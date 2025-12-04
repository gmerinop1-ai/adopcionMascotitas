import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('[TEST-PAYMENT] === INICIANDO DIAGNÓSTICO ===')
    
    // Verificar variables de entorno
    const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
    const secretKey = process.env.CULQI_SECRET_KEY
    
    console.log('[TEST-PAYMENT] Variables de entorno:')
    console.log('[TEST-PAYMENT] - NEXT_PUBLIC_CULQI_PUBLIC_KEY:', publicKey ? 'PRESENT' : 'MISSING')
    console.log('[TEST-PAYMENT] - CULQI_SECRET_KEY:', secretKey ? 'PRESENT' : 'MISSING')
    
    // Verificar conexión con Culqi
    let culqiStatus = 'OK'
    let culqiError = null
    
    try {
      const { culqi } = await import('@/lib/culqi')
      console.log('[TEST-PAYMENT] - Importación Culqi:', 'OK')
      console.log('[TEST-PAYMENT] - Tipo culqi:', typeof culqi)
      console.log('[TEST-PAYMENT] - culqi.instance:', typeof culqi.instance)
    } catch (error: any) {
      culqiStatus = 'ERROR'
      culqiError = error.message
      console.error('[TEST-PAYMENT] - Error Culqi:', error)
    }
    
    // Verificar base de datos
    let dbStatus = 'OK'
    let dbError = null
    
    try {
      const { insertDonation } = await import('@/lib/db')
      console.log('[TEST-PAYMENT] - Importación DB:', 'OK')
    } catch (error: any) {
      dbStatus = 'ERROR'
      dbError = error.message
      console.error('[TEST-PAYMENT] - Error DB:', error)
    }
    
    const diagnosticResult = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      server: 'Running',
      culqi: {
        status: culqiStatus,
        error: culqiError,
        publicKey: publicKey ? `${publicKey.substring(0, 10)}...` : null,
        secretKey: secretKey ? `${secretKey.substring(0, 10)}...` : null
      },
      database: {
        status: dbStatus,
        error: dbError
      }
    }
    
    console.log('[TEST-PAYMENT] ✅ Diagnóstico completo:', diagnosticResult)
    
    return NextResponse.json(diagnosticResult)
    
  } catch (error: any) {
    console.error('[TEST-PAYMENT] ❌ Error crítico:', error)
    
    return NextResponse.json({
      error: 'Error crítico en diagnóstico',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[TEST-PAYMENT] === PRUEBA DE PAGO ===')
    
    const body = await request.json()
    console.log('[TEST-PAYMENT] Datos recibidos:', body)
    
    const { amount = 10.00 } = body
    
    // Simular creación de sesión simple
    const mockDonationData = {
      amount,
      frequency: 'one-time',
      donor_name: 'Test User',
      donor_email: 'test@test.com',
      message: 'Test donation'
    }
    
    console.log('[TEST-PAYMENT] Creando sesión de prueba con:', mockDonationData)
    
    // No hacer llamada interna para evitar bucles
    console.log('[TEST-PAYMENT] ✅ Prueba completada - datos preparados')
    
    return NextResponse.json({
      success: true,
      message: 'Datos de prueba preparados correctamente',
      mockData: mockDonationData,
      note: 'Para prueba real, usar la página /donaciones'
    })
    
  } catch (error: any) {
    console.error('[TEST-PAYMENT] ❌ Error en prueba POST:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error en prueba de pago',
      details: error.message
    }, { status: 500 })
  }
}