import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    return NextResponse.json({
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseKey?.length || 0,
      urlStartsWith: supabaseUrl?.substring(0, 20) + '...',
      keyStartsWith: supabaseKey?.substring(0, 20) + '...'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check environment variables' 
    }, { status: 500 })
  }
}