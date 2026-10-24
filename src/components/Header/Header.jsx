import './Header.css'
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, ShoppingBag, X } from 'lucide-react'
import Logo from '../../ui/Logo.jsx'
import Boton from '../../ui/Boton.jsx'
import BotonIcono from '../../ui/BotonIcono.jsx'
import BotonTema from '../../ui/BotonTema.jsx'
import { useCarrito } from '../../context/Carrito.jsx'

const ENLACES = [
  { to: '/', texto: 'Inicio' },
  { to: '/servicios', texto: 'Servicios' },
  { to: '/tienda', texto: 'Tienda' },
  { to: '/contacto', texto: 'Contacto' },
]

export default function Header() {
  const [menu, setMenu] = useState(false)          // menú hamburguesa
  const [conFondo, setConFondo] = useState(false)  // fondo al bajar
  const { cantidad, setAbierto, pulso } = useCarrito()
  const { pathname } = useLocation()

  useEffect(() => setMenu(false), [pathname])
  useEffect(() => {
    const onScroll = () => setConFondo(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    // Al bajar, la barra se despega del borde y queda flotando con desenfoque (en el celular solo toma fondo)
    <header className="sticky top-0 z-40 w-full md:px-4">
      <div className={`mx-auto flex h-18 max-w-7xl items-center justify-between border-b px-4 transition-[margin,max-width,height,padding,background-color,box-shadow,border-color,border-radius] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:px-8
        ${conFondo || menu ? 'border-borde bg-superficie/85 shadow-suave backdrop-blur-xl md:mt-3 md:h-16 md:max-w-6xl md:rounded-full md:border md:px-4 md:shadow-flotante' : 'border-transparent'}`}>
        <Logo destino />
        <nav aria-label="Principal" className="hidden items-center gap-1 rounded-full bg-superficie p-1 shadow-suave ring-1 ring-borde md:flex">
          {ENLACES.map(e => (
            <NavLink key={e.to} to={e.to} end className="relative flex min-h-11 items-center rounded-full px-4 text-sm font-semibold">
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="nav-activo" className="absolute inset-0 rounded-full bg-tinta" transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }} />}
                  <span className={`relative ${isActive ? 'text-fondo' : 'text-gris hover:text-tinta'}`}>{e.texto}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <BotonTema />
          <span className="relative">
            <BotonIcono etiqueta={`Abrir carrito (${cantidad})`} alinear="derecha" onClick={() => setAbierto(true)}>
              <ShoppingBag size={20} aria-hidden="true" />
            </BotonIcono>
            <AnimatePresence>
              {cantidad > 0 && (
                <motion.span key={pulso} aria-hidden="true"
                  initial={{ transform: 'scale(0.6)', opacity: 0 }} animate={{ transform: 'scale(1)', opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.35, bounce: 0.4 }}
                  className="pointer-events-none absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-secundario px-1.5 text-xs font-bold text-noche ring-2 ring-superficie">
                  {cantidad}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <span className="hidden md:block"><Boton to="/reservar" tamano="sm">Reservar cita</Boton></span>
          <span className="md:hidden">
            <BotonIcono tono="transparente" alinear="derecha" etiqueta={menu ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menu} aria-controls="menu-movil" onClick={() => setMenu(!menu)}>
              {menu ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </BotonIcono>
          </span>
        </div>
      </div>
      <AnimatePresence>
        {menu && (
          <motion.nav id="menu-movil" aria-label="Menú móvil"
            initial={{ opacity: 0, transform: 'translateY(-8px)' }} animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="border-t border-borde bg-superficie px-4 pb-6 pt-2 md:hidden">
            {[...ENLACES, { to: '/reservar', texto: 'Reservar cita' }].map(e => (
              <NavLink key={e.to} to={e.to} end className={({ isActive }) => `flex min-h-14 items-center border-b border-borde px-2 font-display text-2xl font-semibold ${isActive ? 'text-acento' : 'text-tinta'}`}>
                {e.texto}
              </NavLink>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
