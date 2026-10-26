import { db } from '../db/conexion.js'

export const crearMensaje = ({ nombre, correo, asunto, mensaje }) => {
  const { lastInsertRowid } = db.prepare('INSERT INTO mensajes (nombre, correo, asunto, mensaje) VALUES (?, ?, ?, ?)')
    .run(nombre.trim(), correo.trim(), asunto, mensaje.trim())
  return { id: Number(lastInsertRowid) }
}

export const listarMensajes = () => db.prepare('SELECT * FROM mensajes ORDER BY id DESC').all()
