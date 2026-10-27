// npm run db:reset → borra todas las tablas, las vuelve a crear y carga los datos iniciales
import { reiniciarBase } from '../src/db/conexion.js'

const tipo = await reiniciarBase()
console.log(`Base de datos reiniciada con los datos iniciales (${tipo}).`)
