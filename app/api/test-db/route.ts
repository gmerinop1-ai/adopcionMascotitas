import { supabase } from "@/lib/db"

export async function POST() {
  try {
    console.log('[TEST] Testing database connection...')
    
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('usuario')
      .select('usuario_id')
      .limit(1)
    
    if (connectionError) {
      console.error('[TEST] Connection failed:', connectionError)
      return Response.json({ 
        error: 'Database connection failed',
        details: connectionError.message,
        code: connectionError.code
      }, { status: 500 })
    }
    
    console.log('[TEST] ✅ Basic database connection works')
    
    // Check if verification_codes table exists
    const { data: vcodes, error: vcodesError } = await supabase
      .from('verification_codes')
      .select('id')
      .limit(1)
    
    const vcodesExists = !vcodesError
    
    // Check usuario table structure
    const { data: userSchema, error: userSchemaError } = await supabase
      .from('usuario')
      .select('usuario_id, correo, nombres, estado')
      .limit(1)
    
    return Response.json({ 
      success: true,
      message: 'Database diagnostics completed',
      tables: {
        usuario: {
          exists: !userSchemaError,
          sample_count: userSchema?.length || 0,
          error: userSchemaError?.message || null
        },
        verification_codes: {
          exists: vcodesExists,
          error: vcodesError?.message || null,
          needs_creation: !vcodesExists
        }
      },
      recommendations: vcodesExists ? [] : [
        'Execute SQL script: scripts/create-verification-codes-table.sql',
        'Or run the setup API: POST /api/setup/create-tables'
      ]
    })
    
  } catch (error) {
    console.error('[TEST] Database test failed:', error)
    return Response.json({ 
      error: 'Unexpected database error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST() // Allow GET requests for easy browser testing
}