import { db, transaccion } from '../db/conexion.js'
import { conEstado } from './citas.js'

const IGV = 0.18 // los precios ya incluyen IGV

// Crea el pedido y descuenta el stock en UNA transacción:
// si un producto no tiene stock, no se guarda nada.
export function crearPedido({ items, cliente }) {
  if (!Array.isArray(items) || items.length === 0) throw conEstado(400, 'Agrega al menos un producto antes de finalizar el pedido.')
  return transaccion(() => {
    let clienteId = null
    if (cliente?.telefono) {
      db.prepare(`INSERT INTO clientes (nombre, telefono, correo) VALUES (?, ?, ?)
        ON CONFLICT(telefono) DO UPDATE SET nombre = excluded.nombre`).run(cliente.nombre || 'Cliente', cliente.telefono, cliente.correo || null)
      clienteId = db.prepare('SELECT id FROM clientes WHERE telefono = ?').get(cliente.telefono).id
    }

    const buscar = db.prepare('SELECT id, nombre, precio, stock FROM productos WHERE id = ?')
    const detalle = items.map(({ id, cantidad }) => {
      const producto = buscar.get(Number(id))
      const n = Number(cantidad)
      if (!producto || !Number.isInteger(n) || n < 1) throw conEstado(400, 'Uno de los productos ya no está disponible. Quítalo del carrito e intenta de nuevo.')
      if (n > producto.stock) throw conEstado(409, `Solo quedan ${producto.stock} unidades de «${producto.nombre}». Reduce la cantidad e intenta de nuevo.`)
      return { ...producto, cantidad: n }
    })

    const total = +detalle.reduce((s, d) => s + d.precio * d.cantidad, 0).toFixed(2)
    const subtotal = +(total / (1 + IGV)).toFixed(2)
    const igv = +(total - subtotal).toFixed(2)

    const { lastInsertRowid } = db.prepare('INSERT INTO pedidos (codigo, cliente_id, subtotal, igv, total) VALUES (?, ?, ?, ?, ?)')
      .run('TEMP', clienteId, subtotal, igv, total)
    const codigo = `B001-${String(lastInsertRowid).padStart(8, '0')}`
    db.prepare('UPDATE pedidos SET codigo = ? WHERE id = ?').run(codigo, lastInsertRowid)

    const insDetalle = db.prepare('INSERT INTO pedido_detalle (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)')
    const descontar = db.prepare('UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?')
    for (const d of detalle) {
      insDetalle.run(lastInsertRowid, d.id, d.cantidad, d.precio)
      const { changes } = descontar.run(d.cantidad, d.id, d.cantidad)
      if (changes === 0) throw conEstado(409, `«${d.nombre}» se acaba de agotar. Quítalo del carrito e intenta de nuevo.`)
    }
    return obtenerPedido(codigo)
  })
}

export function obtenerPedido(codigo) {
  const pedido = db.prepare(`SELECT p.*, cl.nombre AS cliente, cl.telefono FROM pedidos p
    LEFT JOIN clientes cl ON cl.id = p.cliente_id WHERE p.codigo = ?`).get(codigo)
  if (!pedido) return null
  pedido.detalle = db.prepare(`SELECT d.producto_id AS id, pr.sku, pr.nombre, d.cantidad, d.precio_unitario,
      ROUND(d.cantidad * d.precio_unitario, 2) AS importe
    FROM pedido_detalle d JOIN productos pr ON pr.id = d.producto_id WHERE d.pedido_id = ?`).all(pedido.id)
  return pedido
}

export const listarPedidos = () => db.prepare('SELECT codigo, total, estado, creado_en FROM pedidos ORDER BY id DESC').all()
