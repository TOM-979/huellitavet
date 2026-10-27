-- Esquema PostgreSQL para HuellitaVet (Supabase en producción, PGlite en tu PC y en las pruebas)

-- Especies que atiende la clínica (perros, gatos, aves, cuyes, reptiles...)
CREATE TABLE IF NOT EXISTS especies (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  nombre      TEXT NOT NULL,
  grupo       TEXT NOT NULL CHECK (grupo IN ('Mamíferos', 'Aves', 'Exóticos', 'Acuáticos')),
  descripcion TEXT NOT NULL,
  imagen      TEXT NOT NULL
);

-- Categorías de la tienda
CREATE TABLE IF NOT EXISTS categorias (
  id     SERIAL PRIMARY KEY,
  slug   TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  icono  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS productos (
  id           SERIAL PRIMARY KEY,
  sku          TEXT          NOT NULL UNIQUE,
  nombre       TEXT          NOT NULL,
  descripcion  TEXT          NOT NULL,
  categoria_id INTEGER       NOT NULL REFERENCES categorias(id),
  precio       NUMERIC(10,2) NOT NULL CHECK (precio > 0),
  stock        INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
  rating       NUMERIC(3,2)  NOT NULL DEFAULT 5 CHECK (rating BETWEEN 0 AND 5),
  resenas      INTEGER       NOT NULL DEFAULT 0,
  imagen       TEXT          NOT NULL,
  destacado    INTEGER       NOT NULL DEFAULT 0 CHECK (destacado IN (0, 1)),
  creado_en    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);

-- Relación muchos a muchos: un producto sirve para varias especies
CREATE TABLE IF NOT EXISTS producto_especies (
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  especie_id  INTEGER NOT NULL REFERENCES especies(id) ON DELETE CASCADE,
  PRIMARY KEY (producto_id, especie_id)
);

CREATE TABLE IF NOT EXISTS servicios (
  id           SERIAL PRIMARY KEY,
  slug         TEXT          NOT NULL UNIQUE,
  nombre       TEXT          NOT NULL,
  categoria    TEXT          NOT NULL,
  descripcion  TEXT          NOT NULL,
  incluye      TEXT          NOT NULL,              -- lista separada por "|"
  precio       NUMERIC(10,2) NOT NULL CHECK (precio > 0),
  desde        INTEGER       NOT NULL DEFAULT 0 CHECK (desde IN (0, 1)),
  duracion_min INTEGER       NOT NULL CHECK (duracion_min > 0),
  imagen       TEXT          NOT NULL
);

-- Qué especies puede recibir cada servicio
CREATE TABLE IF NOT EXISTS servicio_especies (
  servicio_id INTEGER NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  especie_id  INTEGER NOT NULL REFERENCES especies(id) ON DELETE CASCADE,
  PRIMARY KEY (servicio_id, especie_id)
);

CREATE TABLE IF NOT EXISTS veterinarios (
  id           SERIAL PRIMARY KEY,
  nombre       TEXT NOT NULL,
  especialidad TEXT NOT NULL,
  bio          TEXT NOT NULL,
  imagen       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clientes (
  id        SERIAL PRIMARY KEY,
  nombre    TEXT        NOT NULL,
  telefono  TEXT        NOT NULL UNIQUE,
  correo    TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citas (
  id             SERIAL PRIMARY KEY,
  codigo         TEXT        NOT NULL UNIQUE,
  cliente_id     INTEGER     NOT NULL REFERENCES clientes(id),
  mascota        TEXT        NOT NULL,
  especie_id     INTEGER     NOT NULL REFERENCES especies(id),
  servicio_id    INTEGER     NOT NULL REFERENCES servicios(id),
  veterinario_id INTEGER     NOT NULL REFERENCES veterinarios(id),
  fecha          TEXT        NOT NULL,                    -- AAAA-MM-DD
  hora           TEXT        NOT NULL,                    -- HH:MM
  notas          TEXT,
  estado         TEXT        NOT NULL DEFAULT 'Pendiente'
                 CHECK (estado IN ('Pendiente', 'Confirmada', 'Atendida', 'Cancelada')),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Un veterinario no puede tener dos citas a la misma hora
  UNIQUE (veterinario_id, fecha, hora)
);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);

CREATE TABLE IF NOT EXISTS pedidos (
  id         SERIAL PRIMARY KEY,
  codigo     TEXT          NOT NULL UNIQUE,
  cliente_id INTEGER       REFERENCES clientes(id),
  subtotal   NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  igv        NUMERIC(10,2) NOT NULL CHECK (igv >= 0),
  total      NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  estado     TEXT          NOT NULL DEFAULT 'Recibido'
             CHECK (estado IN ('Recibido', 'Listo para recoger', 'Entregado', 'Anulado')),
  creado_en  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Se guarda el precio del momento: si el producto sube de precio, el pedido no cambia
CREATE TABLE IF NOT EXISTS pedido_detalle (
  pedido_id   INTEGER       NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id INTEGER       NOT NULL REFERENCES productos(id),
  cantidad    INTEGER       NOT NULL CHECK (cantidad > 0),
  precio_unit NUMERIC(10,2) NOT NULL CHECK (precio_unit > 0),
  PRIMARY KEY (pedido_id, producto_id)
);

CREATE TABLE IF NOT EXISTS mensajes (
  id        SERIAL PRIMARY KEY,
  nombre    TEXT        NOT NULL,
  correo    TEXT        NOT NULL,
  asunto    TEXT        NOT NULL,
  mensaje   TEXT        NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
