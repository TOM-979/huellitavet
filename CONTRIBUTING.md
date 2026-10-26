# Trabajo en equipo con Git y GitHub

## Ramas

| Rama | Uso | Regla |
|---|---|---|
| `main` | Versión estable y desplegada | Protegida. Solo recibe Pull Requests desde `develop` |
| `develop` | Integración | Protegida. Solo recibe Pull Requests desde `feature/*` |
| `feature/<nombre>` | Una funcionalidad | Se crea desde `develop` |

## Paso a paso

```bash
git checkout develop
git pull origin develop
git checkout -b feature/tienda
# ...trabajar y hacer commits pequeños...
git add .
git commit -m "feat(tienda): filtrar productos por especie"
git pull origin develop      # traer lo último y resolver conflictos
git push -u origin feature/tienda
```

Luego, en GitHub: **Compare & pull request** → base `develop` ← `feature/tienda` → otro integrante revisa y aprueba → **Merge**.

## Commits semánticos

`tipo(alcance): descripción en minúsculas`

| Tipo | Ejemplo |
|---|---|
| `feat` | `feat(reservar): mostrar horarios libres desde la api` |
| `fix` | `fix(carrito): no permitir más unidades que el stock` |
| `style` | `style(header): ajustar menú en móvil` |
| `refactor` | `refactor(api): separar modelo de pedidos` |
| `test` | `test(api): probar transacción de pedidos` |
| `docs` | `docs: diagrama entidad-relación` |
| `chore` | `chore: instalar motion y lucide-react` |

## Reparto sugerido (4 integrantes)

Cada persona sube **sus archivos** desde **su cuenta**, en commits pequeños, para que el historial quede parejo.

| Integrante | Rama | Archivos |
|---|---|---|
| **1 · Base de datos** | `feature/db-esquema` | `backend/src/db/schema.sql`, `datos.js`, `imagenes.js`, `conexion.js`, `scripts/`, `docs/BASE_DE_DATOS.md` |
| **1 · Base de datos** | `feature/api-catalogo` | `backend/src/modelos/catalogo.js`, `controladores/catalogo.controlador.js`, `rutas/index.js`, `app.js`, `index.js` |
| **2 · Backend** | `feature/api-citas` | `modelos/citas.js`, `controladores/citas.controlador.js`, `middlewares/` |
| **2 · Backend** | `feature/api-pedidos-pdf` | `modelos/pedidos.js`, `controladores/pedidos.controlador.js`, `utils/comprobante.js`, `modelos/mensajes.js`, `tests/` |
| **3 · Frontend** | `feature/base-ui` | `frontend/` (config), `src/index.css`, `lib/`, `ui/` (Boton, Foto, Modal, Cajon, Logo), `components/Header/`, `components/Footer/` |
| **3 · Frontend** | `feature/inicio` | `components/Inicio/`, `components/Servicios/`, `ui/ChipsEspecies.jsx` |
| **4 · Frontend** | `feature/tienda-carrito` | `components/Tienda/`, `components/ModalProducto/`, `components/PanelCarrito/`, `context/`, `ui/TarjetaProducto.jsx`, `ui/Cantidad.jsx` |
| **4 · Frontend** | `feature/reservar-contacto` | `components/Reservar/`, `components/Contacto/`, `components/NoEncontrada/`, `ui/CheckAnimado.jsx` |
| **Líder** | `feature/despliegue` | `README.md`, `docs/ARQUITECTURA.md`, `vercel.json`, variables en Vercel |

**Orden de integración:** `db-esquema` → `api-catalogo` → `base-ui` → resto en paralelo → `despliegue`.
