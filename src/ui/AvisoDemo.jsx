import { AnimatePresence, motion } from 'motion/react'
import { useModoDemo } from '../lib/useModoDemo.js'

// Flota abajo para no empujar el encabezado (y su logo) cuando aparece tarde
// Aviso cuando el backend está apagado y se muestra el catálogo de respaldo
export default function AvisoDemo() {
  const demo = useModoDemo()
  return (
    <AnimatePresence>
      {demo && (
        <motion.p role="status" initial={{ opacity: 0, transform: 'translateY(8px)' }} animate={{ opacity: 1, transform: 'translateY(0px)' }} exit={{ opacity: 0 }}
          className="fixed inset-x-3 bottom-3 z-30 mx-auto max-w-2xl rounded-2xl bg-aviso-fondo px-4 py-2.5 text-center text-sm text-aviso-texto shadow-flotante ring-1 ring-borde">
          Modo demostración: no hay conexión con la API, se muestra el catálogo guardado. Inicia el backend con <code className="font-semibold">npm run dev</code>.
        </motion.p>
      )}
    </AnimatePresence>
  )
}
