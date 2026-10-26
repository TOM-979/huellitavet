import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Check, Stethoscope } from 'lucide-react'
import Foto from '../../ui/Foto.jsx'
import Boton from '../../ui/Boton.jsx'

const EASE = [0.23, 1, 0.32, 1]

const CAPITULOS = [
  { grupo: 'Mamíferos', titulo: 'Perros y gatos', texto: 'Vacunas al día, limpieza dental y cirugía con monitoreo. Los gatos se atienden en un consultorio cat-friendly, sin ladridos.', servicios: ['vacunacion', 'dental', 'cirugia'], vet: /felina/i, estado: 'Preparando la consulta' },
  { grupo: 'Aves', titulo: 'Loros y periquitos', texto: 'Revisión de plumaje, pico y buche con instrumental del tamaño adecuado y una especialista en aves.', servicios: ['aves', 'unas-pico', 'nutricion'], vet: /aves/i, estado: 'Revisando plumaje' },
  { grupo: 'Exóticos', titulo: 'Cuyes, conejos y reptiles', texto: 'Manejo de bajo estrés, revisión dental y asesoría de hábitat para hámsters, hurones, tortugas y reptiles.', servicios: ['exoticos', 'dental', 'ecografia'], vet: /exóticos/i, estado: 'Ajustando el hábitat' },
  { grupo: 'Acuáticos', titulo: 'Peces', texto: 'Análisis de laboratorio, plan de nutrición y teleconsulta para cuidar tu acuario sin moverlo de casa.', servicios: ['laboratorio', 'nutricion', 'teleconsulta'], vet: null, estado: 'Analizando el agua' },
]

