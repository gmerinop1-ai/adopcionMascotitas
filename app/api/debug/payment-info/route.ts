import { NextRequest, NextResponse } from 'next/server'
import { getPaymentInfo } from '@/lib/mercadopago'

// Consultar información específica de un pago para debugging
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_id')
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    console.log('[PAYMENT DEBUG] Consultando pago:', paymentId)
    
    const paymentInfo = await getPaymentInfo(paymentId)
    
    // Información específica para Yape
    const debug = {
      payment_id: paymentInfo.id,
      status: paymentInfo.status,
      status_detail: paymentInfo.status_detail,
      payment_method_id: paymentInfo.payment_method_id,
      transaction_amount: paymentInfo.transaction_amount,
      currency_id: paymentInfo.currency_id,
      date_created: paymentInfo.date_created,
      date_approved: paymentInfo.date_approved,
      payer_email: paymentInfo.payer?.email,
      external_reference: paymentInfo.external_reference,
      
      // Información específica de Yape si aplica
      yape_info: paymentInfo.payment_method_id === 'yape' ? {
        is_yape: true,
        rejection_reason: getYapeRejectionReason(paymentInfo.status_detail),
        can_retry: canRetryYapePayment(paymentInfo.status_detail)
      } : null,
      
      // Info completa para debugging
      full_info: paymentInfo
    }
    
    console.log('[PAYMENT DEBUG] ✅ Info obtenida:', debug)
    
    return NextResponse.json({
      success: true,
      debug
    })
    
  } catch (error: any) {
    console.error('[PAYMENT DEBUG] ❌ Error:', error)
    return NextResponse.json(
      { error: 'Error obteniendo información del pago', details: error.message },
      { status: 500 }
    )
  }
}

function getYapeRejectionReason(statusDetail: string): string {
  switch (statusDetail) {
    case 'cc_rejected_insufficient_amount':
      return 'Saldo insuficiente en tu cuenta Yape'
    case 'cc_rejected_call_for_authorize':
      return 'Autorización requerida - contacta con Yape o tu banco'
    case 'cc_rejected_other_reason':
      return 'Pago rechazado por políticas de seguridad de Yape'
    case 'cc_rejected_card_type_not_allowed':
      return 'Tipo de cuenta o tarjeta no permitida para este comercio'
    case 'cc_rejected_max_attempts':
      return 'Máximo de intentos alcanzado - espera antes de reintentar'
    case 'cc_rejected_bad_filled_security_code':
      return 'Código OTP incorrecto'
    case 'cc_rejected_blacklist':
      return 'Transacción bloqueada por seguridad'
    case 'cc_rejected_high_risk':
      return 'Transacción de alto riesgo rechazada'
    default:
      return `Código de rechazo: ${statusDetail}`
  }
}

function canRetryYapePayment(statusDetail: string): boolean {
  const retryableErrors = [
    'cc_rejected_insufficient_amount',
    'cc_rejected_bad_filled_security_code',
    'cc_rejected_max_attempts'
  ]
  return retryableErrors.includes(statusDetail)
}