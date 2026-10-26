import * as mensajes from '../modelos/mensajes.js'
import { conEstado } from '../modelos/citas.js'
import { validarMensaje } from '../middlewares/validar.js'

export const crear = async (req, res) => {
  const errores = validarMensaje(req.body)
  if (Object.keys(errores).length) {
    const e = conEstado(400, 'Revisa los campos marcados y vuelve a enviar tu mensaje.')
    e.errores = errores
    throw e
  }
  res.status(201).json(await mensajes.crearMensaje(req.body))
}

export const listar = async (req, res) => res.json(await mensajes.listarMensajes())