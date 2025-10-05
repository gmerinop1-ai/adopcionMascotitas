-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  correo VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'usuario' CHECK (rol IN ('usuario', 'administrador')),
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de mascotas
CREATE TABLE IF NOT EXISTS mascotas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  especie VARCHAR(100) NOT NULL,
  raza VARCHAR(100),
  sexo VARCHAR(20) NOT NULL CHECK (sexo IN ('macho', 'hembra')),
  edad INTEGER CHECK (edad >= 0 AND edad <= 20),
  tamano VARCHAR(50) CHECK (tamano IN ('pequeño', 'mediano', 'grande')),
  ubicacion VARCHAR(255),
  foto_url TEXT NOT NULL,
  fotos_adicionales TEXT[], -- Array de URLs de fotos adicionales
  descripcion TEXT,
  estado VARCHAR(50) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'reservado', 'no_disponible')),
  motivo_no_disponible VARCHAR(100) CHECK (motivo_no_disponible IN ('adoptada', 'en_tratamiento', 'reintegrada', 'fallecida', 'otro')),
  nota_estado TEXT,
  esterilizado BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de datos médicos de mascotas
CREATE TABLE IF NOT EXISTS datos_medicos (
  id SERIAL PRIMARY KEY,
  mascota_id INTEGER REFERENCES mascotas(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('vacuna', 'desparasitacion', 'tratamiento')),
  nombre VARCHAR(255) NOT NULL,
  fecha DATE,
  diagnostico TEXT,
  plan_tratamiento TEXT,
  medicacion TEXT,
  frecuencia VARCHAR(100),
  fecha_inicio DATE,
  fecha_fin DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de solicitudes de adopción
CREATE TABLE IF NOT EXISTS solicitudes_adopcion (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  mascota_id INTEGER REFERENCES mascotas(id) ON DELETE CASCADE,
  dni VARCHAR(20) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  distrito VARCHAR(255) NOT NULL,
  motivacion TEXT NOT NULL,
  disponibilidad_tiempo TEXT NOT NULL,
  condiciones_hogar TEXT NOT NULL,
  estado VARCHAR(50) DEFAULT 'pre_filtro' CHECK (estado IN ('pre_filtro', 'entrevista', 'aprobada', 'rechazada', 'cancelada')),
  observaciones_internas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de historial de cambios de estado de solicitudes
CREATE TABLE IF NOT EXISTS historial_solicitudes (
  id SERIAL PRIMARY KEY,
  solicitud_id INTEGER REFERENCES solicitudes_adopcion(id) ON DELETE CASCADE,
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50) NOT NULL,
  admin_id INTEGER REFERENCES usuarios(id),
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_mascotas_estado ON mascotas(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario ON solicitudes_adopcion(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_mascota ON solicitudes_adopcion(mascota_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_adopcion(estado);
