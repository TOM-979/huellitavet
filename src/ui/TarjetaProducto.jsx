import { Eye, Plus, Star } from 'lucide-react'
import Foto from './Foto.jsx'
import { soles } from '../lib/formato.js'

// Recibe el producto y las acciones por props.
// Con mouse, al pasar por la foto sube una barra con «Vista rápida» y «Agregar»; en táctil queda el botón redondo.
export default function TarjetaProducto({ producto, onVer, onAgregar }) {
  const { nombre, categoria_nombre, precio, rating, resenas, imagen, stock } = producto
  return (
    <article className="producto group relative flex flex-col">
      <div className="foco relative aspect-[4/5] overflow-hidden rounded-[28px] bg-primario-claro ring-1 ring-borde">
        <button onClick={() => onVer(producto)} tabIndex={-1} aria-hidden="true" className="absolute inset-0">
          <Foto src={imagen} alt="" ancho={420} alto={525} className="producto-foto h-full w-full" />
        </button>
        <span className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 rounded-full bg-superficie/85 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
          <Star size={12} className="fill-secundario text-secundario" aria-hidden="true" />{rating}
        </span>
        {stock <= 5 && stock > 0 && <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-secundario px-3 py-1 text-xs font-semibold text-noche">Últimas {stock}</span>}
        {stock === 0 && <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-noche px-3 py-1 text-xs font-semibold text-white">Agotado</span>}
        {/* Barra de acciones (solo con mouse) */}
        <div className="producto-acciones absolute inset-x-3 bottom-3 hidden gap-2 [@media(hover:hover)_and_(pointer:fine)]:flex">
          <button onClick={() => onVer(producto)} tabIndex={-1} aria-hidden="true"
            className="presionable flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-superficie/90 text-sm font-semibold backdrop-blur-sm hover:bg-superficie">
            <Eye size={16} aria-hidden="true" />Vista rápida
          </button>
          <button onClick={() => onAgregar(producto)} disabled={stock === 0} tabIndex={-1} aria-hidden="true"
            className="presionable flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-secundario text-sm font-semibold text-noche hover:bg-secundario-hover disabled:bg-borde disabled:text-gris">
            <Plus size={16} aria-hidden="true" />Agregar
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-1 pt-4">
        <p className="text-xs font-semibold text-acento">{categoria_nombre}</p>
        <h3 className="mt-1 font-sans text-base font-semibold leading-snug">
          <button onClick={() => onVer(producto)} className="w-full text-left underline-offset-4 hover:underline" aria-label={`Ver detalle de ${nombre}`}>{nombre}</button>
        </h3>
        <p className="mt-1 text-xs text-gris">{resenas} opiniones</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="whitespace-nowrap font-display text-2xl font-semibold tabular-nums">{soles(precio)}</span>
          <button onClick={() => onAgregar(producto)} disabled={stock === 0} aria-label={`Agregar ${nombre} al carrito`}
            className="presionable grid h-11 w-11 shrink-0 place-items-center rounded-full bg-tinta text-fondo transition-colors hover:bg-acento disabled:bg-borde disabled:text-gris">
            <Plus size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}
