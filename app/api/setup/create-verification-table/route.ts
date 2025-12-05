import { supabase } from "@/lib/db"

export async function POST() {
  try {
    console.log('[SETUP] Creating verification_codes table...')
    
    // First check if table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('verification_codes')
      .select('id')
      .limit(1)
    
    if (!checkError) {
      return Response.json({ 
        success: true,
        message: 'verification_codes table already exists',
        action: 'no_action_needed'
      })
    }

    console.log('[SETUP] Table does not exist, creating...')
    
    // Create the table with all required columns and constraints
    const createTableSQL = `
      -- Tabla para códigos de verificación
      CREATE TABLE IF NOT EXISTS verification_codes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        dni VARCHAR(8),
        code VARCHAR(6) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('email_verification', 'password_reset', 'dni_verification')),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Índices para mejor performance
      CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
      CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
      CREATE INDEX IF NOT EXISTS idx_verification_codes_type ON verification_codes(type);
      CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);
      CREATE INDEX IF NOT EXISTS idx_verification_codes_used ON verification_codes(used);

      -- Índice compuesto para búsquedas frecuentes
      CREATE INDEX IF NOT EXISTS idx_verification_codes_lookup ON verification_codes(email, code, type, used, expires_at);

      -- Función para limpiar códigos expirados automáticamente
      CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
      RETURNS void AS $$
      BEGIN
        DELETE FROM verification_codes 
        WHERE expires_at < NOW() - INTERVAL '1 day';
      END;
      $$ LANGUAGE plpgsql;

      -- Trigger para actualizar updated_at automáticamente
      CREATE OR REPLACE FUNCTION update_verification_codes_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER IF NOT EXISTS trigger_verification_codes_updated_at
        BEFORE UPDATE ON verification_codes
        FOR EACH ROW
        EXECUTE FUNCTION update_verification_codes_updated_at();
    `

    // Execute the SQL using Supabase client
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: createTableSQL 
    })

    if (error) {
      console.error('[SETUP] Failed to create table via RPC:', error)
      
      // Try alternative approach - create table directly
      const { error: altError } = await supabase.from('verification_codes').select().limit(0)
      
      if (altError && altError.message.includes('relation "verification_codes" does not exist')) {
        return Response.json({ 
          error: 'Cannot create verification_codes table automatically',
          details: error.message,
          solution: 'Please execute the SQL script manually in Supabase SQL Editor',
          sql_script: 'scripts/create-verification-codes-table.sql',
          manual_setup: true
        }, { status: 500 })
      }
    }

    // Verify table was created
    const { data: verifyTable, error: verifyError } = await supabase
      .from('verification_codes')
      .select('id')
      .limit(1)
    
    if (verifyError) {
      console.error('[SETUP] Table creation verification failed:', verifyError)
      return Response.json({ 
        error: 'Table creation verification failed',
        details: verifyError.message,
        fallback: 'Please run SQL script manually: scripts/create-verification-codes-table.sql'
      }, { status: 500 })
    }

    console.log('[SETUP] ✅ verification_codes table created successfully')
    
    return Response.json({ 
      success: true,
      message: 'verification_codes table created successfully',
      action: 'table_created',
      next_step: 'You can now use password reset and email verification features'
    })
    
  } catch (error) {
    console.error('[SETUP] Error creating verification_codes table:', error)
    return Response.json({ 
      error: 'Setup failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      manual_solution: 'Execute SQL script: scripts/create-verification-codes-table.sql'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST() // Allow GET requests for easy browser testing
}