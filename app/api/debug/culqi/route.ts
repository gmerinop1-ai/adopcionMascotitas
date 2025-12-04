import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[CULQI DEBUG] === DIAGNÓSTICO COMPLETO DE CULQI ===')
    
    // 1. Verificar variables de entorno
    let publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
    let secretKey = process.env.CULQI_SECRET_KEY
    const enableYape = process.env.CULQI_ENABLE_YAPE
    const environment = process.env.CULQI_ENVIRONMENT
    
    // Fallbacks para las credenciales (usando las que tienes configuradas)
    if (!publicKey) {
      console.log('[CULQI DEBUG] Usando fallback para clave pública')
      publicKey = 'pk_live_I5HoDzRiSWhBtcnq'
    }
    
    if (!secretKey) {
      console.log('[CULQI DEBUG] Usando fallback para clave secreta')
      secretKey = 'sk_live_o1ZOCqibG4JOsNzD'
    }
    
    console.log('[CULQI DEBUG] Variables de entorno:')
    console.log('- NEXT_PUBLIC_CULQI_PUBLIC_KEY:', publicKey ? `${publicKey.substring(0, 15)}...` : 'MISSING')
    console.log('- CULQI_SECRET_KEY:', secretKey ? `${secretKey.substring(0, 15)}...` : 'MISSING')
    console.log('- CULQI_ENABLE_YAPE:', enableYape)
    console.log('- CULQI_ENVIRONMENT:', environment)
    
    // 2. Detectar entorno por clave pública
    const detectedEnv = publicKey?.includes('live') ? 'PRODUCCIÓN' : publicKey?.includes('test') ? 'TEST' : 'DESCONOCIDO'
    console.log('[CULQI DEBUG] Entorno detectado:', detectedEnv)
    
    // 3. Verificar configuración de cuenta
    let accountCheck = null
    try {
      console.log('[CULQI DEBUG] Verificando cuenta con API de Culqi...')
      
      const response = await fetch('https://api.culqi.com/v2/plans', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      const statusCode = response.status
      console.log('[CULQI DEBUG] Status de API:', statusCode)
      
      if (statusCode === 200) {
        console.log('[CULQI DEBUG] ✅ Credenciales válidas')
        accountCheck = { valid: true, status: 'active' }
      } else if (statusCode === 401) {
        console.log('[CULQI DEBUG] ❌ Credenciales inválidas')
        accountCheck = { valid: false, error: 'Credenciales inválidas' }
      } else {
        console.log('[CULQI DEBUG] ⚠️ Status inusual:', statusCode)
        accountCheck = { valid: true, warning: `Status ${statusCode}` }
      }
    } catch (apiError: any) {
      console.log('[CULQI DEBUG] Error de API:', apiError.message)
      accountCheck = { valid: null, error: apiError.message }
    }
    
    // 4. Configuración recomendada para Yape
    const yapeConfig = {
      shouldBeEnabled: detectedEnv === 'PRODUCCIÓN',
      requiresAccountSetup: true,
      currentlyEnabled: enableYape === 'true',
      inProductionEnvironment: detectedEnv === 'PRODUCCIÓN',
      configurationSteps: [
        '1. Verificar que tu cuenta de Culqi tenga Yape habilitado',
        '2. Contactar soporte de Culqi si Yape no aparece: soporte@culqi.com',
        '3. Usar paymentMethods: { yape: true } en configuración',
        '4. Verificar que el monto esté dentro de límites de Yape (S/1 - S/500)',
        '5. Preguntar específicamente por la cuenta: pk_live_I5HoDzRiSWhBtcnq'
      ],
      contactInfo: {
        email: 'soporte@culqi.com',
        phone: '+51 1 700 5000',
        question: '¿Está habilitado Yape para mi cuenta pk_live_I5HoDzRiSWhBtcnq?'
      }
    }
    
    // 5. Configuración de checkout recomendada
    const recommendedCheckoutConfig = {
      script: 'https://js.culqi.com/checkout-js',
      paymentMethods: {
        tarjeta: true,
        yape: detectedEnv === 'PRODUCCIÓN',
        billetera_movil: detectedEnv === 'PRODUCCIÓN'
      },
      settings: {
        currency: 'PEN',
        lang: 'es',
        modal: true
      }
    }
    
    // 6. Generar reporte completo
    const diagnosticReport = {
      timestamp: new Date().toISOString(),
      environment: {
        detected: detectedEnv,
        configured: environment,
        isProduction: detectedEnv === 'PRODUCCIÓN'
      },
      credentials: {
        publicKeyPresent: !!publicKey,
        secretKeyPresent: !!secretKey,
        publicKeyPrefix: publicKey?.substring(0, 8),
        valid: accountCheck?.valid
      },
      yapeConfiguration: {
        environmentVariable: enableYape === 'true',
        supportedInEnvironment: detectedEnv === 'PRODUCCIÓN',
        ...yapeConfig
      },
      accountStatus: accountCheck,
      recommendedConfig: recommendedCheckoutConfig,
      troubleshooting: {
        commonIssues: [
          'Yape no habilitado en cuenta de Culqi',
          'Script de checkout incorrecto',
          'Configuración de paymentMethods incorrecta',
          'Credenciales de test en lugar de producción'
        ],
        solutions: [
          'Verificar con soporte de Culqi que Yape esté habilitado',
          'Usar script https://js.culqi.com/checkout-js',
          'Configurar paymentMethods.yape = true',
          'Usar credenciales pk_live_ para producción'
        ]
      }
    }
    
    console.log('[CULQI DEBUG] Reporte generado:', diagnosticReport)
    
    return NextResponse.json({
      success: true,
      diagnostic: diagnosticReport
    })
    
  } catch (error: any) {
    console.error('[CULQI DEBUG] Error en diagnóstico:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error en diagnóstico de Culqi',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testAmount, testEmail } = await request.json()
    
    console.log('[CULQI DEBUG] === PRUEBA DE CONFIGURACIÓN ===')
    console.log('Monto de prueba:', testAmount)
    console.log('Email de prueba:', testEmail)
    
    // Simular configuración de checkout
    const checkoutSimulation = {
      publicKey: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY,
      settings: {
        title: 'Prueba - Donación',
        currency: 'PEN',
        amount: Math.round((testAmount || 10) * 100),
        description: 'Donación de prueba'
      },
      paymentMethods: {
        tarjeta: true,
        yape: process.env.CULQI_ENVIRONMENT === 'production',
        billetera_movil: process.env.CULQI_ENVIRONMENT === 'production'
      }
    }
    
    return NextResponse.json({
      success: true,
      simulation: checkoutSimulation,
      instructions: {
        message: 'Configuración simulada generada',
        yapeAvailable: checkoutSimulation.paymentMethods.yape,
        nextSteps: checkoutSimulation.paymentMethods.yape 
          ? 'Yape debería aparecer en el checkout'
          : 'Contacta soporte de Culqi para habilitar Yape'
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}