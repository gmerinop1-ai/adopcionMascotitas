import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();
    
    console.log('🔍 Debug Yape Test - Datos recibidos:', {
      phone,
      otp,
      timestamp: new Date().toISOString()
    });

    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    console.log('🔑 Credenciales en uso:', {
      publicKey: publicKey?.substring(0, 20) + '...',
      accessToken: accessToken?.substring(0, 20) + '...',
      isProduction: !publicKey?.includes('2fb4f3d2') // Check if not test credentials
    });

    // Step 1: Generate token
    console.log('🚀 Paso 1: Generando token...');
    const tokenResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            title: 'Test Donation',
            quantity: 1,
            unit_price: 10.0,
            currency_id: 'PEN'
          }
        ],
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 1
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/donaciones/exito`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/donaciones`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/donaciones`
        },
        auto_return: 'approved',
        external_reference: 'debug-test'
      })
    });

    const tokenData = await tokenResponse.json();
    console.log('📄 Respuesta de token:', {
      status: tokenResponse.status,
      success: tokenResponse.ok,
      data: tokenData
    });

    if (!tokenResponse.ok) {
      return NextResponse.json({
        success: false,
        step: 'token_generation',
        error: 'Failed to generate payment token',
        details: tokenData
      });
    }

    // Step 2: Try Yape payment
    console.log('💰 Paso 2: Intentando pago Yape...');
    const paymentResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `debug-${Date.now()}`
      },
      body: JSON.stringify({
        token: tokenData.id,
        payment_method_id: 'yape',
        payer: {
          email: 'test@example.com',
          phone: {
            area_code: '51',
            number: phone
          }
        },
        transaction_amount: 10.0,
        description: 'Test Yape Payment',
        external_reference: 'debug-test',
        additional_info: {
          authentication_code: otp
        }
      })
    });

    const paymentData = await paymentResponse.json();
    console.log('💸 Respuesta de pago:', {
      status: paymentResponse.status,
      success: paymentResponse.ok,
      data: paymentData
    });

    return NextResponse.json({
      success: paymentResponse.ok,
      step: paymentResponse.ok ? 'payment_success' : 'payment_failed',
      token: tokenData,
      payment: paymentData,
      credentials: {
        publicKey: publicKey?.substring(0, 20) + '...',
        accessToken: accessToken?.substring(0, 20) + '...',
        isProduction: !publicKey?.includes('2fb4f3d2')
      }
    });

  } catch (error) {
    console.error('❌ Error en debug Yape:', error);
    return NextResponse.json({
      success: false,
      step: 'general_error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  
  return NextResponse.json({
    credentials: {
      publicKey: publicKey?.substring(0, 20) + '...',
      accessToken: accessToken?.substring(0, 20) + '...',
      isProduction: !publicKey?.includes('2fb4f3d2'),
      hasCredentials: !!publicKey && !!accessToken
    },
    environment: {
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      nodeEnv: process.env.NODE_ENV
    }
  });
}