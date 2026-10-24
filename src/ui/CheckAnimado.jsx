import { motion } from 'motion/react'

// Check que se dibuja al confirmar (indica que la acción terminó bien)
export default function CheckAnimado({ tamano = 88 }) {
  return (
    <motion.svg width={tamano} height={tamano} viewBox="0 0 88 88" aria-hidden="true"
      initial={{ opacity: 0, transform: 'scale(0.9)' }} animate={{ opacity: 1, transform: 'scale(1)' }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}>
      <circle cx="44" cy="44" r="44" style={{ fill: 'var(--color-primario-claro)' }} />
      <motion.circle cx="44" cy="44" r="34" fill="none" stroke="#2A9D8F" strokeWidth="4"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }} />
      <motion.path d="M30 45 L40 55 L59 35" fill="none" style={{ stroke: 'var(--color-acento)' }} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.35, ease: [0.23, 1, 0.32, 1] }} />
    </motion.svg>
  )
}
