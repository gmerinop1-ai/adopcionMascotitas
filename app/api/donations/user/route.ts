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
    
    const allDonations = await getDonationsByEmail(email)
    
    // Filtrar solo donaciones completadas
    const donations = allDonations.filter(d => d.status === 'completed')
    
    // Calcular estadísticas
    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0)
    
    const totalTransactions = donations.length
    
    const monthlyDonations = donations.filter(d => d.frequency === 'monthly').length
    
    const oneTimeDonations = donations.filter(d => d.frequency === 'one-time').length

    return NextResponse.json({
      success: true,
      donations,
      statistics: {
        totalDonated,
        totalTransactions,
        monthlyDonations,
        oneTimeDonations,
        lastDonation: donations[0]?.created_at || null
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