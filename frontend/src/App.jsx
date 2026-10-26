import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
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

// Al recargar, la página vuelve a la posición en la que estabas (guardada por pestaña y por ruta)
const CLAVE_SCROLL = 'huellitavet:scroll:'
let ultimaRuta = null
const leerScroll = ruta => { try { return Number(sessionStorage.getItem(CLAVE_SCROLL + ruta)) || 0 } catch { return 0 } }
const guardarScroll = ruta => { try { sessionStorage.setItem(CLAVE_SCROLL + ruta, String(window.scrollY)) } catch {} }

// Espera a que la página cargue su contenido (datos y fotos) y la lleva a la posición guardada
function restaurarScroll(y) {
  let intentos = 0
  const paso = () => {
    const alto = document.documentElement.scrollHeight - window.innerHeight
    if (alto >= y || intentos > 180) { window.scrollTo(0, Math.min(y, Math.max(alto, 0))); return }
    intentos++
    requestAnimationFrame(paso)
  }
  requestAnimationFrame(paso)
}

const TITULOS = { '/': 'Veterinaria para todas las especies', '/servicios': 'Servicios', '/tienda': 'Tienda', '/reservar': 'Reservar cita', '/contacto': 'Contacto' }

function Paginas() {
  const location = useLocation()
  useEffect(() => {
    if (ultimaRuta === location.pathname) return // StrictMode vuelve a ejecutar el efecto al montar
    if (ultimaRuta === null) {
      history.scrollRestoration = 'manual'
      restaurarScroll(leerScroll(location.pathname))
    } else {
      window.scrollTo(0, 0)
    }
    ultimaRuta = location.pathname
    document.title = `HuellitaVet · ${TITULOS[location.pathname] ?? 'Página no encontrada'}`
  }, [location.pathname])

  // Guarda la posición mientras se baja (con una sola escritura por cuadro) y al salir de la página
  useEffect(() => {
    const ruta = location.pathname
    let pendiente = false
    const alMover = () => {
      if (pendiente) return
      pendiente = true
      requestAnimationFrame(() => { pendiente = false; guardarScroll(ruta) })
    }
    window.addEventListener('scroll', alMover, { passive: true })
    window.addEventListener('pagehide', () => guardarScroll(ruta))
    return () => { window.removeEventListener('scroll', alMover); guardarScroll(ruta) }
  }, [location.pathname])
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
