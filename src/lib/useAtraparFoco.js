import { useEffect } from 'react'

const ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Mantiene el foco dentro de un panel abierto, cierra con Escape
// y devuelve el foco al elemento que lo abrió.
export function useAtraparFoco(ref, abierto, onCerrar) {
  useEffect(() => {
    if (!abierto) return
    const anterior = document.activeElement
    const cuadro = requestAnimationFrame(() => {
      const panel = ref.current
      if (!panel) return
      ;(panel.querySelector('[data-autofoco]') ?? panel.querySelector(ENFOCABLES) ?? panel).focus({ preventScroll: true })
    })
    const onKey = (e) => {
      const panel = ref.current
      if (!panel) return
      if (e.key === 'Escape') { e.preventDefault(); onCerrar(); return }
      if (e.key !== 'Tab') return
      const items = [...panel.querySelectorAll(ENFOCABLES)].filter(el => el.offsetParent !== null)
      if (!items.length) { e.preventDefault(); return }
      const [inicio, fin] = [items[0], items[items.length - 1]]
      if (e.shiftKey && document.activeElement === inicio) { e.preventDefault(); fin.focus() }
      else if (!e.shiftKey && document.activeElement === fin) { e.preventDefault(); inicio.focus() }
    }
    document.addEventListener('keydown', onKey)
    const ancho = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${ancho}px`
    return () => {
      cancelAnimationFrame(cuadro)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      if (anterior && document.contains(anterior)) anterior.focus({ preventScroll: true })
    }
  }, [ref, abierto, onCerrar])
}
