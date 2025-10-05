// Form validation utilities

export interface ValidationError {
  field: string
  message: string
}

export function validateRegistrationForm(data: {
  nombres: string
  apellidos: string
  nro_dni: string
  correo: string
  password: string
  confirmar_password: string
}): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.nombres || data.nombres.trim().length === 0) {
    errors.push({ field: "nombres", message: "Los nombres son obligatorios" })
  } else if (data.nombres.trim().length < 2) {
    errors.push({ field: "nombres", message: "Los nombres deben tener al menos 2 caracteres" })
  }

  if (!data.apellidos || data.apellidos.trim().length === 0) {
    errors.push({ field: "apellidos", message: "Los apellidos son obligatorios" })
  } else if (data.apellidos.trim().length < 2) {
    errors.push({ field: "apellidos", message: "Los apellidos deben tener al menos 2 caracteres" })
  }

  if (!data.nro_dni || data.nro_dni.trim().length === 0) {
    errors.push({ field: "nro_dni", message: "El DNI es obligatorio" })
  } else {
    const dniRegex = /^\d{8}$/
    if (!dniRegex.test(data.nro_dni.trim())) {
      errors.push({ field: "nro_dni", message: "El DNI debe tener 8 dígitos" })
    }
  }

  if (!data.correo || data.correo.trim().length === 0) {
    errors.push({ field: "correo", message: "El correo es obligatorio" })
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.correo)) {
      errors.push({ field: "correo", message: "El formato del correo no es válido" })
    }
  }

  if (!data.password || data.password.length === 0) {
    errors.push({ field: "password", message: "La contraseña es obligatoria" })
  } else if (data.password.length < 8 || data.password.length > 12) {
    errors.push({ field: "password", message: "La contraseña debe tener entre 8 y 12 caracteres" })
  }

  if (data.password !== data.confirmar_password) {
    errors.push({ field: "confirmar_password", message: "Las contraseñas no coinciden" })
  }

  return errors
}

export function validateLoginForm(data: {
  correo: string
  password: string
}): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.correo || data.correo.trim().length === 0) {
    errors.push({ field: "correo", message: "El correo es obligatorio" })
  }

  if (!data.password || data.password.length === 0) {
    errors.push({ field: "password", message: "La contraseña es obligatoria" })
  }

  return errors
}

export function validateMascotaForm(data: {
  nombre: string
  especie: string
  sexo: string
  foto_url: string
  edad?: number
}): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.nombre || data.nombre.trim().length === 0) {
    errors.push({ field: "nombre", message: "El nombre es obligatorio" })
  }

  if (!data.especie || data.especie.trim().length === 0) {
    errors.push({ field: "especie", message: "La especie es obligatoria" })
  }

  if (!data.sexo || !["macho", "hembra"].includes(data.sexo)) {
    errors.push({ field: "sexo", message: "El sexo es obligatorio y debe ser macho o hembra" })
  }

  if (!data.foto_url || data.foto_url.trim().length === 0) {
    errors.push({ field: "foto_url", message: "La foto es obligatoria" })
  }

  if (data.edad !== undefined && (data.edad < 0 || data.edad > 20)) {
    errors.push({ field: "edad", message: "La edad debe estar entre 0 y 20 años" })
  }

  return errors
}

export function validateSolicitudForm(data: {
  dni: string
  telefono: string
  distrito: string
  motivacion: string
  disponibilidad_tiempo: string
  condiciones_hogar: string
}): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.dni || data.dni.trim().length === 0) {
    errors.push({ field: "dni", message: "El DNI es obligatorio" })
  }

  if (!data.telefono || data.telefono.trim().length === 0) {
    errors.push({ field: "telefono", message: "El teléfono es obligatorio" })
  }

  if (!data.distrito || data.distrito.trim().length === 0) {
    errors.push({ field: "distrito", message: "El distrito es obligatorio" })
  }

  if (!data.motivacion || data.motivacion.trim().length === 0) {
    errors.push({ field: "motivacion", message: "La motivación es obligatoria" })
  }

  if (!data.disponibilidad_tiempo || data.disponibilidad_tiempo.trim().length === 0) {
    errors.push({ field: "disponibilidad_tiempo", message: "La disponibilidad de tiempo es obligatoria" })
  }

  if (!data.condiciones_hogar || data.condiciones_hogar.trim().length === 0) {
    errors.push({ field: "condiciones_hogar", message: "Las condiciones del hogar son obligatorias" })
  }

  return errors
}
