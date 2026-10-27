// Datos iniciales (seed) de HuellitaVet.
// Las imágenes son fotos reales de Unsplash (ver imagenes.js con los créditos).
import { img } from './imagenes.js'

export const especies = [
  { slug: 'perro', nombre: 'Perros', grupo: 'Mamíferos', descripcion: 'Chequeos, vacunas, cirugía y grooming para todas las razas y edades.', imagen: img('esp-perro') },
  { slug: 'gato', nombre: 'Gatos', grupo: 'Mamíferos', descripcion: 'Consultorio cat-friendly, sin ladridos y con manejo de bajo estrés.', imagen: img('esp-gato') },
  { slug: 'loro', nombre: 'Loros y guacamayos', grupo: 'Aves', descripcion: 'Medicina aviar, nutrición, corte de pico y uñas para aves grandes.', imagen: img('esp-loro') },
  { slug: 'periquito', nombre: 'Periquitos y canarios', grupo: 'Aves', descripcion: 'Revisión de plumaje, parásitos y alimentación para aves pequeñas.', imagen: img('esp-periquito') },
  { slug: 'cuy', nombre: 'Cuyes', grupo: 'Exóticos', descripcion: 'Control dental, vitamina C y manejo especializado del cuy.', imagen: img('esp-cuy') },
  { slug: 'conejo', nombre: 'Conejos', grupo: 'Exóticos', descripcion: 'Esterilización, dientes y digestión: los puntos clave del conejo.', imagen: img('esp-conejo') },
  { slug: 'hamster', nombre: 'Hámsters y roedores', grupo: 'Exóticos', descripcion: 'Hámsters, jerbos y ratas con instrumental de tamaño adecuado.', imagen: img('esp-hamster') },
  { slug: 'huron', nombre: 'Hurones', grupo: 'Exóticos', descripcion: 'Vacunas, control hormonal y chequeos para hurones.', imagen: img('esp-huron') },
  { slug: 'tortuga', nombre: 'Tortugas', grupo: 'Exóticos', descripcion: 'Caparazón, luz UVB y alimentación para tortugas de agua y tierra.', imagen: img('esp-tortuga') },
  { slug: 'reptil', nombre: 'Reptiles', grupo: 'Exóticos', descripcion: 'Iguanas, geckos y dragones barbudos: hábitat y temperatura correctos.', imagen: img('esp-reptil') },
  { slug: 'pez', nombre: 'Peces', grupo: 'Acuáticos', descripcion: 'Calidad del agua, enfermedades comunes y asesoría para tu acuario.', imagen: img('esp-pez') },
]

export const categorias = [
  { slug: 'alimento', nombre: 'Alimento', icono: 'bowl' },
  { slug: 'snacks', nombre: 'Snacks y premios', icono: 'bone' },
  { slug: 'juguetes', nombre: 'Juguetes', icono: 'ball' },
  { slug: 'camas', nombre: 'Camas y descanso', icono: 'bed' },
  { slug: 'paseo', nombre: 'Paseo y transporte', icono: 'leash' },
  { slug: 'higiene', nombre: 'Higiene y grooming', icono: 'drop' },
  { slug: 'salud', nombre: 'Salud y farmacia', icono: 'cross' },
  { slug: 'jaulas', nombre: 'Jaulas y hábitats', icono: 'cage' },
  { slug: 'acuarismo', nombre: 'Acuarismo', icono: 'fish' },
  { slug: 'terrarios', nombre: 'Terrarios', icono: 'leaf' },
  { slug: 'accesorios', nombre: 'Accesorios', icono: 'tag' },
  { slug: 'ropa', nombre: 'Ropa', icono: 'shirt' },
]

const p = (sku, nombre, categoria, precio, stock, rating, resenas, imagen, especies, descripcion, destacado = 0) =>
  ({ sku, nombre, categoria, precio, stock, rating, resenas, imagen: img(imagen), especies, descripcion, destacado })

