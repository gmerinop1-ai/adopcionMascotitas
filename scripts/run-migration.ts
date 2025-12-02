import { supabaseAdmin } from '@/lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'

async function runMigration() {
  if (!supabaseAdmin) {
    console.error('❌ No se pudo conectar a Supabase como admin')
    process.exit(1)
  }

  try {
    console.log('🚀 Ejecutando migración de donaciones...')
    
    // Leer el archivo de migración
    const migrationPath = join(process.cwd(), 'migrations', '001_create_donaciones_table.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')
    
    // Ejecutar la migración
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: migrationSQL
    })
    
    if (error) {
      console.error('❌ Error ejecutando migración:', error)
      process.exit(1)
    }
    
    console.log('✅ Migración completada exitosamente!')
    
    // Verificar que la tabla se creó
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'donaciones')
    
    if (tablesError) {
      console.error('❌ Error verificando tabla:', tablesError)
    } else if (tables && tables.length > 0) {
      console.log('✅ Tabla "donaciones" creada correctamente')
    } else {
      console.log('⚠️ No se pudo verificar la creación de la tabla')
    }
    
  } catch (error) {
    console.error('❌ Error en migración:', error)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runMigration()
}

export default runMigration