import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import Header from './components/Header/Header.jsx'
import Footer from './components/Footer/Footer.jsx'
import PanelCarrito from './components/PanelCarrito/PanelCarrito.jsx'
import AvisoDemo from './ui/AvisoDemo.jsx'
import IntroLogo from './components/IntroLogo/IntroLogo.jsx'
import Ambiente from './ui/Ambiente.jsx'
import { CarritoProvider } from './context/Carrito.jsx'
import { AvisosProvider } from './context/Avisos.jsx'
import './App.css'
import Inicio from './components/Inicio/Inicio.jsx'

const Servicios = lazy(() => import('./components/Servicios/Servicios.jsx'))
const Tienda = lazy(() => import('./components/Tienda/Tienda.jsx'))
const Reservar = lazy(() => import('./components/Reservar/Reservar.jsx'))
const Contacto = lazy(() => import('./components/Contacto/Contacto.jsx'))
const NoEncontrada = lazy(() => import('./components/NoEncontrada/NoEncontrada.jsx'))

// Al recargar la página (F5, botón del navegador o Ctrl+R) siempre se vuelve al inicio.
// Solo cuenta la recarga: entrar por un enlace o escribir una dirección abre la página pedida.
const recargada = performance.getEntriesByType('navigation')[0]?.type === 'reload'
let primeraCarga = true

const TITULOS = { '/': 'Veterinaria para todas las especies', '/servicios': 'Servicios', '/tienda': 'Tienda', '/reservar': 'Reservar cita', '/contacto': 'Contacto' }

function Paginas() {
  const location = useLocation()
  const navegar = useNavigate()
  useEffect(() => {
    if (primeraCarga) {
      primeraCarga = false
      history.scrollRestoration = 'manual'
      if (recargada && location.pathname !== '/') { navegar('/', { replace: true }); return }
    }
    window.scrollTo(0, 0)
    document.title = `HuellitaVet · ${TITULOS[location.pathname] ?? 'Página no encontrada'}`
  }, [location.pathname, navegar])
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main key={location.pathname} id="contenido" tabIndex={-1} className="outline-none"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
        <Suspense fallback={<div className="min-h-[70vh]" />}>
        <Routes location={location}>
          <Route path="/" element={<Inicio />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/reservar" element={<Reservar />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
        </Suspense>
      </motion.main>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AvisosProvider>
        <CarritoProvider>
          <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-tinta focus:px-4 focus:py-3 focus:text-fondo">Saltar al contenido</a>
          <AvisoDemo />
          <Header />
          <Paginas />
          <Footer />
          <PanelCarrito />
          <IntroLogo />
          <Ambiente />
        </CarritoProvider>
      </AvisosProvider>
    </MotionConfig>
  )
}
