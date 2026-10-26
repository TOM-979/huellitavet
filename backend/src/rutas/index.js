import { Router } from 'express'
import * as catalogo from '../controladores/catalogo.controlador.js'
import * as citas from '../controladores/citas.controlador.js'
import * as pedidos from '../controladores/pedidos.controlador.js'
import * as mensajes from '../controladores/mensajes.controlador.js'

const r = Router()

r.get('/', (req, res) => res.json({
  ok: true, api: 'HuellitaVet', version: '3.0.0',
  endpoints: [
    'GET  /api/estadisticas', 'GET  /api/especies', 'GET  /api/categorias',
    'GET  /api/productos?q=&categoria=&especie=&orden=&pagina=&limite=', 'GET  /api/productos/:id',
    'GET  /api/servicios?especie=&categoria=', 'GET  /api/veterinarios',
    'GET  /api/citas/disponibilidad?fecha=AAAA-MM-DD', 'POST /api/citas', 'GET  /api/citas/:codigo', 'GET  /api/citas',
    'POST /api/pedidos', 'GET  /api/pedidos/:codigo', 'GET  /api/pedidos/:codigo/comprobante', 'GET  /api/pedidos',
    'POST /api/mensajes', 'GET  /api/mensajes',
  ],
}))

r.get('/estadisticas', catalogo.estadisticas)
r.get('/especies', catalogo.especies)
r.get('/categorias', catalogo.categorias)
r.get('/productos', catalogo.productos)
r.get('/productos/:id', catalogo.producto)
r.get('/servicios', catalogo.servicios)
r.get('/veterinarios', catalogo.veterinarios)

r.get('/citas/disponibilidad', citas.disponibilidad)
r.get('/citas', citas.listar)
r.get('/citas/:codigo', citas.obtener)
r.post('/citas', citas.crear)

r.get('/pedidos', pedidos.listar)
r.post('/pedidos', pedidos.crear)
r.get('/pedidos/:codigo', pedidos.obtener)
r.get('/pedidos/:codigo/comprobante', pedidos.comprobante)

r.get('/mensajes', mensajes.listar)
r.post('/mensajes', mensajes.crear)

export default r
