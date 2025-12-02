import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('[TEST] Probando inserción en tabla donacion...')
    
    // Intentar hacer un insert de prueba
    const { data, error } = await supabaseAdmin
      .from('donacion')
      .insert([{
        donor_name: 'Test',
        donor_email: 'test@test.com',
        amount: 10.00,
        frequency: 'one-time',
        payment_method: 'culqi',
        status: 'pending',
        message: 'Test donation'
      }])
      .select()
      .single()

    if (error) {
      console.error('[TEST] Error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: 'La tabla donacion no existe. Necesitas crearla manualmente en Supabase.',
        sql: `
          CREATE TABLE donacion (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            donor_name TEXT,
            donor_email TEXT,
            amount DECIMAL(10,2) NOT NULL,
            frequency TEXT NOT NULL CHECK (frequency IN ('one-time', 'monthly')),
            payment_method TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            culqi_charge_id TEXT,
            culqi_token_id TEXT,
            yape_transaction_id TEXT,
            yape_code TEXT,
            transaction_data JSONB,
            message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
    }

    // Si llegamos aquí, el insert funcionó
    console.log('[TEST] ✅ Insert exitoso:', data)
    
    // Eliminar el registro de prueba
    await supabaseAdmin
      .from('donacion')
      .delete()
      .eq('id', data.id)

    return NextResponse.json({
      success: true,
      message: 'Tabla donacion existe y funciona correctamente',
      testData: data
    })

  } catch (error) {
    console.error('[TEST] Error inesperado:', error)
    return NextResponse.json({
      success: false,
      error: 'Error inesperado',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint para probar la tabla donacion. Usa POST para ejecutar test.',
    instructions: [
      '1. Este endpoint verifica si la tabla donacion existe',
      '2. Si no existe, te da el SQL para crearla',
      '3. Si existe, hace un test de inserción y borrado'
    ]
  })
}