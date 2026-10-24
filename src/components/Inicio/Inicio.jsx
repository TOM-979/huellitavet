// Patrón: ruta de marketing «Home / landing»
// Nav → hero con selector de especies → especies → servicios → cómo reservar → productos → equipo → visítanos → CTA → footer
// Hilo de la página: la huella del logo deja un rastro que acompaña cada sección
import './Inicio.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { ArrowRight, ArrowUpRight, CalendarCheck, Check, Clock, MapPin, Phone, Stethoscope } from 'lucide-react'
import Foto from '../../ui/Foto.jsx'
import { Huella } from '../../ui/Logo.jsx'
import Boton from '../../ui/Boton.jsx'
import CheckAnimado from '../../ui/CheckAnimado.jsx'
import Esqueleto from '../../ui/Esqueleto.jsx'
import MasPedidos from './MasPedidos.jsx'
import ModalProducto from '../ModalProducto/ModalProducto.jsx'
import { EscenaEspecies, FraseScroll } from './Escenas.jsx'
import { Aparecer, Contador, Rastro } from '../../ui/Movimiento.jsx'
import { useApi } from '../../lib/useApi.js'
import { useCarrito } from '../../context/Carrito.jsx'
import { useAvisos } from '../../context/Avisos.jsx'
import { getEspecies, getEstadisticas, getProductos, getServicios, getVeterinarios } from '../../lib/api.js'
import { IMAGEN_CTA } from '../../lib/escenas.js'
import { CLINICA, diaEnLima, estadoClinica } from '../../lib/clinica.js'

const EASE = [0.23, 1, 0.32, 1]
// Especies que rotan en la portada (singular para la frase)
const PORTADA = [
  { slug: 'perro', palabra: 'perro' },
  { slug: 'gato', palabra: 'gato' },
  { slug: 'loro', palabra: 'loro' },
  { slug: 'cuy', palabra: 'cuy' },
  { slug: 'conejo', palabra: 'conejo' },
  { slug: 'tortuga', palabra: 'tortuga' },
]

// "Abierto ahora" con la hora de Lima; se actualiza cada minuto
function useEstadoClinica() {
  const [estado, setEstado] = useState(estadoClinica)
  useEffect(() => { const t = setInterval(() => setEstado(estadoClinica()), 60000); return () => clearInterval(t) }, [])
  return estado
}

