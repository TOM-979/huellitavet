import { motion } from 'motion/react'
import Foto from './Foto.jsx'

export default function ChipsEspecies({ especies, valor, onCambiar, idGrupo, etiqueta = 'Filtrar por especie' }) {
  const opciones = [{ slug: '', nombre: 'Todas' }, ...especies]
  return (
    <div role="radiogroup" aria-label={etiqueta} className="sin-barra -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
      {opciones.map(e => {
        const activo = valor === e.slug
        return (
          <button key={e.slug || 'todas'} role="radio" aria-checked={activo} onClick={() => onCambiar(e.slug)}
            className={`presionable relative flex min-h-12 shrink-0 items-center gap-2 rounded-full border py-1 ${e.imagen ? 'pl-1' : 'pl-4'} pr-4 text-sm font-semibold ${activo ? 'border-tinta text-fondo' : 'border-borde bg-superficie text-tinta hover:border-primario'}`}>
            {activo && <motion.span layoutId={`chip-${idGrupo}`} className="absolute inset-0 rounded-full bg-tinta" transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }} />}
            {e.imagen && <Foto src={e.imagen} alt="" ancho={72} alto={72} className="relative h-10 w-10 rounded-full" />}
            <span className="relative">{e.nombre}</span>
          </button>
        )
      })}
    </div>
  )
}
