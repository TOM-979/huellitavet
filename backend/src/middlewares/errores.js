export const noEncontrado = (req, res) => {
  res.status(404).json({ mensaje: `La ruta ${req.originalUrl} no existe. Revisa la lista de endpoints en /api.` })
}

// 23505: dato repetido (por ejemplo, dos reservas a la vez en el mismo horario)
const ERRORES_PG = {
  23505: [409, 'Ese registro ya existe o el horario se acaba de ocupar. Revisa los datos e intenta de nuevo.'],
}

export const manejarErrores = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') err = Object.assign(new Error('El cuerpo de la solicitud no es un JSON válido.'), { status: 400 })
  else if (ERRORES_PG[err.code]) {
    const [status, mensaje] = ERRORES_PG[err.code]
    err = Object.assign(new Error(mensaje), { status })
  }
  if (!err.status) console.error(err)
  res.status(err.status || 500).json({
    mensaje: err.status ? err.message : 'Ocurrió un problema en el servidor. Intenta de nuevo en unos segundos.',
    ...(err.errores ? { errores: err.errores } : {}),
  })
}
