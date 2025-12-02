import { NextRequest, NextResponse } from 'next/server'
import { getAllDonations } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Obteniendo todas las donaciones...')
    
    const donations = await getAllDonations()
    
    return NextResponse.json({
      success: true,
      donations,
      total: donations.length
    })
  } catch (error) {
    console.error('[API] Error getting donations:', error)
    return NextResponse.json(
      { error: 'Error al obtener las donaciones' },
      { status: 500 }
    )
  }
}