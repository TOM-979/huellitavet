import './IntroLogo.css'
import { useEffect, useLayoutEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Huella } from '../../ui/Logo.jsx'

const PASOS = 7
const T = { pasos: 0.12, entrePasos: 0.11, marca: 0.95, nombre: 1.1, brillo: 1.6, vuelo: 2.15, duracionVuelo: 0.75, fin: 3.4 }
const EASE_SALIDA = [0.23, 1, 0.32, 1]
const EASE_CAJON = [0.32, 0.72, 0, 1]

function medir() {
  const destino = document.querySelector('[data-logo-destino]')
  if (!destino) return null
  const r = destino.getBoundingClientRect()
  const vw = document.documentElement.clientWidth, vh = window.innerHeight
  const escala = Math.min(2.6, (vw * 0.78) / r.width)
  const cx = vw / 2, cy = vh * 0.46
  const dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2)
  const marcaX = cx - (r.width / 2 - 20) * escala
  // Camino curvo de las huellas: desde abajo a la izquierda hasta la marca.
  // En pantallas angostas no hay espacio a la izquierda, así que suben desde abajo.
  const angosta = marcaX < 220
  const inicio = angosta
    ? { x: marcaX + 70, y: vh + 10 }
    : { x: marcaX - Math.min(vw * 0.42, 460), y: cy + Math.min(vh * 0.32, 240) }
  const fin = angosta
    ? { x: marcaX + 6, y: cy + 20 * escala + 26 }
    : { x: marcaX - 30 * escala, y: cy + 14 * escala }
  const curva = angosta ? 36 : 60
  const cuerdaX = fin.x - inicio.x, cuerdaY = fin.y - inicio.y, largo = Math.hypot(cuerdaX, cuerdaY)
  const nx = cuerdaY / largo, ny = -cuerdaX / largo
  const huellas = Array.from({ length: PASOS }, (_, i) => {
    const t = i / (PASOS - 1)
    const arco = Math.sin(t * Math.PI) * curva
    const x = inicio.x + cuerdaX * t + nx * arco
    const y = inicio.y + cuerdaY * t + ny * arco
    const pendiente = Math.cos(t * Math.PI) * Math.PI * curva
    const angulo = Math.atan2(cuerdaY + ny * pendiente, cuerdaX + nx * pendiente)
    const lado = i % 2 ? 1 : -1
    return {
      x: x + Math.sin(angulo) * 11 * lado,
      y: y - Math.cos(angulo) * 11 * lado,
      giro: (angulo * 180) / Math.PI + 90,
    }
  })
  return { r, escala, dx, dy, huellas, tam: Math.max(20, 12 * escala) }
}

