import './Tienda.css'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import TarjetaProducto from '../../ui/TarjetaProducto.jsx'
import ModalProducto from '../ModalProducto/ModalProducto.jsx'
import ChipsEspecies from '../../ui/ChipsEspecies.jsx'
import Esqueleto from '../../ui/Esqueleto.jsx'
import Boton from '../../ui/Boton.jsx'
import CabeceraPagina from '../../ui/CabeceraPagina.jsx'
import Abanico from '../../ui/Abanico.jsx'
import Foto from '../../ui/Foto.jsx'
import { Huella } from '../../ui/Logo.jsx'
import { Aparecer } from '../../ui/Movimiento.jsx'
import { useApi } from '../../lib/useApi.js'
import { useCarrito } from '../../context/Carrito.jsx'
import { useAvisos } from '../../context/Avisos.jsx'
import { getCategorias, getEspecies, getEstadisticas, getProductos } from '../../lib/api.js'
import { guardarLocal, leerLocal } from '../../lib/formato.js'

const ORDENES = { relevancia: 'Más populares', 'precio-asc': 'Precio: menor a mayor', 'precio-desc': 'Precio: mayor a menor', rating: 'Mejor valorados' }
const POR_PAGINA = 12

export default function Tienda() {
  const [params, setParams] = useSearchParams()
  const especie = params.get('especie') ?? ''
  const categoria = params.get('categoria') ?? ''
  const orden = params.get('orden') ?? leerLocal('huellitavet-orden', 'relevancia')
  const pagina = Number(params.get('pagina') ?? 1)
  const [texto, setTexto] = useState(params.get('q') ?? '')
  const q = params.get('q') ?? ''
  const buscador = useRef(null)
  const inicioLista = useRef(null)

  const especies = useApi(getEspecies)
  const categorias = useApi(getCategorias)
  const stats = useApi(getEstadisticas)
  const destacados = useApi(() => getProductos({ orden: 'rating', limite: 3 }))
  const productos = useApi(() => getProductos({ q, especie, categoria, orden, pagina, limite: POR_PAGINA }), [q, especie, categoria, orden, pagina])
  const { agregar, setAbierto } = useCarrito()
  const avisar = useAvisos()
  const [detalle, setDetalle] = useState(null)

  const cambiar = (cambios) => {
    const p = new URLSearchParams(params)
    for (const [k, v] of Object.entries(cambios)) v ? p.set(k, v) : p.delete(k)
    if (!('pagina' in cambios)) p.delete('pagina')
    setParams(p, { replace: true, preventScrollReset: true })
  }

  // Búsqueda mientras escribes (espera 250 ms para no consultar en cada tecla)
  useEffect(() => {
    if (texto === q) return
    const t = setTimeout(() => cambiar({ q: texto.trim() }), 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto])
  useEffect(() => guardarLocal('huellitavet-orden', orden), [orden])
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) { e.preventDefault(); buscador.current?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const irPagina = (n) => { cambiar({ pagina: n > 1 ? String(n) : '' }); inicioLista.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const limpiar = () => { setTexto(''); setParams(new URLSearchParams(orden !== 'relevancia' ? { orden } : {}), { replace: true, preventScrollReset: true }) }
  const agregarConAviso = (p, c = 1) => {
    agregar(p, c)
    avisar({ titulo: 'Agregado al carrito', texto: p.nombre, accion: { texto: 'Ver carrito', onClick: () => setAbierto(true) } })
  }

  const nombreEspecie = especies.datos?.find(e => e.slug === especie)?.nombre
  const nombreCategoria = categorias.datos?.find(c => c.slug === categoria)?.nombre
  const activos = [
    q && { texto: `«${q}»`, quitar: () => { setTexto(''); cambiar({ q: '' }) } },
    nombreEspecie && { texto: nombreEspecie, quitar: () => cambiar({ especie: '' }) },
    nombreCategoria && { texto: nombreCategoria, quitar: () => cambiar({ categoria: '' }) },
  ].filter(Boolean)
  const res = productos.datos

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 md:px-8">
      <CabeceraPagina titulo="Tienda para cada especie" destacado="cada especie"
        descripcion="Alimento, salud, hábitats y juguetes para perros, gatos, aves, roedores, reptiles y peces. Recógelo en la clínica en 2 horas."
        datos={[[stats.datos?.productos ?? 45, 'productos'], [categorias.datos?.length || 12, 'categorías'], ['2 h', 'para recoger en la clínica']]}
        lado={destacados.datos?.items?.length ? <Abanico productos={destacados.datos.items} onVer={setDetalle} /> : null} />

      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-10">
        <Aparecer as="aside" retraso={0.15} aria-label="Filtros de la tienda" className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[32px] bg-superficie/80 p-4 ring-1 ring-borde backdrop-blur-sm lg:p-5">
            <label htmlFor="buscar" className="mb-2 flex items-center justify-between gap-2 px-1 text-sm font-semibold">
              Buscar <kbd className="hidden rounded border border-borde bg-fondo px-1.5 text-xs font-normal text-gris md:inline">/</kbd>
            </label>
            <div className="relative">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gris" aria-hidden="true" />
              <input id="buscar" ref={buscador} type="search" value={texto} onChange={e => setTexto(e.target.value)} placeholder="heno, arena, terrario…"
                className="min-h-12 w-full rounded-full border border-borde bg-fondo pl-11 pr-4 text-base outline-none focus:border-primario-oscuro focus:ring-4 focus:ring-primario/15" />
            </div>

            <p id="filtro-especie" className="mb-2 mt-5 px-1 text-sm font-semibold">Especie</p>
            <div className="lg:hidden"><ChipsEspecies especies={especies.datos ?? []} valor={especie} onCambiar={(v) => cambiar({ especie: v })} idGrupo="tienda" etiqueta="Filtrar productos por especie" /></div>
            <div role="radiogroup" aria-labelledby="filtro-especie" className="hidden max-h-[22rem] space-y-0.5 overflow-y-auto pr-1 lg:block">
              {[{ slug: '', nombre: 'Todas las especies' }, ...(especies.datos ?? [])].map(e => {
                const activo = especie === e.slug
                return (
                  <button key={e.slug || 'todas'} role="radio" aria-checked={activo} onClick={() => cambiar({ especie: e.slug })}
                    className={`relative flex min-h-11 w-full items-center gap-3 rounded-2xl px-2 text-left text-sm font-semibold transition-colors ${activo ? 'text-fondo' : 'hover:bg-fondo'}`}>
                    {activo && <motion.span layoutId="especie-lateral" className="absolute inset-0 rounded-2xl bg-tinta" transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }} />}
                    {e.imagen
                      ? <Foto src={e.imagen} alt="" ancho={64} alto={64} className="relative h-8 w-8 rounded-full" />
                      : <span className="relative grid h-8 w-8 place-items-center rounded-full bg-primario-claro text-acento"><Huella className="h-4 w-4" /></span>}
                    <span className="relative flex-1">{e.nombre}</span>
                    {e.productos ? <span className={`relative text-xs tabular-nums ${activo ? 'opacity-70' : 'text-gris'}`}>{e.productos}</span> : null}
                  </button>
                )
              })}
            </div>

            <p id="filtro-categoria" className="mb-2 mt-5 px-1 text-sm font-semibold">Categoría</p>
            <div role="radiogroup" aria-labelledby="filtro-categoria" className="sin-barra -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:block lg:space-y-0.5 lg:px-0">
              {[{ slug: '', nombre: 'Todas' }, ...(categorias.datos ?? [])].map(c => {
                const activo = categoria === c.slug
                return (
                  <button key={c.slug || 'todas'} role="radio" aria-checked={activo} onClick={() => cambiar({ categoria: c.slug })}
                    className={`presionable flex min-h-11 shrink-0 items-center justify-between gap-3 rounded-full px-4 text-sm font-semibold lg:w-full lg:rounded-2xl lg:px-3 ${activo ? 'bg-primario-oscuro text-white' : 'bg-fondo text-tinta hover:bg-primario-claro lg:bg-transparent'}`}>
                    <span className="flex items-center gap-2">
                      <span className={`hidden h-1.5 w-1.5 rounded-full lg:block ${activo ? 'bg-secundario' : 'bg-borde'}`} aria-hidden="true" />{c.nombre}
                    </span>
                    {c.productos ? <span className={`text-xs tabular-nums ${activo ? 'opacity-80' : 'text-gris'}`}>{c.productos}</span> : null}
                  </button>
                )
              })}
            </div>
          </div>
        </Aparecer>

        <div className="min-w-0">
          <div ref={inicioLista} className="flex scroll-mt-28 flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-2xl font-semibold" aria-live="polite">
                {productos.cargando && !res ? 'Cargando productos…' : res && `${res.total} ${res.total === 1 ? 'producto' : 'productos'}`}
              </p>
              {activos.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2" aria-label="Filtros activos">
                  {activos.map(f => (
                    <button key={f.texto} onClick={f.quitar} aria-label={`Quitar filtro ${f.texto}`}
                      className="presionable flex min-h-9 items-center gap-2 rounded-full bg-primario-claro pl-3.5 pr-2.5 text-sm font-semibold text-acento hover:bg-primario-claro-hover">
                      {f.texto}<X size={14} aria-hidden="true" />
                    </button>
                  ))}
                  <button onClick={limpiar} className="min-h-9 px-2 text-sm font-semibold text-gris underline underline-offset-4 hover:text-tinta">Limpiar todo</button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="orden" className="text-sm font-semibold text-gris">Ordenar</label>
              <select id="orden" value={orden} onChange={e => cambiar({ orden: e.target.value })}
                className="min-h-11 rounded-full border border-borde bg-superficie px-4 text-sm font-semibold outline-none focus:border-primario-oscuro focus:ring-4 focus:ring-primario/15">
                {Object.entries(ORDENES).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
              </select>
            </div>
          </div>

          {productos.mostrarCarga && !res ? (
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3"><Esqueleto cantidad={6} className="aspect-[4/5]" /></div>
          ) : res && res.total === 0 ? (
            <div className="mt-6 rounded-[32px] border border-borde bg-superficie p-10 text-center">
              <h2 className="text-2xl font-semibold">Ningún producto coincide con tu búsqueda</h2>
              <p className="mx-auto mt-2 max-w-md text-gris">Quita algún filtro o prueba con otra palabra. Si buscas algo especial, pídelo por WhatsApp y lo conseguimos.</p>
              <Boton variante="verde" className="mt-6" onClick={limpiar}>Limpiar filtros</Boton>
            </div>
          ) : (
            <motion.div layout className={`mt-6 grid grid-cols-2 gap-x-4 gap-y-10 transition-opacity duration-200 md:grid-cols-3 ${productos.cargando ? 'opacity-60' : ''}`}>
              <AnimatePresence mode="popLayout">
                {(res?.items ?? []).map((p, n) => (
                  <motion.div key={p.id} layout initial={{ opacity: 0, transform: 'translateY(16px) scale(0.98)' }} animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
                    exit={{ opacity: 0, transform: 'scale(0.97)', transition: { duration: 0.12 } }} transition={{ duration: 0.4, delay: Math.min(n, 8) * 0.04, ease: [0.23, 1, 0.32, 1] }}>
                    <TarjetaProducto producto={p} onVer={setDetalle} onAgregar={agregarConAviso} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {res && res.paginas > 1 && (
            <nav aria-label="Paginación" className="mt-12 flex flex-wrap items-center justify-center gap-2">
              <Boton variante="contorno" tamano="sm" onClick={() => irPagina(pagina - 1)} disabled={pagina <= 1}><ChevronLeft size={16} aria-hidden="true" />Anterior</Boton>
              {Array.from({ length: res.paginas }, (_, n) => n + 1).map(n => (
                <button key={n} onClick={() => irPagina(n)} aria-current={n === pagina ? 'page' : undefined} aria-label={`Página ${n}`}
                  className={`presionable h-11 w-11 shrink-0 rounded-full text-sm font-semibold ${n === pagina ? 'bg-tinta text-fondo' : 'bg-superficie ring-1 ring-borde hover:ring-tinta'}`}>{n}</button>
              ))}
              <Boton variante="contorno" tamano="sm" onClick={() => irPagina(pagina + 1)} disabled={pagina >= res.paginas}>Siguiente<ChevronRight size={16} aria-hidden="true" /></Boton>
            </nav>
          )}
        </div>
      </div>

      <ModalProducto producto={detalle} especies={especies.datos ?? []} onCerrar={() => setDetalle(null)} onAgregar={agregarConAviso} />
    </div>
  )
}
