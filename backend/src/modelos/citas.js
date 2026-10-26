import { consultar, uno, transaccion } from '../db/conexion.js'

export const HORARIOS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','15:00','15:30','16:00','16:30','17:00','17:30','18:00']

const ESPECIALISTA = { aves: 3, exoticos: 3, cirugia: 2, ecografia: 4, 'rayos-x': 4, grooming: 4 }

const esDomingo = (fecha) => new Date(`${fecha}T12:00:00`).getDay() === 0

export async function disponibilidad(fecha) {
  if (esDomingo(fecha)) return []
  const vets = (await consultar('SELECT id FROM veterinarios')).map(v => v.id)
  const ocupadas = await consultar("SELECT hora, veterinario_id FROM citas WHERE fecha = $1 AND estado <> 'Cancelada'", [fecha])
  const hoy = new Date()
  const esHoy = fecha === new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  const ahora = `${String(hoy.getHours()).padStart(2,'0')}:${String(hoy.getMinutes()).padStart(2,'0')}`
  return HORARIOS.map(hora => {
    const libres = vets.filter(v => !ocupadas.some(o => o.hora === hora && o.veterinario_id === v))
    return { hora, disponible: libres.length > 0 && !(esHoy && hora <= ahora), libres: libres.length }
  })
}

export async function crearCita({ nombre, telefono, correo, mascota, especie, servicioId, fecha, hora, notas }) {
  return transaccion(async (cx) => {
    const servicio = await uno('SELECT id, slug, nombre, precio, desde FROM servicios WHERE id = $1', [servicioId], cx)
    if (!servicio) throw conEstado(400, 'Ese servicio ya no está disponible. Elige otro de la lista.')
    const esp = await uno('SELECT id, nombre FROM especies WHERE slug = $1', [especie], cx)
    if (!esp) throw conEstado(400, 'Elige una especie de la lista.')
    const atiende = await uno('SELECT 1 FROM servicio_especies WHERE servicio_id = $1 AND especie_id = $2', [servicio.id, esp.id], cx)
    if (!atiende) throw conEstado(400, `El servicio «${servicio.nombre}» no está disponible para ${esp.nombre.toLowerCase()}. Elige otro servicio.`)

    const slot = (await disponibilidad(fecha)).find(h => h.hora === hora)
    if (!slot?.disponible) throw conEstado(409, 'Ese horario se acaba de ocupar. Elige otro de la lista para confirmar tu cita.')

    const libres = await consultar(`
      SELECT v.id, v.nombre,
        (SELECT COUNT(*) FROM citas c WHERE c.veterinario_id = v.id AND c.fecha = $1 AND c.estado <> 'Cancelada') AS carga
      FROM veterinarios v
      WHERE v.id NOT IN (SELECT veterinario_id FROM citas WHERE fecha = $1 AND hora = $2 AND estado <> 'Cancelada')
      ORDER BY (v.id = $3) DESC, carga ASC, v.id ASC`, [fecha, hora, ESPECIALISTA[servicio.slug] ?? 0], cx)
    const vet = libres[0]

    await cx.query(`INSERT INTO clientes (nombre, telefono, correo) VALUES ($1,$2,$3)
      ON CONFLICT(telefono) DO UPDATE SET nombre = EXCLUDED.nombre, correo = COALESCE(EXCLUDED.correo, clientes.correo)`,
      [nombre, telefono, correo || null])
    const cliente = await uno('SELECT id FROM clientes WHERE telefono = $1', [telefono], cx)

    const { rows } = await cx.query(`INSERT INTO citas (codigo, cliente_id, mascota, especie_id, servicio_id, veterinario_id, fecha, hora, notas, estado)
      VALUES ('TEMP',$1,$2,$3,$4,$5,$6,$7,$8,'Confirmada') RETURNING id`,
      [cliente.id, mascota, esp.id, servicio.id, vet.id, fecha, hora, notas || null])
    const id = rows[0].id
    const codigo = `HV-${String(id).padStart(5,'0')}`
    await cx.query('UPDATE citas SET codigo = $1 WHERE id = $2', [codigo, id])
    return obtenerCita(codigo, cx)
  })
}

export const obtenerCita = (codigo, cx) => uno(`
  SELECT c.codigo, c.mascota, c.fecha, c.hora, c.notas, c.estado, c.creado_en,
         e.nombre AS especie, s.nombre AS servicio, s.precio, s.desde, v.nombre AS veterinario, v.imagen AS veterinario_imagen,
         cl.nombre AS cliente
  FROM citas c
  JOIN especies e ON e.id = c.especie_id
  JOIN servicios s ON s.id = c.servicio_id
  JOIN veterinarios v ON v.id = c.veterinario_id
  JOIN clientes cl ON cl.id = c.cliente_id
  WHERE c.codigo = $1`, [codigo], cx)

export const listarCitas = ({ fecha } = {}) => consultar(`
  SELECT c.codigo, c.fecha, c.hora, c.mascota, c.estado, e.nombre AS especie, s.nombre AS servicio, v.nombre AS veterinario
  FROM citas c JOIN especies e ON e.id = c.especie_id JOIN servicios s ON s.id = c.servicio_id JOIN veterinarios v ON v.id = c.veterinario_id
  ${fecha ? 'WHERE c.fecha = $1' : ''} ORDER BY c.fecha, c.hora`, fecha ? [fecha] : [])

export function conEstado(status, mensaje) {
  const e = new Error(mensaje)
  e.status = status
  return e
}