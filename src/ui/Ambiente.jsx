import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import { Huella } from './Logo.jsx'

export default function Ambiente() {
  const reducir = useReducedMotion()
  const { scrollYProgress, scrollY } = useScroll()
  const avance = useSpring(scrollYProgress, { stiffness: 220, damping: 32, restDelta: 0.001 })
  const [subir, setSubir] = useState(false)

  useEffect(() => scrollY.on('change', y => setSubir(y > 700)), [scrollY])
  useEffect(() => {
    const mover = e => {
      const tarjeta = e.target.closest?.('.foco')
      if (!tarjeta) return
      const r = tarjeta.getBoundingClientRect()
      tarjeta.style.setProperty('--mx', `${e.clientX - r.left}px`)
      tarjeta.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    window.addEventListener('pointermove', mover, { passive: true })
    return () => window.removeEventListener('pointermove', mover)
  }, [])

  return (
    <>
      <motion.div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-primario via-acento to-secundario"
        style={{ scaleX: avance }} />
      <AnimatePresence>
        {subir && (
          <motion.button type="button" aria-label="Subir al inicio de la página" onClick={() => window.scrollTo({ top: 0, behavior: reducir ? 'auto' : 'smooth' })}
            initial={{ opacity: 0, transform: 'translateY(12px) scale(0.9)' }} animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={{ opacity: 0, transform: 'translateY(12px) scale(0.9)', transition: { duration: 0.15 } }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="presionable fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-tinta text-fondo shadow-flotante hover:bg-acento md:bottom-8 md:right-8">
            <ArrowUp size={20} aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
      {!reducir && <EstelaHuellas />}
    </>
  )
}

function EstelaHuellas() {
  const capa = useRef(null)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let ultimo = null, lado = 1
    const mover = e => {
      if (!ultimo) { ultimo = { x: e.clientX, y: e.clientY }; return }
      const dx = e.clientX - ultimo.x, dy = e.clientY - ultimo.y
      if (Math.hypot(dx, dy) < 70) return
      const angulo = Math.atan2(dy, dx)
      lado = -lado
      const x = e.clientX + Math.sin(angulo) * 7 * lado, y = e.clientY - Math.cos(angulo) * 7 * lado
      ultimo = { x: e.clientX, y: e.clientY }
      const h = document.createElement('span')
      h.className = 'huella-estela'
      h.style.transform = `translate(${x - 7}px, ${y - 7}px) rotate(${(angulo * 180) / Math.PI + 90}deg)`
      h.innerHTML = capa.current?.dataset.svg ?? ''
      capa.current?.appendChild(h)
      h.addEventListener('animationend', () => h.remove())
    }
    window.addEventListener('pointermove', mover, { passive: true })
    return () => window.removeEventListener('pointermove', mover)
  }, [])
  const molde = useRef(null)
  useEffect(() => { if (capa.current && molde.current) capa.current.dataset.svg = molde.current.innerHTML }, [])

  return (
    <div ref={capa} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[55] overflow-hidden">
      <span ref={molde} className="hidden"><Huella className="h-full w-full" /></span>
    </div>
  )
}
