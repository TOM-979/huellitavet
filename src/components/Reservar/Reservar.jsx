// Patrón: Form (wizard): elegir mascota → servicio → fecha y hora → datos → confirmación
import './Reservar.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CalendarPlus, ChevronLeft, Clock, Stethoscope } from 'lucide-react'
import Foto from '../../ui/Foto.jsx'
import { CLINICA } from '../../lib/clinica.js'
import Boton from '../../ui/Boton.jsx'
import CheckAnimado from '../../ui/CheckAnimado.jsx'
import Esqueleto from '../../ui/Esqueleto.jsx'
import CabeceraPagina from '../../ui/CabeceraPagina.jsx'
import { useApi } from '../../lib/useApi.js'
import { crearCita, getDisponibilidad, getEspecies, getEstadisticas, getServicios } from '../../lib/api.js'
import { aISO, borrarLocal, duracion, esDomingo, fechaLarga, guardarLocal, hoyISO, leerLocal } from '../../lib/formato.js'

const PASOS = ['Mascota', 'Servicio', 'Fecha y hora', 'Tus datos']
const BORRADOR = 'huellitavet-reserva-v3'
const EASE = [0.23, 1, 0.32, 1]

const proximosDias = (n = 14) => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return aISO(d) })

function validarDatos(c, v) {
  if (c === 'nombre') return v.trim().length < 3 ? 'Escribe tu nombre y apellido.' : ''
  if (c === 'telefono') return /^9\d{8}$/.test(v.replace(/\s/g, '')) ? '' : 'Escribe un celular de 9 dígitos que empiece con 9, como 987 654 321.'
  if (c === 'correo') return v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Escribe un correo como nombre@correo.com, o déjalo vacío.' : ''
  return ''
}