export const productos = [
  p('ALI-001', 'Alimento Premium Adulto 15 kg', 'alimento', 189.9, 14, 4.8, 128, 'alimento-perro', ['perro'], 'Croquetas con pollo y arroz, omega 3 y 6 para un pelaje brillante. Para razas medianas y grandes.', 1),
  p('ALI-002', 'Alimento Cachorro Razas Pequeñas 7 kg', 'alimento', 98.5, 20, 4.7, 64, 'alimento-cachorro', ['perro'], 'Fórmula con DHA para el desarrollo cerebral y calcio para huesos fuertes.'),
  p('ALI-003', 'Alimento Gato Adulto Salmón 3 kg', 'alimento', 74.5, 25, 4.9, 96, 'alimento-gato', ['gato'], 'Con salmón real y control de bolas de pelo. Cuida la salud urinaria.', 1),
  p('ALI-004', 'Alimento Gato Esterilizado 7 kg', 'alimento', 132.0, 12, 4.8, 51, 'alimento-gato-esterilizado', ['gato'], 'Menos grasa y más fibra para gatos esterilizados. Mantiene el peso ideal.'),
  p('ALI-005', 'Mezcla de semillas para loros 2 kg', 'alimento', 39.9, 30, 4.7, 42, 'semillas-ave', ['loro'], 'Girasol, maíz, cártamo y frutas deshidratadas. Sin colorantes.', 1),
  p('ALI-006', 'Alpiste y mijo para periquitos 1 kg', 'alimento', 18.9, 40, 4.6, 73, 'alpiste-periquito', ['periquito'], 'Mezcla balanceada para periquitos, canarios y aves pequeñas.'),
  p('ALI-007', 'Pellets para cuy con vitamina C 2 kg', 'alimento', 29.9, 35, 4.8, 88, 'alimento-cuy', ['cuy'], 'El cuy no produce vitamina C: este pellet la aporta en cada porción.', 1),
  p('ALI-008', 'Heno de timothy premium 1 kg', 'alimento', 24.9, 50, 4.9, 120, 'heno', ['conejo', 'cuy'], 'Fibra larga que desgasta los dientes y mantiene sana la digestión.'),
  p('ALI-009', 'Mezcla para hámster con frutas 800 g', 'alimento', 16.5, 45, 4.5, 37, 'alimento-hamster', ['hamster'], 'Semillas, cereales y trozos de fruta. Fomenta el forrajeo natural.'),
  p('ALI-010', 'Escamas tropicales para peces 100 g', 'alimento', 21.9, 60, 4.7, 58, 'alimento-pez', ['pez'], 'Alimento completo que realza los colores y no enturbia el agua.'),
  p('ALI-011', 'Pellets flotantes para tortuga 250 g', 'alimento', 19.9, 30, 4.6, 29, 'alimento-tortuga', ['tortuga'], 'Con calcio y vitamina D3 para un caparazón fuerte.'),
  p('ALI-012', 'Alimento para hurón 2 kg', 'alimento', 89.9, 10, 4.7, 18, 'huron', ['huron'], 'Alto en proteína animal, como necesita un carnívoro estricto.'),
  p('SNK-001', 'Premios dentales para perro x28', 'snacks', 45.9, 25, 4.8, 102, 'snack-perro', ['perro'], 'Reducen el sarro y refrescan el aliento. Uno al día.'),
  p('SNK-002', 'Snack cremoso para gato x12', 'snacks', 27.9, 40, 4.9, 140, 'snack-gato', ['gato'], 'Premio líquido de atún para dar de la mano. Ideal para medicar.', 1),
  p('SNK-003', 'Barritas de frutas para aves', 'snacks', 15.9, 35, 4.6, 33, 'snack-ave', ['loro', 'periquito'], 'Barritas con miel y frutas para colgar en la jaula.'),
  p('SNK-004', 'Snacks de zanahoria para roedores', 'snacks', 12.9, 45, 4.7, 47, 'snack-roedor', ['conejo', 'cuy', 'hamster'], 'Bastones horneados de zanahoria y alfalfa, sin azúcar.'),
  p('JUG-001', 'Pelota indestructible con sonido', 'juguetes', 29.9, 35, 4.7, 54, 'juguete-perro', ['perro'], 'Caucho natural resistente a mordidas fuertes. Flota en el agua.', 1),
  p('JUG-002', 'Varita con plumas y cascabel', 'juguetes', 18.9, 30, 4.6, 47, 'juguete-gato', ['gato'], 'Estimula el instinto de caza y el ejercicio diario.'),
  p('JUG-003', 'Columpio de madera natural para aves', 'juguetes', 34.9, 18, 4.8, 26, 'juguete-ave', ['loro', 'periquito'], 'Madera sin tratar y cuentas de colores. Fácil de colgar.'),
  p('JUG-004', 'Rueda silenciosa para hámster 21 cm', 'juguetes', 39.9, 15, 4.8, 61, 'rueda-hamster', ['hamster'], 'Superficie cerrada que protege las patitas. Sin chirridos.'),
  p('JUG-005', 'Túnel de juego para conejos y cuyes', 'juguetes', 32.9, 16, 4.7, 22, 'conejo', ['conejo', 'cuy', 'huron'], 'Túnel plegable de tela para esconderse y explorar.'),
  p('CAM-001', 'Cama ortopédica mediana', 'camas', 119.0, 8, 4.8, 72, 'cama-perro', ['perro'], 'Espuma viscoelástica que alivia las articulaciones. Funda lavable.', 1),
  p('CAM-002', 'Cama iglú térmica para gato', 'camas', 89.0, 9, 4.9, 35, 'cama-gato', ['gato'], 'Forma de cueva que conserva el calor. Ideal para gatos friolentos.'),
  p('CAM-003', 'Rascador torre 120 cm', 'camas', 229.0, 5, 4.9, 44, 'rascador', ['gato'], 'Tres niveles, cueva y postes de sisal natural.', 1),
  p('PAS-001', 'Correa retráctil 5 m', 'paseo', 54.9, 14, 4.7, 66, 'correa', ['perro'], 'Freno con un solo botón y mango ergonómico. Hasta 25 kg.'),
  p('PAS-002', 'Arnés antitirones acolchado', 'paseo', 69.9, 18, 4.8, 81, 'arnes', ['perro'], 'Reparte la presión en el pecho. Bandas reflectivas para la noche.'),
  p('PAS-003', 'Transportadora ventilada mediana', 'paseo', 139.0, 7, 4.7, 39, 'transportadora', ['gato', 'perro', 'conejo', 'huron'], 'Apta para viajes en avión. Puerta metálica con seguro.'),
  p('HIG-001', 'Shampoo hipoalergénico con avena', 'higiene', 34.9, 30, 4.7, 59, 'shampoo', ['perro', 'gato'], 'Para pieles sensibles, sin parabenos ni colorantes.'),
  p('HIG-002', 'Cepillo deslanador doble cara', 'higiene', 42.9, 22, 4.8, 57, 'cepillo', ['perro', 'gato', 'conejo'], 'Retira el pelo muerto y reduce la caída en casa.'),
  p('HIG-003', 'Arena aglomerante sin olor 10 kg', 'higiene', 42.9, 22, 4.6, 41, 'arena', ['gato'], 'Bentonita con control de olores. Bloques compactos fáciles de retirar.'),
  p('HIG-004', 'Viruta de papel para roedores 30 L', 'higiene', 36.9, 20, 4.7, 31, 'sustrato-roedor', ['hamster', 'cuy', 'conejo'], 'Sustrato sin polvo, muy absorbente y compostable.'),
  p('SAL-001', 'Antipulgas pipeta x3', 'salud', 64.0, 18, 4.8, 110, 'antipulgas', ['perro', 'gato'], 'Protege contra pulgas y garrapatas por tres meses.', 1),
  p('SAL-002', 'Multivitamínico para aves 30 ml', 'salud', 26.9, 25, 4.6, 19, 'loro', ['loro', 'periquito'], 'Gotas para el agua de bebida. Mejora el plumaje.'),
  p('SAL-003', 'Vitamina C en gotas para cuy', 'salud', 22.9, 28, 4.8, 36, 'cuy', ['cuy'], 'Previene el escorbuto. Se agrega al agua diaria.'),
  p('JAU-001', 'Jaula para loro 90 cm con perchas', 'jaulas', 349.0, 4, 4.8, 15, 'jaula-ave', ['loro'], 'Barrotes reforzados, techo abatible y bandeja extraíble.', 1),
  p('JAU-002', 'Jaula para periquitos 60 cm', 'jaulas', 159.0, 6, 4.7, 21, 'jaula-periquito', ['periquito'], 'Incluye comederos, bebedero y dos perchas de madera.'),
  p('JAU-003', 'Hábitat para hámster dos pisos', 'jaulas', 189.0, 6, 4.7, 27, 'jaula-roedor', ['hamster'], 'Base profunda para excavar, rampa y casita.'),
  p('JAU-004', 'Corral modular para conejo y cuy', 'jaulas', 199.0, 5, 4.8, 24, 'corral', ['conejo', 'cuy'], 'Paneles armables para dar espacio de ejercicio seguro.'),
  p('ACU-001', 'Acuario completo 40 L con filtro y luz LED', 'acuarismo', 279.0, 5, 4.8, 33, 'acuario', ['pez'], 'Listo para empezar: filtro silencioso, luz y tapa.', 1),
  p('ACU-002', 'Acondicionador de agua 250 ml', 'acuarismo', 24.9, 30, 4.7, 49, 'pez', ['pez', 'tortuga'], 'Neutraliza el cloro del agua de caño en segundos.'),
  p('TER-001', 'Terrario de vidrio 60 × 45 cm', 'terrarios', 389.0, 3, 4.8, 12, 'terrario', ['reptil', 'tortuga'], 'Apertura frontal, ventilación superior y cierre seguro.'),
  p('TER-002', 'Lámpara UVB + calor para reptiles', 'terrarios', 79.9, 12, 4.7, 23, 'reptil', ['reptil', 'tortuga'], 'Imprescindible para fijar el calcio y evitar enfermedades óseas.'),
  p('ACC-001', 'Comedero doble de acero inoxidable', 'accesorios', 34.9, 30, 4.6, 52, 'comedero', ['perro', 'gato'], 'Base antideslizante y tazones desmontables aptos para lavavajillas.'),
  p('ACC-002', 'Placa de identificación grabada', 'accesorios', 19.9, 50, 4.9, 77, 'collar', ['perro', 'gato'], 'Grabado láser con el nombre y teléfono de tu mascota.'),
  p('ROP-001', 'Casaca impermeable para perro', 'ropa', 59.9, 15, 4.6, 28, 'ropa-perro', ['perro'], 'Forro polar y capucha. Ideal para el invierno limeño.'),
]

