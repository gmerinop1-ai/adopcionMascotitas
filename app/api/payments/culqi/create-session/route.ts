import { NextRequest, NextResponse } from 'next/server'
import { culqi } from '@/lib/culqi'
import { insertDonation } from '@/lib/db'

// Force redeploy - fixed SWC compilation error

export async function POST(request: NextRequest) {
  try {
    console.log('[CULQI API] === INICIO create-session ===')
    
    const { amount, frequency, donor_name, donor_email, message } = await request.json()
    
    console.log('[CULQI API] Datos recibidos:', { amount, frequency, donor_name, donor_email })
    
    // Validaciones
    if (!amount || amount < 1) {
      console.error('[CULQI API] Monto inválido:', amount)
      return NextResponse.json(
        { error: 'El monto mínimo es S/ 1.00' },
        { status: 400 }
      )
    }
    
    // Verificar variables de entorno con logs detallados
    console.log('[CULQI API] Verificando variables de entorno...')
    console.log('[CULQI API] process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY:', process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY)
    console.log('[CULQI API] process.env.CULQI_SECRET_KEY:', process.env.CULQI_SECRET_KEY ? 'PRESENT' : 'MISSING')
    
    let publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
    let secretKey = process.env.CULQI_SECRET_KEY
    
    // Fallbacks para las credenciales de producción
    if (!publicKey) {
      console.log('[CULQI API] Usando fallback para clave pública')
      publicKey = 'pk_live_I5HoDzRiSWhBtcnq'
    }
    
    if (!secretKey) {
      console.log('[CULQI API] Usando fallback para clave secreta')
      secretKey = 'sk_live_o1ZOCqibG4JOsNzD'
    }
    
    console.log('[CULQI API] Clave pública final:', publicKey ? `${publicKey.substring(0, 15)}...` : 'FALTANTE')
    console.log('[CULQI API] Clave secreta final:', secretKey ? `${secretKey.substring(0, 15)}...` : 'FALTANTE')
    
    if (!publicKey) {
      console.error('[CULQI API] ❌ No se pudo obtener clave pública')
      return NextResponse.json(
        { error: 'Configuración de Culqi incompleta - clave pública faltante' },
        { status: 500 }
      )
    }
    
    if (!secretKey) {
      console.error('[CULQI API] ❌ No se pudo obtener clave secreta')  
      return NextResponse.json(
        { error: 'Configuración de Culqi incompleta - clave secreta faltante' },
        { status: 500 }
      )
    }
    
    console.log('[CULQI API] ✅ Variables de entorno OK')
    
    // Configurar Culqi con la clave secreta (actualizar instancia si es necesario)
    try {
      console.log('[CULQI API] Configurando cliente Culqi...')
      console.log('[CULQI API] Verificando importación de culqi:', typeof culqi)
      console.log('[CULQI API] culqi object:', culqi)
      
      // Forzar reinicialización con la clave secreta correcta
      process.env.CULQI_SECRET_KEY = secretKey
      
      console.log('[CULQI API] Accediendo a culqi.instance...')
      const culqiClient = culqi.instance
      console.log('[CULQI API] ✅ Cliente Culqi obtenido:', typeof culqiClient)
      console.log('[CULQI API] Métodos disponibles:', culqiClient ? Object.keys(culqiClient) : 'Cliente es null/undefined')
    } catch (culqiError) {
      console.error('[CULQI API] ❌ Error configurando Culqi:', culqiError)
      console.error('[CULQI API] ❌ Stack trace:', culqiError instanceof Error ? culqiError.stack : 'No stack trace')
      return NextResponse.json(
        { error: 'Error configurando sistema de pagos' },
        { status: 500 }
      )
    }
    
    // Crear donación en base de datos primero
    console.log('[CULQI API] Insertando donación en BD...')
    const donation = await insertDonation({
      donor_name,
      donor_email,
      amount,
      frequency,
      payment_method: 'culqi',
      status: 'pending',
      message
    })

    console.log('[CULQI API] ✅ Donación creada:', donation.id)    // Configurar los datos para el formulario de Culqi
    const culqiData = {
      amount: Math.round(amount * 100), // Culqi usa centavos
      currency_code: 'PEN',
      description: frequency === 'monthly' 
        ? 'Donación Mensual - Adopción Mascotitas' 
        : 'Donación - Adopción Mascotitas',
      donor_email,
      donor_name,
      donation_id: donation.id,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donaciones/exito?donation_id=${donation.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donaciones?canceled=true`
    }
    
    console.log('[CULQI] Datos preparados para frontend:', {
      donationId: donation.id,
      amount: culqiData.amount,
      publicKey: publicKey ? 'Present' : 'Missing'
    })
    
    // Verificar nuevamente que tenemos la clave pública
    if (!publicKey) {
      console.error('[CULQI API] ❌ No hay clave pública disponible')
      throw new Error('NEXT_PUBLIC_CULQI_PUBLIC_KEY no está configurado')
    }

    console.log('[CULQI API] ✅ Retornando respuesta exitosa')
    
    const finalResponse = { 
      success: true,
      donationId: donation.id,
      culqiData,
      publicKey: publicKey
    }
    
    console.log('[CULQI API] Respuesta final:', JSON.stringify(finalResponse, null, 2))
    
    return NextResponse.json(finalResponse)
    
  } catch (error) {
    console.error('[CULQI API] ❌ Error completo:', error)
    console.error('[CULQI API] ❌ Error message:', error.message)
    console.error('[CULQI API] ❌ Stack trace:', error.stack)
    
    // Determinar tipo específico de error
    let errorMessage = 'Error al preparar el pago'
    
    if (error.message?.includes('relation') || error.message?.includes('donacion')) {
      errorMessage = 'Error de base de datos: tabla donacion no encontrada'
    } else if (error.message?.includes('CULQI') || error.message?.includes('culqi')) {
      errorMessage = 'Error de configuración de Culqi'
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Error de conexión'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message // Solo para desarrollo
      },
      { status: 500 }
    )
  }
}