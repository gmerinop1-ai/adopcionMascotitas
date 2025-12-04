import { MercadoPagoConfig, Preference } from 'mercadopago'

// Configuración de MercadoPago
let mercadopagoInstance: MercadoPagoConfig | null = null

const initializeMercadoPago = () => {
  console.log('[MERCADOPAGO CONFIG] Inicializando MercadoPago...')
  
  // Usar claves de producción directamente hasta que se reinicie el servidor
  const accessToken = 'APP_USR-2581186311571159-120402-140076f8d240816da2bb4412b31f7d4a-3039852664'
  const publicKey = 'APP_USR-e1376b0b-a75a-451f-b4ba-520d719ee956'
  
  console.log('[MERCADOPAGO CONFIG] Usando claves directas de producción')
  console.log('[MERCADOPAGO CONFIG] ACCESS_TOKEN:', accessToken.substring(0, 30) + '...')
  console.log('[MERCADOPAGO CONFIG] PUBLIC_KEY:', publicKey.substring(0, 30) + '...')
  console.log('[MERCADOPAGO CONFIG] Tipo de token: PRODUCCIÓN')

  if (!accessToken) {
    console.error('[MERCADOPAGO CONFIG] ❌ ACCESS_TOKEN no disponible')
    throw new Error('ACCESS_TOKEN no está configurado')
  }

  try {
    console.log('[MERCADOPAGO CONFIG] Creando nueva instancia de MercadoPago...')
    
    mercadopagoInstance = new MercadoPagoConfig({
      accessToken: accessToken,
      options: {
        timeout: 10000, // Incrementar timeout a 10 segundos
        // NO usar idempotencyKey fijo - puede causar problemas
      }
    })
    
    console.log('[MERCADOPAGO CONFIG] ✅ MercadoPago configurado exitosamente')
    return mercadopagoInstance
  } catch (error) {
    console.error('[MERCADOPAGO CONFIG] ❌ Error configurando MercadoPago:', error)
    console.error('[MERCADOPAGO CONFIG] ❌ Error detalles:', error instanceof Error ? error.message : 'Error desconocido')
    throw error
  }
}

// Getter para obtener la instancia de MercadoPago
export const getMercadoPagoInstance = () => {
  // Crear siempre una nueva instancia para evitar problemas de estado
  return initializeMercadoPago()
}

// Función para crear preferencia de pago
export const createPreference = async (data: {
  amount: number
  description: string
  donor_email?: string
  donor_name?: string
  donation_id: string
  external_reference?: string
}) => {
  console.log('[MERCADOPAGO LIB] === INICIO createPreference ===')
  console.log('[MERCADOPAGO LIB] Datos recibidos:', {
    amount: data.amount,
    description: data.description,
    donor_email: data.donor_email,
    donor_name: data.donor_name,
    donation_id: data.donation_id
  })
  
  try {
    console.log('[MERCADOPAGO LIB] Obteniendo cliente MercadoPago...')
    const client = getMercadoPagoInstance()
    
    console.log('[MERCADOPAGO LIB] Creando instancia de Preference...')
    const preference = new Preference(client)
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    console.log('[MERCADOPAGO LIB] Base URL:', baseUrl)
    
    const preferenceData = {
      items: [
        {
          id: data.donation_id,
          title: data.description,
          quantity: 1,
          unit_price: data.amount,
          currency_id: 'PEN'
        }
      ],
      payer: {
        email: data.donor_email || '',
        name: data.donor_name || 'Donante Anónimo'
      },
      back_urls: {
        success: `${baseUrl}/donaciones/exito?donation_id=${data.donation_id}`,
        failure: `${baseUrl}/donaciones?error=payment_failed`,
        pending: `${baseUrl}/donaciones?status=pending`
      },
      // Remover auto_return para evitar problemas
      external_reference: data.external_reference || data.donation_id,
      notification_url: `${baseUrl}/api/payments/mercadopago/webhook`,
      statement_descriptor: 'ADOPCION MASCOTAS',
      // Configuraciones adicionales
      payment_methods: {
        excluded_payment_types: [],
        excluded_payment_methods: [],
        installments: 12, // Hasta 12 cuotas
        default_installments: 1
      },
      shipments: {
        cost: 0,
        mode: 'not_specified'
      }
    }

    console.log('[MERCADOPAGO LIB] Datos de preferencia preparados:', {
      items: preferenceData.items,
      amount: data.amount,
      currency: 'PEN',
      external_reference: preferenceData.external_reference
    })
    
    console.log('[MERCADOPAGO LIB] Enviando request a MercadoPago...')
    const result = await preference.create({ body: preferenceData })
    
    console.log('[MERCADOPAGO LIB] ✅ Preferencia creada exitosamente')
    console.log('[MERCADOPAGO LIB] ID de preferencia:', result.id)
    console.log('[MERCADOPAGO LIB] Init point:', result.init_point)
    
    return result
  } catch (error: any) {
    console.error('[MERCADOPAGO LIB] ❌ Error creating preference - Error completo:', error)
    
    // Log más detallado del error
    if (error.response) {
      console.error('[MERCADOPAGO LIB] ❌ Response status:', error.response.status)
      console.error('[MERCADOPAGO LIB] ❌ Response data:', error.response.data)
      console.error('[MERCADOPAGO LIB] ❌ Response headers:', error.response.headers)
    }
    
    if (error.request) {
      console.error('[MERCADOPAGO LIB] ❌ Request data:', error.request)
    }
    
    console.error('[MERCADOPAGO LIB] ❌ Error message:', error.message)
    console.error('[MERCADOPAGO LIB] ❌ Error stack:', error.stack)
    
    // Determinar el tipo de error más específico
    let errorMessage = error.message || 'Error desconocido al crear preferencia'
    
    if (error.response?.status === 401) {
      errorMessage = 'invalid access token'
    } else if (error.response?.status === 403) {
      errorMessage = 'access forbidden - token may be expired or invalid'
    } else if (error.response?.status === 400) {
      errorMessage = `invalid request data: ${error.response?.data?.message || 'unknown validation error'}`
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      errorMessage = 'network connection error'
    }
    
    // Relanzar con mensaje más claro
    const enhancedError = new Error(errorMessage)
    enhancedError.stack = error.stack
    throw enhancedError
  }
}

// Función para obtener información del pago
export const getPaymentInfo = async (paymentId: string) => {
  console.log('[MERCADOPAGO LIB] === INICIO getPaymentInfo ===')
  
  try {
    const client = getMercadoPagoInstance()
    
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Error fetching payment: ${response.statusText}`)
    }
    
    const payment = await response.json()
    console.log('[MERCADOPAGO] ✅ Información de pago obtenida:', payment.id)
    
    return payment
  } catch (error: any) {
    console.error('[MERCADOPAGO LIB] ❌ Error getting payment info:', error)
    throw error
  }
}

export const getMercadoPagoPublicKey = () => {
  // Usar clave de producción directamente
  const publicKey = 'APP_USR-e1376b0b-a75a-451f-b4ba-520d719ee956'
  console.log('[MERCADOPAGO LIB] getMercadoPagoPublicKey called')
  console.log('[MERCADOPAGO LIB] PUBLIC_KEY:', publicKey ? `Present (${publicKey.substring(0, 30)}...)` : 'MISSING')
  
  if (!publicKey) {
    console.error('[MERCADOPAGO LIB] Missing MercadoPago public key')
    throw new Error('Missing MercadoPago public key')
  }
  return publicKey
}