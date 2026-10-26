export const noEncontrado = (req, res) => {
  res.status(404).json({ mensaje: `La ruta ${req.originalUrl} no existe. Revisa la lista de endpoints en /api.` })
}

export const manejarErrores = (err, req, res, next) => {
  if (!err.status) console.error(err)
  res.status(err.status || 500).json({
    mensaje: err.status ? err.message : 'Ocurrió un problema en el servidor. Intenta de nuevo en unos segundos.',
    ...(err.errores ? { errores: err.errores } : {}),
  })
}
