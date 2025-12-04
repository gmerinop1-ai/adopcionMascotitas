const Culqi = require('culqi-node')

// Función para inicializar Culqi de manera lazy
let culqiInstance: any = null
let culqiInitialized = false

const initializeCulqi = () => {
  console.log('[CULQI CONFIG] Inicializando Culqi...')
  
  let secretKey = process.env.CULQI_SECRET_KEY
  
  // Fallback para la clave secreta si no se encuentra en variables de entorno
  if (!secretKey) {
    console.log('[CULQI CONFIG] Usando fallback para clave secreta')
    secretKey = 'sk_live_o1ZOCqibG4JOsNzD'
  }
  
  console.log('[CULQI CONFIG] CULQI_SECRET_KEY presente:', !!secretKey)
  console.log('[CULQI CONFIG] Clave secreta:', secretKey ? `${secretKey.substring(0, 15)}...` : 'MISSING')

  if (!secretKey) {
    console.error('[CULQI CONFIG] ❌ No se pudo obtener clave secreta')
    throw new Error('CULQI_SECRET_KEY no está configurado')
  }

  try {
    // Verificar si Culqi constructor está disponible
    if (!Culqi) {
      throw new Error('Módulo Culqi no está disponible')
    }
    
    // CORRECCIÓN: Pasar privateKey en el constructor, no con config()
    const newCulqiInstance = new Culqi({
      privateKey: secretKey
    })
    
    culqiInstance = newCulqiInstance
    culqiInitialized = true
    
    console.log('[CULQI CONFIG] ✅ Culqi configurado exitosamente con clave:', secretKey.substring(0, 15) + '...')
    console.log('[CULQI CONFIG] ✅ Métodos disponibles:', Object.keys(culqiInstance))
    return culqiInstance
  } catch (error) {
    console.error('[CULQI CONFIG] ❌ Error configurando Culqi:', error)
    console.error('[CULQI CONFIG] ❌ Tipo de error:', typeof error)
    console.error('[CULQI CONFIG] ❌ Mensaje de error:', error instanceof Error ? error.message : 'Error desconocido')
    culqiInitialized = false
    throw error
  }
}

// Getter para obtener la instancia de Culqi
export const getCulqiInstance = () => {
  return initializeCulqi()
}

// Función para forzar reinicialización (útil para debugging)
export const resetCulqiInstance = () => {
  console.log('[CULQI CONFIG] Forzando reinicialización de Culqi...')
  culqiInitialized = false
  culqiInstance = null
  return initializeCulqi()
}

// Mantener compatibilidad con el código existente
export const culqi = {
  get instance() {
    try {
      return initializeCulqi()
    } catch (error) {
      console.error('[CULQI INSTANCE] Error obteniendo instancia:', error)
      throw error
    }
  }
}

export const getCulqiPublicKey = () => {
  let publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
  
  console.log('[CULQI LIB] getCulqiPublicKey called')
  console.log('[CULQI LIB] NEXT_PUBLIC_CULQI_PUBLIC_KEY from env:', publicKey ? `Present (${publicKey.substring(0, 8)}...)` : 'MISSING')
  
  // Fallback para la clave pública si no se encuentra en variables de entorno
  if (!publicKey) {
    console.log('[CULQI LIB] Usando fallback para clave pública')
    publicKey = 'pk_live_I5HoDzRiSWhBtcnq'
  }
  
  console.log('[CULQI LIB] Clave pública final:', publicKey ? `${publicKey.substring(0, 15)}...` : 'MISSING')
  
  return publicKey
}

export const createCulqiCharge = async (data: {
  amount: number
  currency_code: string
  description: string
  source_id: string
  customer_email?: string
  metadata?: any
}) => {
  console.log('[CULQI LIB] === INICIO createCulqiCharge ===')
  
  let culqiClient
  try {
    culqiClient = getCulqiInstance()
    console.log('[CULQI LIB] ✅ Cliente Culqi inicializado')
  } catch (initError) {
    console.error('[CULQI LIB] ❌ Error inicializando Culqi:', initError)
    throw new Error('Error de configuración de Culqi: ' + initError.message)
  }
  
  try {
    console.log('[CULQI LIB] Creando cargo con datos:', {
      amount: data.amount, // Ya debe venir en centavos
      currency_code: data.currency_code,
      description: data.description,
      source_id: data.source_id ? data.source_id.substring(0, 10) + '...' : 'MISSING'
    })
    
    const chargePayload = {
      amount: data.amount, // NO convertir a centavos aquí, ya viene convertido
      currency_code: data.currency_code,
      description: data.description,
      source_id: data.source_id,
      customer_email: data.customer_email || '',
      metadata: data.metadata || {}
    }
    
    console.log('[CULQI LIB] Payload del cargo:', chargePayload)
    
    const charge = await culqiClient.charges.create(chargePayload)
    
    console.log('[CULQI LIB] ✅ Cargo creado exitosamente:', charge.id)
    console.log('[CULQI LIB] Estado del cargo:', charge.outcome?.type)
    
    return charge
  } catch (error: any) {
    console.error('[CULQI LIB] ❌ Error creating Culqi charge:', error)
    console.error('[CULQI LIB] ❌ Error message:', error.message)
    console.error('[CULQI LIB] ❌ Error details:', error.response?.data || error.response || 'No details')
    throw error
  }
}