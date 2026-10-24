export const soles = (n) => `S/ ${Number(n).toFixed(2)}`

export const aISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
export const hoyISO = () => aISO(new Date())
export const esDomingo = (iso) => new Date(`${iso}T12:00:00`).getDay() === 0
export const fechaLarga = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })

export const duracion = (min) => (min >= 1440 ? '24 h' : min >= 60 ? `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''}` : `${min} min`)

export const leerLocal = (clave, defecto = null) => {
  try { const v = localStorage.getItem(clave); return v === null ? defecto : JSON.parse(v) } catch { return defecto }
}
export const guardarLocal = (clave, valor) => { try { localStorage.setItem(clave, JSON.stringify(valor)) } catch { /* sin almacenamiento */ } }
export const borrarLocal = (clave) => { try { localStorage.removeItem(clave) } catch { /* sin almacenamiento */ } }
