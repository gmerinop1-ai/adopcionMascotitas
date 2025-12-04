import { NextRequest, NextResponse } from 'next/server'

// Verificar el estado de las credenciales de MercadoPago
export async function GET(request: NextRequest) {
  try {
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || 'APP_USR-e1376b0b-a75a-451f-b4ba-520d719ee956'
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-2581186311571159-120402-140076f8d240816da2bb4412b31f7d4a-3039852664'
    
    const isTestMode = publicKey.includes('APP_USR') || publicKey.includes('TEST')
    
    // Verificar estado de las credenciales
    const response = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!response.ok) {
      return NextResponse.json({
        error: 'No se pudieron verificar las credenciales',
        status: 'invalid'
      }, { status: 401 })
    }
    
    const userData = await response.json()
    
    return NextResponse.json({
      success: true,
      credentials: {
        type: isTestMode ? 'test' : 'production',
        isTest: isTestMode,
        publicKeyType: publicKey.includes('APP_USR') ? 'TEST' : 'PRODUCTION',
        accessTokenType: accessToken.includes('APP_USR') ? 'TEST' : 'PRODUCTION',
        user: {
          id: userData.id,
          nickname: userData.nickname,
          email: userData.email
        }
      },
      yape: {
        available: isTestMode,
        testInstructions: isTestMode ? {
          validNumbers: ['111111111', '111111112', '111111113'],
          validOTP: '123456',
          note: 'En modo de prueba, solo estos datos funcionan'
        } : {
          note: 'Para Yape real, necesitas credenciales de producción activadas'
        }
      },
      instructions: {
        howToActivateProduction: [
          '1. Ve a tu panel de MercadoPago Developers',
          '2. Selecciona tu aplicación en "Tus integraciones"',
          '3. Ve a "Credenciales" → "Productivas"',
          '4. Completa los datos requeridos y activa',
          '5. Reemplaza las credenciales en tu .env'
        ],
        currentEnv: {
          publicKey: publicKey.substring(0, 20) + '...',
          accessToken: accessToken.substring(0, 20) + '...'
        }
      }
    })
    
  } catch (error: any) {
    console.error('[CREDENTIALS CHECK] Error:', error)
    return NextResponse.json({
      error: 'Error verificando credenciales',
      details: error.message
    }, { status: 500 })
  }
}