# HuellitaVet

Aplicación web full stack para una clínica veterinaria de Independencia (Lima) que atiende **todas las especies**: perros, gatos, loros, periquitos, cuyes, conejos, hámsters, hurones, tortugas, reptiles y peces.

Proyecto Grupal Integrador · Laboratorio #5 · Full Stack Developer Web · SENATI

| | |
|---|---|
| Prototipo en Figma | _(pegar enlace)_ |
| Frontend en Vercel | _(pegar enlace)_ |
| API en Vercel | _(pegar enlace)_ |

## Qué hace

- **Inicio** con selector de especies animado: la foto, el título y los servicios cambian según la mascota.
- **Servicios**: 16 servicios filtrables por especie y por tipo (salud, diagnóstico, cirugía, especialidades…).
- **Tienda**: 45 productos en 12 categorías. Búsqueda, filtros por especie y categoría, orden y paginación, todo resuelto en la base de datos.
- **Carrito**: panel lateral con cantidades y opción de deshacer. El pedido se guarda en la base de datos, descuenta stock y genera un **comprobante PDF**.
- **Reservar cita**: asistente de 4 pasos. Muestra los horarios libres reales y asigna al especialista según la especie (por ejemplo, aves → Lia).
- **Contacto**: formulario animado que guarda los mensajes, estado "Abierto ahora", mapa y preguntas frecuentes.
- Fotos reales (Unsplash), animaciones con Motion, diseño responsive y accesible (WCAG 2.1 AA).

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite 7 + React Router 7 + Tailwind CSS 4 + Motion + Lucide |
| Backend | Node.js + Express 5 (API REST por capas: rutas → controladores → modelos) |
| Base de datos | SQLite integrada en Node (`node:sqlite`), SQL estándar migrable a PostgreSQL |
| PDF | PDFKit |
| Pruebas | `node:test` (7 pruebas de la API) |
| Despliegue | Vercel (frontend y backend por separado) |

## Requisitos

- **Node.js 22.13 o superior** (recomendado 24). Verifica con `node -v`.

## Cómo ejecutarlo

```bash
# Terminal 1: backend → http://localhost:3000/api
cd backend
npm install
npm run dev          # crea la base de datos y carga los datos la primera vez

# Terminal 2: frontend → http://localhost:5173
cd frontend
npm install
npm run dev
```

Si el backend está apagado, el frontend entra en **modo demostración** con el catálogo guardado (aviso amarillo arriba).

### Otros comandos

| Comando | Carpeta | Qué hace |
|---|---|---|
| `npm test` | backend | Ejecuta las pruebas de la API |
| `npm run db:reset` | backend | Borra la base de datos y vuelve a cargar los datos iniciales |
| `npm run catalogo` | backend | Regenera la copia del catálogo para el modo demostración |
| `npm run build` | frontend | Compila para producción |
| `npm run vista-previa` | frontend | Genera un solo HTML que se abre con doble clic |

## Estructura

```
huellitavet/
├── backend/
│   ├── src/
│   │   ├── db/            schema.sql, datos.js (seed), imagenes.js, conexion.js
│   │   ├── modelos/       consultas SQL (catálogo, citas, pedidos, mensajes)
│   │   ├── controladores/ lógica de cada endpoint
│   │   ├── rutas/         definición de la API
│   │   ├── middlewares/   validaciones y manejo de errores
│   │   └── utils/         comprobante PDF
│   ├── tests/             pruebas de la API
│   └── api/               entrada para Vercel
├── frontend/
│   └── src/
│       ├── components/    páginas y secciones grandes, cada una en su carpeta: Nombre/Nombre.jsx + Nombre.css
│       │                  (Inicio, Servicios, Tienda, Reservar, Contacto, NoEncontrada, Header, Footer,
│       │                   IntroLogo, PanelCarrito, ModalProducto)
│       ├── ui/            piezas pequeñas reutilizables, un archivo cada una (Boton, Foto, Modal, Logo…)
│       ├── App.jsx        rutas de la aplicación (+ App.css)
│       ├── index.css      Tailwind, colores del prototipo y tema oscuro
│       ├── context/       Carrito y Avisos (estado global)
│       ├── lib/           api.js, clinica.js, foto.js, formato.js y los hooks (useApi, useAtraparFoco…)
│       └── data/          catalogo.json (respaldo del modo demostración)
└── docs/                  ARQUITECTURA.md, BASE_DE_DATOS.md, CREDITOS.md
```

## Despliegue en Vercel

1. **Backend**: *Add New → Project* → importar el repositorio → **Root Directory: `backend`** → *Deploy*.
2. **Frontend**: *Add New → Project* → mismo repositorio → **Root Directory: `frontend`** → variable `VITE_API_URL` = `https://TU-API.vercel.app/api` → *Deploy*.

En Vercel la base SQLite vive en `/tmp` y se reinicia cada cierto tiempo. Para que los datos persistan, migra a PostgreSQL siguiendo `docs/BASE_DE_DATOS.md`.

## Equipo y flujo de trabajo

Ver [CONTRIBUTING.md](CONTRIBUTING.md).
