// npm run catalogo → genera frontend/src/data/catalogo.json (respaldo para cuando la API no responde)
// Usa una base en memoria con los datos iniciales, así no depende de Supabase.
import { writeFileSync, mkdirSync } from 'node:fs'
process.env.DATABASE_URL = ''
process.env.DB_PATH = ':memory:'
const catalogo = await import('../src/modelos/catalogo.js')
const { cerrarBase } = await import('../src/db/conexion.js')

const datos = {
  generado: new Date().toISOString(),
  especies: await catalogo.listarEspecies(),
  categorias: await catalogo.listarCategorias(),
  servicios: await catalogo.listarServicios(),
  veterinarios: await catalogo.listarVeterinarios(),
  productos: (await catalogo.buscarProductos({ limite: 60 })).items,
  estadisticas: await catalogo.estadisticas(),
}
await cerrarBase()
const destino = new URL('../../frontend/src/data/', import.meta.url)
mkdirSync(destino, { recursive: true })
writeFileSync(new URL('catalogo.json', destino), JSON.stringify(datos, null, 1))
console.log(`catalogo.json: ${datos.productos.length} productos, ${datos.servicios.length} servicios, ${datos.especies.length} especies`)
