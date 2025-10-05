import bcrypt from "bcryptjs"

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Password validation
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "La contraseña debe tener al menos 8 caracteres" }
  }
  if (password.length > 12) {
    return { valid: false, error: "La contraseña no puede tener más de 12 caracteres" }
  }
  return { valid: true }
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Session management types
export interface SessionUser {
  id: number
  nombre_completo: string
  correo: string
  rol: "usuario" | "administrador"
}

export interface Session {
  user: SessionUser
  expires: string
}
