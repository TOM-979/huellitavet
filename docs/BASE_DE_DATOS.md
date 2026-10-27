# Base de datos

El esquema completo está en `backend/src/db/schema.sql` y los datos iniciales en `backend/src/db/datos.js`. Al iniciar el backend (o en la primera petición, en Vercel) se crean las tablas que falten y, si la base está vacía, se cargan los datos.

La base es PostgreSQL en todos los entornos:

| Entorno | Base | Cómo se elige |
|---|---|---|
| Producción (Vercel) | Supabase | Variable `DATABASE_URL` |
| Tu PC | PGlite (PostgreSQL embebido) en `backend/data/pglite` | `DATABASE_URL` vacío |
| Pruebas (`npm test`) | PGlite en memoria | Lo fija `tests/api.test.js` |

## Diagrama entidad-relación

```mermaid
erDiagram
  especies ||--o{ producto_especies : "sirve a"
  productos ||--o{ producto_especies : ""
  categorias ||--o{ productos : "agrupa"
  especies ||--o{ servicio_especies : "recibe"
  servicios ||--o{ servicio_especies : ""
  clientes ||--o{ citas : "reserva"
  especies ||--o{ citas : ""
  servicios ||--o{ citas : ""
  veterinarios ||--o{ citas : "atiende"
  clientes ||--o{ pedidos : "compra"
  pedidos ||--|{ pedido_detalle : "contiene"
  productos ||--o{ pedido_detalle : ""

  especies { int id PK  text slug UK  text nombre  text grupo  text imagen }
  categorias { int id PK  text slug UK  text nombre }
  productos { int id PK  text sku UK  int categoria_id FK  real precio  int stock  real rating }
  servicios { int id PK  text slug UK  text categoria  real precio  int duracion_min }
  veterinarios { int id PK  text nombre  text especialidad }
  clientes { int id PK  text nombre  text telefono UK  text correo }
  citas { int id PK  text codigo UK  int cliente_id FK  int especie_id FK  int servicio_id FK  int veterinario_id FK  text fecha  text hora  text estado }
  pedidos { int id PK  text codigo UK  int cliente_id FK  real subtotal  real igv  real total  text estado }
  pedido_detalle { int pedido_id PK  int producto_id PK  int cantidad  real precio_unit }
  mensajes { int id PK  text nombre  text correo  text asunto  text mensaje }
```

## Reglas que garantiza la propia base de datos

| Regla | Cómo |
|---|---|
| Un veterinario no tiene dos citas a la misma hora | `UNIQUE (veterinario_id, fecha, hora)` en `citas` |
| El stock nunca es negativo | `CHECK (stock >= 0)` en `productos` |
| Precios positivos y ratings entre 0 y 5 | `CHECK` en `productos` y `servicios` |
| Estados válidos | `CHECK (estado IN (...))` en `citas` y `pedidos` |
| Un cliente por celular | `UNIQUE (telefono)` en `clientes` |
| Un producto sirve a varias especies | Tabla intermedia `producto_especies` (muchos a muchos) |
| El pedido conserva el precio del momento | `pedido_detalle.precio_unit` |

## Transacciones

`crearPedido` (en `modelos/pedidos.js`) crea el pedido, inserta el detalle y descuenta el stock **dentro de una transacción**. Si un producto no alcanza, se ejecuta `ROLLBACK` y no se guarda nada. Lo comprueba la prueba «pedidos: descuenta stock y la transacción se deshace si falta stock».

## Consultas útiles para el informe

```sql
-- Ventas por categoría
SELECT c.nombre, SUM(d.cantidad * d.precio_unit) AS ventas
FROM pedido_detalle d
JOIN productos p ON p.id = d.producto_id
JOIN categorias c ON c.id = p.categoria_id
GROUP BY c.id ORDER BY ventas DESC;

-- Citas por veterinario en una fecha
SELECT v.nombre, COUNT(*) AS citas
FROM citas ci JOIN veterinarios v ON v.id = ci.veterinario_id
WHERE ci.fecha = '2026-10-24' AND ci.estado <> 'Cancelada'
GROUP BY v.id;

-- Productos con poco stock
SELECT sku, nombre, stock FROM productos WHERE stock <= 5 ORDER BY stock;
```

Para ejecutar estas consultas en producción usa el *SQL Editor* de Supabase.

## Reiniciar la base

`npm run db:reset` (en `backend`) borra todas las tablas, las vuelve a crear con `schema.sql` y carga los datos iniciales. Usa la base que indique `DATABASE_URL` (o la local si está vacío). Apaga antes `npm run dev`: PGlite no admite dos procesos abriendo la misma carpeta.
