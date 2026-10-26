import { consultar, uno } from '../db/conexion.js'

export const crearMensaje = async ({ nombre, correo, asunto, mensaje }) => {
  const row = await uno(
    'INSERT INTO mensajes (nombre, correo, asunto, mensaje) VALUES ($1,$2,$3,$4) RETURNING id',
    [nombre.trim(), correo.trim(), asunto, mensaje.trim()]
  )
  return { id: Number(row.id) }
}

export const listarMensajes = () => consultar('SELECT * FROM mensajes ORDER BY id DESC')