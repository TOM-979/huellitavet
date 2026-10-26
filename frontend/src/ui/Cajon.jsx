import { useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAtraparFoco } from '../lib/useAtraparFoco.js'

function Contenido({ onCerrar, titulo, children }) {
  const panel = useRef(null)
  useAtraparFoco(panel, true, onCerrar)
  return (
    <div className="fixed inset-0 z-50">
      <motion.div className="absolute inset-0 bg-noche/60" onClick={onCerrar} aria-hidden="true"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} transition={{ duration: 0.25 }} />
      <motion.aside ref={panel} role="dialog" aria-modal="true" aria-label={titulo} tabIndex={-1}
        initial={{ transform: 'translateX(100%)' }} animate={{ transform: 'translateX(0%)' }}
        exit={{ transform: 'translateX(100%)', transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] } }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="absolute bottom-0 right-0 top-0 flex w-full max-w-md flex-col bg-superficie shadow-flotante outline-none md:bottom-3 md:right-3 md:top-3 md:rounded-[28px]">
        {children}
      </motion.aside>
    </div>
  )
}

export default function Cajon({ abierto, onCerrar, titulo, children }) {
  return <AnimatePresence>{abierto && <Contenido onCerrar={onCerrar} titulo={titulo}>{children}</Contenido>}</AnimatePresence>
}
