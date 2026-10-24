// npm run db:reset → borra todo y vuelve a cargar los datos iniciales
import { cargarDatosIniciales } from '../src/db/conexion.js'
cargarDatosIniciales({ forzar: true })
console.log('Base de datos reiniciada con los datos iniciales.')
