import { useEffect, useState } from 'react'

// Carga datos de la API. El esqueleto solo aparece si la espera supera 120 ms (evita parpadeos).
export function useApi(cargar, deps = []) {
  const [estado, setEstado] = useState({ datos: null, error: null, cargando: true, mostrarCarga: false })
  useEffect(() => {
    let activo = true
    setEstado(e => ({ ...e, cargando: true, error: null }))
    const t = setTimeout(() => activo && setEstado(e => ({ ...e, mostrarCarga: true })), 120)
    cargar()
      .then(datos => activo && setEstado({ datos, error: null, cargando: false, mostrarCarga: false }))
      .catch(error => activo && setEstado(e => ({ ...e, error: error.message, cargando: false, mostrarCarga: false })))
      .finally(() => clearTimeout(t))
    return () => { activo = false; clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return estado
}
