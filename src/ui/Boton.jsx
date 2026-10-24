import { Link } from 'react-router-dom'

const VARIANTES = {
  primario: 'bg-secundario text-noche hover:bg-secundario-hover',
  verde: 'bg-primario-oscuro text-white hover:bg-primario-hover',
  contorno: 'border-2 border-primario bg-superficie text-acento hover:bg-primario-claro',
  claro: 'bg-superficie text-tinta hover:bg-primario-claro',
  fantasma: 'text-tinta hover:bg-tinta/5',
}
const TAMANOS = { sm: 'min-h-11 px-4 text-sm', md: 'min-h-12 px-6', lg: 'min-h-14 px-8 text-base' }

// Botón o enlace con el mismo estilo. Si recibe "to" se convierte en enlace interno.
export default function Boton({ variante = 'primario', tamano = 'md', ancho, to, href, className = '', children, ...props }) {
  const clases = `presionable inline-flex items-center justify-center gap-2 rounded-full font-semibold
    disabled:cursor-not-allowed disabled:bg-borde disabled:text-gris disabled:border-transparent
    ${VARIANTES[variante]} ${TAMANOS[tamano]} ${ancho ? 'w-full' : ''} ${className}`
  if (to) return <Link to={to} className={clases} {...props}>{children}</Link>
  if (href) return <a href={href} className={clases} {...props}>{children}</a>
  return <button className={clases} {...props}>{children}</button>
}
