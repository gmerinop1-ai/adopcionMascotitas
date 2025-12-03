import { NextRequest, NextResponse } from 'next/server'
import { getDonationsByEmail } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    const donations = await getDonationsByEmail(email)

    // Calcular estadísticas
    const completedDonations = donations.filter(d => d.status === 'completed')
    const totalDonated = completedDonations.reduce((sum, d) => sum + Number(d.amount), 0)
    const monthlyDonations = completedDonations.filter(d => d.frequency === 'monthly').length
    const oneTimeDonations = completedDonations.filter(d => d.frequency === 'one-time').length

    return NextResponse.json({
      success: true,
      donations: donations,
      statistics: {
        totalDonated,
        totalTransactions: completedDonations.length,
        monthlyDonations,
        oneTimeDonations,
        lastDonation: donations.length > 0 ? donations[0].created_at : null
      }
    })

  } catch (error) {
    console.error('Error obteniendo donaciones por email:', error)
    return NextResponse.json(
      { error: 'Error al obtener donaciones' },
      { status: 500 }
    )
  }
}