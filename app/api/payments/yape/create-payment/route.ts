import { NextRequest, NextResponse } from 'next/server'
import { insertDonation, updateDonationStatus } from '@/lib/db'

// Crear pago con Yape usando token generado
export async function POST(request: NextRequest) {
  try {
    const { 
      token, 
      amount, 
      donor_name, 
      donor_email, 
      frequency,
      message 
    } = await request.json()
    
    if (!token || !amount || !donor_email) {
      return NextResponse.json(
        { error: 'Token, amount and email are required' },
        { status: 400 }
      )
    }

    console.log('[YAPE PAYMENT] Creando pago con token:', { token, amount, donor_email })
    
    // Crear donación en la base de datos primero
    const donation = await insertDonation({
      donor_name,
      donor_email,
      amount: parseFloat(amount),
      frequency: frequency || 'one-time',
      payment_method: 'yape',
      status: 'pending',
      message
    })

    console.log('[YAPE PAYMENT] Donación creada:', donation.id)
    
    const accessToken = 'APP_USR-2581186311571159-120402-140076f8d240816da2bb4412b31f7d4a-3039852664'
    
    // Crear el pago con MercadoPago API
    const paymentResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Idempotency-Key': `donation_${donation.id}_${Date.now()}`
      },
      body: JSON.stringify({
        token,
        transaction_amount: parseFloat(amount),
        description: frequency === 'monthly' ? 'Donación Mensual - Adopción Mascotitas' : 'Donación - Adopción Mascotitas',
        installments: 1,
        payment_method_id: 'yape',
        payer: {
          email: donor_email,
          first_name: donor_name || 'Donante',
          last_name: 'Anónimo'
        },
        external_reference: donation.id,
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payments/mercadopago/webhook`,
        metadata: {
          donation_id: donation.id,
          frequency,
          source: 'yape_direct'
        }
      })
    })
    
    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.json().catch(() => ({}))
      console.error('[YAPE PAYMENT] Error de API:', paymentResponse.status, errorData)
      
      // Marcar donación como fallida
      await updateDonationStatus(donation.id, 'failed', {
        error: 'Payment API error',
        api_response: errorData,
        timestamp: new Date().toISOString()
      })
      
      let errorMessage = 'Error procesando el pago Yape'
      if (paymentResponse.status === 400) {
        errorMessage = 'Error en los datos del pago. Verifica el OTP y número de teléfono.'
      } else if (paymentResponse.status === 401) {
        errorMessage = 'Error de autorización'
      } else if (errorData.message?.includes('cc_rejected')) {
        errorMessage = 'Pago rechazado por Yape. Verifica tu saldo y límites.'
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorData },
        { status: paymentResponse.status }
      )
    }
    
    const paymentData = await paymentResponse.json()
    console.log('[YAPE PAYMENT] ✅ Pago creado:', paymentData.id, 'Status:', paymentData.status)
    
    // Actualizar donación con datos del pago
    if (paymentData.status === 'approved') {
      await updateDonationStatus(donation.id, 'completed', {
        mercadopago_payment_id: paymentData.id,
        payment_status: paymentData.status,
        payment_method: 'yape',
        transaction_amount: paymentData.transaction_amount,
        status_detail: paymentData.status_detail,
        payment_data: paymentData,
        timestamp: new Date().toISOString()
      })
    } else if (paymentData.status === 'rejected') {
      await updateDonationStatus(donation.id, 'failed', {
        mercadopago_payment_id: paymentData.id,
        payment_status: paymentData.status,
        payment_method: 'yape',
        transaction_amount: paymentData.transaction_amount,
        status_detail: paymentData.status_detail,
        payment_data: paymentData,
        timestamp: new Date().toISOString()
      })
    }
    // Para estados pendientes, no actualizar hasta recibir webhook
    
    return NextResponse.json({
      success: true,
      donationId: donation.id,
      paymentId: paymentData.id,
      status: paymentData.status,
      statusDetail: paymentData.status_detail,
      approved: paymentData.status === 'approved',
      message: paymentData.status === 'approved' ? 
        'Pago procesado exitosamente' : 
        `Pago ${paymentData.status}: ${paymentData.status_detail}`
    })
    
  } catch (error: any) {
    console.error('[YAPE PAYMENT] ❌ Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}