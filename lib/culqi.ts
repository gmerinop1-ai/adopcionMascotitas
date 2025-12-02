const Culqi = require('culqi-node')

// Función para inicializar Culqi de manera lazy
let culqiInstance: any = null
let culqiInitialized = false

const initializeCulqi = () => {
  if (culqiInitialized) {
    return culqiInstance
  }

  console.log('[CULQI CONFIG] Inicializando Culqi...')
  console.log('[CULQI CONFIG] CULQI_SECRET_KEY presente:', !!process.env.CULQI_SECRET_KEY)
  console.log('[CULQI CONFIG] NEXT_PUBLIC_CULQI_PUBLIC_KEY presente:', !!process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY)

  if (!process.env.CULQI_SECRET_KEY) {
    console.error('[CULQI CONFIG] ❌ CULQI_SECRET_KEY no encontrada')
    throw new Error('CULQI_SECRET_KEY no está configurado')
  }

  try {
    culqiInstance = new Culqi()
    culqiInstance.config({
      private_key: process.env.CULQI_SECRET_KEY
    })
    culqiInitialized = true
    console.log('[CULQI CONFIG] ✅ Culqi configurado exitosamente')
    return culqiInstance
  } catch (error) {
    console.error('[CULQI CONFIG] ❌ Error configurando Culqi:', error)
    throw error
  }
}

// Getter para obtener la instancia de Culqi
export const getCulqiInstance = () => {
  return initializeCulqi()
}

// Mantener compatibilidad con el código existente
export const culqi = {
  get instance() {
    return initializeCulqi()
  }
}

export const getCulqiPublicKey = () => {
  const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
  console.log('[CULQI LIB] getCulqiPublicKey called')
  console.log('[CULQI LIB] NEXT_PUBLIC_CULQI_PUBLIC_KEY:', publicKey ? `Present (${publicKey.substring(0, 8)}...)` : 'MISSING')
  
  if (!publicKey) {
    console.error('[CULQI LIB] Missing Culqi public key - todas las env vars:', Object.keys(process.env).filter(key => key.includes('CULQI')))
    throw new Error('Missing Culqi public key')
  }
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