import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[CULQI TEST] === INICIO test básico ===')
    
    // Verificar variables de entorno básicas
    const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
    const secretKey = process.env.CULQI_SECRET_KEY
    
    console.log('[CULQI TEST] Variables de entorno:')
    console.log('[CULQI TEST] - NEXT_PUBLIC_CULQI_PUBLIC_KEY:', publicKey ? 'PRESENTE' : 'FALTANTE')
    console.log('[CULQI TEST] - CULQI_SECRET_KEY:', secretKey ? 'PRESENTE' : 'FALTANTE')
    
    const result: any = {
      success: true,
      environment: {
        hasPublicKey: !!publicKey,
        hasSecretKey: !!secretKey,
        publicKeyPreview: publicKey ? publicKey.substring(0, 8) + '...' : null,
        secretKeyPreview: secretKey ? secretKey.substring(0, 8) + '...' : null,
      },
      nodeEnv: process.env.NODE_ENV
    }
    
    // Intentar importar culqi-node
    try {
      const Culqi = require('culqi-node')
      result.culqiSdk = {
        imported: true,
        version: 'available'
      }
      console.log('[CULQI TEST] ✅ culqi-node importado exitosamente')
    } catch (importError: any) {
      result.culqiSdk = {
        imported: false,
        error: importError.message
      }
      console.error('[CULQI TEST] ❌ Error importando culqi-node:', importError.message)
    }
    
    console.log('[CULQI TEST] ✅ Test completado exitosamente')
    return NextResponse.json(result)
    
  } catch (error: any) {
    console.error('[CULQI TEST] ❌ Error general en test:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error en test de Culqi',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}