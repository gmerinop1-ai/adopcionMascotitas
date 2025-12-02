import { NextRequest, NextResponse } from 'next/server'
import { checkMigrationStatus } from '@/lib/check-migrations'

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Verificando migraciones de la base de datos...')
    
    const migrationsComplete = await checkMigrationStatus()
    
    return NextResponse.json({
      success: true,
      migrationsComplete,
      message: migrationsComplete 
        ? 'Todas las migraciones están completas' 
        : 'Faltan migraciones por aplicar. Revisa la consola del servidor.'
    })
  } catch (error) {
    console.error('[API] Error verificando migraciones:', error)
    return NextResponse.json(
      { 
        success: false, 
        migrationsComplete: false,
        error: 'Error verificando migraciones',
        message: 'Revisa la configuración de la base de datos'
      },
      { status: 500 }
    )
  }
}