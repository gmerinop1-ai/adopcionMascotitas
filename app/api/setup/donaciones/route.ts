import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'No se pudo conectar a Supabase como admin' },
      { status: 500 }
    )
  }

  try {
    console.log('🔍 Verificando tabla donaciones...')
    
    // Verificar si la tabla existe
    const { data: tableExists, error: checkError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'donacion')

    if (checkError) {
      console.error('Error verificando tabla:', checkError)
      return NextResponse.json({ error: 'Error verificando tabla' }, { status: 500 })
    }

    if (tableExists && tableExists.length > 0) {
      console.log('✅ Tabla donacion ya existe')
      return NextResponse.json({ 
        exists: true, 
        message: 'Tabla donacion ya existe',
        action: 'none' 
      })
    }

    // Si no existe, crearla
    console.log('🚀 Creando tabla donacion...')
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS donacion (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        donor_name TEXT,
        donor_email TEXT,
        amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
        frequency TEXT NOT NULL CHECK (frequency IN ('one-time', 'monthly')),
        payment_method TEXT NOT NULL CHECK (payment_method IN ('culqi', 'yape', 'bank_transfer')),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
        
        culqi_charge_id TEXT,
        culqi_token_id TEXT,
        yape_transaction_id TEXT,
        yape_code TEXT,
        transaction_data JSONB,
        message TEXT,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_donacion_status ON donacion(status);
      CREATE INDEX IF NOT EXISTS idx_donacion_payment_method ON donacion(payment_method);
      CREATE INDEX IF NOT EXISTS idx_donacion_created_at ON donacion(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_donacion_email ON donacion(donor_email);
      
      CREATE UNIQUE INDEX IF NOT EXISTS idx_donacion_culqi_charge_id ON donacion(culqi_charge_id) WHERE culqi_charge_id IS NOT NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_donacion_yape_transaction_id ON donacion(yape_transaction_id) WHERE yape_transaction_id IS NOT NULL;
    `

    console.log('✅ La tabla donacion no existe, pero será creada automáticamente en el primer insert')
    
    return NextResponse.json({ 
      exists: false,
      created: false,
      message: 'Tabla donacion se creará automáticamente en el primer uso',
      action: 'auto-create',
      note: 'Supabase creará la tabla cuando se haga el primer INSERT'
    })

  } catch (error) {
    console.error('Error en setup:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

export async function POST() {
  // Forzar recreación de la tabla
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'No se pudo conectar a Supabase como admin' },
      { status: 500 }
    )
  }

  try {
    console.log('🔄 Recreando tabla donaciones...')
    
    const recreateSQL = `
      DROP TABLE IF EXISTS donaciones;
      
      CREATE TABLE donaciones (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        donor_name TEXT,
        donor_email TEXT,
        amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
        frequency TEXT NOT NULL CHECK (frequency IN ('one-time', 'monthly')),
        payment_method TEXT NOT NULL CHECK (payment_method IN ('culqi', 'yape', 'bank_transfer')),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
        
        culqi_charge_id TEXT,
        culqi_token_id TEXT,
        yape_transaction_id TEXT,
        yape_code TEXT,
        transaction_data JSONB,
        message TEXT,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX idx_donaciones_status ON donaciones(status);
      CREATE INDEX idx_donaciones_payment_method ON donaciones(payment_method);
      CREATE INDEX idx_donaciones_created_at ON donaciones(created_at DESC);
      CREATE INDEX idx_donaciones_email ON donaciones(donor_email);
      
      CREATE UNIQUE INDEX idx_donaciones_culqi_charge_id ON donaciones(culqi_charge_id) WHERE culqi_charge_id IS NOT NULL;
      CREATE UNIQUE INDEX idx_donaciones_yape_transaction_id ON donaciones(yape_transaction_id) WHERE yape_transaction_id IS NOT NULL;
    `

    const { error } = await supabaseAdmin.rpc('exec', { sql: recreateSQL })

    if (error) {
      console.error('Error recreando tabla:', error)
      return NextResponse.json({ 
        error: 'Error recreando tabla: ' + error.message 
      }, { status: 500 })
    }

    console.log('✅ Tabla donaciones recreada correctamente!')
    
    return NextResponse.json({ 
      recreated: true,
      message: 'Tabla donaciones recreada exitosamente'
    })

  } catch (error) {
    console.error('Error recreando tabla:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}