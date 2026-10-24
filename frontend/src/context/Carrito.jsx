import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { guardarLocal, leerLocal } from '../lib/formato.js'

const Ctx = createContext(null)
const CLAVE = 'huellitavet-carrito-v3'

export function CarritoProvider({ children }) {
  const [items, setItems] = useState(() => {
    const g = leerLocal(CLAVE, [])
    return Array.isArray(g) ? g.filter(i => i?.producto?.id && i.cantidad > 0) : []
  })
  const [abierto, setAbierto] = useState(false)
  const [pulso, setPulso] = useState(0)

  useEffect(() => guardarLocal(CLAVE, items), [items])

  const agregar = useCallback((producto, cantidad = 1) => {
    setItems(prev => {
      const existe = prev.find(i => i.producto.id === producto.id)
      if (existe) return prev.map(i => i.producto.id === producto.id ? { ...i, cantidad: Math.min(i.cantidad + cantidad, producto.stock) } : i)
      return [...prev, { producto, cantidad: Math.min(cantidad, producto.stock) }]
    })
    setPulso(p => p + 1)
  }, [])
  const cambiar = useCallback((id, cantidad) =>
    setItems(prev => prev.map(i => i.producto.id === id ? { ...i, cantidad: Math.max(1, Math.min(cantidad, i.producto.stock)) } : i)), [])
  const quitar = useCallback((id) => setItems(prev => prev.filter(i => i.producto.id !== id)), [])
  const restaurar = useCallback((item, indice) => setItems(prev => { const c = [...prev]; c.splice(indice, 0, item); return c }), [])
  const vaciar = useCallback(() => setItems([]), [])

  const valor = useMemo(() => ({
    items, agregar, cambiar, quitar, restaurar, vaciar, abierto, setAbierto, pulso,
    cantidad: items.reduce((s, i) => s + i.cantidad, 0),
    total: items.reduce((s, i) => s + i.cantidad * i.producto.precio, 0),
  }), [items, agregar, cambiar, quitar, restaurar, vaciar, abierto, pulso])

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export const useCarrito = () => useContext(Ctx)
