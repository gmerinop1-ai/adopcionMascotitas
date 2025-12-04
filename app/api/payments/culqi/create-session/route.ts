import { NextRequest, NextResponse } from 'next/server'
import { insertDonation } from '@/lib/db'

const CULQI_PUBLIC_KEY = 'pk_live_I5HoDzRiSWhBtcnq'
const CULQI_SECRET_KEY = 'sk_live_o1ZOCqibG4JOsNzD'

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
    
    // Obtener claves con fallbacks
    const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || CULQI_PUBLIC_KEY
    const secretKey = process.env.CULQI_SECRET_KEY || CULQI_SECRET_KEY
    
    console.log('[CULQI API] Clave pública:', publicKey ? 'Presente' : 'Faltante')
    console.log('[CULQI API] Clave secreta:', secretKey ? 'Presente' : 'Faltante')
    
    if (!publicKey || !secretKey) {
      return NextResponse.json(
        { error: 'Configuración de Culqi incompleta' },
        { status: 500 }
      )
    }
    
    // Crear donación en base de datos
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

    console.log('[CULQI API] ✅ Donación creada:', donation.id)
    
    // Configurar los datos para el formulario de Culqi
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
    
    const finalResponse = { 
      success: true,
      donationId: donation.id,
      culqiData,
      publicKey: publicKey
    }
    
    console.log('[CULQI API] ✅ Retornando respuesta exitosa')
    return NextResponse.json(finalResponse)
    
  } catch (error: any) {
    console.error('[CULQI API] ❌ Error:', error)
    
    let errorMessage = 'Error al preparar el pago'
    
    if (error.message?.includes('relation') || error.message?.includes('donacion')) {
      errorMessage = 'Error de base de datos: tabla donacion no encontrada'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message
      },
      { status: 500 }
    )
  }
}