export function EscenaEspecies({ especies, servicios, vets }) {
  const ref = useRef(null)
  const reducir = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const suave = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.0005 })
  const [cap, setCap] = useState(0)
  const [avance, setAvance] = useState(reducir ? 1 : 0)
  const [vista, setVista] = useState(reducir)
  const alto = useRef(0)
  const N = CAPITULOS.length

  useMotionValueEvent(suave, 'change', v => {
    if (vista) return
    if (v > 0.985) { setVista(true); setAvance(1); return }
    const t = Math.min(N - 0.001, Math.max(0, v * N))
    const c = Math.floor(t)
    setCap(c)
    setAvance(Math.min(1, (t - c) * 1.4))
  })

  // Al dejar de ser fija la sección se acorta; se compensa el scroll para que la vista no salte
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (!vista) { alto.current = el.offsetHeight; return }
    const diferencia = alto.current - el.offsetHeight
    if (diferencia > 0 && el.getBoundingClientRect().top < 0) window.scrollBy({ top: -diferencia, behavior: 'instant' })
  }, [vista])

  const ir = i => {
    if (vista) { setCap(i); setAvance(1); return }
    const el = ref.current
    if (!el) return
    const recorrido = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + recorrido * ((i + 0.05) / N), behavior: 'smooth' })
  }
  const manual = useRef(0)
  useEffect(() => {
    if (vista || reducir) return
    const marcar = () => { manual.current = Date.now() }
    const eventos = ['wheel', 'touchstart', 'touchmove', 'keydown', 'pointerdown']
    eventos.forEach(e => window.addEventListener(e, marcar, { passive: true }))
    let raf, antes = 0, pos = null
    const paso = t => {
      raf = requestAnimationFrame(paso)
      const dt = Math.min(64, t - antes) / 1000
      antes = t
      const el = ref.current
      if (!el || document.hidden) { pos = null; return }
      const r = el.getBoundingClientRect()
      const fija = r.top <= 8 && r.bottom >= window.innerHeight - 8
      if (!fija || Date.now() - manual.current < 2200) { pos = null; return }
      const recorrido = el.offsetHeight - window.innerHeight
      if (pos === null || Math.abs(pos - window.scrollY) > 3) pos = window.scrollY
      pos += (recorrido / (N * 6)) * dt
      window.scrollTo({ top: pos, behavior: 'instant' })
    }
    raf = requestAnimationFrame(t => { antes = t; raf = requestAnimationFrame(paso) })
    return () => { cancelAnimationFrame(raf); eventos.forEach(e => window.removeEventListener(e, marcar)) }
  }, [vista, reducir, N])

  const c = CAPITULOS[cap]
  const fotos = especies.filter(e => e.grupo === c.grupo)
  const lista = c.servicios.map(s => servicios.find(x => x.slug === s)).filter(Boolean)
  const vet = c.vet ? vets.find(v => c.vet.test(v.especialidad)) : null
  const pct = Math.round(avance * 100)

  return (
    <section ref={ref} className="relative mt-24" style={{ height: vista ? 'auto' : `${N * 60 + 25}vh` }} aria-label="Cómo cuidamos a cada especie">
      <div className={`flex flex-col justify-start overflow-hidden pb-6 pt-24 md:justify-center md:py-20 ${vista ? 'min-h-svh' : 'sticky top-0 h-svh'}`}>
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-14 md:px-8">
          <div className="min-w-0">
            <p className="flex items-baseline gap-3 font-display font-semibold text-acento" aria-hidden="true">
              <span className="text-4xl tabular-nums md:text-6xl">{String(cap + 1).padStart(2, '0')}</span>
              <span className="h-px w-14 bg-acento/40" />
              <span className="text-sm text-gris tabular-nums">{String(N).padStart(2, '0')}</span>
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={cap}
                initial={{ opacity: 0, transform: 'translateY(14px)', filter: 'blur(4px)' }} animate={{ opacity: 1, transform: 'translateY(0px)', filter: 'blur(0px)' }}
                exit={{ opacity: 0, transform: 'translateY(-8px)', filter: 'blur(4px)', transition: { duration: 0.22, ease: 'easeIn' } }} transition={{ duration: 0.6, ease: EASE }}>
                <h2 className="mt-3 text-3xl font-semibold md:mt-4 md:text-6xl">{c.titulo}</h2>
                <p className="mt-3 max-w-md text-gris md:mt-4 md:text-lg">{c.texto}</p>
                <ul className="mt-6 hidden max-w-sm md:block">
                  {lista.map((s, i) => {
                    const listo = avance > (i + 1) / (lista.length + 1.5)
                    return (
                      <li key={s.slug} className={`flex items-center justify-between gap-3 border-b border-borde py-3 transition-colors duration-300 ${listo ? 'text-tinta' : 'text-gris/70'}`}>
                        <span className="flex items-center gap-2 font-semibold">
                          <span className={`h-2 w-2 rounded-full transition-colors duration-300 ${listo ? 'bg-secundario' : 'bg-borde'}`} />{s.nombre}
                        </span>
                        <span className="text-sm tabular-nums">S/ {s.precio}</span>
                      </li>
                    )
                  })}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative [perspective:1400px]">
            <div className="escena-ficha relative rounded-[28px] bg-superficie p-4 shadow-flotante ring-1 ring-borde md:p-6"
              style={{ transform: reducir ? 'none' : `rotateY(${-7 + avance * 5}deg) rotateX(${3 - avance * 2}deg)` }}>
              <div className="flex items-center justify-between gap-3 border-b border-borde pb-3">
                <span className="flex gap-1.5" aria-hidden="true"><i className="h-2.5 w-2.5 rounded-full bg-error/70" /><i className="h-2.5 w-2.5 rounded-full bg-secundario/80" /><i className="h-2.5 w-2.5 rounded-full bg-primario/80" /></span>
                <span className="truncate text-xs font-semibold text-gris">Ficha clínica · {c.titulo}</span>
                <Stethoscope size={16} className="shrink-0 text-acento" aria-hidden="true" />
              </div>
              <div className="mt-4 grid gap-2.5 md:gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(3, fotos.length || 1)}, minmax(0, 1fr))` }}>
                {fotos.slice(0, 3).map((e, i) => {
                  const visible = avance > i * 0.12
                  return (
                    <div key={e.slug} className={`relative overflow-hidden bg-primario-claro ${fotos.length === 1 ? 'aspect-[16/10] rounded-3xl' : fotos.length === 2 ? 'aspect-[4/3] rounded-t-[999px] rounded-b-2xl' : 'aspect-[3/4] rounded-t-[999px] rounded-b-2xl'} transition-[opacity,transform,filter] duration-500 ${visible ? 'opacity-100' : 'translate-y-3 opacity-0 blur-sm'}`}>
                      <Foto src={e.imagen} alt="" ancho={260} alto={340} className="h-full w-full" />
                      <span className="absolute inset-x-1.5 bottom-1.5 truncate rounded-full bg-noche/80 px-2 py-1 text-center text-[11px] font-semibold text-white">{e.nombre}</span>
                    </div>
                  )
                })}
              </div>
              <div className={`mt-4 flex items-center gap-3 rounded-2xl bg-primario-claro p-3 transition-[opacity,transform] duration-500 ${avance > 0.7 ? 'opacity-100' : 'translate-y-2 opacity-0'}`}>
                {vet ? (
                  <>
                    <Foto src={vet.imagen} alt="" ancho={80} alto={80} className="h-10 w-10 shrink-0 rounded-full" />
                    <span className="min-w-0 text-sm"><span className="block font-semibold">Te atiende {vet.nombre}</span><span className="block truncate text-gris">{vet.especialidad}</span></span>
                  </>
                ) : (
                  <span className="flex items-center gap-2 text-sm font-semibold"><Check size={16} className="text-acento" aria-hidden="true" />Teleconsulta disponible para tu acuario</span>
                )}
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3 text-sm font-semibold" aria-hidden="true">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${pct === 100 ? 'bg-primario' : 'bg-secundario motion-safe:animate-pulse'}`} />
              <span className="shrink-0">{pct === 100 ? 'Lista para tu visita' : c.estado}</span>
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-borde">
                <span className="block h-full origin-left rounded-full bg-gradient-to-r from-primario to-secundario" style={{ transform: `scaleX(${avance})` }} />
              </span>
              <span className="w-10 text-right tabular-nums text-acento">{pct}%</span>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 md:mt-12 md:px-8">
          <nav aria-label="Capítulos" className="sin-barra -mx-1 flex gap-1 overflow-x-auto px-1">
            {CAPITULOS.map((x, i) => (
              <button key={x.grupo} type="button" onClick={() => ir(i)} aria-current={i === cap ? 'step' : undefined}
                className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors duration-300 ${i === cap ? 'bg-tinta text-fondo' : 'text-gris hover:text-tinta'}`}>
                <span className="tabular-nums opacity-60">{String(i + 1).padStart(2, '0')}</span>{x.titulo}
              </button>
            ))}
          </nav>
          <span className="hidden md:block"><Boton to="/servicios" variante="contorno" tamano="sm">Ver todos los servicios</Boton></span>
        </div>
      </div>
    </section>
  )
}

export function FraseScroll({ texto, fotos = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] })
  const palabras = texto.split(' ')
  const firma = useTransform(scrollYProgress, [0.85, 1], [0, 1])
  const firmaY = useTransform(scrollYProgress, [0.85, 1], [12, 0])
  return (
    <section className="relative mx-auto max-w-5xl px-4 pt-28 md:px-8 md:pt-40">
      <span className="pointer-events-none absolute -top-2 left-0 select-none font-display text-[12rem] leading-none text-primario/10 md:-left-10 md:top-10 md:text-[16rem]" aria-hidden="true">“</span>
      <p ref={ref} className="relative font-display text-3xl font-semibold leading-[1.25] md:text-5xl md:leading-[1.2]">
        <span className="sr-only">{texto}</span>
        <span aria-hidden="true">
          {palabras.map((p, i) => {
            const clave = p.toLowerCase().replace(/[^a-záéíóúñ]/g, '')
            return (
              <Palabra key={i} progreso={scrollYProgress} rango={[i / palabras.length, (i + 1) / palabras.length]} foto={fotos[clave]}>{p}</Palabra>
            )
          })}
        </span>
      </p>
      <motion.div style={{ opacity: firma, y: firmaY }} className="relative mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
        <span className="flex items-center gap-3">
          <span className="h-px w-10 bg-acento" aria-hidden="true" />
          <span className="font-semibold">Equipo HuellitaVet</span>
        </span>
        <Link to="/servicios" className="inline-flex min-h-11 items-center gap-1 font-semibold text-acento underline-offset-4 hover:underline">
          Conoce cómo cuidamos a cada especie<ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </motion.div>
    </section>
  )
}

function Palabra({ progreso, rango, foto, children }) {
  const opacidad = useTransform(progreso, rango, [0.15, 1])
  const escala = useTransform(progreso, [rango[1] - 0.02, rango[1] + 0.06], [0.4, 1])
  const visible = useTransform(progreso, [rango[1] - 0.02, rango[1] + 0.06], [0, 1])
  return (
    <motion.span className="inline-block" style={{ opacity: opacidad }}>
      {children}
      {foto && (
        <motion.span className="mx-1 inline-block h-[0.85em] w-[1.5em] translate-y-[0.08em] overflow-hidden rounded-full align-baseline ring-2 ring-secundario/70"
          style={{ scale: escala, opacity: visible }}>
          <Foto src={foto} alt="" ancho={120} alto={80} className="h-full w-full" />
        </motion.span>
      )}
      &nbsp;
    </motion.span>
  )
}
