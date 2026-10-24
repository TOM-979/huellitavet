import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App.jsx'
import AtrapaErrores from './ui/AtrapaErrores.jsx'
import './index.css'

// VITE_HASH=1 usa rutas con # (para abrir la vista previa con doble clic, sin servidor)
const Router = import.meta.env.VITE_HASH === '1' ? HashRouter : BrowserRouter

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AtrapaErrores>
      <Router>
        <App />
      </Router>
    </AtrapaErrores>
  </StrictMode>
)
