import * as pedidos from '../modelos/pedidos.js'
import { conEstado } from '../modelos/citas.js'
import { generarComprobante } from '../utils/comprobante.js'

export const crear = (req, res) => res.status(201).json(pedidos.crearPedido(req.body))

export const obtener = (req, res) => {
  const pedido = pedidos.obtenerPedido(req.params.codigo)
  if (!pedido) throw conEstado(404, 'No encontramos un pedido con ese código.')
  res.json(pedido)
}

export const comprobante = (req, res) => {
  const pedido = pedidos.obtenerPedido(req.params.codigo)
  if (!pedido) throw conEstado(404, 'No encontramos un pedido con ese código.')
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="comprobante-${pedido.codigo}.pdf"`)
  generarComprobante(pedido, res)
}

export const listar = (req, res) => res.json(pedidos.listarPedidos())
