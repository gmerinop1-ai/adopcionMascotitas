import { supabaseAdmin } from '@/lib/db'

async function createDonacionesTable() {
  if (!supabaseAdmin) {
    console.error('❌ No se pudo conectar a Supabase como admin')
    return false
  }

  try {
    console.log('🚀 Creando tabla donacion...')
    
    // SQL para crear la tabla
    const createTableSQL = `
      -- Crear tabla de donaciones
      CREATE TABLE IF NOT EXISTS donacion (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        donor_name TEXT,
        donor_email TEXT,
        amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
        frequency TEXT NOT NULL CHECK (frequency IN ('one-time', 'monthly')),
        payment_method TEXT NOT NULL CHECK (payment_method IN ('culqi', 'yape', 'bank_transfer')),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
        
        -- Datos específicos de Culqi
        culqi_charge_id TEXT,
        culqi_token_id TEXT,
        
        -- Datos específicos de Yape
        yape_transaction_id TEXT,
        yape_code TEXT,
        
        -- Datos de transacción genéricos (JSON)
        transaction_data JSONB,
        
        -- Mensaje del donante
        message TEXT,
        
        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    
    const { error } = await supabaseAdmin.rpc('exec', { sql: createTableSQL })
    
    if (error) {
      console.error('❌ Error creando tabla:', error)
      return false
    }
    
    console.log('✅ Tabla donacion creada correctamente!')
    return true
    
  } catch (error) {
    console.error('❌ Error:', error)
    return false
  }
}

export default createDonacionesTable