const s = (slug, nombre, categoria, precio, duracion_min, especies, descripcion, incluye, desde = 0) =>
  ({ slug, nombre, categoria, precio, duracion_min, especies, descripcion, incluye: incluye.join('|'), desde, imagen: img(`srv-${slug}`) })

const TODOS = especies.map(e => e.slug)
const EXOTICOS = ['cuy', 'conejo', 'hamster', 'huron', 'tortuga', 'reptil']

export const servicios = [
  s('consulta', 'Consulta general', 'Salud', 50, 30, TODOS, 'Evaluación completa de la salud de tu mascota, de la nariz a la cola.', ['Examen físico completo', 'Peso y condición corporal', 'Plan de cuidado por escrito']),
  s('vacunacion', 'Vacunación', 'Prevención', 45, 20, ['perro', 'gato', 'huron', 'conejo'], 'Calendario de vacunas para cachorros, adultos y senior.', ['Vacuna del día', 'Carné de vacunación', 'Recordatorio de la siguiente dosis']),
  s('desparasitacion', 'Desparasitación', 'Prevención', 35, 15, TODOS, 'Control de parásitos internos y externos según la especie y el peso.', ['Dosis según peso', 'Examen de heces opcional', 'Plan anual']),
  s('grooming', 'Baño y grooming', 'Estética', 60, 90, ['perro', 'gato', 'conejo'], 'Baño con productos hipoalergénicos, corte de raza y perfume suave.', ['Baño y secado', 'Corte según raza', 'Limpieza de oídos'], 1),
  s('unas-pico', 'Corte de uñas y pico', 'Estética', 25, 15, ['loro', 'periquito', 'cuy', 'conejo', 'hamster', 'tortuga', 'reptil', 'perro', 'gato'], 'Recorte seguro de uñas y pico con sujeción de bajo estrés.', ['Uñas', 'Pico (aves y tortugas)', 'Revisión de patas']),
  s('dental', 'Limpieza dental', 'Salud', 120, 60, ['perro', 'gato', 'conejo', 'cuy'], 'Profilaxis con ultrasonido y pulido. En roedores, ajuste dental.', ['Ultrasonido', 'Pulido', 'Evaluación de encías']),
  s('laboratorio', 'Laboratorio clínico', 'Diagnóstico', 80, 30, TODOS, 'Hemograma, bioquímica, orina y heces con resultados en 24 horas.', ['Toma de muestra', 'Informe digital', 'Interpretación del médico'], 1),
  s('ecografia', 'Ecografía', 'Diagnóstico', 140, 40, ['perro', 'gato', 'conejo', 'huron', 'cuy'], 'Ecografía abdominal y gestacional con equipo de alta resolución.', ['Estudio completo', 'Imágenes digitales', 'Informe']),
  s('rayos-x', 'Rayos X digital', 'Diagnóstico', 110, 30, TODOS, 'Radiografía digital para huesos, tórax y control de caparazón en tortugas.', ['Dos proyecciones', 'Imágenes en tu correo', 'Lectura del especialista']),
  s('cirugia', 'Cirugía y esterilización', 'Cirugía', 250, 120, ['perro', 'gato', 'conejo', 'cuy', 'huron'], 'Esterilizaciones y cirugías programadas con anestesia inhalada y monitoreo.', ['Evaluación prequirúrgica', 'Anestesia inhalada', 'Control posoperatorio'], 1),
  s('aves', 'Medicina de aves', 'Especialidades', 70, 40, ['loro', 'periquito'], 'Consulta especializada para loros, guacamayos, periquitos y canarios.', ['Examen de plumaje', 'Revisión de pico y buche', 'Asesoría nutricional']),
  s('exoticos', 'Medicina de exóticos', 'Especialidades', 70, 40, EXOTICOS, 'Cuyes, conejos, hámsters, hurones, tortugas y reptiles con especialista.', ['Manejo especializado', 'Revisión dental', 'Asesoría de hábitat']),
  s('microchip', 'Microchip e identificación', 'Prevención', 65, 15, ['perro', 'gato', 'huron', 'conejo', 'loro'], 'Microchip ISO con registro nacional para que tu mascota siempre vuelva a casa.', ['Microchip ISO', 'Registro', 'Certificado']),
  s('nutricion', 'Asesoría nutricional', 'Bienestar', 55, 40, TODOS, 'Plan de alimentación según especie, edad y condición: dietas, pesos y porciones.', ['Evaluación corporal', 'Plan escrito', 'Control a los 30 días']),
  s('hospitalizacion', 'Hospitalización', 'Cuidados', 150, 1440, ['perro', 'gato', 'conejo', 'cuy', 'huron'], 'Cuidado 24 horas con monitoreo, fluidoterapia y reportes diarios a la familia.', ['Monitoreo 24 h', 'Medicación', 'Reporte diario'], 1),
  s('teleconsulta', 'Teleconsulta', 'Bienestar', 35, 20, TODOS, 'Videollamada con un veterinario para dudas, controles y seguimiento.', ['Videollamada', 'Receta digital si aplica', 'Resumen por correo']),
]

export const veterinarios = [
  { nombre: 'Thair', especialidad: 'Medicina general y felina', bio: '12 años de experiencia. Certificada en manejo cat-friendly.', imagen: img('vet-ana') },
  { nombre: 'Tom', especialidad: 'Cirugía y traumatología', bio: 'Especialista en cirugía de tejidos blandos y ortopedia.', imagen: img('vet-jorge') },
  { nombre: 'Lia', especialidad: 'Aves y animales exóticos', bio: 'Atiende loros, cuyes, conejos y reptiles desde 2015.', imagen: img('vet-lucia') },
  { nombre: 'Mayra', especialidad: 'Dermatología y diagnóstico por imagen', bio: 'Ecografía, rayos X y problemas de piel.', imagen: img('vet-carlos') },
]
