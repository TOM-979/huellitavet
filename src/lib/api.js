// Cliente de la API. Si el backend no responde, usa la copia local del catálogo
// para que la página nunca quede vacía (modo demostración).
import catalogo from '../data/catalogo.json'
import { esDomingo, hoyISO } from './formato.js'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export class ApiError extends Error {
  constructor(mensaje, status, errores) { super(mensaje); this.status = status; this.errores = errores }
}

async function pedir(ruta, opciones = {}) {
  let res
  try {
    res = await fetch(API_URL + ruta, { headers: { 'Content-Type': 'application/json' }, ...opciones })
  } catch {
    throw new ApiError('No pudimos conectar con la clínica. Revisa tu conexión e intenta de nuevo.', 0)
  }
  const tipo = res.headers.get('content-type') ?? ''
  if (!tipo.includes('application/json')) throw new ApiError('El servidor no respondió como esperábamos.', 0)
  const datos = await res.json()
  if (!res.ok) throw new ApiError(datos.mensaje ?? 'El servidor no respondió como esperábamos. Intenta de nuevo en unos segundos.', res.status, datos.errores)
  return datos
}

// Estado de la conexión (para mostrar el aviso de modo demostración)
export let modoDemo = false
const oyentes = new Set()
export const alCambiarModo = (fn) => { oyentes.add(fn); return () => oyentes.delete(fn) }
const marcarDemo = (v) => { if (modoDemo !== v) { modoDemo = v; oyentes.forEach(f => f(v)) } }

async function conRespaldo(fn, respaldo) {
  try {
    const r = await fn()
    marcarDemo(false)
    return r
  } catch (e) {
    if (e.status === 0) { marcarDemo(true); return respaldo() }
    throw e
  }
}

// ---------- Catálogo ----------
export const getEspecies = () => conRespaldo(() => pedir('/especies'), () => catalogo.especies)
export const getCategorias = () => conRespaldo(() => pedir('/categorias'), () => catalogo.categorias)
export const getVeterinarios = () => conRespaldo(() => pedir('/veterinarios'), () => catalogo.veterinarios)
export const getEstadisticas = () => conRespaldo(() => pedir('/estadisticas'), () => catalogo.estadisticas)

export const getServicios = ({ especie = '', categoria = '' } = {}) =>
  conRespaldo(
    () => pedir(`/servicios?${new URLSearchParams({ especie, categoria })}`),
    () => catalogo.servicios.filter(s => (!especie || s.especies.includes(especie)) && (!categoria || s.categoria === categoria))
  )

const ORDENES = {
  'precio-asc': (a, b) => a.precio - b.precio,
  'precio-desc': (a, b) => b.precio - a.precio,
  rating: (a, b) => b.rating - a.rating || b.resenas - a.resenas,
  relevancia: (a, b) => b.destacado - a.destacado || b.resenas - a.resenas,
}

export const getProductos = ({ q = '', categoria = '', especie = '', orden = 'relevancia', pagina = 1, limite = 12 } = {}) =>
  conRespaldo(
    () => pedir(`/productos?${new URLSearchParams({ q, categoria, especie, orden, pagina, limite })}`),
    () => {
      const t = q.toLowerCase()
      const cats = categoria ? categoria.split(',') : []
      const esps = especie ? especie.split(',') : []
      const lista = catalogo.productos
        .filter(p => (!t || p.nombre.toLowerCase().includes(t) || p.descripcion.toLowerCase().includes(t))
          && (!cats.length || cats.includes(p.categoria))
          && (!esps.length || p.especies.some(e => esps.includes(e))))
        .sort(ORDENES[orden] ?? ORDENES.relevancia)
      return { items: lista.slice((pagina - 1) * limite, pagina * limite), total: lista.length, pagina, paginas: Math.max(1, Math.ceil(lista.length / limite)) }
    }
  )

// ---------- Citas ----------
const HORAS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00']
export const getDisponibilidad = (fecha) =>
  conRespaldo(
    () => pedir(`/citas/disponibilidad?fecha=${fecha}`),
    () => (esDomingo(fecha) ? [] : HORAS.map((hora, i) => ({ hora, disponible: !(fecha === hoyISO() && i < 4) && i % 5 !== 2, libres: i % 5 === 2 ? 0 : 4 - (i % 3) })))
  )

export const crearCita = (cita) =>
  conRespaldo(
    () => pedir('/citas', { method: 'POST', body: JSON.stringify(cita) }),
    () => {
      const servicio = catalogo.servicios.find(s => s.id === Number(cita.servicioId))
      return { codigo: `HV-DEMO${String(Date.now()).slice(-3)}`, mascota: cita.mascota, fecha: cita.fecha, hora: cita.hora,
        servicio: servicio?.nombre, precio: servicio?.precio, veterinario: catalogo.veterinarios[0].nombre, estado: 'Confirmada', demo: true }
    }
  )

// ---------- Pedidos ----------
export const crearPedido = (pedido) =>
  conRespaldo(
    () => pedir('/pedidos', { method: 'POST', body: JSON.stringify(pedido) }),
    () => ({ codigo: `B001-DEMO${String(Date.now()).slice(-4)}`, demo: true })
  )
export const urlComprobante = (codigo) => `${API_URL}/pedidos/${codigo}/comprobante`

// ---------- Mensajes ----------
export const enviarMensaje = (mensaje) =>
  conRespaldo(() => pedir('/mensajes', { method: 'POST', body: JSON.stringify(mensaje) }), () => ({ id: 0, demo: true }))
