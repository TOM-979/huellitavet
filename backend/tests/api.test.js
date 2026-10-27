// Pruebas de la API: npm test (usa una base PostgreSQL en memoria, nunca toca Supabase)
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'

process.env.DATABASE_URL = ''
process.env.DB_PATH = ':memory:'
const { default: app } = await import('../src/app.js')
const { cerrarBase } = await import('../src/db/conexion.js')

let servidor, URL_BASE
before(() => new Promise(ok => { servidor = app.listen(0, () => { URL_BASE = `http://localhost:${servidor.address().port}/api`; ok() }) }))
after(async () => { servidor.close(); await cerrarBase() })

const api = async (ruta, opciones = {}) => {
  const res = await fetch(URL_BASE + ruta, { headers: { 'Content-Type': 'application/json' }, ...opciones, body: opciones.body && JSON.stringify(opciones.body) })
  const tipo = res.headers.get('content-type') ?? ''
  return { status: res.status, datos: tipo.includes('json') ? await res.json() : Buffer.from(await res.arrayBuffer()) }
}

const proximoLunes = () => {
  const d = new Date(); d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7))
  return d.toISOString().slice(0, 10)
}
const cita = (extra = {}) => ({ nombre: 'María Rojas', telefono: '987654321', mascota: 'Kiwi', especie: 'loro', servicioId: 11, fecha: proximoLunes(), hora: '10:00', ...extra })

test('catálogo: 11 especies, 12 categorías, 16 servicios', async () => {
  assert.equal((await api('/especies')).datos.length, 11)
  assert.equal((await api('/categorias')).datos.length, 12)
  assert.equal((await api('/servicios')).datos.length, 16)
})

test('productos: filtra por especie y categoría, pagina y ordena', async () => {
  const aves = (await api('/productos?especie=loro&limite=50')).datos
  assert.ok(aves.items.length > 0)
  assert.ok(aves.items.every(p => p.especies.includes('loro')))
  const baratos = (await api('/productos?orden=precio-asc&limite=5')).datos
  assert.deepEqual(baratos.items.map(p => p.precio), [...baratos.items.map(p => p.precio)].sort((a, b) => a - b))
  const pag2 = (await api('/productos?limite=10&pagina=2')).datos
  assert.equal(pag2.pagina, 2)
})

test('citas: valida datos y no acepta un servicio que no atiende esa especie', async () => {
  const vacia = await api('/citas', { method: 'POST', body: {} })
  assert.equal(vacia.status, 400)
  assert.ok(vacia.datos.errores.telefono)
  const malServicio = await api('/citas', { method: 'POST', body: cita({ especie: 'pez', servicioId: 2 }) })
  assert.equal(malServicio.status, 400)
})

test('citas: asigna al especialista y no permite más citas que veterinarios en un horario', async () => {
  const primera = await api('/citas', { method: 'POST', body: cita() })
  assert.equal(primera.status, 201)
  assert.equal(primera.datos.veterinario, 'Lia')
  for (let i = 0; i < 3; i++) {
    const r = await api('/citas', { method: 'POST', body: cita({ telefono: `98765000${i}`, especie: 'perro', servicioId: 1 }) })
    assert.equal(r.status, 201)
  }
  const llena = await api('/citas', { method: 'POST', body: cita({ telefono: '987650009', especie: 'perro', servicioId: 1 }) })
  assert.equal(llena.status, 409)
  const horas = (await api(`/citas/disponibilidad?fecha=${proximoLunes()}`)).datos
  assert.equal(horas.find(h => h.hora === '10:00').disponible, false)
})

test('pedidos: descuenta stock y la transacción se deshace si falta stock', async () => {
  const antes = (await api('/productos/3')).datos.stock
  const ok = await api('/pedidos', { method: 'POST', body: { items: [{ id: 3, cantidad: 2 }] } })
  assert.equal(ok.status, 201)
  assert.match(ok.datos.codigo, /^B001-\d{8}$/)
  assert.equal(ok.datos.total, +(74.5 * 2).toFixed(2))
  assert.equal((await api('/productos/3')).datos.stock, antes - 2)

  const stock3 = (await api('/productos/3')).datos.stock
  const falla = await api('/pedidos', { method: 'POST', body: { items: [{ id: 3, cantidad: 1 }, { id: 1, cantidad: 999 }] } })
  assert.equal(falla.status, 409)
  assert.equal((await api('/productos/3')).datos.stock, stock3) // no se descontó nada
})

test('comprobante: devuelve el HTML imprimible del pedido', async () => {
  const pedido = (await api('/pedidos', { method: 'POST', body: { items: [{ id: 10, cantidad: 1 }], cliente: { nombre: '<b>Ana</b>', telefono: '912345678' } } })).datos
  const html = await api(`/pedidos/${pedido.codigo}/comprobante`)
  assert.equal(html.status, 200)
  const texto = html.datos.toString()
  assert.ok(texto.includes(pedido.codigo))
  assert.ok(texto.includes('&lt;b&gt;Ana&lt;/b&gt;'))
  assert.ok(!texto.includes('Invalid Date'))
})

test('mensajes: valida y guarda', async () => {
  assert.equal((await api('/mensajes', { method: 'POST', body: { nombre: 'A' } })).status, 400)
  const ok = await api('/mensajes', { method: 'POST', body: { nombre: 'Ana', correo: 'ana@correo.com', asunto: 'Consulta', mensaje: '¿Atienden iguanas los domingos?' } })
  assert.equal(ok.status, 201)
})