export default function Reservar() {
  const [params] = useSearchParams()
  const reducir = useReducedMotion()
  const especies = useApi(getEspecies)
  const todos = useApi(() => getServicios())
  const stats = useApi(getEstadisticas)

  const [form, setForm] = useState(() => {
    const b = leerLocal(BORRADOR, {})
    const base = { especie: '', mascota: '', servicioId: params.get('servicio') ?? '', fecha: '', hora: '', nombre: '', telefono: '', correo: '', notas: '', ...b, telefono: '', correo: '' }
    if (params.get('servicio')) base.servicioId = params.get('servicio')
    if (base.fecha && base.fecha < hoyISO()) { base.fecha = ''; base.hora = '' }
    return base
  })
  const [paso, setPaso] = useState(0)
  const [direccion, setDireccion] = useState(1)
  const [errores, setErrores] = useState({})
  const [horarios, setHorarios] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cita, setCita] = useState(null)
  const enviandoRef = useRef(false)
  const panel = useRef(null)

  const especie = especies.datos?.find(e => e.slug === form.especie)
  const serviciosEspecie = useMemo(() => (todos.datos ?? []).filter(s => !form.especie || s.especies.includes(form.especie)), [todos.datos, form.especie])
  const servicio = todos.datos?.find(s => String(s.id) === String(form.servicioId))

  // Borrador automático (sin teléfono ni correo)
  useEffect(() => {
    if (cita) return
    const { telefono, correo, ...resto } = form
    guardarLocal(BORRADOR, resto)
  }, [form, cita])

  // Si el servicio elegido no atiende a esa especie, se limpia
  useEffect(() => {
    if (servicio && form.especie && !servicio.especies.includes(form.especie)) setForm(f => ({ ...f, servicioId: '' }))
  }, [form.especie, servicio])

  // Horarios disponibles según la fecha (desde la base de datos)
  useEffect(() => {
    if (!form.fecha) return
    let activo = true
    setHorarios(null)
    getDisponibilidad(form.fecha).then(h => activo && setHorarios(h)).catch(() => activo && setHorarios([]))
    return () => { activo = false }
  }, [form.fecha])

  const cambiar = (campo, valor) => {
    setForm(f => ({ ...f, [campo]: valor, ...(campo === 'fecha' ? { hora: '' } : {}) }))
    if (errores[campo]) setErrores(e => ({ ...e, [campo]: '' }))
  }

  const erroresPaso = (n) => {
    const e = {}
    if (n === 0) { if (!form.especie) e.especie = 'Elige la especie de tu mascota.'; if (!form.mascota.trim()) e.mascota = 'Escribe el nombre de tu mascota.' }
    if (n === 1 && !form.servicioId) e.servicioId = 'Elige el servicio que necesitas.'
    if (n === 2) { if (!form.fecha) e.fecha = 'Elige un día.'; else if (!form.hora) e.hora = 'Elige uno de los horarios disponibles.' }
    if (n === 3) for (const c of ['nombre', 'telefono', 'correo']) { const m = validarDatos(c, form[c]); if (m) e[c] = m }
    return e
  }

  const ir = (n) => { setDireccion(n > paso ? 1 : -1); setPaso(n); setErrorGeneral(''); requestAnimationFrame(() => panel.current?.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'start' })) }

  const continuar = async (e) => {
    e.preventDefault()
    const e2 = erroresPaso(paso)
    setErrores(e2)
    const primero = Object.keys(e2)[0]
    if (primero) { document.getElementById(`campo-${primero}`)?.focus(); return }
    if (paso < 3) return ir(paso + 1)
    if (enviandoRef.current) return
    enviandoRef.current = true; setEnviando(true); setErrorGeneral('')
    try {
      const r = await crearCita({ ...form, telefono: form.telefono.replace(/\s/g, ''), servicioId: Number(form.servicioId) })
      borrarLocal(BORRADOR)
      setCita(r)
      window.scrollTo({ top: 0, behavior: reducir ? 'auto' : 'smooth' })
    } catch (err) {
      setErrorGeneral(err.message)
      if (err.errores) setErrores(err.errores)
      if (err.status === 409) { setForm(f => ({ ...f, hora: '' })); getDisponibilidad(form.fecha).then(setHorarios).catch(() => {}); ir(2) }
    } finally { enviandoRef.current = false; setEnviando(false) }
  }

  if (cita) return <Confirmacion cita={cita} especie={especie} onOtra={() => { setCita(null); setForm(f => ({ ...f, servicioId: '', fecha: '', hora: '', notas: '' })); setPaso(1) }} />

  const variantes = {
    entra: (d) => ({ opacity: 0, transform: `translateX(${d * 24}px)` }),
    centro: { opacity: 1, transform: 'translateX(0px)' },
    sale: (d) => ({ opacity: 0, transform: `translateX(${d * -24}px)`, transition: { duration: 0.12 } }),
  }
  const claseInput = (err) => `min-h-12 w-full rounded-2xl border bg-superficie px-4 py-3 outline-none focus:ring-4 ${err ? 'border-error focus:ring-error/15' : 'border-borde focus:border-primario-oscuro focus:ring-primario/15'}`
  const Error = ({ c }) => errores[c] ? <p id={`error-${c}`} className="mt-2 text-sm text-error">{errores[c]}</p> : null

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 md:px-8">
      <CabeceraPagina titulo="Reserva tu cita" destacado="cita"
        descripcion="Cuatro pasos y listo. Te asignamos al especialista que corresponde a tu mascota."
        datos={[[4, 'pasos'], [stats.datos?.veterinarios ?? 4, 'especialistas'], ['S/ 0', 'de adelanto: pagas en la clínica']]} />

      {/* Progreso */}
      <ol className="mt-10 grid grid-cols-4 gap-2" aria-label="Pasos de la reserva">
        {PASOS.map((p, n) => (
          <li key={p}>
            <button type="button" onClick={() => n < paso && ir(n)} disabled={n > paso} aria-current={n === paso ? 'step' : undefined}
              className="group flex min-h-11 w-full flex-col justify-center text-left disabled:cursor-default md:justify-start">
              <span className="block h-1.5 overflow-hidden rounded-full bg-borde">
                <motion.span className="block h-full origin-left rounded-full bg-primario" initial={false}
                  animate={{ transform: `scaleX(${n < paso ? 1 : n === paso ? 0.5 : 0})` }} transition={{ duration: 0.35, ease: EASE }} />
              </span>
              <span className={`mt-2 hidden text-sm font-semibold md:block ${n === paso ? 'text-tinta' : n < paso ? 'text-acento group-hover:underline' : 'text-gris'}`}>{n + 1}. {p}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-sm font-semibold md:hidden">Paso {paso + 1} de 4: {PASOS[paso]}</p>

      <div ref={panel} className="mt-8 grid scroll-mt-24 items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
        <form onSubmit={continuar} noValidate className="min-h-[420px] overflow-hidden rounded-[32px] bg-superficie p-6 ring-1 ring-borde md:p-8" aria-busy={enviando}>
          <AnimatePresence mode="wait" custom={direccion} initial={false}>
            <motion.div key={paso} custom={direccion} variants={variantes} initial="entra" animate="centro" exit="sale" transition={{ duration: 0.25, ease: EASE }}>
              {paso === 0 && (
                <fieldset>
                  <legend className="font-display text-2xl font-semibold">¿A quién vamos a atender?</legend>
                  <div id="campo-especie" tabIndex={-1} role="radiogroup" aria-label="Especie" aria-describedby="error-especie"
                    className="mt-5 grid grid-cols-2 gap-3 outline-none md:grid-cols-4">
                    {especies.mostrarCarga && <Esqueleto cantidad={8} className="h-36" />}
                    {(especies.datos ?? []).map(e => {
                      const activo = form.especie === e.slug
                      return (
                        <button type="button" key={e.slug} role="radio" aria-checked={activo} onClick={() => cambiar('especie', e.slug)}
                          className={`presionable group relative overflow-hidden rounded-3xl text-left ring-2 ${activo ? 'ring-primario-oscuro' : 'ring-transparent hover:ring-primario/40'}`}>
                          <Foto src={e.imagen} alt="" ancho={240} alto={200} className="h-28 w-full" />
                          <span className={`block px-3 py-2 text-sm font-semibold ${activo ? 'bg-primario-oscuro text-white' : 'bg-fondo'}`}>{e.nombre}</span>
                        </button>
                      )
                    })}
                  </div>
                  <Error c="especie" />
                  <div className="mt-6 max-w-sm">
                    <label htmlFor="campo-mascota" className="mb-2 block text-sm font-semibold">Nombre de tu mascota</label>
                    <input id="campo-mascota" value={form.mascota} onChange={e => cambiar('mascota', e.target.value)} placeholder="Kiwi"
                      onBlur={() => !form.mascota.trim() && setErrores(x => ({ ...x, mascota: 'Escribe el nombre de tu mascota.' }))}
                      aria-invalid={Boolean(errores.mascota)} aria-describedby="error-mascota" className={claseInput(errores.mascota)} />
                    <Error c="mascota" />
                  </div>
                </fieldset>
              )}

              {paso === 1 && (
                <fieldset>
                  <legend className="font-display text-2xl font-semibold">¿Qué necesita {form.mascota || 'tu mascota'}?</legend>
                  <p className="mt-1 text-sm text-gris">{serviciosEspecie.length} servicios disponibles para {especie?.nombre.toLowerCase()}.</p>
                  <div id="campo-servicioId" tabIndex={-1} role="radiogroup" aria-label="Servicio" aria-describedby="error-servicioId" className="mt-5 grid gap-3 outline-none md:grid-cols-2">
                    {serviciosEspecie.map(s => {
                      const activo = String(form.servicioId) === String(s.id)
                      return (
                        <button type="button" key={s.id} role="radio" aria-checked={activo} onClick={() => cambiar('servicioId', String(s.id))}
                          className={`presionable flex items-center gap-3 rounded-3xl p-2 pr-4 text-left ring-2 ${activo ? 'bg-primario-claro ring-primario-oscuro' : 'bg-fondo ring-transparent hover:ring-primario/40'}`}>
                          <Foto src={s.imagen} alt="" ancho={120} alto={120} className="h-16 w-16 shrink-0 rounded-2xl" />
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold">{s.nombre}</span>
                            <span className="block text-sm text-gris">{s.desde ? 'Desde ' : ''}S/ {s.precio}, {duracion(s.duracion_min)}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <Error c="servicioId" />
                </fieldset>
              )}

              {paso === 2 && (
                <fieldset>
                  <legend className="font-display text-2xl font-semibold">¿Cuándo vienes?</legend>
                  <p id="dia-titulo" className="mt-5 text-sm font-semibold">Día</p>
                  <div id="campo-fecha" tabIndex={-1} role="radiogroup" aria-labelledby="dia-titulo" aria-describedby="error-fecha" className="sin-barra -mx-2 mt-2 flex gap-2 overflow-x-auto px-2 pb-2 outline-none">
                    {proximosDias().map(d => {
                      const fecha = new Date(`${d}T12:00:00`)
                      const cerrado = esDomingo(d)
                      const activo = form.fecha === d
                      return (
                        <button type="button" key={d} role="radio" aria-checked={activo} disabled={cerrado} onClick={() => cambiar('fecha', d)}
                          aria-label={`${fechaLarga(d)}${cerrado ? ', cerrado' : ''}`}
                          className={`presionable flex min-h-20 w-16 shrink-0 flex-col items-center justify-center rounded-2xl ring-2 ${activo ? 'bg-tinta text-fondo ring-tinta' : 'bg-fondo ring-transparent hover:ring-primario/40'} disabled:opacity-40`}>
                          <span className="text-xs capitalize">{fecha.toLocaleDateString('es-PE', { weekday: 'short' }).replace('.', '')}</span>
                          <span className="font-display text-2xl font-semibold">{fecha.getDate()}</span>
                          <span className="text-xs capitalize">{d === hoyISO() ? 'hoy' : fecha.toLocaleDateString('es-PE', { month: 'short' }).replace('.', '')}</span>
                        </button>
                      )
                    })}
                  </div>
                  <Error c="fecha" />
                  {form.fecha && (
                    <>
                      <p id="hora-titulo" className="mt-6 text-sm font-semibold">Hora del {fechaLarga(form.fecha)}</p>
                      <div id="campo-hora" tabIndex={-1} role="radiogroup" aria-labelledby="hora-titulo" aria-describedby="error-hora" className="mt-2 grid grid-cols-3 gap-2 outline-none md:grid-cols-5">
                        {!horarios && <Esqueleto cantidad={10} className="h-14 rounded-2xl" />}
                        {horarios?.length === 0 && <p className="col-span-full rounded-2xl bg-fondo p-4 text-sm text-gris">No quedan horarios para este día. Elige otro.</p>}
                        {horarios?.map(h => {
                          const activo = form.hora === h.hora
                          return (
                            <button type="button" key={h.hora} role="radio" aria-checked={activo} disabled={!h.disponible} onClick={() => cambiar('hora', h.hora)}
                              aria-label={`${h.hora}${h.disponible ? '' : ', ocupado'}`}
                              className={`presionable flex min-h-14 flex-col items-center justify-center rounded-2xl text-sm font-semibold ring-2 ${activo ? 'bg-primario-oscuro text-white ring-primario-oscuro' : 'bg-fondo ring-transparent hover:ring-primario/40'} disabled:bg-transparent disabled:text-gris disabled:line-through disabled:ring-borde`}>
                              {h.hora}
                              {h.disponible && h.libres === 1 && <span className={`text-xs font-normal ${activo ? 'text-white/80' : 'text-gris'}`}>último</span>}
                            </button>
                          )
                        })}
                      </div>
                      <Error c="hora" />
                    </>
                  )}
                </fieldset>
              )}

              {paso === 3 && (
                <fieldset>
                  <legend className="font-display text-2xl font-semibold">Tus datos</legend>
                  <p className="mt-1 text-sm text-gris">Te escribimos al celular para confirmar. No guardamos tu celular ni tu correo en este navegador.</p>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {[['nombre', 'Nombre y apellido', 'name', 'text', ''], ['telefono', 'Celular', 'tel-national', 'tel', '987 654 321'], ['correo', 'Correo (opcional)', 'email', 'email', 'nombre@correo.com']].map(([c, etiqueta, ac, tipo, ph]) => (
                      <div key={c} className={c === 'nombre' ? 'md:col-span-2' : ''}>
                        <label htmlFor={`campo-${c}`} className="mb-2 block text-sm font-semibold">{etiqueta}</label>
                        <input id={`campo-${c}`} type={tipo} autoComplete={ac} placeholder={ph || undefined} inputMode={c === 'telefono' ? 'numeric' : undefined}
                          value={form[c]} onChange={e => cambiar(c, e.target.value)} onBlur={() => setErrores(x => ({ ...x, [c]: validarDatos(c, form[c]) }))}
                          aria-invalid={Boolean(errores[c])} aria-describedby={`error-${c}`} className={claseInput(errores[c])} />
                        <Error c={c} />
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label htmlFor="campo-notas" className="mb-2 block text-sm font-semibold">¿Algo que debamos saber? (opcional)</label>
                      <textarea id="campo-notas" rows={3} value={form.notas} onChange={e => cambiar('notas', e.target.value)} className={claseInput()} />
                    </div>
                  </div>
                </fieldset>
              )}
            </motion.div>
          </AnimatePresence>

          {errorGeneral && <p role="alert" className="mt-6 rounded-2xl bg-error-fondo p-4 text-sm text-error-texto">{errorGeneral}</p>}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-borde pt-6">
            {paso > 0 ? <Boton type="button" variante="fantasma" onClick={() => ir(paso - 1)}><ChevronLeft size={18} aria-hidden="true" />Atrás</Boton> : <span />}
            <Boton type="submit" tamano="lg">{paso < 3 ? 'Continuar' : enviando ? 'Reservando…' : 'Confirmar reserva'}</Boton>
          </div>
        </form>

        {/* Resumen en vivo */}
        <aside className="overflow-hidden rounded-[32px] bg-noche text-white lg:sticky lg:top-24" aria-label="Resumen de la cita">
          <div className="relative h-40">
            <AnimatePresence initial={false}>
              <motion.div key={servicio?.imagen ?? especie?.imagen ?? 'vacio'} className="absolute inset-0"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                {(servicio?.imagen || especie?.imagen) && <Foto src={servicio?.imagen ?? especie?.imagen} alt="" ancho={520} alto={240} className="h-full w-full opacity-80" />}
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-noche to-transparent" aria-hidden="true" />
          </div>
          <dl className="space-y-4 p-6 pt-2">
            {[['Mascota', form.mascota ? `${form.mascota}${especie ? `, ${especie.nombre.toLowerCase()}` : ''}` : especie?.nombre],
              ['Servicio', servicio?.nombre], ['Fecha', form.fecha && fechaLarga(form.fecha)], ['Hora', form.hora]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-white/10 pb-3">
                <dt className="text-sm text-[#C9DADF]">{k}</dt>
                <dd className={`text-right font-semibold first-letter:uppercase ${v ? '' : 'text-[#9FB7BD]'}`}>{v || 'Por elegir'}</dd>
              </div>
            ))}
            <div className="flex justify-between pt-1 font-display text-2xl font-semibold">
              <dt>Total</dt><dd>{servicio ? `${servicio.desde ? 'Desde ' : ''}S/ ${servicio.precio}` : '—'}</dd>
            </div>
            <p className="text-xs text-[#C9DADF]">Pagas en la clínica. Puedes cancelar hasta 2 horas antes.</p>
          </dl>
        </aside>
      </div>
    </div>
  )
}

function Confirmacion({ cita, especie, onOtra }) {
  const inicio = `${cita.fecha.replaceAll('-', '')}T${cita.hora.replace(':', '')}00`
  const fin = (() => { const [h, m] = cita.hora.split(':').map(Number); const t = h * 60 + m + 30; return `${cita.fecha.replaceAll('-', '')}T${String(Math.floor(t / 60)).padStart(2, '0')}${String(t % 60).padStart(2, '0')}00` })()
  const calendario = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${cita.servicio} para ${cita.mascota} · HuellitaVet`)}&dates=${inicio}/${fin}&ctz=America/Lima&location=${encodeURIComponent(CLINICA.direccionLima)}&details=${encodeURIComponent(`Código de reserva: ${cita.codigo}`)}`
  return (
    <div className="mx-auto max-w-2xl px-4 pt-16 text-center">
      <div className="flex justify-center"><CheckAnimado tamano={104} /></div>
      <motion.div initial={{ opacity: 0, transform: 'translateY(8px)' }} animate={{ opacity: 1, transform: 'translateY(0px)' }} transition={{ duration: 0.35, delay: 0.3, ease: EASE }}>
        <h1 className="mt-6 text-5xl font-bold">Cita confirmada</h1>
        <p className="mt-3 text-lg text-gris">
          Te esperamos con <b className="text-tinta">{cita.mascota}</b> el <b className="text-tinta">{fechaLarga(cita.fecha)}</b> a las <b className="text-tinta">{cita.hora}</b>.
        </p>
        <div className="mx-auto mt-8 max-w-md rounded-[28px] bg-superficie p-6 text-left ring-1 ring-borde">
          <p className="text-sm text-gris">Código de reserva</p>
          <p className="font-display text-3xl font-semibold tracking-wide">{cita.codigo}</p>
          <div className="mt-4 space-y-2 border-t border-borde pt-4 text-sm">
            <p className="flex items-center gap-2"><Stethoscope size={16} className="text-primario" aria-hidden="true" />{cita.servicio} con {cita.veterinario}</p>
            <p className="flex items-center gap-2"><Clock size={16} className="text-primario" aria-hidden="true" />Llega 10 minutos antes{especie ? `, con ${especie.grupo === 'Aves' ? 'tu ave en su jaula o transportadora' : 'su carné o historial si lo tienes'}` : ''}.</p>
          </div>
          {cita.demo && <p className="mt-4 rounded-2xl bg-aviso-fondo p-3 text-sm text-aviso-texto">Modo demostración: la cita no se guardó porque la API está apagada.</p>}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Boton href={calendario} target="_blank" rel="noreferrer" variante="verde"><CalendarPlus size={18} aria-hidden="true" />Agregar a mi calendario</Boton>
          <Boton variante="contorno" onClick={onOtra}>Reservar otra cita</Boton>
          <Link to="/" className="flex min-h-12 items-center px-4 font-semibold text-acento underline underline-offset-4">Volver al inicio</Link>
        </div>
      </motion.div>
    </div>
  )
}
