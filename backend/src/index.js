import 'dotenv/config'
import app from './app.js'
import { prepararBase } from './db/conexion.js'

const PORT = process.env.PORT || 3000

prepararBase()
  .then((db) => {
    console.log(`Base de datos: ${db.tipo}`)
    app.listen(PORT, () => console.log(`API HuellitaVet lista en http://localhost:${PORT}/api`))
  })
  .catch((e) => {
    console.error('Error al conectar con la base de datos:', e.message)
    process.exit(1)
  })
