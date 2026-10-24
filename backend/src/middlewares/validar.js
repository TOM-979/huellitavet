// Validaciones del lado del servidor (nunca confiar solo en el frontend)
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CELULAR = /^9\d{8}$/
const FECHA = /^\d{4}-\d{2}-\d{2}$/

const hoyLima = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export function validarCita(body) {
  const e = {}
  if (!body.nombre?.trim() || body.nombre.trim().length < 3) e.nombre = 'Escribe tu nombre y apellido.'
  if (!CELULAR.test(String(body.telefono ?? '').replace(/\s/g, ''))) e.telefono = 'Escribe un celular de 9 dígitos que empiece con 9, como 987 654 321.'
  if (body.correo && !EMAIL.test(body.correo)) e.correo = 'Escribe un correo como nombre@correo.com, o déjalo vacío.'
  if (!body.mascota?.trim()) e.mascota = 'Escribe el nombre de tu mascota.'
  if (!body.especie) e.especie = 'Elige la especie de tu mascota.'
  if (!body.servicioId) e.servicioId = 'Elige el servicio que necesitas.'
  if (!FECHA.test(body.fecha ?? '')) e.fecha = 'Elige una fecha.'
  else if (body.fecha < hoyLima()) e.fecha = 'Elige una fecha desde hoy en adelante.'
  if (!body.hora) e.hora = 'Elige uno de los horarios disponibles.'
  return e
}

export function validarMensaje(body) {
  const e = {}
  if (!body.nombre?.trim()) e.nombre = 'Escribe tu nombre.'
  if (!EMAIL.test(body.correo ?? '')) e.correo = 'Escribe un correo como nombre@correo.com.'
  if (!body.asunto) e.asunto = 'Elige un asunto.'
  if (!body.mensaje?.trim() || body.mensaje.trim().length < 10) e.mensaje = 'Cuéntanos un poco más (mínimo 10 caracteres).'
  return e
}

export const FECHA_VALIDA = FECHA
