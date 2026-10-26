-- Esquema PostgreSQL para HuellitaVet

CREATE TABLE IF NOT EXISTS especies (
  id          SERIAL PRIMARY KEY,
  slug        TEXT    NOT NULL UNIQUE,
  nombre      TEXT    NOT NULL,
  grupo       TEXT    NOT NULL CHECK (grupo IN ('Mamíferos', 'Aves', 'Exóticos', 'Acuáticos')),
  descripcion TEXT    NOT NULL,
  imagen      TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS categorias (
  id     SERIAL PRIMARY KEY,
  slug   TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  icono  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS productos (
  id           SERIAL PRIMARY KEY,
  sku          TEXT           NOT NULL UNIQUE,
  nombre       TEXT           NOT NULL,
  descripcion  TEXT           NOT NULL,
  categoria_id INTEGER        NOT NULL REFERENCES categorias(id),
  precio       NUMERIC(10,2)  NOT NULL CHECK (precio > 0),
  stock        INTEGER        NOT NULL DEFAULT 0 CHECK (stock >= 0),
  rating       NUMERIC(3,2)   NOT NULL DEFAULT 5 CHECK (rating BETWEEN 0 AND 5),
  resenas      INTEGER        NOT NULL DEFAULT 0,
  imagen       TEXT           NOT NULL,
  destacado    INTEGER        NOT NULL DEFAULT 0 CHECK (destacado IN (0, 1)),
  creado_en    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);

CREATE TABLE IF NOT EXISTS producto_especies (
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  especie_id  INTEGER NOT NULL REFERENCES especies(id) ON DELETE CASCADE,
  PRIMARY KEY (producto_id, especie_id)
);

CREATE TABLE IF NOT EXISTS servicios (
  id           SERIAL PRIMARY KEY,
  slug         TEXT           NOT NULL UNIQUE,
  nombre       TEXT           NOT NULL,
  categoria    TEXT           NOT NULL,
  descripcion  TEXT           NOT NULL,
  incluye      TEXT           NOT NULL,
  precio       NUMERIC(10,2)  NOT NULL CHECK (precio > 0),
  desde        INTEGER        NOT NULL DEFAULT 0 CHECK (desde IN (0, 1)),
  duracion_min INTEGER        NOT NULL CHECK (duracion_min > 0),
  imagen       TEXT           NOT NULL
);

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
  id         SERIAL PRIMARY KEY,
  nombre     TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  telefono   TEXT,
  creado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citas (
  id             SERIAL PRIMARY KEY,
  cliente_id     INTEGER NOT NULL REFERENCES clientes(id),
  veterinario_id INTEGER NOT NULL REFERENCES veterinarios(id),
  servicio_id    INTEGER NOT NULL REFERENCES servicios(id),
  especie_id     INTEGER NOT NULL REFERENCES especies(id),
  fecha          TEXT    NOT NULL,
  hora           TEXT    NOT NULL,
  mascota        TEXT    NOT NULL,
  notas          TEXT,
  estado         TEXT    NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','confirmada','cancelada','completada')),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (veterinario_id, fecha, hora)
);

CREATE TABLE IF NOT EXISTS pedidos (
  id         SERIAL PRIMARY KEY,
  cliente_id INTEGER        NOT NULL REFERENCES clientes(id),
  total      NUMERIC(10,2)  NOT NULL CHECK (total >= 0),
  estado     TEXT           NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','procesando','enviado','entregado','cancelado')),
  creado_en  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedido_detalle (
  id          SERIAL PRIMARY KEY,
  pedido_id   INTEGER        NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id INTEGER        NOT NULL REFERENCES productos(id),
  cantidad    INTEGER        NOT NULL CHECK (cantidad > 0),
  precio_unit NUMERIC(10,2)  NOT NULL CHECK (precio_unit > 0)
);

CREATE TABLE IF NOT EXISTS mensajes (
  id        SERIAL PRIMARY KEY,
  nombre    TEXT NOT NULL,
  email     TEXT NOT NULL,
  telefono  TEXT,
  mensaje   TEXT NOT NULL,
  leido     INTEGER NOT NULL DEFAULT 0 CHECK (leido IN (0,1)),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);