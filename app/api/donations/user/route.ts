import { NextRequest, NextResponse } from 'next/server'
import { getDonationsByEmail } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    console.log('[API] Obteniendo donaciones para usuario:', email)
    
    const donations = await getDonationsByEmail(email)
    
    // Calcular estadísticas solo para donaciones completadas
    const completedDonations = donations.filter(d => d.status === 'completed')
    const totalDonated = completedDonations.reduce((sum, d) => sum + d.amount, 0)
    
    const totalTransactions = completedDonations.length
    
    const monthlyDonations = completedDonations.filter(d => d.frequency === 'monthly').length
    
    const oneTimeDonations = completedDonations.filter(d => d.frequency === 'one-time').length

    return NextResponse.json({
      success: true,
      donations, // Mostrar todas las donaciones (incluyendo pendientes)
      statistics: {
        totalDonated,
        totalTransactions,
        monthlyDonations,
        oneTimeDonations,
        lastDonation: completedDonations[0]?.created_at || null
      }
    })
  } catch (error) {
    console.error('[API] Error getting user donations:', error)
    return NextResponse.json(
      { error: 'Error al obtener las donaciones del usuario' },
      { status: 500 }
    )
  }
}