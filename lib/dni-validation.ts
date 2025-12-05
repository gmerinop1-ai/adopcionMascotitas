// DNI validation service for Peru
// This service validates DNI numbers using external APIs or internal logic

export interface DNIValidationResult {
  isValid: boolean
  exists?: boolean
  data?: {
    nombres?: string
    apellidos?: string
    dni?: string
  }
  error?: string
}

// Basic DNI format validation (8 digits)
export function validateDNIFormat(dni: string): boolean {
  // Remove spaces and validate format
  const cleanDNI = dni.replace(/\s/g, '')
  const dniRegex = /^\d{8}$/
  return dniRegex.test(cleanDNI)
}

// Validate DNI using external API (RENIEC simulation)
export async function validateDNIExists(dni: string): Promise<DNIValidationResult> {
  try {
    // First, validate format
    if (!validateDNIFormat(dni)) {
      return {
        isValid: false,
        error: "El DNI debe tener exactamente 8 dígitos"
      }
    }

    // For development/testing, we'll simulate API responses
    // In production, you would integrate with RENIEC API or similar service
    if (process.env.NODE_ENV === 'development' || !process.env.RENIEC_API_KEY) {
      return simulateDNIValidation(dni)
    }

    // Example of how you would call a real DNI validation API
    // const response = await fetch(`https://api.reniec.gob.pe/dni/${dni}`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RENIEC_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   }
    // })

    // if (!response.ok) {
    //   throw new Error(`DNI API error: ${response.status}`)
    // }

    // const data = await response.json()
    // 
    // return {
    //   isValid: true,
    //   exists: data.exists,
    //   data: data.exists ? {
    //     nombres: data.nombres,
    //     apellidos: data.apellidos,
    //     dni: data.dni
    //   } : undefined
    // }

    return simulateDNIValidation(dni)
    
  } catch (error) {
    console.error('[DNI] Error validating DNI:', error)
    return {
      isValid: false,
      error: "Error al validar el DNI. Inténtalo de nuevo."
    }
  }
}

// Simulate DNI validation for development/testing
function simulateDNIValidation(dni: string): DNIValidationResult {
  console.log(`[DNI] Simulando validación para DNI: ${dni}`)
  
  // Simulate some valid test DNIs
  const testValidDNIs = [
    { dni: '12345678', nombres: 'Juan Carlos', apellidos: 'Pérez González' },
    { dni: '87654321', nombres: 'María Elena', apellidos: 'García Rodríguez' },
    { dni: '11111111', nombres: 'Pedro José', apellidos: 'López Martínez' },
    { dni: '22222222', nombres: 'Ana Sofía', apellidos: 'Hernández Cruz' },
    { dni: '33333333', nombres: 'Carlos Alberto', apellidos: 'Mendoza Silva' }
  ]
  
  // Find if this DNI is in our test list
  const validDNI = testValidDNIs.find(item => item.dni === dni)
  
  if (validDNI) {
    console.log(`[DNI] ✅ DNI válido encontrado: ${validDNI.nombres} ${validDNI.apellidos}`)
    return {
      isValid: true,
      exists: true,
      data: validDNI
    }
  }
  
  // For any other 8-digit DNI, consider it "valid format but not found"
  if (validateDNIFormat(dni)) {
    console.log(`[DNI] ⚠️ DNI con formato válido pero no encontrado en RENIEC: ${dni}`)
    return {
      isValid: true,
      exists: false,
      error: "DNI no encontrado en RENIEC. Verifica que sea correcto."
    }
  }
  
  return {
    isValid: false,
    error: "Formato de DNI inválido"
  }
}

// Check if DNI is already registered in our system
export async function isDNIRegistered(dni: string): Promise<boolean> {
  try {
    // Import here to avoid circular dependencies
    const { getAdoptanteByDNI } = await import('./db')
    
    const existingAdoptante = await getAdoptanteByDNI(dni)
    return !!existingAdoptante
    
  } catch (error) {
    console.error('[DNI] Error checking if DNI is registered:', error)
    return false
  }
}

// Validate DNI for registration (format + exists + not already registered)
export async function validateDNIForRegistration(dni: string): Promise<DNIValidationResult> {
  try {
    // First validate format and existence
    const dniValidation = await validateDNIExists(dni)
    
    if (!dniValidation.isValid || !dniValidation.exists) {
      return dniValidation
    }
    
    // Check if already registered in our system
    const isRegistered = await isDNIRegistered(dni)
    
    if (isRegistered) {
      return {
        isValid: false,
        error: "Este DNI ya está registrado en el sistema"
      }
    }
    
    return dniValidation
    
  } catch (error) {
    console.error('[DNI] Error in full DNI validation:', error)
    return {
      isValid: false,
      error: "Error al validar el DNI. Inténtalo de nuevo."
    }
  }
}

// Generate a list of valid test DNIs for documentation
export function getTestDNIs(): string[] {
  return [
    '12345678', // Juan Carlos Pérez González
    '87654321', // María Elena García Rodríguez  
    '11111111', // Pedro José López Martínez
    '22222222', // Ana Sofía Hernández Cruz
    '33333333'  // Carlos Alberto Mendoza Silva
  ]
}