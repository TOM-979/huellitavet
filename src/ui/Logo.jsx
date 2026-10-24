import { Link } from 'react-router-dom'

export function Huella({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g fill="currentColor"><ellipse cx="32" cy="41" rx="11" ry="9" /><circle cx="18" cy="28" r="5" /><circle cx="26" cy="19" r="5" /><circle cx="38" cy="19" r="5" /><circle cx="46" cy="28" r="5" /></g>
    </svg>
  )
}

export default function Logo({ claro = false, destino = false }) {
  return (
    <Link to="/" aria-label="HuellitaVet, ir al inicio" data-logo-destino={destino || undefined} className="flex min-h-11 items-center gap-2.5">
      <span className={`grid h-10 w-10 place-items-center rounded-2xl ${claro ? 'bg-white/10' : 'bg-noche'}`}><Huella className="h-6 w-6 text-secundario" /></span>
      <span className={`font-display text-xl font-bold tracking-tight ${claro ? 'text-white' : 'text-tinta'}`}>HuellitaVet</span>
    </Link>
  )
}
