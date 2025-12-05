import { NextRequest, NextResponse } from "next/server"
import { insertDonation } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      donor_name,
      donor_email,
      amount,
      frequency,
      payment_method,
      status = 'pending',
      message,
      culqi_token_id,
      yape_transaction_id,
      transaction_data
    } = body

    console.log('[DONATION] Creando donación pendiente:', {
      donor_name,
      donor_email,
      amount,
      frequency,
      status
    })

    // Validaciones básicas
    if (!donor_email || !amount || !frequency || !payment_method) {
      return NextResponse.json(
        { error: 'Datos requeridos: donor_email, amount, frequency, payment_method' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a 0' },
        { status: 400 }
      )
    }

    // Crear donación en la base de datos
    const donationData = {
      donor_name: donor_name || 'Anónimo',
      donor_email,
      amount: parseFloat(amount),
      frequency,
      payment_method,
      status,
      message: message || '',
      culqi_token_id,
      yape_transaction_id,
      transaction_data: transaction_data ? JSON.stringify(transaction_data) : null
    }

    const donation = await insertDonation(donationData)

    console.log('[DONATION] ✅ Donación pendiente creada:', donation.id)

    return NextResponse.json(
      {
        success: true,
        message: 'Donación registrada como pendiente',
        donation: {
          id: donation.id,
          amount: donation.amount,
          frequency: donation.frequency,
          status: donation.status,
          created_at: donation.created_at
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('[DONATION] Error creando donación pendiente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}