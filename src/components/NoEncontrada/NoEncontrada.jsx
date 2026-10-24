import './NoEncontrada.css'
import Boton from '../../ui/Boton.jsx'
import Foto from '../../ui/Foto.jsx'
import { IMAGEN_CTA } from '../../lib/escenas.js'

export default function NoEncontrada() {
  return (
    <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8">
      <Foto src={IMAGEN_CTA.gato} alt="Gato negro asomado desde su casita" ancho={520} alto={520} className="aspect-square w-full rounded-[40px]" />
      <div>
        <h1 className="text-5xl font-bold">No encontramos esta página</h1>
        <p className="mt-4 text-lg text-gris">Puede que el enlace haya cambiado. Vuelve al inicio o reserva tu cita directamente.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Boton to="/" variante="verde">Volver al inicio</Boton><Boton to="/reservar" variante="contorno">Reservar cita</Boton></div>
      </div>
    </div>
  )
}