function Estado({ estado, className = '' }) {
  return (
    <p className={`flex items-center gap-2 text-sm font-semibold ${className}`}>
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        {estado.abierto && <span className="absolute inline-flex h-full w-full rounded-full bg-primario opacity-60 motion-safe:animate-ping" />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${estado.abierto ? 'bg-primario' : 'bg-gris'}`} />
      </span>
      {estado.texto}
    </p>
  )
}

function Portada({ especies }) {
  const reducir = useReducedMotion()
  const estado = useEstadoClinica()
  const [i, setI] = useState(0)
  const [pausa, setPausa] = useState(false)
  const lista = useMemo(() => PORTADA.map(p => ({ ...p, ...especies.find(e => e.slug === p.slug) })).filter(p => p.imagen), [especies])
  const actual = lista[i] ?? lista[0]

  // La foto del arco baja un poco más lento que la página (parallax)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const desfase = useTransform(scrollYProgress, [0, 1], [0, reducir ? 0 : 90])

  // El arco se inclina un poco siguiendo al mouse (solo con mouse y sin movimiento reducido)
  const puntoX = useMotionValue(0), puntoY = useMotionValue(0)
  const giroY = useSpring(useTransform(puntoX, [-0.5, 0.5], [-7, 7]), { stiffness: 140, damping: 18 })
  const giroX = useSpring(useTransform(puntoY, [-0.5, 0.5], [6, -6]), { stiffness: 140, damping: 18 })
  const alMover = e => {
    if (reducir || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    puntoX.set((e.clientX - r.left) / r.width - 0.5)
    puntoY.set((e.clientY - r.top) / r.height - 0.5)
  }
  const alSalir = () => { puntoX.set(0); puntoY.set(0) }

  // Rota sola hasta que la persona elige una especie (y nunca con movimiento reducido)
  useEffect(() => {
    if (pausa || reducir || lista.length < 2) return
    const t = setTimeout(() => setI(n => (n + 1) % lista.length), 4500)
    return () => clearTimeout(t)
  }, [i, pausa, reducir, lista.length])

  return (
    <section ref={ref} onPointerMove={alMover} onPointerLeave={alSalir} className="mx-auto grid max-w-7xl overflow-x-clip grid-cols-[minmax(0,1fr)] items-center gap-12 px-4 pb-24 pt-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:px-8 md:pt-14 lg:gap-16">
      <div className="min-w-0">
        <h1 className="text-5xl font-bold sm:text-6xl md:text-7xl lg:text-[5.25rem]">
          <span className="block">Cuidamos a tu</span>
          <span className="relative block h-[1.05em] overflow-hidden" aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={actual?.palabra} className="texto-marca absolute left-0 top-0 block pr-2"
                initial={{ opacity: 0, transform: 'translateY(60%)', filter: 'blur(6px)' }}
                animate={{ opacity: 1, transform: 'translateY(0%)', filter: 'blur(0px)' }}
                exit={{ opacity: 0, transform: 'translateY(-60%)', filter: 'blur(6px)', transition: { duration: 0.2 } }}
                transition={{ duration: 0.45, ease: EASE }}>
                {actual?.palabra ?? 'mascota'}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>
        <p className="mt-6 max-w-lg text-lg text-gris md:text-xl">
          Clínica veterinaria en Independencia, Lima. Perros y gatos, pero también loros, cuyes, conejos, hámsters, tortugas, reptiles y peces.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Boton to="/reservar" tamano="lg"><CalendarCheck size={20} aria-hidden="true" />Reservar cita</Boton>
          <Boton to="/servicios" tamano="lg" variante="contorno">Ver servicios</Boton>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1">
          <Estado estado={estado} />
          <a href={CLINICA.telefonoLink} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-acento underline-offset-4 hover:underline">
            <Phone size={15} aria-hidden="true" />Emergencias {CLINICA.telefono}
          </a>
        </div>

        {/* Selector de especies */}
        <div className="mt-8" onMouseEnter={() => setPausa(true)} onFocus={() => setPausa(true)}>
          <p id="elige-especie" className="text-sm font-semibold">Elige tu mascota</p>
          <div role="radiogroup" aria-labelledby="elige-especie" className="sin-barra -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
            {lista.map((e, n) => (
              <button key={e.slug} role="radio" aria-checked={n === i} onClick={() => { setI(n); setPausa(true) }}
                className={`presionable relative flex min-h-12 shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-4 text-sm font-semibold ${n === i ? 'border-tinta text-fondo' : 'border-borde bg-superficie text-tinta hover:border-primario'}`}>
                {n === i && <motion.span layoutId="especie-activa" className="absolute inset-0 rounded-full bg-tinta" transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }} />}
                <Foto src={e.imagen} alt="" ancho={80} alto={80} className="relative h-10 w-10 rounded-full" />
                <span className="relative">{e.nombre}</span>
              </button>
            ))}
            <Link to="/servicios" className="flex min-h-12 shrink-0 items-center rounded-full px-4 text-sm font-semibold text-acento underline underline-offset-4">y 5 especies más</Link>
          </div>
        </div>
      </div>

      {/* Foto principal en forma de arco (motivo del prototipo Figma), con el rastro de huellas que llega a ella */}
      <div className="relative">
        <motion.div className="relative mx-auto w-full max-w-lg [transform-style:preserve-3d]" style={{ rotateX: giroX, rotateY: giroY, transformPerspective: 1200 }}>
          {/* Anillos en órbita y etiquetas flotantes alrededor del arco (solo en pantallas grandes) */}
          <div className="orbita orbita-grande" aria-hidden="true" />
          <div className="orbita orbita-chica" aria-hidden="true" />
          {[
            ['Aves y exóticos', 'top-[8%] -left-10', 'bg-secundario', 0],
            ['24 h emergencias', 'top-[30%] -right-4', 'bg-error', 1.4],
            ['4 especialistas', 'bottom-[26%] -right-2', 'bg-primario', 2.6],
          ].map(([texto, lugar, punto, retraso]) => (
            <span key={texto} aria-hidden="true" className={`etiqueta-flotante absolute z-20 hidden items-center gap-2 rounded-full bg-superficie/90 px-3.5 py-2 text-sm font-semibold shadow-flotante ring-1 ring-borde backdrop-blur-sm lg:inline-flex ${lugar}`}
              style={{ animationDelay: `${retraso}s` }}>
              <span className={`h-2 w-2 rounded-full ${punto}`} />{texto}
            </span>
          ))}
          <Rastro pasos={5} giro={20} separacion={34} tamano={22} retraso={0.5} className="absolute -left-16 top-[38%] z-20 hidden text-primario lg:block" />
          <div className="relative z-10 aspect-[4/5] w-full overflow-hidden rounded-t-[999px] rounded-b-[40px] bg-primario shadow-flotante">
            <motion.div className="absolute -inset-y-12 inset-x-0" style={{ y: desfase }}>
              <AnimatePresence initial={false}>
                <motion.div key={actual?.slug} className="absolute inset-0"
                  initial={{ opacity: 0, transform: 'scale(1.06)', filter: 'blur(8px)' }}
                  animate={{ opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' }}
                  exit={{ opacity: 0, transition: { duration: 0.4 } }}
                  transition={{ duration: 0.7, ease: EASE }}>
                  <Foto src={actual?.imagen} alt={actual ? `${actual.nombre} en HuellitaVet` : ''} ancho={640} alto={900} prioridad className="h-full w-full" />
                </motion.div>
              </AnimatePresence>
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-noche/70 to-transparent" aria-hidden="true" />
          </div>
        </motion.div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={actual?.slug}
            initial={{ opacity: 0, transform: 'translateY(10px)' }} animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.3, delay: 0.15, ease: EASE }}
            className="absolute -bottom-6 left-0 right-0 z-20 mx-auto w-[88%] max-w-md rounded-3xl border border-borde bg-superficie p-5 shadow-flotante md:-left-8 md:right-auto">
            <p className="font-display text-xl font-semibold">{actual?.nombre}</p>
            <p className="mt-1 text-sm text-gris">{actual?.descripcion}</p>
            <Link to={`/servicios?especie=${actual?.slug}`} className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-acento underline-offset-4 hover:underline">
              {actual?.servicios} servicios para {actual?.nombre?.toLowerCase()}<ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

// Pasarela que avanza sola y además se puede desplazar a mano (dedo, trackpad o arrastrando con el mouse).
// La lista va dos veces: al pasar el ancho de una, el scroll salta atrás esa misma distancia y no se nota.
function usePasarela(velocidad = 55) {
  const marco = useRef(null)
  const lista = useRef(null)
  const reducir = useReducedMotion()

  useEffect(() => {
    const el = marco.current, ls = lista.current
    if (!el || !ls) return
    let pos = el.scrollLeft, ultimo = performance.now(), frame = 0
    let reanudar = 0, encima = false, arrastre = null, movio = false
    const esperar = ms => { reanudar = performance.now() + ms }

    // Mantiene el scroll dentro de la primera vuelta; devuelve cuánto saltó
    const envolver = () => {
      const ancho = ls.offsetWidth
      if (reducir || !ancho) return 0
      const salto = el.scrollLeft >= ancho ? -ancho : el.scrollLeft <= 0 ? ancho : 0
      if (salto) el.scrollLeft += salto
      return salto
    }

    const paso = ahora => {
      const dt = Math.min(64, ahora - ultimo)
      ultimo = ahora
      const quieta = reducir || encima || arrastre || ahora < reanudar || el.contains(document.activeElement)
      if (quieta) pos = el.scrollLeft
      else {
        pos += (velocidad * dt) / 1000
        if (pos >= ls.offsetWidth) pos -= ls.offsetWidth
        el.scrollLeft = pos
      }
      frame = requestAnimationFrame(paso)
    }
    frame = requestAnimationFrame(paso)

    // Un scroll que no hizo la animación (dedo, trackpad, inercia) la detiene un momento
    const alScroll = () => {
      if (Math.abs(el.scrollLeft - pos) > 2) esperar(1500)
      const salto = envolver()
      if (arrastre) arrastre.inicio += salto
    }
    // Arrastre con el mouse; si de verdad se movió, el clic que sigue no abre la tarjeta
    const abajo = e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      arrastre = { x: e.clientX, inicio: el.scrollLeft }
      movio = false
    }
    const mover = e => {
      if (!arrastre) return
      const dx = e.clientX - arrastre.x
      if (!movio && Math.abs(dx) > 5) { movio = true; el.classList.add('arrastrando') }
      if (movio) el.scrollLeft = arrastre.inicio - dx
    }
    const soltar = () => {
      if (!arrastre) return
      arrastre = null
      el.classList.remove('arrastrando')
      esperar(1200)
    }
    const clic = e => { if (movio) { e.preventDefault(); e.stopPropagation(); movio = false } }
    const entrar = () => { encima = true }
    const salir = () => { encima = false; esperar(400) }
    const sinArrastreNativo = e => e.preventDefault()

    el.addEventListener('scroll', alScroll, { passive: true })
    el.addEventListener('pointerdown', abajo)
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', soltar)
    el.addEventListener('click', clic, true)
    el.addEventListener('mouseenter', entrar)
    el.addEventListener('mouseleave', salir)
    el.addEventListener('dragstart', sinArrastreNativo)
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('scroll', alScroll)
      el.removeEventListener('pointerdown', abajo)
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', soltar)
      el.removeEventListener('click', clic, true)
      el.removeEventListener('mouseenter', entrar)
      el.removeEventListener('mouseleave', salir)
      el.removeEventListener('dragstart', sinArrastreNativo)
    }
  }, [reducir, velocidad])

  return { marco, lista }
}

// Cifras de la clínica que cuentan al aparecer (salen de la API)
function Cifras({ stats }) {
  const datos = [
    [stats?.especies ?? 11, 'especies atendidas', 'De perros y gatos a reptiles y peces'],
    [stats?.servicios ?? 16, 'servicios', 'Salud, diagnóstico, cirugía y estética'],
    [stats?.veterinarios ?? 4, 'especialistas', 'Uno para cada tipo de mascota'],
    ['24 h', 'emergencias', 'Todos los días, al (01) 555-1234'],
  ]
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8" aria-label="HuellitaVet en cifras">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {datos.map(([n, etiqueta, detalle], i) => (
          <Aparecer key={etiqueta} retraso={i * 0.08} className="foco elevable rounded-3xl bg-superficie/70 p-5 ring-1 ring-borde backdrop-blur-sm md:p-6">
            <dd className="font-display text-5xl font-semibold leading-none text-acento md:text-6xl">
              {typeof n === 'number' ? <Contador valor={n} /> : n}
            </dd>
            <dt className="mt-3 font-semibold">{etiqueta}</dt>
            <dd className="mt-1 text-sm text-gris">{detalle}</dd>
          </Aparecer>
        ))}
      </dl>
    </section>
  )
}

// Todas las especies: pasarela sobre la banda oscura
function Especies({ especies, total }) {
  const { marco, lista } = usePasarela()
  // La copia es solo visual (inert): el teclado y los lectores de pantalla recorren una sola lista.
  // Tarjetas de foto completa con alturas alternadas (como una ola); al pasar el mouse sube y aparece "Ver servicios"
  const tarjetas = copia => especies.map((e, n) => (
    <li key={e.slug} className={`w-60 shrink-0 md:w-72 ${n % 2 ? 'pt-10' : 'pb-10'}`}>
      <Link to={`/servicios?especie=${e.slug}`} tabIndex={copia ? -1 : undefined}
        className="especie-carta group relative block aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-[32px] bg-white/5 ring-1 ring-white/10">
        <Foto src={e.imagen} alt={copia ? '' : e.nombre} ancho={360} alto={480} className="especie-foto h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-noche via-noche/20 to-transparent" aria-hidden="true" />
        <span className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-noche/60 px-3 py-1 text-xs font-semibold tabular-nums backdrop-blur-sm">
          {String(n + 1).padStart(2, '0')} · {e.grupo}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="font-display text-2xl font-semibold leading-tight">{e.nombre}</p>
          <p className="mt-1 text-sm text-[#C9DADF]">{e.servicios} servicios · {e.productos} productos</p>
          <span className="especie-boton mt-4 inline-flex items-center gap-1.5 rounded-full bg-secundario px-4 py-2 text-sm font-semibold text-noche">
            Ver servicios<ArrowUpRight size={15} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </li>
  ))
  const nombres = especies.map(e => e.nombre).join(' · ')
  return (
    <section className="relative overflow-hidden bg-noche py-24 text-white md:py-28">
      {/* Texto gigante que corre detrás, en sentido contrario a la pasarela */}
      <div className="especies-fondo pointer-events-none absolute inset-x-0 bottom-6 select-none" aria-hidden="true">
        <span>{nombres} · {nombres} · </span>
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:px-8">
        <Aparecer>
          <h2 className="max-w-2xl text-5xl font-semibold md:text-6xl">{total ?? 11} especies, una sola clínica</h2>
          <p className="mt-4 max-w-lg text-lg text-[#C9DADF]">Instrumental del tamaño adecuado, manejo de bajo estrés y un especialista en aves y exóticos.</p>
        </Aparecer>
        <Aparecer retraso={0.15} className="hidden items-center gap-3 text-sm text-[#C9DADF] md:flex">
          <span className="especies-arrastre grid h-11 w-11 place-items-center rounded-full ring-1 ring-white/20" aria-hidden="true"><ArrowRight size={18} /></span>
          Arrastra o desliza para ver todas
        </Aparecer>
      </div>
      {/* A todo el ancho de la pantalla; se detiene con el mouse encima, al tocarla o al enfocar una tarjeta */}
      <Aparecer className="relative mt-12">
        <div ref={marco} className="pasarela-marco sin-barra" style={{ paddingLeft: 'max(1rem, calc((100% - 80rem) / 2 + 2rem))' }}>
          <div className="flex w-max">
            <ul ref={lista} className="flex gap-4 pr-4" aria-label="Especies que atendemos">{tarjetas(false)}</ul>
            <ul className="pasarela-copia flex gap-4 pr-4" aria-hidden="true" inert>{tarjetas(true)}</ul>
          </div>
        </div>
      </Aparecer>
    </section>
  )
}

// Visítanos: horario real con el día de hoy marcado, dirección y mapa
const DIAS = [['L', 1], ['M', 2], ['M', 3], ['J', 4], ['V', 5], ['S', 6], ['D', 0]]
const minutosLima = () => { const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' })); return d.getHours() * 60 + d.getMinutes() }

// Visítanos: mapa grande con una tarjeta flotante encima, la semana con hoy marcado
// y una barra del día que muestra la hora actual dentro del horario de atención
function Visitanos() {
  const estado = useEstadoClinica()
  const hoy = diaEnLima()
  const [ahora, setAhora] = useState(minutosLima)
  useEffect(() => { const t = setInterval(() => setAhora(minutosLima()), 60000); return () => clearInterval(t) }, [])
  const abreHoy = hoy !== 0
  const reloj = `${Math.floor(ahora / 60)}:${String(ahora % 60).padStart(2, '0')}`
  const pct = v => `${(v / 1440) * 100}%`

  return (
    <section className="mx-auto max-w-7xl px-4 pt-28 md:px-8 md:pt-36">
      <Aparecer className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <h2 className="max-w-2xl text-5xl font-semibold md:text-6xl">Te esperamos en Independencia</h2>
        <p className="flex items-start gap-2 text-lg text-gris md:max-w-sm md:text-right">
          <MapPin size={20} className="mt-1 shrink-0 text-acento md:hidden" aria-hidden="true" />{CLINICA.direccion}
        </p>
      </Aparecer>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[400px_minmax(0,1fr)]">
        {/* Mapa: se amplía un poco para recortar el panel propio de Google */}
        <Aparecer retraso={0.1} className="relative order-first min-h-[320px] overflow-hidden rounded-[36px] bg-primario-claro ring-1 ring-borde lg:order-last lg:min-h-[500px]">
          <iframe title="Mapa de HuellitaVet en la sede central de SENATI, Independencia" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            src={`${CLINICA.mapa}&output=embed`} className="mapa absolute inset-0 h-full w-full origin-center scale-[2.2] border-0" />
          <div className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-3">
            <span className="flex items-center gap-2 rounded-full bg-superficie/90 px-4 py-2.5 text-sm font-semibold shadow-flotante ring-1 ring-borde backdrop-blur-md">
              <MapPin size={16} className="text-acento" aria-hidden="true" />SENATI · Sede central, Independencia
            </span>
            <span className="pointer-events-auto"><Boton href={CLINICA.mapa} target="_blank" rel="noreferrer"><MapPin size={18} aria-hidden="true" />Cómo llegar</Boton></span>
          </div>
        </Aparecer>

        <Aparecer className="flex flex-col rounded-[36px] bg-superficie p-6 shadow-flotante ring-1 ring-borde md:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-noche text-secundario"><Huella className="h-6 w-6" /></span>
            <div>
              <p className="font-display text-xl font-semibold">HuellitaVet</p>
              <p className="text-sm text-gris">Sede central de SENATI</p>
            </div>
          </div>
          <Estado estado={estado} className="mt-5" />

          {/* Semana: hoy resaltado */}
          <ul className="mt-5 grid grid-cols-7 gap-1.5" aria-label="Días de atención">
            {DIAS.map(([letra, d], i) => {
              const esHoy = d === hoy
              return (
                <li key={i} className={`flex flex-col items-center rounded-xl py-2 text-sm font-semibold ${esHoy ? 'bg-tinta text-fondo' : d === 0 ? 'bg-error-fondo text-error-texto' : 'bg-fondo'}`}>
                  {letra}
                  <span className={`mt-1 h-1.5 w-1.5 rounded-full ${d === 0 ? 'bg-error' : esHoy ? 'bg-secundario' : 'bg-primario'}`} aria-hidden="true" />
                </li>
              )
            })}
          </ul>
          <p className="mt-2 text-xs text-gris">Lunes a sábado de 9:00 a 19:00 · domingo solo emergencias</p>

          {/* Barra del día con la hora actual */}
          <div className="mt-6">
            <div className="flex justify-between text-xs font-semibold text-gris tabular-nums" aria-hidden="true"><span>0:00</span><span>12:00</span><span>24:00</span></div>
            <div className="relative mt-2 h-3 rounded-full bg-fondo ring-1 ring-borde" role="img"
              aria-label={`Hoy ${abreHoy ? 'atendemos de 9:00 a 19:00' : 'solo emergencias'}; ahora son las ${reloj}`}>
              {abreHoy && <span className="absolute inset-y-0 rounded-full bg-gradient-to-r from-primario to-acento" style={{ left: pct(540), width: pct(600) }} />}
              <span className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secundario ring-4 ring-superficie" style={{ left: pct(ahora) }}>
                <span className="absolute inset-0 rounded-full bg-secundario opacity-60 motion-safe:animate-ping" />
              </span>
            </div>
            <p className="mt-2 text-sm"><span className="font-semibold tabular-nums">Ahora {reloj}</span> <span className="text-gris">· hora de Lima</span></p>
          </div>

          <a href={CLINICA.telefonoLink} className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-error-fondo lg:mt-auto px-4 py-3 text-error-texto">
            <span className="text-sm font-semibold">Emergencias 24 horas</span>
            <span className="flex items-center gap-1.5 font-semibold tabular-nums"><Phone size={15} aria-hidden="true" />{CLINICA.telefono}</span>
          </a>
          <div className="mt-3 [&>*]:w-full"><Boton to="/contacto" variante="contorno">Escríbenos</Boton></div>
        </Aparecer>
      </div>
    </section>
  )
}

// CTA final: la foto se desplaza a otro ritmo que el texto
function Cierre() {
  const reducir = useReducedMotion()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const desfase = useTransform(scrollYProgress, [0, 1], reducir ? [0, 0] : [-50, 50])
  return (
    <section className="mx-auto max-w-7xl px-4 pt-28 md:px-8 md:pt-36">
      <div ref={ref} className="relative overflow-hidden rounded-[40px] bg-noche">
        <motion.div className="absolute -inset-y-16 inset-x-0 md:left-1/3" style={{ y: desfase }}>
          <Foto src={IMAGEN_CTA.perros} alt="" ancho={1280} alto={720} className="h-full w-full" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-noche via-noche/85 to-noche/30 md:bg-gradient-to-r md:from-noche md:from-35% md:via-noche/80 md:to-transparent" aria-hidden="true" />
        <Aparecer className="relative max-w-2xl p-8 text-white md:p-16">
          <h2 className="text-5xl font-semibold md:text-6xl">¿Tu mascota necesita atención hoy?</h2>
          <p className="mt-4 text-lg text-[#D5E4E7]">Elige el horario que te acomode o escríbenos. Emergencias las 24 horas al {CLINICA.telefono}.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Boton to="/reservar" tamano="lg">Reservar cita</Boton>
            <Boton href={CLINICA.telefonoLink} tamano="lg" variante="claro">Llamar a emergencias</Boton>
          </div>
        </Aparecer>
      </div>
    </section>
  )
}

const PASOS_RESERVA = [
  ['Elige a tu mascota', 'Perro, loro, cuy o tortuga: te mostramos solo los servicios que le corresponden.'],
  ['Escoge día y hora', 'Ves los horarios libres en tiempo real y te asignamos al especialista.'],
  ['Recibe tu código', 'Confirmación al instante. Pagas en la clínica.'],
]
const HORAS_DEMO = [['9:00', false], ['9:40', true], ['10:20', false], ['11:00', false], ['11:40', true], ['12:20', false]]

// Próximos días hábiles (lunes a sábado) con la fecha de Lima, para la vista previa
function proximosDias(cantidad) {
  const dias = []
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }))
  while (dias.length < cantidad) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0) dias.push({ dia: d.toLocaleDateString('es-PE', { weekday: 'short' }).replace('.', ''), numero: d.getDate(), texto: d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }) })
  }
  return dias
}

// Vista previa del asistente de reserva (el mismo que está en /reservar), con un loro que atiende Lia
function VistaReserva({ paso, especies, vets }) {
  const dias = useMemo(() => proximosDias(5), [])
  const mascotas = ['perro', 'gato', 'loro', 'cuy'].map(s => especies.find(e => e.slug === s)).filter(Boolean)
  const vet = vets.find(v => /aves/i.test(v.especialidad)) ?? vets[0]
  // Dentro de cada paso, la elección se marca un instante después de que aparece
  const [elegido, setElegido] = useState(false)
  useEffect(() => { setElegido(false); const t = setTimeout(() => setElegido(true), 450); return () => clearTimeout(t) }, [paso])

  return (
    <div data-ui aria-hidden="true" className="relative overflow-hidden rounded-[28px] bg-superficie p-5 text-tinta shadow-flotante ring-1 ring-borde md:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-lg font-semibold">Reservar cita</p>
        <p className="text-xs font-semibold text-gris">Paso {paso + 1} de 3</p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {PASOS_RESERVA.map((_, n) => (
          <span key={n} className="h-1.5 overflow-hidden rounded-full bg-borde">
            <motion.span className="block h-full origin-left rounded-full bg-primario" initial={false}
              animate={{ transform: `scaleX(${n < paso ? 1 : n === paso ? (elegido ? 1 : 0.5) : 0})` }} transition={{ duration: 0.4, ease: EASE }} />
          </span>
        ))}
      </div>

      <div className="relative mt-5 min-h-[330px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={paso}
            initial={{ opacity: 0, transform: 'translateX(24px)' }} animate={{ opacity: 1, transform: 'translateX(0px)' }}
            exit={{ opacity: 0, transform: 'translateX(-24px)', transition: { duration: 0.15 } }} transition={{ duration: 0.35, ease: EASE }}>
            {paso === 0 && (
              <>
                <p className="font-semibold">¿A quién vamos a atender?</p>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {mascotas.map(m => {
                    const activo = elegido && m.slug === 'loro'
                    return (
                      <div key={m.slug} className={`relative overflow-hidden rounded-2xl bg-fondo ring-2 transition-[box-shadow,transform] duration-300 ${activo ? 'scale-[1.02] ring-acento' : 'ring-transparent'}`}>
                        <Foto src={m.imagen} alt="" ancho={240} alto={150} className="h-24 w-full" />
                        <p className="px-3 py-2 text-sm font-semibold">{m.nombre}</p>
                        {activo && (
                          <motion.span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-acento text-fondo"
                            initial={{ opacity: 0, transform: 'scale(0.6)' }} animate={{ opacity: 1, transform: 'scale(1)' }} transition={{ type: 'spring', duration: 0.4, bounce: 0.4 }}>
                            <Check size={16} />
                          </motion.span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {paso === 1 && (
              <>
                <p className="font-semibold">Medicina de aves para Kiwi</p>
                <div className="mt-3 flex gap-2">
                  {dias.map((d, n) => (
                    <div key={d.numero} className={`flex min-w-0 flex-1 flex-col items-center rounded-2xl py-2 text-sm ${n === 1 ? 'bg-tinta text-fondo' : 'bg-fondo'}`}>
                      <span className="text-xs capitalize">{d.dia}</span>
                      <span className="font-display text-lg font-semibold tabular-nums">{d.numero}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {HORAS_DEMO.map(([h, ocupada]) => {
                    const activa = elegido && h === '10:20'
                    return (
                      <span key={h} className={`grid min-h-11 place-items-center rounded-xl text-sm font-semibold tabular-nums transition-colors duration-300
                        ${ocupada ? 'text-gris/60 line-through' : activa ? 'bg-primario-oscuro text-white' : 'bg-fondo'}`}>{h}</span>
                    )
                  })}
                </div>
                {vet && (
                  <div className={`mt-4 flex items-center gap-3 rounded-2xl bg-primario-claro p-3 transition-opacity duration-300 ${elegido ? 'opacity-100' : 'opacity-0'}`}>
                    <Foto src={vet.imagen} alt="" ancho={80} alto={80} className="h-10 w-10 rounded-full" />
                    <div className="min-w-0 text-sm">
                      <p className="font-semibold">Te atiende {vet.nombre}</p>
                      <p className="truncate text-gris">{vet.especialidad}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {paso === 2 && (
              <div className="flex flex-col items-center pt-2 text-center">
                <CheckAnimado tamano={72} />
                <p className="mt-3 font-display text-2xl font-semibold">¡Cita reservada!</p>
                <p className="mt-1 text-sm text-gris">Muestra este código en recepción</p>
                <p className="mt-2 rounded-xl bg-fondo px-4 py-2 font-display text-2xl font-semibold tracking-wide">HV-00128</p>
                <dl className="mt-4 w-full space-y-1.5 text-left text-sm">
                  {[['Mascota', 'Kiwi, loro'], ['Fecha', `${dias[1]?.texto}, 10:20`], ['Especialista', vet?.nombre ?? ''], ['Total', 'S/ 70, pagas en la clínica']].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3"><dt className="text-gris">{k}</dt><dd className="text-right font-semibold first-letter:uppercase">{v}</dd></div>
                  ))}
                </dl>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// Cómo reservar: los pasos de la izquierda mueven la vista previa de la derecha. Avanza sola mientras está en pantalla;
// al elegir un paso se queda en él un rato
function ComoReservar({ especies, vets }) {
  const reducir = useReducedMotion()
  const ref = useRef(null)
  const enVista = useInView(ref, { amount: 0.4 })
  const [paso, setPaso] = useState(0)
  const [quieto, setQuieto] = useState(0)

  useEffect(() => {
    if (!enVista || reducir) return
    const t = setTimeout(() => setPaso(p => (p + 1) % PASOS_RESERVA.length), Date.now() < quieto ? quieto - Date.now() : 2300)
    return () => clearTimeout(t)
  }, [paso, enVista, reducir, quieto])

  const elegir = n => { setPaso(n); setQuieto(Date.now() + 6000) }

  return (
    <section className="mx-auto max-w-7xl px-4 pt-28 md:px-8 md:pt-36">
      <div ref={ref} className="grid items-center gap-10 overflow-hidden rounded-[40px] bg-primario-claro p-6 md:grid-cols-[1fr_1fr] md:p-14">
        <div>
          <Aparecer as="h2" className="text-5xl font-semibold md:text-6xl">Tu cita, en menos de un minuto</Aparecer>
          <ol className="mt-10">
            {PASOS_RESERVA.map(([t, d], n) => {
              const activo = n === paso
              return (
                <li key={t} className="flex gap-5">
                  <div className="flex w-11 shrink-0 flex-col items-center">
                    <span className={`grid h-11 w-11 place-items-center rounded-full font-display text-lg font-semibold transition-colors duration-300 ${activo || n < paso ? 'bg-tinta text-fondo' : 'bg-superficie text-gris ring-1 ring-borde'}`}>{n + 1}</span>
                    {n < PASOS_RESERVA.length - 1 && <Rastro pasos={3} giro={180} separacion={20} tamano={15} retraso={n * 0.45 + 0.2} className={`my-3 transition-colors duration-300 ${n < paso ? 'text-acento' : 'text-primario/50'}`} />}
                  </div>
                  <button type="button" onClick={() => elegir(n)} aria-pressed={activo}
                    className={`-mt-1 mb-6 flex-1 rounded-2xl px-4 py-2.5 text-left transition-colors duration-300 ${activo ? 'bg-superficie shadow-suave' : 'hover:bg-superficie/60'}`}>
                    <span className={`block font-sans text-xl font-semibold transition-colors duration-300 ${activo ? 'text-tinta' : 'text-gris'}`}>{t}</span>
                    <span className="mt-1 block max-w-sm text-gris">{d}</span>
                  </button>
                </li>
              )
            })}
          </ol>
          <Boton to="/reservar" tamano="lg"><CalendarCheck size={20} aria-hidden="true" />Reservar ahora</Boton>
        </div>
        <Aparecer retraso={0.1} className="mx-auto w-full max-w-md">
          <VistaReserva paso={paso} especies={especies} vets={vets} />
        </Aparecer>
      </div>
    </section>
  )
}

const duracion = min => (min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''}`)

// Servicios destacados: acordeón. El activo se abre y muestra qué incluye, cuánto dura y a qué especies atiende;
// se activa al pasar el mouse, al enfocar con el teclado o al tocarlo
function ServiciosDestacados({ servicios, especies }) {
  const [activo, setActivo] = useState(0)
  return (
    <Aparecer className="mt-12 flex flex-col gap-3 md:h-[560px] md:flex-row">
      {servicios.map((s, n) => {
        const abierto = n === activo
        const atiende = s.especies.map(slug => especies.find(e => e.slug === slug)).filter(Boolean)
        return (
          // En escritorio cada panel reparte el ancho con flex-grow: el abierto vale 4.2 y los cerrados 1 (nunca menos de 110px)
          <div key={s.slug} onMouseEnter={() => setActivo(n)}
            className={`group relative flex flex-col overflow-hidden rounded-3xl bg-noche text-white md:h-full md:min-w-[110px] md:basis-0 md:transition-[flex-grow] md:duration-[420ms] md:ease-[cubic-bezier(0.32,0.72,0,1)] ${abierto ? 'min-h-[480px] md:min-h-0 md:grow-[4.2]' : 'h-24 md:grow'}`}>
            <Foto src={s.imagen} alt="" ancho={760} alto={760}
              className={`absolute inset-0 h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${abierto ? 'scale-[1.04]' : ''}`} />
            <div className={`absolute inset-0 transition-colors duration-500 ${abierto ? 'bg-gradient-to-t from-noche via-noche/70 to-noche/5' : 'bg-noche/65'}`} aria-hidden="true" />

            <h3 className={abierto ? 'sr-only' : ''}>
              <button type="button" aria-expanded={abierto} aria-controls={`servicio-${s.slug}`}
                onClick={() => setActivo(n)} onFocus={() => setActivo(n)}
                className={`absolute inset-0 flex flex-col justify-end gap-1 p-5 text-left ${abierto ? 'pointer-events-none opacity-0' : ''}`}>
                <span className="text-xs font-semibold text-[#C9DADF]">{s.categoria}</span>
                <span className="font-display text-xl font-semibold leading-tight">{s.nombre}</span>
                <span className="text-sm text-[#C9DADF] md:hidden">{s.desde ? 'Desde ' : ''}S/ {s.precio}</span>
              </button>
            </h3>

            {/* Con el panel abierto, toda la tarjeta lleva a reservar ese servicio */}
            {abierto && <Link to={`/reservar?servicio=${s.id}`} aria-label={`Reservar ${s.nombre}`} tabIndex={-1} className="absolute inset-0 z-10 cursor-pointer" />}
            <AnimatePresence initial={false}>
              {abierto && (
                <motion.div id={`servicio-${s.slug}`} key="detalle" className="pointer-events-none relative z-20 flex flex-1 flex-col justify-end p-6 md:p-9"
                  initial={{ opacity: 0, transform: 'translateY(16px)' }} animate={{ opacity: 1, transform: 'translateY(0px)' }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ duration: 0.35, delay: 0.1, ease: EASE }}>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-[#C9DADF]">
                    {s.categoria}<span className="inline-flex items-center gap-1"><Clock size={14} aria-hidden="true" />{duracion(s.duracion_min)}</span>
                  </p>
                  <p className="mt-2 font-display text-4xl font-semibold leading-none md:text-5xl" aria-hidden="true">{s.nombre}</p>
                  <p className="mt-3 max-w-md text-[#D5E4E7]">{s.descripcion}</p>
                  <ul className="mt-5 grid max-w-lg gap-2">
                    {s.incluye.map(x => (
                      <li key={x} className="flex items-start gap-2 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-secundario" aria-hidden="true" />{x}</li>
                    ))}
                  </ul>
                  <div className="pointer-events-auto mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <ul className="flex -space-x-2" aria-label={`Atiende a: ${atiende.map(e => e.nombre).join(', ')}`}>
                        {atiende.slice(0, 5).map(e => (
                          <li key={e.slug}><Foto src={e.imagen} alt="" ancho={72} alto={72} className="h-9 w-9 rounded-full ring-2 ring-noche" /></li>
                        ))}
                      </ul>
                      <span className="text-sm text-[#C9DADF]">{atiende.length > 5 ? `y ${atiende.length - 5} ${atiende.length === 6 ? 'especie' : 'especies'} más` : atiende.length === 1 ? atiende[0].nombre : `${atiende.length} especies`}</span>
                    </div>
                    <Boton to={`/reservar?servicio=${s.id}`}>
                      Reservar · {s.desde ? 'desde ' : ''}S/ {s.precio}<ArrowUpRight size={16} aria-hidden="true" />
                    </Boton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </Aparecer>
  )
}

export default function Inicio() {
  const especies = useApi(getEspecies)
  const stats = useApi(getEstadisticas)
  const servicios = useApi(() => getServicios())
  const productos = useApi(() => getProductos({ limite: 8 }))
  const vets = useApi(getVeterinarios)
  const { agregar } = useCarrito()
  const avisar = useAvisos()
  const { setAbierto } = useCarrito()
  const [detalle, setDetalle] = useState(null)

  const agregarConAviso = (p, c = 1) => {
    agregar(p, c)
    avisar({ titulo: 'Agregado al carrito', texto: p.nombre, accion: { texto: 'Ver carrito', onClick: () => setAbierto(true) } })
  }
  const destacados = servicios.datos ? ['consulta', 'aves', 'exoticos', 'grooming', 'laboratorio'].map(s => servicios.datos.find(x => x.slug === s)).filter(Boolean) : []

  return (
    <>
      {especies.datos ? <Portada especies={especies.datos} /> : <div className="mx-auto h-[640px] max-w-7xl" />}

      <Cifras stats={stats.datos} />

      <Especies especies={especies.datos ?? []} total={stats.datos?.especies} />

      <EscenaEspecies especies={especies.datos ?? []} servicios={servicios.datos ?? []} vets={vets.datos ?? []} />

      {/* Servicios destacados (composición asimétrica) */}
      <section className="mx-auto max-w-7xl px-4 pt-28 md:px-8 md:pt-36">
        <Aparecer className="grid gap-4 md:grid-cols-2 md:items-end">
          <h2 className="max-w-lg text-5xl font-semibold md:text-6xl">Lo que hacemos por tu mascota</h2>
          <p className="max-w-md text-lg text-gris md:justify-self-end">Consultas, vacunas, cirugía y especialidades para aves y exóticos. Cada servicio se reserva en línea, con su precio a la vista.</p>
        </Aparecer>
        {servicios.mostrarCarga && <div className="mt-12 grid gap-3 md:grid-cols-5"><Esqueleto cantidad={5} className="h-24 md:h-[560px]" /></div>}
        {destacados.length > 0 && <ServiciosDestacados servicios={destacados} especies={especies.datos ?? []} />}
        <div className="mt-8 flex justify-end">
          <Boton to="/servicios" variante="contorno">Ver los {servicios.datos?.length ?? 16} servicios<ArrowRight size={18} aria-hidden="true" /></Boton>
        </div>
      </section>

      <ComoReservar especies={especies.datos ?? []} vets={vets.datos ?? []} />

      {/* Productos */}
      {productos.mostrarCarga && <div className="mx-auto mt-28 max-w-7xl px-4 md:px-8"><Esqueleto cantidad={1} className="h-[560px]" /></div>}
      <MasPedidos productos={productos.datos?.items ?? []} onVer={setDetalle} onAgregar={agregarConAviso} />

      <FraseScroll texto="Un loro esconde el dolor. Un cuy deja de comer. Un gato se esconde. Cada especie avisa a su manera, y aquí aprendimos a leer cada señal."
        fotos={Object.fromEntries(['loro', 'cuy', 'gato'].map(s => [s, especies.datos?.find(e => e.slug === s)?.imagen]))} />

      {/* Equipo: retratos en arco, como la foto de la portada */}
      <section className="mx-auto max-w-7xl px-4 pt-28 md:px-8 md:pt-36">
        <Aparecer className="mx-auto max-w-2xl text-center">
          <h2 className="text-5xl font-semibold md:text-6xl">Especialistas para cada caso</h2>
          <p className="mt-4 text-lg text-gris">Según la especie de tu mascota, te asignamos al veterinario que mejor la conoce.</p>
        </Aparecer>
        <ul className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-4">
          {(vets.datos ?? []).map((v, n) => (
            <Aparecer as="li" key={v.id} retraso={n * 0.09}>
              <div className="zoom-foto aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-3xl bg-primario-claro">
                <Foto src={v.imagen} alt="" ancho={360} alto={480} className="h-full w-full" />
              </div>
              <h3 className="mt-4 font-sans text-lg font-semibold">{v.nombre}</h3>
              <p className="flex items-center gap-1 text-sm font-semibold text-acento"><Stethoscope size={14} aria-hidden="true" />{v.especialidad}</p>
              <p className="mt-1 text-sm text-gris">{v.bio}</p>
            </Aparecer>
          ))}
        </ul>
      </section>

      <Visitanos />
      <Cierre />

      <ModalProducto producto={detalle} especies={especies.datos ?? []} onCerrar={() => setDetalle(null)} onAgregar={agregarConAviso} />
    </>
  )
}
