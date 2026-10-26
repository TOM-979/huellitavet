import * as catalogo from '../modelos/catalogo.js'
import { conEstado } from '../modelos/citas.js'

export const especies = async (req, res) => res.json(await catalogo.listarEspecies())
export const categorias = async (req, res) => res.json(await catalogo.listarCategorias())
export const productos = async (req, res) => res.json(await catalogo.buscarProductos(req.query))
export const producto = async (req, res) => {
  const p = await catalogo.obtenerProducto(Number(req.params.id))
  if (!p) throw conEstado(404, 'Ese producto no existe o ya no está a la venta.')
  res.json(p)
}
export const servicios = async (req, res) => res.json(await catalogo.listarServicios(req.query))
export const veterinarios = async (req, res) => res.json(await catalogo.listarVeterinarios())
export const estadisticas = async (req, res) => res.json(await catalogo.estadisticas())