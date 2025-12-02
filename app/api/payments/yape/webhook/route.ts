import { NextRequest, NextResponse } from 'next/server'
import { updateDonationStatus } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[YAPE SIMULATION] Webhook recibido:', body)
    
    const { reference, status, transaction_id, amount, yape_code, recipient_phone, error_code, message: errorMessage } = body
    
    if (status === 'completed' || status === 'paid') {
      await updateDonationStatus(reference, 'completed', {
        yape_transaction_id: transaction_id,
        yape_code,
        recipient_phone,
        webhook_data: body,
        simulation: true // Marcar como simulación
      })
      
      console.log(`[YAPE SIMULATION] Donación ${reference} marcada como completada`)
      
      // Simular notificación a la app Yape (solo log)
      console.log(`[YAPE SIMULATION] 📱 Notificación enviada a Yape:`, {
        tipo: 'PAGO_RECIBIDO',
        monto: amount,
        destinatario: recipient_phone,
        concepto: 'Donación - Adopción Mascotitas',
        transaccion_id: transaction_id
      })
      
    } else if (status === 'failed' || status === 'cancelled') {
      await updateDonationStatus(reference, 'failed', {
        yape_transaction_id: transaction_id,
        error_code,
        error_message: errorMessage,
        webhook_data: body,
        simulation: true
      })
      
      console.log(`[YAPE SIMULATION] Donación ${reference} marcada como fallida: ${errorMessage}`)
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('[YAPE SIMULATION] Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Error procesando webhook simulado' },
      { status: 500 }
    )
  }
}