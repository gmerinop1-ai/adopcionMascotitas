import { NextRequest, NextResponse } from 'next/server'

// Consultar pagos recientes de MercadoPago para debugging
export async function GET(request: NextRequest) {
  try {
    const accessToken = 'APP_USR-2581186311571159-120402-140076f8d240816da2bb4412b31f7d4a-3039852664'
    
    // Obtener pagos recientes (últimas 24 horas)
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    
    const response = await fetch(`https://api.mercadopago.com/v1/payments/search?begin_date=${yesterday.toISOString()}&end_date=${today.toISOString()}&sort=date_created&criteria=desc&limit=50`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Error consulting payments: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Filtrar y formatear pagos de Yape
    const yapePayments = data.results?.filter((payment: any) => 
      payment.payment_method_id === 'yape'
    ).map((payment: any) => ({
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      transaction_amount: payment.transaction_amount,
      date_created: payment.date_created,
      payer_email: payment.payer?.email,
      external_reference: payment.external_reference,
      rejection_reason: getYapeRejectionReason(payment.status_detail),
      description: payment.description
    })) || []
    
    console.log('[RECENT PAYMENTS] Pagos Yape encontrados:', yapePayments.length)
    
    return NextResponse.json({
      success: true,
      total_payments: data.paging?.total || 0,
      yape_payments: yapePayments,
      last_24h: {
        approved: yapePayments.filter((p: any) => p.status === 'approved').length,
        rejected: yapePayments.filter((p: any) => p.status === 'rejected').length,
        pending: yapePayments.filter((p: any) => p.status === 'pending').length
      }
    })
    
  } catch (error: any) {
    console.error('[RECENT PAYMENTS] ❌ Error:', error)
    return NextResponse.json(
      { error: 'Error consultando pagos recientes', details: error.message },
      { status: 500 }
    )
  }
}

function getYapeRejectionReason(statusDetail: string): string {
  switch (statusDetail) {
    case 'cc_rejected_insufficient_amount':
      return 'Saldo insuficiente en Yape'
    case 'cc_rejected_call_for_authorize':
      return 'Autorización requerida'
    case 'cc_rejected_other_reason':
      return 'Rechazado por políticas de Yape'
    case 'cc_rejected_card_type_not_allowed':
      return 'Tipo de cuenta no permitida'
    case 'cc_rejected_max_attempts':
      return 'Máximo de intentos alcanzado'
    case 'cc_rejected_bad_filled_security_code':
      return 'Código OTP incorrecto'
    case 'cc_rejected_blacklist':
      return 'Transacción bloqueada'
    case 'cc_rejected_high_risk':
      return 'Transacción de alto riesgo'
    default:
      return `Código: ${statusDetail}`
  }
}