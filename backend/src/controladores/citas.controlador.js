import * as citas from '../modelos/citas.js'
import { validarCita, FECHA_VALIDA } from '../middlewares/validar.js'

export const disponibilidad = async (req, res) => {
  if (!FECHA_VALIDA.test(req.query.fecha ?? '')) throw citas.conEstado(400, 'Envía la fecha con el formato AAAA-MM-DD, por ejemplo 2026-10-24.')
  res.json(await citas.disponibilidad(req.query.fecha))
}

export const crear = async (req, res) => {
  const errores = validarCita(req.body)
  if (Object.keys(errores).length) {
    const e = citas.conEstado(400, 'Faltan algunos datos. Revisa los campos marcados y vuelve a confirmar.')
    e.errores = errores
    throw e
  }
  const cita = await citas.crearCita({ ...req.body, telefono: String(req.body.telefono).replace(/\s/g, ''), servicioId: Number(req.body.servicioId) })
  res.status(201).json(cita)
}

export const obtener = async (req, res) => {
  const cita = await citas.obtenerCita(req.params.codigo)
  if (!cita) throw citas.conEstado(404, 'No encontramos una cita con ese código. Revisa que esté bien escrito.')
  res.json(cita)
}

export const listar = async (req, res) => res.json(await citas.listarCitas(req.query))