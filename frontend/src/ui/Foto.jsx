import { useState } from 'react'
import { PawPrint } from 'lucide-react'
import { foto, srcSet } from '../lib/foto.js'

export default function Foto({ src, alt, ancho = 600, alto, className = '', prioridad = false, ...props }) {
  const [estado, setEstado] = useState('cargando')
  if (!src || estado === 'error') {
    return (
      <div className={`grid place-items-center bg-primario-claro text-primario ${className}`} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
        <PawPrint size={40} aria-hidden="true" />
      </div>
    )
  }
  return (
    <img
      src={foto(src, ancho, alto)}
      srcSet={srcSet(src, ancho, alto)}
      alt={alt}
      width={ancho}
      height={alto}
      loading={prioridad ? 'eager' : 'lazy'}
      fetchPriority={prioridad ? 'high' : undefined}
      decoding="async"
      onLoad={() => setEstado('lista')}
      onError={() => setEstado('error')}
      className={`bg-primario-claro object-cover transition-opacity duration-300 ${estado === 'lista' ? 'opacity-100' : 'opacity-0'} ${className}`}
      {...props}
    />
  )
}
