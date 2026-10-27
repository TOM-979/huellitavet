// Conexión a PostgreSQL.
// - Con DATABASE_URL (Supabase, Neon o un PostgreSQL propio) usa un Pool de "pg".
// - Sin DATABASE_URL usa PGlite: PostgreSQL embebido en Node, sin instalar nada. Se guarda en backend/data/pglite
//   (o en memoria si DB_PATH=:memory:, como en las pruebas).
// La primera consulta crea las tablas (schema.sql) y carga los datos iniciales (datos.js) si la base está vacía.
import 'dotenv/config'
import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const aqui = dirname(fileURLToPath(import.meta.url))
const ESQUEMA = readFileSync(join(aqui, 'schema.sql'), 'utf8')
const TABLAS = ['pedido_detalle', 'pedidos', 'citas', 'clientes', 'mensajes', 'servicio_especies', 'servicios',
  'producto_especies', 'productos', 'categorias', 'veterinarios', 'especies']

// COUNT(*) devuelve BIGINT (20) y los precios NUMERIC (1700): ambos llegarían como texto, los pasamos a número
const INT8 = 20
const NUMERIC = 1700

async function conectarPostgres(url) {
  const { default: pg } = await import('pg')
  pg.types.setTypeParser(INT8, Number)
  pg.types.setTypeParser(NUMERIC, Number)
  const local = /localhost|127\.0\.0\.1/.test(url)
  const pool = new pg.Pool({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false }, max: process.env.VERCEL ? 1 : 10 })
  return {
    tipo: 'PostgreSQL',
    query: (sql, params) => pool.query(sql, params),
    exec: (sql) => pool.query(sql),
    async transaccion(fn) {
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
    },
    cerrar: () => pool.end(),
  }
}

async function conectarPGlite(ruta) {
  const { PGlite } = await import('@electric-sql/pglite')
  if (ruta !== ':memory:') mkdirSync(ruta, { recursive: true })
  const parsers = { [INT8]: Number, [NUMERIC]: Number }
  const db = new PGlite(ruta === ':memory:' ? undefined : ruta, { parsers })
  // Misma forma de respuesta que "pg": { rows, rowCount }. Los parsers van en cada consulta porque
  // dentro de una transacción PGlite no aplica los del constructor.
  const adaptar = (cx) => ({
    query: async (sql, params) => {
      const r = await cx.query(sql, params, { parsers })
      return { rows: r.rows, rowCount: r.affectedRows ?? r.rows.length }
    },
  })
  return {
    tipo: ruta === ':memory:' ? 'PGlite (memoria)' : `PGlite (${ruta})`,
    ...adaptar(db),
    exec: (sql) => db.exec(sql),
    transaccion: (fn) => db.transaction((tx) => fn(adaptar(tx))),
    cerrar: () => db.close(),
  }
}

const conectar = () => process.env.DATABASE_URL
  ? conectarPostgres(process.env.DATABASE_URL)
  : conectarPGlite(process.env.DB_PATH ?? join(aqui, '../../data/pglite'))

let motor
// Devuelve la conexión lista para usar (se crea una sola vez)
const base = () => (motor ??= (async () => {
  const m = await conectar()
  await m.exec(ESQUEMA)
  await sembrar(m)
  return m
})())

export const prepararBase = base

// Convierte "?" a "$1, $2…" para no reescribir cada consulta
const aPg = (sql) => { let i = 0; return sql.replace(/\?/g, () => `$${++i}`) }

export const consultar = async (sql, params = [], cliente) =>
  (await (cliente ?? await base()).query(aPg(sql), params)).rows

export const uno = async (sql, params = [], cliente) =>
  (await consultar(sql, params, cliente))[0]

// Ejecuta una función dentro de una transacción: si algo falla, se deshace todo.
// Dentro de fn, todas las consultas deben usar el cliente que recibe (cx).
export const transaccion = async (fn) => (await base()).transaccion(fn)

export async function cerrarBase() {
  if (!motor) return
  const m = await motor
  motor = undefined
  await m.cerrar()
}

// Borra todas las tablas y las vuelve a crear con los datos iniciales
export async function reiniciarBase() {
  const m = await conectar()
  try {
    await m.exec(`DROP TABLE IF EXISTS ${TABLAS.join(', ')} CASCADE`)
    await m.exec(ESQUEMA)
    await sembrar(m)
    return m.tipo
  } finally {
    await m.cerrar()
  }
}

// Carga los datos iniciales solo si la base está vacía
async function sembrar(m) {
  const { rows } = await m.query('SELECT COUNT(*) AS n FROM especies')
  if (rows[0].n > 0) return false

  const datos = await import('./datos.js')

  await m.transaccion(async (cx) => {
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