export default function IntroLogo() {
  const [geo, setGeo] = useState(null)
  const [fase, setFase] = useState('entrada')
  const reducido = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useLayoutEffect(() => {
    if (reducido) return
    document.documentElement.classList.add('intro-activa')
    let vivo = true
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 700))]).then(() => { if (vivo) setGeo(medir()) })
    return () => { vivo = false; document.documentElement.classList.remove('intro-activa') }
  }, [reducido])

  useEffect(() => {
    if (!geo) return
    const tiempos = fase === 'entrada'
      ? [setTimeout(() => setFase('vuelo'), T.vuelo * 1000)]
      : fase === 'vuelo' ? [setTimeout(() => setFase('listo'), (T.duracionVuelo + 0.05) * 1000)] : []
    return () => tiempos.forEach(clearTimeout)
  }, [geo, fase])

  // El encabezado puede moverse mientras dura la intro (por ejemplo, al aparecer el aviso
  // de modo demostración), así que el destino se vuelve a medir justo antes de volar
  const [llegada, setLlegada] = useState({ x: 0, y: 0 })
  useLayoutEffect(() => {
    if (fase !== 'vuelo' || !geo) return
    const r2 = document.querySelector('[data-logo-destino]')?.getBoundingClientRect()
    if (r2) setLlegada({ x: r2.left - geo.r.left, y: r2.top - geo.r.top })
  }, [fase, geo])
  const [anillo, setAnillo] = useState(null)
  useLayoutEffect(() => {
    if (fase !== 'listo') return
    document.documentElement.classList.remove('intro-activa')
    const marca = document.querySelector('[data-logo-destino] > span')?.getBoundingClientRect()
    if (marca) setAnillo({ left: marca.left, top: marca.top, width: marca.width, height: marca.height })
  }, [fase])

  useEffect(() => {
    if (fase !== 'entrada' || !geo) return
    const saltar = () => setFase('vuelo')
    window.addEventListener('pointerdown', saltar)
    window.addEventListener('keydown', saltar)
    return () => { window.removeEventListener('pointerdown', saltar); window.removeEventListener('keydown', saltar) }
  }, [fase, geo])

  const [terminado, setTerminado] = useState(false)
  useEffect(() => {
    if (fase !== 'listo') return
    const t = setTimeout(() => setTerminado(true), 650)
    return () => clearTimeout(t)
  }, [fase])

  if (reducido || terminado) return null
  if (!geo) return <div aria-hidden="true" className="fixed inset-0 z-[80] bg-fondo" />

  const { r, escala, dx, dy, huellas, tam } = geo
  const volando = fase !== 'entrada'
  const grande = `translate(${dx}px, ${dy}px) scale(${escala})`

  return (
    <div aria-hidden="true" className={`fixed inset-0 z-[80] ${volando ? 'pointer-events-none' : 'cursor-pointer'}`}>
      <motion.div className="absolute inset-0 bg-fondo"
        initial={{ opacity: 1 }} animate={{ opacity: volando ? 0 : 1 }}
        transition={{ duration: 0.5, ease: EASE_SALIDA, delay: volando ? 0.1 : 0 }} />

      {!volando && huellas.map((h, i) => (
        <motion.span key={i} className="absolute left-0 top-0 text-primario"
          style={{ width: tam, height: tam, marginLeft: -tam / 2, marginTop: -tam / 2 }}
          initial={{ opacity: 0, transform: `translate(${h.x}px, ${h.y}px) rotate(${h.giro}deg) scale(0.7)` }}
          animate={{ opacity: [0, 0.9, 0.9, 0], transform: `translate(${h.x}px, ${h.y}px) rotate(${h.giro}deg) scale(1)` }}
          transition={{
            opacity: { duration: 1.25, times: [0, 0.12, 0.55, 1], delay: T.pasos + i * T.entrePasos, ease: 'easeOut' },
            transform: { duration: 0.25, delay: T.pasos + i * T.entrePasos, ease: EASE_SALIDA },
          }}>
          <Huella className="h-full w-full" />
        </motion.span>
      ))}

      {anillo && (
        <motion.span className="absolute rounded-2xl ring-2 ring-secundario" style={anillo}
          initial={{ opacity: 0.9, transform: 'scale(1)' }} animate={{ opacity: 0, transform: 'scale(1.7)' }}
          transition={{ duration: 0.6, ease: EASE_SALIDA }} />
      )}

      {fase !== 'listo' && <motion.div className="absolute flex items-center gap-2.5"
        style={{ left: r.left, top: r.top, height: r.height, transformOrigin: 'center' }}
        initial={{ transform: grande }}
        animate={{ transform: volando ? `translate(${llegada.x}px, ${llegada.y}px) scale(1)` : grande }}
        transition={{ duration: T.duracionVuelo, ease: EASE_CAJON }}>
        <motion.span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-noche"
          initial={{ opacity: 0, transform: 'scale(0.6) rotate(-12deg)' }}
          animate={{ opacity: 1, transform: 'scale(1) rotate(0deg)' }}
          transition={volando ? { duration: 0 } : { type: 'spring', duration: 0.55, bounce: 0.35, delay: T.marca }}>
          <Huella className="h-6 w-6 text-secundario" />
        </motion.span>
        <span className="relative font-display text-xl font-bold tracking-tight text-tinta">
          <motion.span className="block"
            initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={volando ? { duration: 0 } : { duration: 0.55, ease: EASE_SALIDA, delay: T.nombre }}>
            HuellitaVet
          </motion.span>
          {!volando && (
            <motion.span className="intro-brillo absolute inset-0" aria-hidden="true"
              initial={{ maskPosition: '150% 0' }} animate={{ maskPosition: '-50% 0' }}
              transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1], delay: T.brillo }}>
              HuellitaVet
            </motion.span>
          )}
        </span>
      </motion.div>}
    </div>
  )
}
