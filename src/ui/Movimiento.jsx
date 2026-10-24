import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useReducedMotion } from 'motion/react'
import { Huella } from './Logo.jsx'

const EASE = [0.23, 1, 0.32, 1]
const VISTA = { once: true, margin: '0px 0px -12% 0px' }

export function Aparecer({ as = 'div', retraso = 0, distancia = 24, className = '', children, ...props }) {
  const M = motion[as]
  return (
    <M className={className} viewport={VISTA}
      initial={{ opacity: 0, transform: `translateY(${distancia}px)` }}
      whileInView={{ opacity: 1, transform: 'translateY(0px)' }}
      transition={{ duration: 0.6, ease: EASE, delay: retraso }} {...props}>
      {children}
    </M>
  )
}

export function Rastro({ pasos = 4, giro = 0, separacion = 26, tamano = 16, retraso = 0, className = '' }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none block ${/\babsolute\b/.test(className) ? '' : 'relative'} ${className}`}
      style={{ width: tamano * 2, height: separacion * (pasos - 1) + tamano, transform: `rotate(${giro}deg)` }}>
      {Array.from({ length: pasos }, (_, i) => (
        <motion.span key={i} className="absolute block"
          style={{ width: tamano, height: tamano, left: i % 2 ? tamano * 0.9 : 0, bottom: i * separacion }}
          viewport={VISTA}
          initial={{ opacity: 0, transform: 'scale(0.6)' }}
          whileInView={{ opacity: 1, transform: 'scale(1)' }}
          transition={{ duration: 0.35, ease: EASE, delay: retraso + i * 0.14 }}>
          <Huella className="h-full w-full" />
        </motion.span>
      ))}
    </span>
  )
}

export function Contador({ valor, className = '' }) {
  const ref = useRef(null)
  const enVista = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reducir = useReducedMotion()
  const [n, setN] = useState(reducir ? valor : 0)
  useEffect(() => {
    if (!enVista || reducir) { if (reducir) setN(valor); return }
    const control = animate(0, valor, { duration: 1.4, ease: EASE, onUpdate: v => setN(Math.round(v)) })
    return () => control.stop()
  }, [enVista, reducir, valor])
  return <span ref={ref} className={`tabular-nums ${className}`}>{n}</span>
}

export function TituloAnimado({ as = 'h1', texto, destacado = '', className = '' }) {
  const Tag = as
  const marca = new Set(destacado.split(' ').filter(Boolean))
  return (
    <Tag className={className}>
      <span className="sr-only">{texto}</span>
      <span aria-hidden="true">
        {texto.split(' ').map((palabra, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span className={`inline-block ${marca.has(palabra) ? 'texto-marca' : ''}`}
              initial={{ opacity: 0, transform: 'translateY(70%)', filter: 'blur(6px)' }}
              animate={{ opacity: 1, transform: 'translateY(0%)', filter: 'blur(0px)' }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.06 }}>
              {palabra}
            </motion.span>
            {'\u00a0'}
          </span>
        ))}
      </span>
    </Tag>
  )
}
