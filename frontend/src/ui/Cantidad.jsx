import { Minus, Plus } from 'lucide-react'
import BotonIcono from './BotonIcono.jsx'

export default function Cantidad({ valor, max, onCambiar, nombre, compacto }) {
  return (
    <div className={`inline-flex items-center rounded-full border border-borde bg-superficie ${compacto ? '' : 'p-1'}`}>
      <BotonIcono tono="transparente" lado="arriba" etiqueta={`Quitar uno de ${nombre}`} onClick={() => onCambiar(valor - 1)} disabled={valor <= 1} className="disabled:opacity-30">
        <Minus size={16} aria-hidden="true" />
      </BotonIcono>
      <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite" aria-label={`Cantidad ${valor}`}>{valor}</span>
      <BotonIcono tono="transparente" lado="arriba" etiqueta={`Agregar uno de ${nombre}`} onClick={() => onCambiar(valor + 1)} disabled={valor >= max} className="disabled:opacity-30">
        <Plus size={16} aria-hidden="true" />
      </BotonIcono>
    </div>
  )
}
