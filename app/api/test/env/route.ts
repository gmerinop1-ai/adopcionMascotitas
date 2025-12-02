import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const culqiPublicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
    const culqiSecretKey = process.env.CULQI_SECRET_KEY
    
    // Logs de diagnóstico
    console.log('[ENV TEST] Variables de entorno:')
    console.log('[ENV TEST] SUPABASE_URL:', supabaseUrl ? 'PRESENTE' : 'FALTANTE')
    console.log('[ENV TEST] SUPABASE_KEY:', supabaseKey ? 'PRESENTE' : 'FALTANTE')
    console.log('[ENV TEST] CULQI_PUBLIC_KEY:', culqiPublicKey ? 'PRESENTE' : 'FALTANTE')
    console.log('[ENV TEST] CULQI_SECRET_KEY:', culqiSecretKey ? 'PRESENTE' : 'FALTANTE')
    
    // Todas las variables que contienen "CULQI"
    const allCulqiVars = Object.keys(process.env).filter(key => key.includes('CULQI'))
    console.log('[ENV TEST] Todas las variables CULQI encontradas:', allCulqiVars)

    return NextResponse.json({
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      hasCulqiPublic: !!culqiPublicKey,
      hasCulqiSecret: !!culqiSecretKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseKey?.length || 0,
      urlStartsWith: supabaseUrl?.substring(0, 20) + '...',
      keyStartsWith: supabaseKey?.substring(0, 20) + '...',
      culqiPublicPreview: culqiPublicKey ? culqiPublicKey.substring(0, 8) + '...' : 'N/A',
      culqiSecretPreview: culqiSecretKey ? culqiSecretKey.substring(0, 8) + '...' : 'N/A',
      allCulqiVars,
      nodeEnv: process.env.NODE_ENV
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check environment variables',
      details: error.message 
    }, { status: 500 })
  }
}