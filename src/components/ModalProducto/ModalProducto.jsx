import './ModalProducto.css'
import { useEffect, useState } from 'react'
import { ShieldCheck, Star, Store } from 'lucide-react'
import Modal from '../../ui/Modal.jsx'
import Foto from '../../ui/Foto.jsx'
import Boton from '../../ui/Boton.jsx'
import Cantidad from '../../ui/Cantidad.jsx'
import { soles } from '../../lib/formato.js'

export default function ModalProducto({ producto, especies = [], onCerrar, onAgregar }) {
  const [cantidad, setCantidad] = useState(1)
  useEffect(() => setCantidad(1), [producto?.id])
  const p = producto
  const nombresEspecies = p ? especies.filter(e => p.especies.includes(e.slug)).map(e => e.nombre) : []
  return (
    <Modal abierto={Boolean(p)} onCerrar={onCerrar} titulo={p?.nombre ?? 'Producto'} ancho="max-w-4xl">
      {p && (
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square bg-primario-claro md:aspect-auto md:min-h-[560px]">
            <Foto src={p.imagen} alt={p.nombre} ancho={720} alto={720} prioridad className="absolute inset-0 h-full w-full" />
          </div>
          <div className="flex flex-col gap-4 p-6 md:p-8">
            <p className="text-sm text-gris">{p.categoria_nombre}</p>
            <h2 className="pr-12 text-3xl font-semibold">{p.nombre}</h2>
            <p className="flex items-center gap-1 text-sm text-gris">
              <Star size={16} className="fill-secundario text-secundario" aria-hidden="true" /><b className="text-tinta">{p.rating}</b> de 5, {p.resenas} opiniones
            </p>
            <p className="font-display text-4xl font-semibold text-acento tabular-nums">{soles(p.precio)}</p>
            <p className="text-gris">{p.descripcion}</p>
            {nombresEspecies.length > 0 && (
              <div>
                <p className="text-sm font-semibold">Ideal para</p>
                <ul className="mt-2 flex flex-wrap gap-2">{nombresEspecies.map(n => <li key={n} className="rounded-full bg-primario-claro px-3 py-1 text-sm text-acento">{n}</li>)}</ul>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <Cantidad valor={cantidad} max={p.stock} onCambiar={setCantidad} nombre={p.nombre} />
              <span className="text-sm text-gris">{p.stock > 0 ? `${p.stock} disponibles` : 'Agotado'}</span>
            </div>
            <Boton tamano="lg" ancho disabled={p.stock === 0} onClick={() => { onAgregar(p, cantidad); onCerrar() }}>
              Agregar al carrito · {soles(p.precio * cantidad)}
            </Boton>
            <ul className="space-y-2 border-t border-borde pt-4 text-sm text-gris">
              <li className="flex gap-2"><Store size={16} className="mt-0.5 shrink-0" aria-hidden="true" />Recojo gratis en la clínica en 2 horas</li>
              <li className="flex gap-2"><ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />Recomendado por nuestros veterinarios</li>
            </ul>
          </div>
        </div>
      )}
    </Modal>
  )
}
