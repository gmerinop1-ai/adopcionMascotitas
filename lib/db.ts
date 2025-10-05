// Database connection utility
// This will be used to connect to PostgreSQL database

export interface Usuario {
  id: number
  nombre_completo: string
  correo: string
  password_hash: string
  rol: "usuario" | "administrador"
  estado: "activo" | "inactivo"
  created_at: Date
  updated_at: Date
}

export interface Mascota {
  id: number
  nombre: string
  especie: string
  raza?: string
  sexo: "macho" | "hembra"
  edad?: number
  tamano?: "pequeño" | "mediano" | "grande"
  ubicacion?: string
  foto_url: string
  fotos_adicionales?: string[]
  descripcion?: string
  estado: "disponible" | "reservado" | "no_disponible"
  motivo_no_disponible?: "adoptada" | "en_tratamiento" | "reintegrada" | "fallecida" | "otro"
  nota_estado?: string
  esterilizado: boolean
  created_at: Date
  updated_at: Date
}

export interface DatoMedico {
  id: number
  mascota_id: number
  tipo: "vacuna" | "desparasitacion" | "tratamiento"
  nombre: string
  fecha?: Date
  diagnostico?: string
  plan_tratamiento?: string
  medicacion?: string
  frecuencia?: string
  fecha_inicio?: Date
  fecha_fin?: Date
  created_at: Date
}

export interface SolicitudAdopcion {
  id: number
  usuario_id: number
  mascota_id: number
  dni: string
  telefono: string
  distrito: string
  motivacion: string
  disponibilidad_tiempo: string
  condiciones_hogar: string
  estado: "pre_filtro" | "entrevista" | "aprobada" | "rechazada" | "cancelada"
  observaciones_internas?: string
  created_at: Date
  updated_at: Date
}

export interface HistorialSolicitud {
  id: number
  solicitud_id: number
  estado_anterior?: string
  estado_nuevo: string
  admin_id?: number
  notas?: string
  created_at: Date
}

// Database query helper (will be implemented with actual DB connection)
export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
  // This will be implemented when database integration is added
  throw new Error("Database not configured. Please add DATABASE_URL to environment variables.")
}
