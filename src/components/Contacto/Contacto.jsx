// Patrón: ruta de marketing «Contact»: formulario corto + tarjetas de información + mapa + preguntas frecuentes
import './Contacto.css'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, LoaderCircle, Mail, MapPin, MessageCircle, Phone, Plus, Send } from 'lucide-react'
import Boton from '../../ui/Boton.jsx'
import Foto from '../../ui/Foto.jsx'
import CheckAnimado from '../../ui/CheckAnimado.jsx'
import { Aparecer, TituloAnimado } from '../../ui/Movimiento.jsx'
import { enviarMensaje } from '../../lib/api.js'
import { IMAGEN_CTA } from '../../lib/escenas.js'
import { CLINICA, estadoClinica } from '../../lib/clinica.js'

const EASE = [0.23, 1, 0.32, 1]
const ASUNTOS = ['Consulta', 'Tienda y pedidos', 'Emergencia', 'Otro']
const PREGUNTAS = [
  ['¿Atienden animales exóticos?', 'Sí. Lia, nuestra especialista en aves y exóticos, atiende loros, periquitos, cuyes, conejos, hámsters, hurones, tortugas y reptiles. Tenemos un consultorio separado para ellos.'],
  ['¿Necesito reservar para una emergencia?', 'No. Llama al (01) 555-1234 y ven directo: siempre hay un veterinario de turno, las 24 horas.'],
  ['¿Cómo recojo un pedido de la tienda?', 'Tu pedido está listo en 2 horas. Muestra el código de tu comprobante en recepción y pagas al recoger.'],
  ['¿Qué métodos de pago aceptan?', 'Efectivo, tarjetas de débito y crédito, Yape y Plin.'],
  ['¿Puedo cancelar o cambiar mi cita?', 'Sí, hasta 2 horas antes. Escríbenos por WhatsApp con tu código de reserva.'],
]

