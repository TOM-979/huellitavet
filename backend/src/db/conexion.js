import pg from 'pg'
import 'dotenv/config'

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// Convierte "?" a "$1, $2…" para no reescribir cada consulta
const aPg = (sql) => { let i = 0; return sql.replace(/\?/g, () => `$${++i}`) }

export const consultar = async (sql, params = [], cliente = pool) =>
  (await cliente.query(aPg(sql), params)).rows

export const uno = async (sql, params = [], cliente = pool) =>
  (await consultar(sql, params, cliente))[0]

export async function transaccion(fn) {
  const cliente = await pool.connect()
  try {
    await cliente.query('BEGIN')
    const resultado = await fn(cliente)
    await cliente.query('COMMIT')
    return resultado
  } catch (e) {
    await cliente.query('ROLLBACK')
    throw e
  } finally {
    cliente.release()
  }
}

export async function cargarDatosIniciales() {
  const { rows } = await pool.query('SELECT COUNT(*) AS n FROM especies')
  if (parseInt(rows[0].n) > 0) return false

  const datos = await import('./datos.js')

  await transaccion(async (cx) => {
    for (const e of datos.especies) {
      await cx.query(
        'INSERT INTO especies (slug, nombre, grupo, descripcion, imagen) VALUES ($1,$2,$3,$4,$5)',
        [e.slug, e.nombre, e.grupo, e.descripcion, e.imagen]
      )
    }
    const { rows: esp } = await cx.query('SELECT slug, id FROM especies')
    const idEspecie = Object.fromEntries(esp.map(r => [r.slug, r.id]))

    for (const c of datos.categorias) {
      await cx.query(
        'INSERT INTO categorias (slug, nombre, icono) VALUES ($1,$2,$3)',
        [c.slug, c.nombre, c.icono]
      )
    }
    const { rows: cat } = await cx.query('SELECT slug, id FROM categorias')
    const idCategoria = Object.fromEntries(cat.map(r => [r.slug, r.id]))

    for (const p of datos.productos) {
      const { rows: pr } = await cx.query(
        `INSERT INTO productos (sku, nombre, descripcion, categoria_id, precio, stock, rating, resenas, imagen, destacado)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [p.sku, p.nombre, p.descripcion, idCategoria[p.categoria], p.precio, p.stock, p.rating, p.resenas, p.imagen, p.destacado]
      )
      for (const e of p.especies) {
        await cx.query(
          'INSERT INTO producto_especies (producto_id, especie_id) VALUES ($1,$2)',
          [pr[0].id, idEspecie[e]]
        )
      }
    }

    for (const s of datos.servicios) {
      const { rows: sr } = await cx.query(
        `INSERT INTO servicios (slug, nombre, categoria, descripcion, incluye, precio, desde, duracion_min, imagen)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [s.slug, s.nombre, s.categoria, s.descripcion, s.incluye, s.precio, s.desde, s.duracion_min, s.imagen]
      )
      for (const e of s.especies) {
        await cx.query(
          'INSERT INTO servicio_especies (servicio_id, especie_id) VALUES ($1,$2)',
          [sr[0].id, idEspecie[e]]
        )
      }
    }

    for (const v of datos.veterinarios) {
      await cx.query(
        'INSERT INTO veterinarios (nombre, especialidad, bio, imagen) VALUES ($1,$2,$3,$4)',
        [v.nombre, v.especialidad, v.bio, v.imagen]
      )
    }
  })
  return true
}