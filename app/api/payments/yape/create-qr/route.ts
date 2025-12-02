import { NextRequest, NextResponse } from 'next/server'
import { insertDonation } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { amount, frequency, donor_name, donor_email, message, yape_code } = await request.json()
    
    console.log('[YAPE SIMULATION] Procesando pago simulado:', { amount, frequency, donor_name, donor_email, yape_code })
    
    // Validaciones
    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'El monto mínimo es S/ 1.00' },
        { status: 400 }
      )
    }

    if (!yape_code || yape_code.length !== 6) {
      return NextResponse.json(
        { error: 'El código de aprobación Yape debe tener 6 dígitos' },
        { status: 400 }
      )
    }
    
    // Crear donación en base de datos
    const donation = await insertDonation({
      donor_name,
      donor_email,
      amount,
      frequency,
      payment_method: 'yape',
      status: 'pending',
      message
    })
    
    // Simular tiempo de procesamiento (1-3 segundos)
    const processingTime = Math.random() * 2000 + 1000
    
    // Simular validación del código Yape
    const isValidCode = await simulateYapeCodeValidation(yape_code)
    
    if (!isValidCode) {
      // Actualizar donación como fallida
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payments/yape/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: donation.id,
          status: 'failed',
          transaction_id: `YAPE_${Date.now()}`,
          amount,
          error_code: 'INVALID_CODE',
          message: 'Código de aprobación inválido'
        })
      })
      
      return NextResponse.json(
        { error: 'Código de aprobación inválido. Verifica e intenta nuevamente.' },
        { status: 400 }
      )
    }
    
    // Simular procesamiento exitoso después del tiempo de espera
    setTimeout(async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payments/yape/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: donation.id,
            status: 'completed',
            transaction_id: `YAPE_${Date.now()}`,
            amount,
            yape_code,
            recipient_phone: '987654321', // Número simulado de la ONG
            timestamp: new Date().toISOString()
          })
        })
      } catch (error) {
        console.error('Error en simulación de webhook:', error)
      }
    }, processingTime)
    
    return NextResponse.json({
      success: true,
      donationId: donation.id,
      transactionId: `YAPE_${Date.now()}`,
      amount,
      status: 'processing',
      estimatedTime: Math.round(processingTime / 1000),
      recipient: {
        name: 'ONG Adopción Mascotitas',
        phone: '987654321'
      },
      message: 'Procesando tu donación Yape...'
    })
    
  } catch (error) {
    console.error('[YAPE SIMULATION] Error:', error)
    return NextResponse.json(
      { error: 'Error al procesar el pago Yape' },
      { status: 500 }
    )
  }
}

// Función para simular validación del código Yape
async function simulateYapeCodeValidation(code: string): Promise<boolean> {
  // Simular validación del código (90% de éxito para testing)
  await new Promise(resolve => setTimeout(resolve, 500)) // Simular latencia de API
  
  // Códigos que siempre fallan (para testing)
  if (['000000', '111111', '123456'].includes(code)) {
    return false
  }
  
  // 90% de probabilidad de éxito
  return Math.random() > 0.1
}