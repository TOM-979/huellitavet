import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { ArrowRight, Plus, Star } from 'lucide-react'
import Foto from '../../ui/Foto.jsx'
import Boton from '../../ui/Boton.jsx'
import { Aparecer } from '../../ui/Movimiento.jsx'
import { soles } from '../../lib/formato.js'

const EASE = [0.23, 1, 0.32, 1]
// Misma foto y mismo encuadre (centrado) en la miniatura y en la tarjeta grande
const centrada = url => (url && !url.includes('crop=') ? `${url}${url.includes('?') ? '&' : '?'}crop=center` : url)

export default function MasPedidos({ productos, onVer, onAgregar }) {
  const [activo, setActivo] = useState(0)
  const [pausa, setPausa] = useState(false)
  const raiz = useRef(null)
  const enVista = useInView(raiz, { amount: 0.35 })
  const reducir = useReducedMotion()
  const lista = productos.slice(0, 6)
  useEffect(() => {
    if (reducir || pausa || !enVista || lista.length < 2) return
    const id = setTimeout(() => setActivo(a => (a + 1) % lista.length), 4200)
    return () => clearTimeout(id)
  }, [activo, pausa, enVista, reducir, lista.length])
  const p = lista[activo] ?? lista[0]
  if (!p) return null

  return (
    <section ref={raiz} id="mas-pedidos" className="scroll-mt-24 mx-auto max-w-7xl px-4 pt-28 md:px-8 md:pt-36">
      <Aparecer className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="max-w-lg text-5xl font-semibold md:text-6xl">Lo más pedido en la tienda</h2>
        <Boton to="/tienda" variante="contorno">Ir a la tienda<ArrowRight size={18} aria-hidden="true" /></Boton>
      </Aparecer>

      <div onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)} onFocus={() => setPausa(true)} onBlur={() => setPausa(false)} className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
        <Aparecer className="relative overflow-hidden rounded-[36px] bg-noche text-white">
          <AnimatePresence initial={false}>
            <motion.div key={p.id} className="absolute inset-0"
              initial={{ opacity: 0, transform: 'scale(1.06)' }} animate={{ opacity: 1, transform: 'scale(1)' }}
              exit={{ opacity: 0, transition: { duration: 0.35 } }} transition={{ duration: 0.7, ease: EASE }}>
              <Foto src={centrada(p.imagen)} alt="" ancho={900} alto={900} className="h-full w-full" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-noche via-noche/70 to-noche/10" aria-hidden="true" />
          <button type="button" onClick={() => onVer(p)} aria-label={`Ver detalle de ${p.nombre}`} className="absolute inset-0 z-10 cursor-pointer" />
          <div className="pointer-events-none relative z-20 flex min-h-[460px] flex-col justify-between p-6 md:min-h-[560px] md:p-9">
            <span className="self-start rounded-full bg-secundario px-3.5 py-1.5 text-sm font-semibold text-noche">#{activo + 1} más pedido</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={p.id}
                initial={{ opacity: 0, transform: 'translateY(14px)' }} animate={{ opacity: 1, transform: 'translateY(0px)' }}
                exit={{ opacity: 0, transform: 'translateY(-6px)', transition: { duration: 0.15 } }} transition={{ duration: 0.45, ease: EASE }}>
                <p className="text-sm font-medium text-white/90">{p.categoria_nombre}</p>
                <h3 className="mt-1 max-w-md text-3xl font-semibold leading-tight md:text-4xl">{p.nombre}</h3>
                <p className="mt-3 flex items-center gap-1.5 text-sm text-white/90">
                  <Star size={16} className="fill-secundario text-secundario" aria-hidden="true" />
                  <span className="font-semibold text-white">{p.rating}</span> · {p.resenas} opiniones
                </p>
                <div className="pointer-events-auto mt-6 flex flex-wrap items-center gap-3">
                  <span className="mr-2 font-display text-4xl font-semibold tabular-nums">{soles(p.precio)}</span>
                  <Boton onClick={() => onAgregar(p)} disabled={p.stock === 0}><Plus size={18} aria-hidden="true" />Agregar al carrito</Boton>
                  <Boton onClick={() => onVer(p)} variante="claro">Ver detalle</Boton>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Aparecer>

        <ol className="flex flex-col gap-2" aria-label="Ranking de los más pedidos">
          {lista.map((x, n) => {
            const sel = n === activo
            return (
              <Aparecer as="li" key={x.id} retraso={n * 0.06}>
                <button type="button" onMouseEnter={() => setActivo(n)} onFocus={() => setActivo(n)} onClick={() => onVer(x)}
                  className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-3xl p-3 pr-5 text-left transition-colors duration-300 ${sel ? 'bg-superficie shadow-flotante ring-1 ring-borde' : 'hover:bg-superficie/60'}`}>
                  {sel && <motion.span layoutId="ranking-activo" className="absolute inset-y-3 left-0 w-1 rounded-full bg-secundario" transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }} />}
                  <span className={`w-9 shrink-0 text-center font-display text-2xl font-semibold tabular-nums transition-colors duration-300 ${sel ? 'text-acento' : 'text-gris/60'}`}>
                    {String(n + 1).padStart(2, '0')}
                  </span>
                  <Foto src={centrada(x.imagen)} alt="" ancho={120} alto={120} className={`h-16 w-16 shrink-0 rounded-2xl bg-superficie object-cover ring-1 ring-borde transition-transform duration-500 ${sel ? 'scale-105' : ''}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{x.nombre}</span>
                    <span className="mt-0.5 flex items-center gap-1 text-sm text-gris">
                      <Star size={13} className="fill-secundario text-secundario" aria-hidden="true" />{x.rating} · {x.categoria_nombre}
                    </span>
                  </span>
                  <span className="shrink-0 font-display text-lg font-semibold tabular-nums">{soles(x.precio)}</span>
                </button>
              </Aparecer>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
