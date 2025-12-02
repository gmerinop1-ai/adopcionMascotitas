import { NextResponse } from 'next/server'
import { getCulqiPublicKey } from '@/lib/culqi'

export async function GET() {
  try {
    console.log('🔍 Probando configuración de Culqi...')
    
    // Verificar variables de entorno
    const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
    const secretKey = process.env.CULQI_SECRET_KEY
    
    const config = {
      publicKey: publicKey ? 'Configurada ✅' : 'Faltante ❌',
      secretKey: secretKey ? 'Configurada ✅' : 'Faltante ❌',
      publicKeyValue: publicKey || 'No configurada',
      secretKeyPrefix: secretKey ? secretKey.substring(0, 8) + '...' : 'No configurada'
    }
    
    // Verificar función de configuración
    try {
      const testPublicKey = getCulqiPublicKey()
      config.functionTest = 'getCulqiPublicKey() funciona ✅'
    } catch (error) {
      config.functionTest = 'getCulqiPublicKey() falló ❌: ' + (error as Error).message
    }
    
    // Verificar formato de las claves
    if (publicKey) {
      config.publicKeyFormat = publicKey.startsWith('pk_test_') || publicKey.startsWith('pk_live_') 
        ? 'Formato correcto ✅' 
        : 'Formato incorrecto ❌ (debe empezar con pk_test_ o pk_live_)'
    }
    
    if (secretKey) {
      config.secretKeyFormat = secretKey.startsWith('sk_test_') || secretKey.startsWith('sk_live_')
        ? 'Formato correcto ✅'
        : 'Formato incorrecto ❌ (debe empezar con sk_test_ o sk_live_)'
    }
    
    const allGood = publicKey && secretKey && 
      (publicKey.startsWith('pk_test_') || publicKey.startsWith('pk_live_')) &&
      (secretKey.startsWith('sk_test_') || secretKey.startsWith('sk_live_'))
    
    return NextResponse.json({
      success: allGood,
      message: allGood 
        ? '🎉 Configuración de Culqi correcta!' 
        : '⚠️ Hay problemas en la configuración de Culqi',
      config,
      environment: process.env.NODE_ENV,
      recommendations: allGood ? [
        'Todo está configurado correctamente',
        'Puedes proceder a probar pagos',
        'Recuerda que estás usando claves de prueba (test)'
      ] : [
        'Verifica que las claves estén en el archivo .env.local',
        'Las claves públicas deben empezar con pk_test_ o pk_live_',
        'Las claves secretas deben empezar con sk_test_ o sk_live_',
        'Reinicia el servidor después de cambiar variables de entorno'
      ]
    })
    
  } catch (error) {
    console.error('Error verificando Culqi:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno verificando configuración',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}