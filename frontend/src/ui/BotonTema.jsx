import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Moon, Sun } from 'lucide-react'
import BotonIcono from './BotonIcono.jsx'

// El tema inicial lo pone el script de index.html antes de pintar (evita el destello claro)
const leerTema = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
const COLOR_BARRA = { light: '#264653', dark: '#0D1A1F' }

function aplicar(tema) {
  document.documentElement.dataset.theme = tema
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLOR_BARRA[tema])
}

export default function BotonTema() {
  const [tema, setTema] = useState(leerTema)
  const oscuro = tema === 'dark'
  useEffect(() => {
    const consulta = window.matchMedia('(prefers-color-scheme: dark)')
    const alCambiar = e => {
      let guardado = null
      try { guardado = localStorage.getItem('tema') } catch {}
      if (guardado) return
      const t = e.matches ? 'dark' : 'light'
      aplicar(t)
      setTema(t)
    }
    consulta.addEventListener('change', alCambiar)
    return () => consulta.removeEventListener('change', alCambiar)
  }, [])

  function cambiar(e) {
    const siguiente = oscuro ? 'light' : 'dark'
    try { localStorage.setItem('tema', siguiente) } catch {}
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reducido) {
      aplicar(siguiente)
      setTema(siguiente)
      return
    }
    // El nuevo tema se revela en un círculo que crece desde el botón
    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2, y = r.top + r.height / 2
    const radio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const transicion = document.startViewTransition(() => {
      flushSync(() => setTema(siguiente))
      aplicar(siguiente)
    })
    transicion.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radio}px at ${x}px ${y}px)`] },
        { duration: 550, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
  }

  return (
    <BotonIcono tono="transparente" className="ring-1 ring-borde" etiqueta={oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'} onClick={cambiar}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={tema} className="grid place-items-center"
          initial={{ opacity: 0, transform: 'rotate(-90deg) scale(0.6)', filter: 'blur(3px)' }}
          animate={{ opacity: 1, transform: 'rotate(0deg) scale(1)', filter: 'blur(0px)' }}
          exit={{ opacity: 0, transform: 'rotate(90deg) scale(0.6)', filter: 'blur(3px)', transition: { duration: 0.15 } }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}>
          {oscuro ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </BotonIcono>
  )
}
