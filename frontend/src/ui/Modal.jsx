import { useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import BotonIcono from './BotonIcono.jsx'
import { useAtraparFoco } from '../lib/useAtraparFoco.js'

const EASE = [0.23, 1, 0.32, 1]

function Contenido({ onCerrar, titulo, ancho, children }) {
  const panel = useRef(null)
  useAtraparFoco(panel, true, onCerrar)
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.2 }}>
      <div className="absolute inset-0 bg-noche/60" onClick={onCerrar} aria-hidden="true" />
      <motion.div ref={panel} role="dialog" aria-modal="true" aria-label={titulo} tabIndex={-1}
        initial={{ opacity: 0, transform: 'translateY(12px) scale(0.97)' }}
        animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
        exit={{ opacity: 0, transform: 'translateY(8px) scale(0.98)', transition: { duration: 0.15 } }}
        transition={{ duration: 0.28, ease: EASE }}
        className={`relative max-h-[92dvh] w-full ${ancho} overflow-y-auto rounded-[28px] bg-superficie shadow-flotante outline-none`}>
        <div className="absolute right-4 top-4 z-10">
          <BotonIcono tono="neutro" alinear="derecha" etiqueta="Cerrar" atajo="Esc" onClick={onCerrar}><X size={18} aria-hidden="true" /></BotonIcono>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

export default function Modal({ abierto, onCerrar, titulo, ancho = 'max-w-lg', children }) {
  return <AnimatePresence>{abierto && <Contenido onCerrar={onCerrar} titulo={titulo} ancho={ancho}>{children}</Contenido>}</AnimatePresence>
}
