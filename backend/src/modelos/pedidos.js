import { consultar, uno, transaccion } from '../db/conexion.js'
import { conEstado } from './citas.js'

const IGV = 0.18

export async function crearPedido({ items, cliente }) {
  if (!Array.isArray(items) || items.length === 0) throw conEstado(400, 'Agrega al menos un producto antes de finalizar el pedido.')
  return transaccion(async (cx) => {
    let clienteId = null
    if (cliente?.telefono) {
      await cx.query(`INSERT INTO clientes (nombre, telefono, correo) VALUES ($1,$2,$3)
        ON CONFLICT(telefono) DO UPDATE SET nombre = EXCLUDED.nombre`,
        [cliente.nombre || 'Cliente', cliente.telefono, cliente.correo || null])
      const cl = await uno('SELECT id FROM clientes WHERE telefono = $1', [cliente.telefono], cx)
      clienteId = cl.id
    }

    const detalle = []
    for (const { id, cantidad } of items) {
      const producto = await uno('SELECT id, nombre, precio, stock FROM productos WHERE id = $1', [Number(id)], cx)
      const n = Number(cantidad)
      if (!producto || !Number.isInteger(n) || n < 1) throw conEstado(400, 'Uno de los productos ya no está disponible.')
      if (n > producto.stock) throw conEstado(409, `Solo quedan ${producto.stock} unidades de «${producto.nombre}».`)
      detalle.push({ ...producto, cantidad: n })
    }

    const total = +detalle.reduce((s, d) => s + d.precio * d.cantidad, 0).toFixed(2)
    const subtotal = +(total / (1 + IGV)).toFixed(2)
    const igv = +(total - subtotal).toFixed(2)

    const { rows } = await cx.query(
      'INSERT INTO pedidos (codigo, cliente_id, subtotal, igv, total) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      ['TEMP', clienteId, subtotal, igv, total])
    const pedidoId = rows[0].id
    const codigo = `B001-${String(pedidoId).padStart(8,'0')}`
    await cx.query('UPDATE pedidos SET codigo = $1 WHERE id = $2', [codigo, pedidoId])

    for (const d of detalle) {
      await cx.query('INSERT INTO pedido_detalle (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1,$2,$3,$4)',
        [pedidoId, d.id, d.cantidad, d.precio])
      const { rowCount } = await cx.query('UPDATE productos SET stock = stock - $1 WHERE id = $2 AND stock >= $1',
        [d.cantidad, d.id])
      if (rowCount === 0) throw conEstado(409, `«${d.nombre}» se acaba de agotar.`)
    }
    return obtenerPedido(codigo, cx)
  })
}

export async function obtenerPedido(codigo, cx) {
  const pedido = await uno(`SELECT p.*, cl.nombre AS cliente, cl.telefono FROM pedidos p
    LEFT JOIN clientes cl ON cl.id = p.cliente_id WHERE p.codigo = $1`, [codigo], cx)
  if (!pedido) return null
  pedido.detalle = await consultar(`SELECT d.producto_id AS id, pr.sku, pr.nombre, d.cantidad, d.precio_unitario,
      ROUND(d.cantidad * d.precio_unitario, 2) AS importe
    FROM pedido_detalle d JOIN productos pr ON pr.id = d.producto_id WHERE d.pedido_id = $1`, [pedido.id], cx)
  return pedido
}

export const listarPedidos = () => consultar('SELECT codigo, total, estado, creado_en FROM pedidos ORDER BY id DESC')