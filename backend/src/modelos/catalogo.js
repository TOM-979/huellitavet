import { consultar, uno } from '../db/conexion.js'
import { productos as productosBase } from '../db/datos.js'

// Las fotos de la tienda salen del código (public/images). Así se ven aunque la base de datos publicada
// todavía guarde rutas antiguas; si un producto no está en datos.js se respeta lo que diga la base.
const IMAGEN_POR_SKU = Object.fromEntries(productosBase.map(p => [p.sku, p.imagen]))

const lista = (texto) => (texto ? texto.split(',') : [])

export const listarEspecies = () => consultar(`
  SELECT e.*,
    (SELECT COUNT(*) FROM producto_especies pe WHERE pe.especie_id = e.id) AS productos,
    (SELECT COUNT(*) FROM servicio_especies se WHERE se.especie_id = e.id) AS servicios
  FROM especies e ORDER BY e.id`)

export const listarCategorias = () => consultar(`
  SELECT c.*, COUNT(p.id) AS productos
  FROM categorias c LEFT JOIN productos p ON p.categoria_id = c.id
  GROUP BY c.id ORDER BY c.id`)

const SELECT_PRODUCTO = `
  SELECT p.id, p.sku, p.nombre, p.descripcion, p.precio, p.stock, p.rating, p.resenas, p.imagen, p.destacado,
         c.slug AS categoria, c.nombre AS categoria_nombre,
         STRING_AGG(e.slug, ',') AS especies
  FROM productos p
  JOIN categorias c ON c.id = p.categoria_id
  LEFT JOIN producto_especies pe ON pe.producto_id = p.id
  LEFT JOIN especies e ON e.id = pe.especie_id`

const ORDENES = {
  relevancia: 'p.destacado DESC, p.resenas DESC',
  'precio-asc': 'p.precio ASC',
  'precio-desc': 'p.precio DESC',
  rating: 'p.rating DESC, p.resenas DESC',
}

export async function buscarProductos({ q = '', categoria = '', especie = '', orden = 'relevancia', pagina = 1, limite = 12 }) {
  const condiciones = []
  const params = []
  let i = 1
  if (q) {
    condiciones.push(`(p.nombre ILIKE $${i} OR p.descripcion ILIKE $${i+1})`)
    params.push(`%${q}%`, `%${q}%`); i += 2
  }
  if (categoria) {
    const slugs = categoria.split(',')
    condiciones.push(`c.slug = ANY($${i}::text[])`)
    params.push(slugs); i++
  }
  if (especie) {
    const slugs = especie.split(',')
    condiciones.push(`p.id IN (SELECT pe2.producto_id FROM producto_especies pe2 JOIN especies e2 ON e2.id = pe2.especie_id WHERE e2.slug = ANY($${i}::text[]))`)
    params.push(slugs); i++
  }
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''
  const { n } = await uno(`SELECT COUNT(*) AS n FROM productos p JOIN categorias c ON c.id = p.categoria_id ${where}`, params)
  const total = parseInt(n)
  const lim = Math.min(Math.max(Number(limite) || 12, 1), 60)
  const pag = Math.max(Number(pagina) || 1, 1)
  const items = (await consultar(
    `${SELECT_PRODUCTO} ${where} GROUP BY p.id, c.slug, c.nombre ORDER BY ${ORDENES[orden] ?? ORDENES.relevancia} LIMIT $${i} OFFSET $${i+1}`,
    [...params, lim, (pag - 1) * lim]
  )).map(normalizarProducto)
  return { items, total, pagina: pag, paginas: Math.max(1, Math.ceil(total / lim)) }
}

export const obtenerProducto = async (id) => {
  const fila = await uno(`${SELECT_PRODUCTO} WHERE p.id = $1 GROUP BY p.id, c.slug, c.nombre`, [id])
  return fila ? normalizarProducto(fila) : null
}

const normalizarProducto = (p) => ({ ...p, imagen: IMAGEN_POR_SKU[p.sku] ?? p.imagen, destacado: Boolean(p.destacado), especies: lista(p.especies) })

export async function listarServicios({ especie = '', categoria = '' } = {}) {
  const condiciones = []
  const params = []
  let i = 1
  if (categoria) { condiciones.push(`s.categoria = $${i}`); params.push(categoria); i++ }
  if (especie) {
    condiciones.push(`s.id IN (SELECT se2.servicio_id FROM servicio_especies se2 JOIN especies e2 ON e2.id = se2.especie_id WHERE e2.slug = $${i})`)
    params.push(especie); i++
  }
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''
  const rows = await consultar(`
    SELECT s.*, STRING_AGG(e.slug, ',') AS especies
    FROM servicios s
    LEFT JOIN servicio_especies se ON se.servicio_id = s.id
    LEFT JOIN especies e ON e.id = se.especie_id
    ${where} GROUP BY s.id ORDER BY s.id`, params)
  return rows.map(s => ({ ...s, desde: Boolean(s.desde), incluye: s.incluye.split('|'), especies: lista(s.especies) }))
}

export const listarVeterinarios = () => consultar('SELECT * FROM veterinarios ORDER BY id')

export const estadisticas = () => uno(`
  SELECT
    (SELECT COUNT(*) FROM especies)     AS especies,
    (SELECT COUNT(*) FROM servicios)    AS servicios,
    (SELECT COUNT(*) FROM productos)    AS productos,
    (SELECT COUNT(*) FROM veterinarios) AS veterinarios,
    (SELECT COUNT(*) FROM citas WHERE estado <> 'Cancelada') AS citas,
    (SELECT COUNT(*) FROM pedidos)      AS pedidos`)