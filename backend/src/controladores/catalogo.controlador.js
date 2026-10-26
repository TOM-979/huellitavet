import * as catalogo from '../modelos/catalogo.js'
import { conEstado } from '../modelos/citas.js'

export const especies = (req, res) => res.json(catalogo.listarEspecies())
export const categorias = (req, res) => res.json(catalogo.listarCategorias())
export const productos = (req, res) => res.json(catalogo.buscarProductos(req.query))
export const producto = (req, res) => {
  const p = catalogo.obtenerProducto(Number(req.params.id))
  if (!p) throw conEstado(404, 'Ese producto no existe o ya no está a la venta.')
  res.json(p)
}
export const servicios = (req, res) => res.json(catalogo.listarServicios(req.query))
export const veterinarios = (req, res) => res.json(catalogo.listarVeterinarios())
export const estadisticas = (req, res) => res.json(catalogo.estadisticas())
