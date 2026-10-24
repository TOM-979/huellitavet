// Botón cuadrado de solo ícono (44 × 44) con tooltip en hover y en foco de teclado
export default function BotonIcono({ etiqueta, atajo, lado = 'abajo', alinear = 'centro', tono = 'suave', className = '', children, ...props }) {
  const tonos = {
    suave: 'bg-primario-claro text-tinta hover:bg-primario-claro-hover',
    neutro: 'bg-fondo text-tinta hover:bg-borde',
    transparente: 'text-tinta hover:bg-tinta/5',
    oscuro: 'bg-white/10 text-white hover:bg-white/20',
  }
  const vertical = lado === 'arriba' ? 'bottom-full mb-2' : 'top-full mt-2'
  const horizontal = alinear === 'derecha' ? 'right-0' : alinear === 'izquierda' ? 'left-0' : 'left-1/2 -translate-x-1/2'
  return (
    <span className="group/tip relative inline-flex">
      <button aria-label={etiqueta} className={`presionable grid h-11 w-11 shrink-0 place-items-center rounded-full ${tonos[tono]} ${className}`} {...props}>
        {children}
      </button>
      <span role="tooltip"
        className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-tinta px-2 py-1 text-xs font-semibold text-fondo opacity-0 transition-opacity duration-150
          group-hover/tip:opacity-100 group-has-[:focus-visible]/tip:opacity-100 ${vertical} ${horizontal}`}>
        {etiqueta}{atajo && <kbd className="ml-2 rounded bg-fondo/15 px-1 font-sans">{atajo}</kbd>}
      </span>
    </span>
  )
}
