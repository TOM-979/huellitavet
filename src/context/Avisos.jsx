import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, X } from 'lucide-react'

const Ctx = createContext(null)

// Avisos breves en la esquina (por ejemplo, "Agregaste… al carrito")
export function AvisosProvider({ children }) {
  const [avisos, setAvisos] = useState([])
  const id = useRef(0)

  const cerrar = useCallback((clave) => setAvisos(a => a.filter(x => x.clave !== clave)), [])
  const avisar = useCallback(({ titulo, texto, accion }) => {
    const clave = ++id.current
    setAvisos(a => [...a.slice(-2), { clave, titulo, texto, accion }])
    setTimeout(() => cerrar(clave), 4500)
  }, [cerrar])

  return (
    <Ctx.Provider value={avisar}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-[60] flex flex-col items-end gap-3 md:left-auto md:right-6 md:bottom-6" aria-live="polite">
        <AnimatePresence initial={false}>
          {avisos.map(a => (
            <motion.div key={a.clave} layout
              initial={{ opacity: 0, transform: 'translateY(16px) scale(0.97)' }}
              animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
              exit={{ opacity: 0, transform: 'translateY(8px) scale(0.97)', transition: { duration: 0.15 } }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-noche p-3 pr-2 text-white shadow-flotante">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primario"><Check size={18} aria-hidden="true" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{a.titulo}</p>
                {a.texto && <p className="truncate text-sm text-white/75">{a.texto}</p>}
              </div>
              {a.accion && (
                <button onClick={() => { a.accion.onClick(); cerrar(a.clave) }}
                  className="presionable min-h-11 rounded-lg px-3 text-sm font-semibold text-secundario hover:bg-white/10">{a.accion.texto}</button>
              )}
              <button onClick={() => cerrar(a.clave)} aria-label="Cerrar aviso" className="grid h-11 w-11 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white">
                <X size={16} aria-hidden="true" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}

export const useAvisos = () => useContext(Ctx)
