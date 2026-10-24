export const CLINICA = {
  // Dirección única de toda la web: la sede central de SENATI
  calle: 'Av. Alfredo Mendiola 3520, Independencia',
  direccionLima: 'Av. Alfredo Mendiola 3520, Independencia, Lima',
  direccion: 'Av. Alfredo Mendiola 3520, Independencia, Lima (sede central de SENATI)',
  telefono: '(01) 555-1234',
  telefonoLink: 'tel:015551234',
  mapa: 'https://www.google.com/maps?q=SENATI+Sede+Central,+Av.+Alfredo+Mendiola+3520,+Independencia,+Lima',
}

// dias: getDay() que cubre cada fila (0 = domingo)
export const HORARIO = [
  { dias: [1, 2, 3, 4, 5], nombre: 'Lunes a viernes', horas: '9:00 a 19:00' },
  { dias: [6], nombre: 'Sábado', horas: '9:00 a 19:00' },
  { dias: [0], nombre: 'Domingo', horas: 'Solo emergencias' },
]

const ahoraEnLima = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }))

export const diaEnLima = () => ahoraEnLima().getDay()

export function estadoClinica() {
  const lima = ahoraEnLima()
  const dia = lima.getDay()
  const minutos = lima.getHours() * 60 + lima.getMinutes()
  const abierto = dia !== 0 && minutos >= 540 && minutos < 1140
  return abierto ? { abierto, texto: 'Abierto ahora, cerramos a las 19:00' } : { abierto, texto: dia === 6 && minutos >= 1140 || dia === 0 ? 'Cerrado: abrimos el lunes a las 9:00. Emergencias 24 h' : 'Cerrado: abrimos a las 9:00. Emergencias 24 h' }
}
