// Conexión a la base de datos SQLite integrada en Node (sin instalar nada).
// La primera vez crea las tablas (schema.sql) y carga los datos iniciales (datos.js).
import { DatabaseSync } from 'node:sqlite'
import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as datos from './datos.js'

const aqui = dirname(fileURLToPath(import.meta.url))
// En Vercel solo /tmp permite escribir; en tu PC se guarda en backend/data/
const RUTA_DB = process.env.DB_PATH ?? (process.env.VERCEL ? '/tmp/huellitavet.db' : join(aqui, '../../data/huellitavet.db'))

if (RUTA_DB !== ':memory:') mkdirSync(dirname(RUTA_DB), { recursive: true })
export const db = new DatabaseSync(RUTA_DB)
db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;')
db.exec(readFileSync(join(aqui, 'schema.sql'), 'utf8'))

// Ejecuta una función dentro de una transacción: si algo falla, se deshace todo
export function transaccion(fn) {
  db.exec('BEGIN')
  try {
    const resultado = fn()
    db.exec('COMMIT')
    return resultado
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

export function cargarDatosIniciales({ forzar = false } = {}) {
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM especies').get()
  if (n > 0 && !forzar) return false

  transaccion(() => {
    if (forzar) {
      for (const t of ['pedido_detalle', 'pedidos', 'citas', 'clientes', 'mensajes', 'servicio_especies', 'servicios',
        'producto_especies', 'productos', 'categorias', 'veterinarios', 'especies']) db.exec(`DELETE FROM ${t}`)
      db.exec("DELETE FROM sqlite_sequence")
    }
    const insEspecie = db.prepare('INSERT INTO especies (slug, nombre, grupo, descripcion, imagen) VALUES (?, ?, ?, ?, ?)')
    for (const e of datos.especies) insEspecie.run(e.slug, e.nombre, e.grupo, e.descripcion, e.imagen)
    const idEspecie = Object.fromEntries(db.prepare('SELECT slug, id FROM especies').all().map(r => [r.slug, r.id]))

    const insCategoria = db.prepare('INSERT INTO categorias (slug, nombre, icono) VALUES (?, ?, ?)')
    for (const c of datos.categorias) insCategoria.run(c.slug, c.nombre, c.icono)
    const idCategoria = Object.fromEntries(db.prepare('SELECT slug, id FROM categorias').all().map(r => [r.slug, r.id]))

    const insProducto = db.prepare(`INSERT INTO productos (sku, nombre, descripcion, categoria_id, precio, stock, rating, resenas, imagen, destacado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    const insPE = db.prepare('INSERT INTO producto_especies (producto_id, especie_id) VALUES (?, ?)')
    for (const p of datos.productos) {
      const { lastInsertRowid } = insProducto.run(p.sku, p.nombre, p.descripcion, idCategoria[p.categoria], p.precio, p.stock, p.rating, p.resenas, p.imagen, p.destacado)
      for (const e of p.especies) insPE.run(lastInsertRowid, idEspecie[e])
    }

    const insServicio = db.prepare(`INSERT INTO servicios (slug, nombre, categoria, descripcion, incluye, precio, desde, duracion_min, imagen)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    const insSE = db.prepare('INSERT INTO servicio_especies (servicio_id, especie_id) VALUES (?, ?)')
    for (const s of datos.servicios) {
      const { lastInsertRowid } = insServicio.run(s.slug, s.nombre, s.categoria, s.descripcion, s.incluye, s.precio, s.desde, s.duracion_min, s.imagen)
      for (const e of s.especies) insSE.run(lastInsertRowid, idEspecie[e])
    }

    const insVet = db.prepare('INSERT INTO veterinarios (nombre, especialidad, bio, imagen) VALUES (?, ?, ?, ?)')
    for (const v of datos.veterinarios) insVet.run(v.nombre, v.especialidad, v.bio, v.imagen)
  })
  return true
}

cargarDatosIniciales()
