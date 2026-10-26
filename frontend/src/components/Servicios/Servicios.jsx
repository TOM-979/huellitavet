import './Servicios.css'
import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { ArrowUpRight, Check, Clock, Phone } from 'lucide-react'
import ChipsEspecies from '../../ui/ChipsEspecies.jsx'
import Esqueleto from '../../ui/Esqueleto.jsx'
import Boton from '../../ui/Boton.jsx'
import Foto from '../../ui/Foto.jsx'
import CabeceraPagina from '../../ui/CabeceraPagina.jsx'
import { Aparecer } from '../../ui/Movimiento.jsx'
import { useApi } from '../../lib/useApi.js'
import { getEspecies, getEstadisticas, getServicios } from '../../lib/api.js'
import { duracion } from '../../lib/formato.js'

const CATEGORIAS = ['Salud', 'Prevención', 'Diagnóstico', 'Cirugía', 'Especialidades', 'Estética', 'Bienestar', 'Cuidados']
const EASE = [0.23, 1, 0.32, 1]

export default function Servicios() {
  const [params, setParams] = useSearchParams()
  const especie = params.get('especie') ?? ''
  const categoria = params.get('categoria') ?? ''
  const especies = useApi(getEspecies)
  const servicios = useApi(() => getServicios({ especie, categoria }), [especie, categoria])
  const stats = useApi(getEstadisticas)
  const cambiar = (clave, valor) => {
    const p = new URLSearchParams(params)
    valor ? p.set(clave, valor) : p.delete(clave)
    setParams(p, { replace: true, preventScrollReset: true })
  }
  const nombreEspecie = especies.datos?.find(e => e.slug === especie)?.nombre
  const lista = servicios.datos ?? []
  const grupos = CATEGORIAS.map(c => [c, lista.filter(s => s.categoria === c)]).filter(([, l]) => l.length)

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 md:px-8">
      <CabeceraPagina titulo="Servicios veterinarios para todas las especies" destacado="todas las especies"
        descripcion="Desde la consulta general hasta medicina de aves y exóticos. Elige a tu mascota y te mostramos lo que podemos hacer por ella."
        datos={[[stats.datos?.servicios ?? 16, 'servicios'], [stats.datos?.especies ?? 11, 'especies'], [stats.datos?.veterinarios ?? 4, 'especialistas'], ['24 h', 'emergencias']]} />

      <Aparecer retraso={0.2} className="filtros mt-10 rounded-[32px] bg-superficie/80 p-4 ring-1 ring-borde backdrop-blur-sm md:p-5">
        <p className="mb-3 px-1 text-sm font-semibold text-gris">¿Para quién es la consulta?</p>
        <ChipsEspecies especies={especies.datos ?? []} valor={especie} onCambiar={(v) => cambiar('especie', v)} idGrupo="servicios" />
        <div className="mt-4 border-t border-borde pt-3">
          <div role="radiogroup" aria-label="Filtrar por tipo de servicio" className="sin-barra -mx-1 flex gap-1 overflow-x-auto px-1">
            {['', ...CATEGORIAS].map(c => {
              const activo = categoria === c
              return (
                <button key={c || 'todos'} role="radio" aria-checked={activo} onClick={() => cambiar('categoria', c)}
                  className={`relative min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors duration-200 ${activo ? 'text-tinta' : 'text-gris hover:text-tinta'}`}>
                  {activo && <motion.span layoutId="tipo-servicio" className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-secundario" transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }} />}
                  {c || 'Todos los tipos'}
                </button>
              )
            })}
          </div>
        </div>
      </Aparecer>

      <p className="mt-8 text-sm text-gris" aria-live="polite">
        {servicios.cargando ? 'Buscando servicios…' : `${lista.length} ${lista.length === 1 ? 'servicio' : 'servicios'}${nombreEspecie ? ` para ${nombreEspecie.toLowerCase()}` : ''}${categoria ? ` de ${categoria.toLowerCase()}` : ''}`}
      </p>

      {servicios.mostrarCarga ? (
        <div className="mt-6 space-y-3"><Esqueleto cantidad={5} className="h-24" /></div>
      ) : lista.length === 0 ? (
        <div className="mt-6 rounded-[32px] border border-borde bg-superficie p-10 text-center">
          <h2 className="text-2xl font-semibold">No hay servicios de ese tipo para esta especie</h2>
          <p className="mx-auto mt-2 max-w-md text-gris">Prueba con otro tipo de servicio o escríbenos: muchas veces podemos ayudarte igual.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Boton variante="verde" onClick={() => cambiar('categoria', '')}>Ver todos los tipos</Boton>
            <Boton to="/contacto" variante="contorno">Escribirnos</Boton>
          </div>
        </div>
      ) : (
        <ListaServicios grupos={grupos} especies={especies.datos ?? []} />
      )}

      <Aparecer as="section" aria-label="Información de atención" className="relative mt-24 overflow-hidden rounded-[40px] bg-noche p-8 text-white md:p-12">
        <div className="grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-white/10">
          {[
            ['9:00 – 19:00', 'Lunes a sábado', 'Atención por orden de reserva. Puedes reservar en línea en menos de un minuto.'],
            ['24 h', 'Emergencias', 'Siempre hay un veterinario de turno. Llama y ven directo, sin reservar.'],
            ['2', 'Consultorios separados', 'Uno para gatos y otro para aves y exóticos: menos estrés, sin ladridos.'],
          ].map(([cifra, t, d]) => (
            <div key={t} className="md:px-10 md:first:pl-0 md:last:pr-0">
              <p className="font-display text-5xl font-semibold text-acento">{cifra}</p>
              <h2 className="mt-3 font-sans text-lg font-semibold">{t}</h2>
              <p className="mt-1 text-[#C9DADF]">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3 border-t border-white/10 pt-8">
          <Boton to="/reservar" tamano="lg">Reservar cita</Boton>
          <Boton href="tel:015551234" tamano="lg" variante="claro"><Phone size={18} aria-hidden="true" />Llamar a emergencias</Boton>
        </div>
      </Aparecer>
    </div>
  )
}

function ListaServicios({ grupos, especies }) {
  const reducir = useReducedMotion()
  const caja = useRef(null)
  const [encima, setEncima] = useState(null)
  const [abierto, setAbierto] = useState(null)
  const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 28 }), sy = useSpring(y, { stiffness: 260, damping: 28 })
  const mover = e => {
    if (e.pointerType !== 'mouse' || !caja.current) return
    const r = caja.current.getBoundingClientRect()
    x.set(e.clientX - r.left + 28)
    y.set(e.clientY - r.top - 90)
  }
  let numero = 0

  return (
    <div ref={caja} className="relative mt-6" onPointerMove={mover} onPointerLeave={() => setEncima(null)}>
      {!reducir && (
        <motion.div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-30 hidden h-44 w-64 overflow-hidden rounded-3xl shadow-flotante ring-1 ring-borde lg:block"
          style={{ x: sx, y: sy }}
          animate={{ opacity: encima && encima.id !== abierto ? 1 : 0, scale: encima && encima.id !== abierto ? 1 : 0.85, rotate: encima ? -3 : 0 }} transition={{ duration: 0.25, ease: EASE }}>
          <AnimatePresence initial={false}>
            {encima && (
              <motion.div key={encima.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <Foto src={encima.imagen} alt="" ancho={520} alto={360} className="h-full w-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {grupos.map(([categoria, items]) => (
        <section key={categoria} className="grid border-t border-borde py-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:py-10" aria-labelledby={`tipo-${categoria}`}>
          <div className="mb-3 lg:mb-0">
            <div className="lg:sticky lg:top-28">
              <h2 id={`tipo-${categoria}`} className="text-2xl font-semibold lg:text-3xl">{categoria}</h2>
              <p className="mt-1 text-sm text-gris">{items.length} {items.length === 1 ? 'servicio' : 'servicios'}</p>
            </div>
          </div>
          <ul>
            {items.map(s => {
              numero += 1
              const abiertoAqui = abierto === s.id
              const atiende = s.especies.map(slug => especies.find(e => e.slug === slug)).filter(Boolean)
              return (
                <Aparecer as="li" key={s.id} distancia={14} onMouseEnter={() => setEncima(s)}
                  className={`servicio-fila group rounded-[28px] transition-colors duration-300 ${abiertoAqui ? 'bg-superficie shadow-flotante ring-1 ring-borde' : 'hover:bg-superficie/70'}`}>
                  <button type="button" onClick={() => setAbierto(abiertoAqui ? null : s.id)} aria-expanded={abiertoAqui} aria-controls={`detalle-${s.id}`}
                    className="flex w-full items-center gap-4 px-4 py-5 text-left md:gap-6 md:px-6">
                    <Foto src={s.imagen} alt="" ancho={120} alto={120} className="h-14 w-14 shrink-0 rounded-2xl lg:hidden" />
                    <span className="hidden w-8 shrink-0 font-display text-lg font-semibold text-gris/60 tabular-nums lg:block">{String(numero).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1">
                      <span className="servicio-nombre block font-display text-xl font-semibold md:text-3xl">{s.nombre}</span>
                      <span className="mt-1 hidden text-gris md:line-clamp-1">{s.descripcion}</span>
                    </span>
                    <span className="hidden shrink-0 items-center -space-x-2 xl:flex" aria-hidden="true">
                      {atiende.slice(0, 4).map(e => <Foto key={e.slug} src={e.imagen} alt="" ancho={64} alto={64} className="h-8 w-8 rounded-full ring-2 ring-fondo" />)}
                      {atiende.length > 4 && <span className="grid h-8 w-8 place-items-center rounded-full bg-primario-claro text-xs font-semibold text-acento ring-2 ring-fondo">+{atiende.length - 4}</span>}
                    </span>
                    <span className="hidden shrink-0 items-center gap-1 text-sm text-gris md:flex"><Clock size={14} aria-hidden="true" />{duracion(s.duracion_min)}</span>
                    <span className="shrink-0 text-right">
                      <span className="block text-xs text-gris">{s.desde ? 'desde' : 'precio'}</span>
                      <span className="font-display text-xl font-semibold tabular-nums text-acento md:text-2xl">S/ {s.precio}</span>
                    </span>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ring-1 ring-borde transition-[transform,background-color,color] duration-300 ${abiertoAqui ? 'rotate-45 bg-tinta text-fondo' : 'group-hover:bg-secundario group-hover:text-noche'}`} aria-hidden="true">
                      <ArrowUpRight size={18} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {abiertoAqui && (
                      <motion.div id={`detalle-${s.id}`} key="detalle" className="overflow-hidden"
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }} transition={{ duration: 0.4, ease: EASE }}>
                        <div className="grid gap-6 px-4 pb-6 md:grid-cols-[minmax(0,1fr)_260px] md:px-6 lg:pl-20">
                          <div>
                            <p className="text-gris md:hidden">{s.descripcion}</p>
                            <ul className="mt-4 grid gap-2 sm:grid-cols-3 md:mt-0">
                              {s.incluye.map(i => <li key={i} className="flex gap-2 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-acento" aria-hidden="true" />{i}</li>)}
                            </ul>
                            <p className="mt-4 text-sm text-gris">Atiende a: {atiende.map(e => e.nombre).join(', ')}</p>
                          </div>
                          <div className="flex flex-col gap-3 md:items-end md:justify-end">
                            <Boton to={`/reservar?servicio=${s.id}`} aria-label={`Reservar ${s.nombre}`}>Reservar este servicio</Boton>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Aparecer>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
