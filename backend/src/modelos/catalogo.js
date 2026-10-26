// Consultas de lectura del catálogo: especies, categorías, productos, servicios y equipo
import { db } from '../db/conexion.js'

const lista = (texto) => (texto ? texto.split(',') : [])

export const listarEspecies = () => db.prepare(`
  SELECT e.*,
    (SELECT COUNT(*) FROM producto_especies pe WHERE pe.especie_id = e.id) AS productos,
    (SELECT COUNT(*) FROM servicio_especies se WHERE se.especie_id = e.id) AS servicios
  FROM especies e ORDER BY e.id`).all()

export const listarCategorias = () => db.prepare(`
  SELECT c.*, COUNT(p.id) AS productos
  FROM categorias c LEFT JOIN productos p ON p.categoria_id = c.id
  GROUP BY c.id ORDER BY c.id`).all()

const SELECT_PRODUCTO = `
  SELECT p.id, p.sku, p.nombre, p.descripcion, p.precio, p.stock, p.rating, p.resenas, p.imagen, p.destacado,
         c.slug AS categoria, c.nombre AS categoria_nombre,
         GROUP_CONCAT(e.slug) AS especies
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

export function buscarProductos({ q = '', categoria = '', especie = '', orden = 'relevancia', pagina = 1, limite = 12 }) {
  const condiciones = []
  const params = []
  if (q) { condiciones.push('(p.nombre LIKE ? OR p.descripcion LIKE ?)'); params.push(`%${q}%`, `%${q}%`) }
  if (categoria) { condiciones.push(`c.slug IN (${lista(categoria).map(() => '?').join(',')})`); params.push(...lista(categoria)) }
  if (especie) {
    condiciones.push(`p.id IN (SELECT pe2.producto_id FROM producto_especies pe2 JOIN especies e2 ON e2.id = pe2.especie_id
                      WHERE e2.slug IN (${lista(especie).map(() => '?').join(',')}))`)
    params.push(...lista(especie))
  }
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''
  const total = db.prepare(`SELECT COUNT(*) AS n FROM productos p JOIN categorias c ON c.id = p.categoria_id ${where}`).get(...params).n
  const lim = Math.min(Math.max(Number(limite) || 12, 1), 60)
  const pag = Math.max(Number(pagina) || 1, 1)
  const items = db.prepare(`${SELECT_PRODUCTO} ${where} GROUP BY p.id ORDER BY ${ORDENES[orden] ?? ORDENES.relevancia} LIMIT ? OFFSET ?`)
    .all(...params, lim, (pag - 1) * lim)
    .map(normalizarProducto)
  return { items, total, pagina: pag, paginas: Math.max(1, Math.ceil(total / lim)) }
}

export const obtenerProducto = (id) => {
  const fila = db.prepare(`${SELECT_PRODUCTO} WHERE p.id = ? GROUP BY p.id`).get(id)
  return fila ? normalizarProducto(fila) : null
}

const normalizarProducto = (p) => ({ ...p, destacado: Boolean(p.destacado), especies: lista(p.especies) })

export function listarServicios({ especie = '', categoria = '' } = {}) {
  const condiciones = []
  const params = []
  if (categoria) { condiciones.push('s.categoria = ?'); params.push(categoria) }
  if (especie) {
    condiciones.push('s.id IN (SELECT se2.servicio_id FROM servicio_especies se2 JOIN especies e2 ON e2.id = se2.especie_id WHERE e2.slug = ?)')
    params.push(especie)
  }
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''
  return db.prepare(`
    SELECT s.*, GROUP_CONCAT(e.slug) AS especies
    FROM servicios s
    LEFT JOIN servicio_especies se ON se.servicio_id = s.id
    LEFT JOIN especies e ON e.id = se.especie_id
    ${where} GROUP BY s.id ORDER BY s.id`).all(...params)
    .map(s => ({ ...s, desde: Boolean(s.desde), incluye: s.incluye.split('|'), especies: lista(s.especies) }))
}

export const listarVeterinarios = () => db.prepare('SELECT * FROM veterinarios ORDER BY id').all()

export const estadisticas = () => db.prepare(`
  SELECT
    (SELECT COUNT(*) FROM especies)  AS especies,
    (SELECT COUNT(*) FROM servicios) AS servicios,
    (SELECT COUNT(*) FROM productos) AS productos,
    (SELECT COUNT(*) FROM veterinarios) AS veterinarios,
    (SELECT COUNT(*) FROM citas WHERE estado <> 'Cancelada') AS citas,
    (SELECT COUNT(*) FROM pedidos) AS pedidos`).get()
