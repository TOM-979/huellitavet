# Arquitectura y decisiones técnicas

## 1. Rubro y problemática

**Rubro:** clínica veterinaria de barrio que atiende todas las especies.

**Problema:** las reservas se hacen por llamada o WhatsApp, con cruces de horario y sin saber qué veterinario atiende aves o exóticos. La clínica tampoco vende sus productos en línea.

**Solución:** web donde el cliente elige a su mascota, ve solo los servicios que le corresponden, reserva con horarios reales y compra productos para recoger en la clínica.

## 2. Requisitos

| Funcionales | No funcionales |
|---|---|
| Catálogo de especies, servicios y productos con filtros | Funcionar en celulares desde 375 px |
| Reserva con disponibilidad real y asignación de especialista | Accesible (WCAG 2.1 AA) |
| Carrito, pedido con control de stock y comprobante PDF | Cero instalación extra en Windows para el equipo |
| Formulario de contacto | Desplegable en Vercel |
| Seguir funcionando si la API cae (modo demostración) | Código separable por ramas para trabajo en equipo |

## 3. Diagrama

```
 Navegador
    │
    ▼
 Frontend React (Vercel)                       Backend Express (Vercel)
 ┌─────────────────────────┐   fetch JSON   ┌──────────────────────────────┐
 │ components/ (páginas,   │ ─────────────▶ │ rutas → controladores        │
 │   X/X.jsx + X.css)  ui/ │                │                              │
 │ context/ (carrito)      │                │        → modelos (SQL)       │
 │ lib/api.js ──respaldo──▶│ catalogo.json  │        → PostgreSQL          │
 └─────────────────────────┘                │ utils/comprobante.js (HTML)  │
          │                                 └──────────────────────────────┘
          ▼
 Fotos: CDN de Unsplash (recorte y tamaño por URL)
```

## 4. Decisiones y compromisos

| Decisión | Por qué | Costo / qué revisar después |
|---|---|---|
| **PostgreSQL: Supabase en producción, PGlite en local** | El mismo motor en todos lados; en local no hay que instalar nada y en Vercel los datos persisten. SQL real con `CHECK`, `UNIQUE`, `FOREIGN KEY` y transacciones | PGlite admite un solo proceso por carpeta; Supabase gratis pausa el proyecto tras días sin uso |
| **Express por capas** (rutas → controladores → modelos) | Cada integrante trabaja en una capa o recurso sin pisarse | Para más de ~10 recursos convendría un ORM (Prisma) |
| **Filtros y paginación en el backend** | El catálogo puede crecer sin cargar todo en el navegador | Una consulta por cambio de filtro (con 250 ms de espera al escribir) |
| **Respaldo `catalogo.json`** | La demo nunca queda vacía si la API cae | Se regenera con `npm run catalogo` cuando cambian los datos |
| **Fotos desde el CDN de Unsplash** | Imágenes reales y livianas, sin inflar el repositorio | Dependen de internet; el componente `Foto` muestra un respaldo si fallan |
| **Motion para animaciones** | Animaciones interrumpibles, transiciones de página y `reducedMotion="user"` | Agrega unos 40 KB comprimidos |
| **Comprobante HTML imprimible en el servidor** | Liviano para Vercel; se guarda como PDF desde el navegador | Es una nota de venta académica, no un comprobante electrónico SUNAT |

## 5. API

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/api/especies` | Especies con su cantidad de servicios y productos |
| GET | `/api/categorias` | Categorías con su cantidad de productos |
| GET | `/api/productos?q=&categoria=&especie=&orden=&pagina=&limite=` | `{ items, total, pagina, paginas }` |
| GET | `/api/productos/:id` | Un producto |
| GET | `/api/servicios?especie=&categoria=` | Servicios con `incluye` y `especies` |
| GET | `/api/veterinarios` | Equipo médico |
| GET | `/api/estadisticas` | Totales para la portada |
| GET | `/api/citas/disponibilidad?fecha=AAAA-MM-DD` | `[{ hora, disponible, libres }]` |
| POST | `/api/citas` | `201` cita con código y veterinario · `400` datos inválidos · `409` horario ocupado |
| GET | `/api/citas/:codigo` | Detalle de una cita |
| POST | `/api/pedidos` | `201` pedido con subtotal, IGV y total · `409` sin stock |
| GET | `/api/pedidos/:codigo/comprobante` | PDF |
| POST | `/api/mensajes` | `201` mensaje guardado |

## 6. Frontend: uso de React (requisitos del laboratorio)

| Requisito | Dónde |
|---|---|
| Componentes | `Header`, `Footer`, `TarjetaProducto`, `TarjetaServicio`, `ModalProducto`, `PanelCarrito`, `ChipsEspecies`, `Foto`, `Boton`… |
| `useState`: carrito | `context/Carrito.jsx` (agregar, cambiar, quitar, deshacer) |
| `useState`: filtros | `components/Tienda/Tienda.jsx`, `components/Servicios/Servicios.jsx`, selector de especies en `components/Inicio/Inicio.jsx` |
| `useState`: menú hamburguesa | `components/Header/Header.jsx` |
| Props | Las tarjetas reciben `producto` o `servicio` y las acciones `onVer` y `onAgregar` |
| CSS estructurado | Tailwind con los colores del prototipo Figma en `index.css` (`@theme`); cada componente tiene su `Nombre.css` en su carpeta |

## 7. Accesibilidad y experiencia

- Contraste ≥ 4.5:1 en todo el texto (verificado automáticamente).
- Controles de 44 × 44 px como mínimo, foco visible y foco atrapado en el modal y el carrito.
- Formularios: validan al salir del campo y el error se limpia al corregir; el botón de envío nunca se deshabilita.
- Animaciones solo con `transform` y `opacity`, curvas `ease-out`, y desactivadas con "reducir movimiento".
- Sin desborde horizontal a 375 px ni a 1280 px.

## 8. Qué revisar cuando el proyecto crezca

1. Migrar a PostgreSQL y agregar índices según las consultas reales.
2. Autenticación (JWT) y un panel de administración para citas, pedidos y stock.
3. Recordatorios de cita por correo o WhatsApp.
4. Subir fotos propias a un almacenamiento (por ejemplo, Cloudinary) en vez de usar Unsplash.
