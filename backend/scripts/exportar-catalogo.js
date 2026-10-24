// npm run catalogo → genera frontend/src/data/catalogo.json (respaldo para cuando la API no responde)
import { writeFileSync, mkdirSync } from 'node:fs'
process.env.DB_PATH = ':memory:'
const catalogo = await import('../src/modelos/catalogo.js')

const datos = {
  generado: new Date().toISOString(),
  especies: catalogo.listarEspecies(),
  categorias: catalogo.listarCategorias(),
  servicios: catalogo.listarServicios(),
  veterinarios: catalogo.listarVeterinarios(),
  productos: catalogo.buscarProductos({ limite: 60 }).items,
  estadisticas: catalogo.estadisticas(),
}
const destino = new URL('../../frontend/src/data/', import.meta.url)
mkdirSync(destino, { recursive: true })
writeFileSync(new URL('catalogo.json', destino), JSON.stringify(datos, null, 1))
console.log(`catalogo.json: ${datos.productos.length} productos, ${datos.servicios.length} servicios, ${datos.especies.length} especies`)
