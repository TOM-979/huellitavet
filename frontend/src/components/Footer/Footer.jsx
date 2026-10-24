import './Footer.css'
import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, CalendarCheck, Clock, Mail, MapPin, Phone } from 'lucide-react'
import Logo from '../../ui/Logo.jsx'
import { CLINICA } from '../../lib/clinica.js'
import Boton from '../../ui/Boton.jsx'
import { Aparecer } from '../../ui/Movimiento.jsx'

const COLUMNAS = [
  ['Clínica', [['/servicios', 'Servicios'], ['/reservar', 'Reservar cita'], ['/contacto', 'Preguntas frecuentes']]],
  ['Tienda', [['/tienda?categoria=alimento', 'Alimento'], ['/tienda?categoria=salud', 'Salud y farmacia'], ['/tienda?categoria=jaulas', 'Jaulas y hábitats']]],
]

export default function Footer() {
  const enInicio = useLocation().pathname === '/'
  return (
    <footer className="pie mt-28 text-[#D5E4E7] md:mt-36">
      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
        {!enInicio && <Aparecer className="flex flex-col gap-6 border-b border-white/10 py-14 md:flex-row md:items-end md:justify-between md:py-16">
          <div>
            <p className="font-display text-4xl font-semibold text-white md:text-5xl">Tu mascota en buenas manos</p>
            <p className="mt-3 max-w-md text-[#C9DADF]">Reserva en línea o llámanos: siempre hay un veterinario de turno.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Boton to="/reservar" tamano="lg"><CalendarCheck size={20} aria-hidden="true" />Reservar cita</Boton>
            <Boton href={CLINICA.telefonoLink} tamano="lg" variante="claro"><Phone size={18} aria-hidden="true" />{CLINICA.telefono}</Boton>
          </div>
        </Aparecer>}

        <div className="grid gap-10 py-14 md:grid-cols-[1.6fr_1fr_1fr_1.4fr]">
          <div>
            <Logo claro />
            <p className="mt-4 max-w-xs text-sm">Medicina veterinaria para perros, gatos, aves, cuyes, conejos, reptiles y peces, en el corazón de Independencia.</p>
          </div>
          {COLUMNAS.map(([titulo, enlaces]) => (
            <div key={titulo}>
              <h2 className="font-sans text-sm font-semibold text-white">{titulo}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {enlaces.map(([to, texto]) => (
                  <li key={to}><Link className="pie-enlace" to={to}>{texto}<ArrowUpRight size={14} aria-hidden="true" /></Link></li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h2 className="font-sans text-sm font-semibold text-white">Visítanos</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" /><a className="hover:text-white hover:underline" href={CLINICA.mapa} target="_blank" rel="noreferrer"><span className="block font-semibold text-white">Sede central de SENATI</span>{CLINICA.direccionLima}</a></li>
              <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0" aria-hidden="true" /><a className="hover:text-white hover:underline" href="tel:015551234">(01) 555-1234</a></li>
              <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0" aria-hidden="true" /><a className="hover:text-white hover:underline" href="mailto:hola@huellitavet.pe">hola@huellitavet.pe</a></li>
              <li className="flex gap-2"><Clock size={16} className="mt-0.5 shrink-0" aria-hidden="true" />Lun a sáb, 9:00 a 19:00. Emergencias 24 h</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pie-gigante-marco relative z-10" aria-hidden="true"
        onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--gx', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--gy', `${e.clientY - r.top}px`) }}>
        <p className="pie-gigante">HuellitaVet</p>
        <p className="pie-gigante pie-gigante-luz">HuellitaVet</p>
      </div>

      <div className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-[#A9C0C6] md:px-8">
          <p>© 2026 HuellitaVet · Proyecto Integrador SENATI · Sede central: {CLINICA.direccionLima}</p>
        </div>
      </div>
    </footer>
  )
}
