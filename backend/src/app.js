import express from 'express'
import cors from 'cors'
import rutas from './rutas/index.js'
import { noEncontrado, manejarErrores } from './middlewares/errores.js'

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*' }))
app.use(express.json({ limit: '100kb' }))
app.use('/api', rutas)
app.use(noEncontrado)
app.use(manejarErrores)

export default app
