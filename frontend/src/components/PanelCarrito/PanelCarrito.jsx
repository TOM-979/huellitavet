import './PanelCarrito.css'
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FileText, ShoppingBag, Trash2, X } from 'lucide-react'
import Cajon from '../../ui/Cajon.jsx'
import Boton from '../../ui/Boton.jsx'
import BotonIcono from '../../ui/BotonIcono.jsx'
import Cantidad from '../../ui/Cantidad.jsx'
import Foto from '../../ui/Foto.jsx'
import Check from '../../ui/CheckAnimado.jsx'
import { useCarrito } from '../../context/Carrito.jsx'
import { crearPedido, urlComprobante } from '../../lib/api.js'
import { soles } from '../../lib/formato.js'

export default function PanelCarrito() {
  const { items, cambiar, quitar, restaurar, vaciar, cantidad, total, abierto, setAbierto } = useCarrito()
  const [paso, setPaso] = useState('carrito')
  const [datos, setDatos] = useState({ nombre: '', telefono: '' })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [pedido, setPedido] = useState(null)
  const [quitado, setQuitado] = useState(null)
  const enviando = useRef(false)
  const [cargando, setCargando] = useState(false)

  const cerrar = () => { setAbierto(false); setQuitado(null); if (paso === 'listo') setPaso('carrito') }
  const quitarItem = (item, i) => { quitar(item.producto.id); setQuitado({ item, i }) }

  const validar = (c, v) => c === 'nombre' ? (v.trim().length < 3 ? 'Escribe tu nombre y apellido.' : '')
    : (/^9\d{8}$/.test(v.replace(/\s/g, '')) ? '' : 'Escribe un celular de 9 dígitos que empiece con 9.')

  const confirmar = async (e) => {
    e.preventDefault()
    if (enviando.current) return
    const nuevos = { nombre: validar('nombre', datos.nombre), telefono: validar('telefono', datos.telefono) }
    setErrores(nuevos)
    if (nuevos.nombre || nuevos.telefono) { document.getElementById(nuevos.nombre ? 'pedido-nombre' : 'pedido-telefono')?.focus(); return }
    enviando.current = true; setCargando(true); setError('')
    try {
      const p = await crearPedido({ items: items.map(i => ({ id: i.producto.id, cantidad: i.cantidad })), cliente: { nombre: datos.nombre.trim(), telefono: datos.telefono.replace(/\s/g, '') } })
      setPedido({ ...p, total })
      setPaso('listo')
      vaciar()
    } catch (err) {
      setError(err.message)
    } finally { enviando.current = false; setCargando(false) }
  }

  const igv = total - total / 1.18
  const claseInput = (err) => `min-h-12 w-full rounded-2xl border bg-superficie px-4 outline-none focus:ring-4 ${err ? 'border-error focus:ring-error/15' : 'border-borde focus:border-primario-oscuro focus:ring-primario/15'}`

  return (
    <Cajon abierto={abierto} onCerrar={cerrar} titulo="Carrito de compras">
      <div className="flex items-center justify-between p-6 pb-2">
        <h2 className="text-2xl font-semibold">{paso === 'datos' ? 'Tus datos' : 'Tu carrito'} {paso === 'carrito' && <span className="font-sans text-base font-normal text-gris">({cantidad})</span>}</h2>
        <BotonIcono tono="neutro" alinear="derecha" etiqueta="Cerrar carrito" atajo="Esc" onClick={cerrar}><X size={18} aria-hidden="true" /></BotonIcono>
      </div>

      {paso === 'listo' && pedido ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center" role="status">
          <Check />
          <h3 className="text-3xl font-semibold">Pedido recibido</h3>
          <p className="text-gris">Tu pedido <b className="text-tinta">{pedido.codigo}</b> estará listo para recoger en la clínica en 2 horas.</p>
          {!pedido.demo
            ? <Boton href={urlComprobante(pedido.codigo)} target="_blank" rel="noreferrer" variante="verde" className="mt-2"><FileText size={18} aria-hidden="true" />Descargar comprobante PDF</Boton>
            : <p className="rounded-2xl bg-fondo p-3 text-sm text-gris">Modo demostración: enciende el backend para generar el comprobante PDF.</p>}
          <Boton variante="fantasma" onClick={cerrar}>Seguir comprando</Boton>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-primario-claro text-acento"><ShoppingBag size={28} aria-hidden="true" /></span>
          <h3 className="text-xl font-semibold">Aquí verás lo que agregues</h3>
          <p className="max-w-xs text-gris">Arma tu pedido y recógelo listo en la clínica, sin hacer cola.</p>
          {quitado && <Deshacer item={quitado.item} onDeshacer={() => { restaurar(quitado.item, quitado.i); setQuitado(null) }} />}
          <Boton to="/tienda" variante="verde" onClick={cerrar}>Ir a la tienda</Boton>
        </div>
      ) : paso === 'carrito' ? (
        <>
          <ul className="flex-1 overflow-y-auto px-6">
            <AnimatePresence initial={false}>
              {items.map((item, i) => (
                <motion.li key={item.producto.id} layout="position" exit={{ opacity: 0, transition: { duration: 0.15 } }} className="flex gap-4 border-b border-borde py-4">
                  <Foto src={item.producto.imagen} alt="" ancho={80} alto={80} className="h-20 w-20 shrink-0 rounded-2xl" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{item.producto.nombre}</p>
                    <p className="text-sm text-gris tabular-nums">{soles(item.producto.precio)} c/u</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Cantidad compacto valor={item.cantidad} max={item.producto.stock} onCambiar={(n) => cambiar(item.producto.id, n)} nombre={item.producto.nombre} />
                      <b className="font-display tabular-nums">{soles(item.producto.precio * item.cantidad)}</b>
                    </div>
                  </div>
                  <BotonIcono tono="transparente" lado="arriba" alinear="derecha" etiqueta={`Quitar ${item.producto.nombre}`} onClick={() => quitarItem(item, i)}>
                    <Trash2 size={18} aria-hidden="true" />
                  </BotonIcono>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="px-6">{quitado && <Deshacer item={quitado.item} onDeshacer={() => { restaurar(quitado.item, quitado.i); setQuitado(null) }} />}</div>
          <Resumen total={total} igv={igv}>
            <Boton tamano="lg" ancho onClick={() => setPaso('datos')}>Continuar con mis datos</Boton>
          </Resumen>
        </>
      ) : (
        <form onSubmit={confirmar} noValidate className="flex flex-1 flex-col" aria-busy={cargando}>
          <div className="flex-1 space-y-4 overflow-y-auto px-6 pt-2">
            <p className="text-sm text-gris">Con estos datos te reconocemos al recoger tu pedido.</p>
            {[['nombre', 'Nombre y apellido', 'name', 'text'], ['telefono', 'Celular', 'tel-national', 'tel']].map(([c, etiqueta, ac, tipo]) => (
              <div key={c}>
                <label htmlFor={`pedido-${c}`} className="mb-2 block text-sm font-semibold">{etiqueta}</label>
                <input id={`pedido-${c}`} type={tipo} autoComplete={ac} inputMode={c === 'telefono' ? 'numeric' : undefined} placeholder={c === 'telefono' ? '987 654 321' : undefined}
                  value={datos[c]} aria-invalid={Boolean(errores[c])} aria-describedby={`pedido-${c}-error`}
                  onChange={e => { setDatos(d => ({ ...d, [c]: e.target.value })); if (errores[c]) setErrores(x => ({ ...x, [c]: '' })) }}
                  onBlur={() => setErrores(x => ({ ...x, [c]: validar(c, datos[c]) }))} className={claseInput(errores[c])} />
                {errores[c] && <p id={`pedido-${c}-error`} className="mt-1 text-sm text-error">{errores[c]}</p>}
              </div>
            ))}
            {error && <p role="alert" className="rounded-2xl bg-error-fondo p-3 text-sm text-error-texto">{error}</p>}
          </div>
          <Resumen total={total} igv={igv}>
            <Boton tamano="lg" ancho type="submit">{cargando ? 'Enviando pedido…' : `Confirmar pedido · ${soles(total)}`}</Boton>
            <Boton type="button" variante="fantasma" ancho className="mt-2" onClick={() => setPaso('carrito')}>Volver al carrito</Boton>
          </Resumen>
        </form>
      )}
    </Cajon>
  )
}

function Resumen({ total, igv, children }) {
  return (
    <div className="border-t border-borde p-6">
      <dl className="space-y-1 text-sm text-gris">
        <div className="flex justify-between"><dt>Op. gravada</dt><dd className="tabular-nums">{soles(total - igv)}</dd></div>
        <div className="flex justify-between"><dt>IGV (18 %)</dt><dd className="tabular-nums">{soles(igv)}</dd></div>
        <div className="flex justify-between"><dt>Recojo en clínica</dt><dd>Gratis</dd></div>
      </dl>
      <p className="my-4 flex justify-between font-display text-2xl font-semibold"><span>Total</span><span className="tabular-nums">{soles(total)}</span></p>
      {children}
    </div>
  )
}

function Deshacer({ item, onDeshacer }) {
  return (
    <p role="status" className="my-3 flex items-center justify-between gap-3 rounded-2xl bg-fondo px-4 py-1 text-sm">
      <span className="truncate">Quitaste «{item.producto.nombre}».</span>
      <button onClick={onDeshacer} className="min-h-11 shrink-0 font-semibold text-acento underline">Deshacer</button>
    </p>
  )
}
