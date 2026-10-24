import { motion, useReducedMotion } from 'motion/react'
import Foto from './Foto.jsx'
import { soles } from '../lib/formato.js'

const EASE = [0.23, 1, 0.32, 1]
const POSES = [
  { x: -112, y: 24, giro: -10, z: 1 },
  { x: 0, y: 0, giro: 0, z: 3 },
  { x: 112, y: 24, giro: 10, z: 2 },
]

export default function Abanico({ productos, onVer }) {
  const reducir = useReducedMotion()
  return (
    <div className="relative mx-auto h-[400px] w-full max-w-md" aria-label="Productos destacados">
      {productos.slice(0, 3).map((p, i) => {
        const pose = POSES[i]
        return (
          <motion.button key={p.id} type="button" onClick={() => onVer(p)} aria-label={`Ver ${p.nombre}`}
            className="foco absolute top-4 w-48 origin-bottom overflow-hidden rounded-3xl bg-superficie text-left shadow-flotante ring-1 ring-borde"
            style={{ zIndex: pose.z, left: 'calc(50% - 96px)' }}
            initial={reducir ? false : { opacity: 0, transform: 'translate(0px, 40px) rotate(0deg) scale(0.9)' }}
            animate={{ opacity: 1, transform: `translate(${pose.x}px, ${pose.y}px) rotate(${pose.giro}deg) scale(1)` }}
            whileHover={{ transform: `translate(${pose.x * 1.08}px, ${pose.y - 18}px) rotate(${pose.giro * 0.4}deg) scale(1.04)`, zIndex: 5, transition: { duration: 0.35, ease: EASE } }}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: EASE }}>
            <Foto src={p.imagen} alt="" ancho={420} alto={420} className="aspect-square w-full" />
            <span className="block p-4">
              <span className="block truncate text-xs font-semibold text-gris">{p.categoria_nombre}</span>
              <span className="mt-0.5 line-clamp-2 block font-semibold leading-snug">{p.nombre}</span>
              <span className="mt-2 block font-display text-lg font-semibold text-acento">{soles(p.precio)}</span>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
