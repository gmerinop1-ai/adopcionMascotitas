import { NextRequest, NextResponse } from 'next/server'
import { getPaymentInfo } from '@/lib/mercadopago'
import { updateDonationStatus } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('[MERCADOPAGO WEBHOOK] === INICIO webhook ===')
    
    const body = await request.json()
    console.log('[MERCADOPAGO WEBHOOK] Notificación recibida:', JSON.stringify(body, null, 2))
    
    // MercadoPago envía diferentes tipos de notificaciones
    if (body.type === 'payment') {
      const paymentId = body.data?.id
      
      if (!paymentId) {
        console.error('[MERCADOPAGO WEBHOOK] ❌ No se recibió payment ID')
        return NextResponse.json({ error: 'Payment ID missing' }, { status: 400 })
      }
      
      console.log('[MERCADOPAGO WEBHOOK] Procesando pago ID:', paymentId)
      
      // Obtener información completa del pago
      const paymentInfo = await getPaymentInfo(paymentId.toString())
      
      console.log('[MERCADOPAGO WEBHOOK] Información del pago:', {
        id: paymentInfo.id,
        status: paymentInfo.status,
        external_reference: paymentInfo.external_reference,
        transaction_amount: paymentInfo.transaction_amount
      })
      
      // Extraer donation_id del external_reference
      const donationId = paymentInfo.external_reference
      
      if (!donationId) {
        console.error('[MERCADOPAGO WEBHOOK] ❌ No se encontró donation_id en external_reference')
        return NextResponse.json({ error: 'Donation ID not found' }, { status: 400 })
      }
      
      // Determinar el estado basado en el status del pago
      let newStatus: 'completed' | 'failed' = 'failed' // valor por defecto
      let shouldUpdate = true
      
      switch (paymentInfo.status) {
        case 'approved':
          newStatus = 'completed'
          break
        case 'rejected':
        case 'cancelled':
          newStatus = 'failed'
          break
        case 'pending':
        case 'in_process':
        case 'in_mediation':
          // Para estados pendientes, no actualizar el estado principal pero sí guardar la información
          shouldUpdate = false
          console.log('[MERCADOPAGO WEBHOOK] Pago pendiente, no actualizando estado principal')
          break
        default:
          console.log('[MERCADOPAGO WEBHOOK] Estado desconocido:', paymentInfo.status)
          shouldUpdate = false
      }
      
      // Actualizar estado de la donación solo si es final
      if (shouldUpdate) {
        try {
          await updateDonationStatus(donationId, newStatus, {
            mercadopago_payment_id: paymentInfo.id,
            mercadopago_data: paymentInfo,
            payment_status: paymentInfo.status,
            payment_method: paymentInfo.payment_method_id,
            transaction_amount: paymentInfo.transaction_amount,
            net_received_amount: paymentInfo.transaction_details?.net_received_amount,
            timestamp: new Date().toISOString()
          })
          
          console.log('[MERCADOPAGO WEBHOOK] ✅ Donación actualizada:', {
            donationId,
            newStatus,
            paymentId: paymentInfo.id
          })
        } catch (dbError: any) {
          console.error('[MERCADOPAGO WEBHOOK] ❌ Error al actualizar donación:', dbError)
          return NextResponse.json(
            { error: 'Database update failed', details: dbError.message },
            { status: 500 }
          )
        }
      } else {
        console.log('[MERCADOPAGO WEBHOOK] Estado pendiente o desconocido, solo registrando información')
        // Aquí podrías agregar lógica para registrar la información sin cambiar el estado principal
      }
      
      return NextResponse.json({ 
        success: true, 
        processed: shouldUpdate,
        donation_id: donationId,
        payment_status: shouldUpdate ? newStatus : 'pending'
      })
    }
    
    // Para otros tipos de notificaciones, simplemente confirmar recepción
    console.log('[MERCADOPAGO WEBHOOK] Tipo de notificación no procesada:', body.type)
    return NextResponse.json({ success: true, processed: false })
    
  } catch (error: any) {
    console.error('[MERCADOPAGO WEBHOOK] ❌ Error procesando webhook:', error)
    console.error('[MERCADOPAGO WEBHOOK] ❌ Error message:', error.message)
    
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// Manejar GET para verificación de webhook
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'MercadoPago webhook endpoint active',
    timestamp: new Date().toISOString()
  })
}