// Campo con etiqueta flotante: la etiqueta sube y se achica al escribir o enfocar
function Campo({ id, etiqueta, valor, onCambiar, onSalir, error, tipo = 'text', multilinea, autoComplete, maximo }) {
  const [foco, setFoco] = useState(false)
  const arriba = foco || valor.length > 0
  const Tag = multilinea ? 'textarea' : 'input'
  return (
    <div>
      <div className={`relative rounded-2xl border bg-superficie transition-colors duration-150 ${error ? 'border-error' : foco ? 'border-primario-oscuro ring-4 ring-primario/15' : 'border-borde'}`}>
        <label htmlFor={id} className="pointer-events-none absolute left-4 top-4 origin-left text-gris transition-transform duration-200"
          style={{ transform: arriba ? 'translateY(-10px) scale(0.78)' : 'none', transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}>
          {etiqueta}
        </label>
        <Tag id={id} type={multilinea ? undefined : tipo} value={valor} rows={multilinea ? 5 : undefined} autoComplete={autoComplete} maxLength={maximo}
          onChange={e => onCambiar(e.target.value)} onFocus={() => setFoco(true)} onBlur={() => { setFoco(false); onSalir() }}
          aria-invalid={Boolean(error)} aria-describedby={`${id}-ayuda`}
          className={`block w-full resize-none rounded-2xl bg-transparent px-4 pb-3 pt-7 outline-none ${multilinea ? '' : 'min-h-14'}`} />
      </div>
      <div id={`${id}-ayuda`} className="mt-1 flex justify-between gap-2 text-sm">
        <span className="text-error">{error}</span>
        {maximo && <span className="text-xs text-gris tabular-nums">{valor.length}/{maximo}</span>}
      </div>
    </div>
  )
}

const validar = (c, v) => {
  if (c === 'nombre') return v.trim() ? '' : 'Escribe tu nombre.'
  if (c === 'correo') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Escribe un correo como nombre@correo.com.'
  if (c === 'mensaje') return v.trim().length >= 10 ? '' : 'Cuéntanos un poco más (mínimo 10 caracteres).'
  return ''
}

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', correo: '', asunto: 'Consulta', mensaje: '' })
  const [errores, setErrores] = useState({})
  const [estado, setEstado] = useState('listo') // listo | enviando | enviado
  const [error, setError] = useState('')
  const [clinica, setClinica] = useState(estadoClinica)
  const enviando = useRef(false)

  useEffect(() => { const t = setInterval(() => setClinica(estadoClinica()), 60000); return () => clearInterval(t) }, [])

  const cambiar = (c, v) => { setForm(f => ({ ...f, [c]: v })); if (errores[c]) setErrores(e => ({ ...e, [c]: '' })) }

  const enviar = async (e) => {
    e.preventDefault()
    if (enviando.current) return
    const nuevos = Object.fromEntries(['nombre', 'correo', 'mensaje'].map(c => [c, validar(c, form[c])]))
    setErrores(nuevos)
    const primero = Object.keys(nuevos).find(c => nuevos[c])
    if (primero) { document.getElementById(`contacto-${primero}`)?.focus(); return }
    enviando.current = true; setEstado('enviando'); setError('')
    try {
      await enviarMensaje(form)
      setEstado('enviado')
    } catch (err) {
      setError(err.message); setEstado('listo')
    } finally { enviando.current = false }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 md:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        {/* Columna de información */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-superficie px-3 py-2 text-sm font-semibold ring-1 ring-borde" role="status">
            <span className="relative flex h-2.5 w-2.5">
              {clinica.abierto && <span className="absolute inline-flex h-full w-full rounded-full bg-primario opacity-60 motion-safe:animate-ping" />}
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${clinica.abierto ? 'bg-primario' : 'bg-gris'}`} />
            </span>
            {clinica.texto}
          </p>
          <TituloAnimado texto="Hablemos de tu mascota" destacado="tu mascota" className="mt-6 text-5xl font-bold md:text-6xl lg:text-7xl" />
          <Aparecer retraso={0.3} distancia={12}><p className="mt-4 max-w-md text-lg text-gris md:text-xl">Respondemos los mensajes el mismo día. Si es urgente, llámanos: siempre contesta un veterinario.</p></Aparecer>

          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {[
              [MessageCircle, 'WhatsApp', '987 654 321', 'https://wa.me/51987654321'],
              [Phone, 'Emergencias 24 h', '(01) 555-1234', 'tel:015551234'],
              [Mail, 'Correo', 'hola@huellitavet.pe', 'mailto:hola@huellitavet.pe'],
              [MapPin, 'Visítanos', CLINICA.calle, CLINICA.mapa],
            ].map(([Icono, t, d, href], n) => (
              <Aparecer as="li" key={t} retraso={0.4 + n * 0.07}>
                <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  className="foco elevable presionable group flex h-full items-start gap-3 rounded-3xl bg-superficie p-4 ring-1 ring-borde hover:ring-primario">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primario-claro text-acento group-hover:bg-primario group-hover:text-white"><Icono size={20} aria-hidden="true" /></span>
                  <span><span className="block font-semibold">{t}</span><span className="block text-sm text-gris">{d}</span></span>
                </a>
              </Aparecer>
            ))}
          </ul>

          <div className="relative mt-6 hidden overflow-hidden rounded-[32px] lg:block">
            <Foto src={IMAGEN_CTA.abrazo} alt="Un perro y un gato abrazados sobre el pasto" ancho={620} alto={300} className="h-56 w-full" />
          </div>
        </div>

        {/* Formulario */}
        <Aparecer retraso={0.2} className="rounded-[32px] bg-superficie p-6 shadow-flotante ring-1 ring-borde md:p-10">
          <AnimatePresence mode="wait" initial={false}>
            {estado === 'enviado' ? (
              <motion.div key="ok" initial={{ opacity: 0, transform: 'scale(0.97)' }} animate={{ opacity: 1, transform: 'scale(1)' }} transition={{ duration: 0.3, ease: EASE }}
                className="flex min-h-[460px] flex-col items-center justify-center text-center" role="status">
                <CheckAnimado />
                <h2 className="mt-6 text-3xl font-semibold">Mensaje enviado</h2>
                <p className="mt-2 max-w-sm text-gris">Gracias, {form.nombre.split(' ')[0]}. Te responderemos a {form.correo} hoy mismo.</p>
                <Boton variante="contorno" className="mt-6" onClick={() => { setForm({ nombre: '', correo: '', asunto: 'Consulta', mensaje: '' }); setEstado('listo') }}>Escribir otro mensaje</Boton>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={enviar} noValidate exit={{ opacity: 0, transition: { duration: 0.15 } }} className="space-y-4" aria-busy={estado === 'enviando'}>
                <h2 className="text-3xl font-semibold">Escríbenos</h2>
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold">Asunto</legend>
                  <div role="radiogroup" aria-label="Asunto" className="flex flex-wrap gap-1 rounded-full bg-fondo p-1">
                    {ASUNTOS.map(a => (
                      <button type="button" key={a} role="radio" aria-checked={form.asunto === a} onClick={() => cambiar('asunto', a)}
                        className="relative min-h-11 flex-1 rounded-full px-3 text-sm font-semibold">
                        {form.asunto === a && <motion.span layoutId="asunto" className="absolute inset-0 rounded-full bg-tinta" transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }} />}
                        <span className={`relative ${form.asunto === a ? 'text-fondo' : 'text-gris'}`}>{a}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <AnimatePresence>
                  {form.asunto === 'Emergencia' && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="alert" className="rounded-2xl bg-error-fondo p-4 text-sm text-error-texto">
                      Para emergencias no esperes una respuesta por escrito: llama ahora al <a href="tel:015551234" className="font-semibold underline">(01) 555-1234</a>.
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="grid gap-4 md:grid-cols-2">
                  <Campo id="contacto-nombre" etiqueta="Tu nombre" autoComplete="name" valor={form.nombre} onCambiar={v => cambiar('nombre', v)} onSalir={() => setErrores(e => ({ ...e, nombre: validar('nombre', form.nombre) }))} error={errores.nombre} />
                  <Campo id="contacto-correo" etiqueta="Tu correo" tipo="email" autoComplete="email" valor={form.correo} onCambiar={v => cambiar('correo', v)} onSalir={() => setErrores(e => ({ ...e, correo: validar('correo', form.correo) }))} error={errores.correo} />
                </div>
                <Campo id="contacto-mensaje" etiqueta="¿En qué te ayudamos?" multilinea maximo={600} valor={form.mensaje} onCambiar={v => cambiar('mensaje', v)} onSalir={() => setErrores(e => ({ ...e, mensaje: validar('mensaje', form.mensaje) }))} error={errores.mensaje} />
                {error && <p role="alert" className="rounded-2xl bg-error-fondo p-4 text-sm text-error-texto">{error}</p>}

                {/* Botón que cambia de estado: enviar → enviando → enviado */}
                <button type="submit" className="presionable relative flex min-h-14 w-full items-center justify-center overflow-hidden rounded-full bg-secundario font-semibold text-noche hover:bg-secundario-hover">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={estado} className="flex items-center gap-2"
                      initial={{ opacity: 0, transform: 'translateY(14px)', filter: 'blur(4px)' }}
                      animate={{ opacity: 1, transform: 'translateY(0px)', filter: 'blur(0px)' }}
                      exit={{ opacity: 0, transform: 'translateY(-14px)', filter: 'blur(4px)' }}
                      transition={{ duration: 0.22, ease: EASE }}>
                      {estado === 'enviando'
                        ? <><LoaderCircle size={18} className="motion-safe:animate-spin" aria-hidden="true" />Enviando…</>
                        : <><Send size={18} aria-hidden="true" />Enviar mensaje</>}
                    </motion.span>
                  </AnimatePresence>
                </button>
                <p className="text-center text-xs text-gris">Usamos tus datos solo para responderte.</p>
              </motion.form>
            )}
          </AnimatePresence>
        </Aparecer>
      </div>

      {/* Mapa con la dirección encima */}
      <Aparecer as="section" className="relative mt-16 overflow-hidden rounded-[36px] ring-1 ring-borde" aria-label="Mapa de la clínica">
        <iframe title={`Mapa: ${CLINICA.direccionLima}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          src={`${CLINICA.mapa}&output=embed`} className="mapa h-80 w-full border-0 bg-primario-claro md:h-[420px]" />
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex md:bottom-6 md:left-6 md:right-auto">
          <p className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-superficie/90 px-4 py-3 text-sm shadow-flotante ring-1 ring-borde backdrop-blur-xl">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-noche text-secundario"><MapPin size={16} aria-hidden="true" /></span>
            <span><span className="block font-semibold">Sede central de SENATI</span><span className="block text-gris">{CLINICA.calle}</span></span>
          </p>
        </div>
      </Aparecer>

      {/* Preguntas frecuentes: se abre la que tiene el cursor (o el foco) y se cierra la anterior */}
      <section className="mt-24 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16" aria-labelledby="faq-titulo">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Aparecer as="h2" id="faq-titulo" className="text-4xl font-semibold md:text-5xl">Preguntas frecuentes</Aparecer>
          <Aparecer retraso={0.1}><p className="mt-4 max-w-sm text-lg text-gris">Lo que más nos preguntan antes de venir. Pasa el cursor por cada pregunta para ver la respuesta.</p></Aparecer>
          <Aparecer retraso={0.2} className="mt-8 rounded-[28px] bg-noche p-6 text-white">
            <p className="font-display text-xl font-semibold">¿No encuentras tu respuesta?</p>
            <p className="mt-2 text-sm text-[#C9DADF]">Escríbenos por WhatsApp y te responde un veterinario el mismo día.</p>
            <a href="https://wa.me/51987654321" target="_blank" rel="noreferrer"
              className="presionable mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-secundario px-5 text-sm font-semibold text-noche hover:bg-secundario-hover">
              <MessageCircle size={16} aria-hidden="true" />Escribir por WhatsApp
            </a>
          </Aparecer>
        </div>
        <Preguntas />
      </section>
    </div>
  )
}

function Preguntas() {
  const [activa, setActiva] = useState(0)
  return (
    <ul className="space-y-3">
      {PREGUNTAS.map(([pregunta, respuesta], i) => {
        const abierta = i === activa
        return (
          <Aparecer as="li" key={pregunta} retraso={i * 0.06} onMouseEnter={() => setActiva(i)}
            className={`overflow-hidden rounded-[28px] ring-1 transition-[background-color,box-shadow] duration-300 ${abierta ? 'bg-superficie shadow-flotante ring-borde' : 'bg-superficie/50 ring-borde/60 hover:bg-superficie'}`}>
            <h3 className="font-sans">
              <button onClick={() => setActiva(i)} onFocus={() => setActiva(i)} aria-expanded={abierta} aria-controls={`faq-${i}`}
                className="flex min-h-16 w-full items-center gap-4 px-5 py-4 text-left md:px-6">
                <span className={`font-display text-lg font-semibold tabular-nums transition-colors duration-300 ${abierta ? 'text-acento' : 'text-gris/60'}`}>{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 text-lg font-semibold">{pregunta}</span>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-[transform,background-color,color] duration-300 ${abierta ? 'rotate-45 bg-secundario text-noche' : 'bg-fondo text-acento'}`} aria-hidden="true">
                  <Plus size={18} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {abierta && (
                <motion.div id={`faq-${i}`} key="respuesta" className="overflow-hidden"
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}>
                  <p className="flex gap-3 px-5 pb-6 text-gris md:px-6 md:pl-[4.25rem]">
                    <Check size={18} className="mt-0.5 shrink-0 text-primario" aria-hidden="true" />{respuesta}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Aparecer>
        )
      })}
    </ul>
  )
}
