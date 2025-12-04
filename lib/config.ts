// Configuración de Culqi - Alternativa a variables de entorno problemáticas

// Credenciales de prueba de Culqi
export const CULQI_CONFIG = {
  // Clave pública de prueba
  PUBLIC_KEY: 'pk_test_XcaT7eUAdQ6y7CBp',
  
  // Para el servidor, intentar leer desde variables de entorno o usar fallback
  SECRET_KEY: process.env.CULQI_SECRET_KEY || 'sk_test_d0k1OohbDJnJ8KBg',
  
  // URL base
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  
  // API URLs
  API_BASE_URL: 'https://api.culqi.com/v2',
  
  // Configuración de pruebas
  TEST_CARDS: {
    VISA_SUCCESS: {
      number: '4111111111111111',
      cvv: '123',
      month: '12',
      year: '2030',
      email: 'review@culqi.com'
    },
    MASTERCARD_SUCCESS: {
      number: '5111111111111118',
      cvv: '039', 
      month: '12',
      year: '2030',
      email: 'review@culqi.com'
    }
  }
}

// Función para obtener la clave pública con múltiples fallbacks
export function getCulqiPublicKey(): string {
  // Intentar desde variables de entorno primero
  if (typeof window !== 'undefined') {
    // En el cliente
    const envKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
    if (envKey && envKey !== 'undefined' && envKey.trim() !== '') {
      console.log('[CONFIG] Usando clave pública desde env variable')
      return envKey
    }
  }
  
  // Fallback a configuración hardcodeada
  console.log('[CONFIG] Usando clave pública de fallback')
  return CULQI_CONFIG.PUBLIC_KEY
}

// Función para obtener la clave secreta (solo servidor)
export function getCulqiSecretKey(): string | null {
  if (typeof window !== 'undefined') {
    // En el cliente, no exponer la clave secreta
    return null
  }
  
  const envKey = process.env.CULQI_SECRET_KEY
  if (envKey && envKey !== 'undefined' && envKey.trim() !== '') {
    console.log('[CONFIG] Usando clave secreta desde env variable')
    return envKey
  }
  
  console.log('[CONFIG] Usando clave secreta de fallback')
  return CULQI_CONFIG.SECRET_KEY
}