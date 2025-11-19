import { supabase } from './db'

async function checkMigrationStatus() {
  try {
    console.log('🔍 Verificando estado de migraciones...')

    // Verificar columnas de solicitud
    const { data: solicitudData, error: solicitudError } = await supabase
      .from('solicitud')
      .select('id, fecha_entrevista, created_at, updated_at')
      .limit(1)

    console.log('📋 Estado tabla solicitud:')
    if (solicitudError) {
      console.error('❌ Error:', solicitudError.message)
      
      if (solicitudError.message.includes('fecha_entrevista') && 
          solicitudError.message.includes('does not exist')) {
        console.log('🚨 PROBLEMA DETECTADO: La columna fecha_entrevista NO existe')
        console.log('💡 SOLUCIÓN: Ejecutar en Supabase SQL Editor:')
        console.log(`
ALTER TABLE public.solicitud 
ADD COLUMN fecha_entrevista timestamp with time zone,
ADD COLUMN created_at timestamp with time zone DEFAULT now(),
ADD COLUMN updated_at timestamp with time zone DEFAULT now();
        `)
        return false
      }
    } else {
      console.log('✅ Tabla solicitud - OK')
      console.log('✅ Columna fecha_entrevista - OK')
      if (solicitudData && solicitudData.length > 0) {
        console.log('📊 Datos de prueba:', solicitudData[0])
      }
    }

    // Verificar tabla entrevista
    const { data: entrevistaData, error: entrevistaError } = await supabase
      .from('entrevista')
      .select('id')
      .limit(1)

    console.log('📋 Estado tabla entrevista:')
    if (entrevistaError) {
      console.error('❌ Error:', entrevistaError.message)
      if (entrevistaError.message.includes('does not exist')) {
        console.log('🚨 PROBLEMA: La tabla entrevista NO existe')
        console.log('💡 SOLUCIÓN: Ejecutar el script sql/entrevistas.sql en Supabase')
        return false
      }
    } else {
      console.log('✅ Tabla entrevista - OK')
    }

    console.log('🎉 Todas las migraciones están completas!')
    return true

  } catch (error) {
    console.error('💥 Error verificando migraciones:', error)
    return false
  }
}

// Función para aplicar migraciones automáticamente
async function applyMigrations() {
  try {
    console.log('🔧 Intentando aplicar migraciones automáticamente...')

    // Como no podemos ejecutar DDL directamente con el cliente de Supabase,
    // necesitamos usar el SQL Editor de Supabase
    console.log('⚠️  Las migraciones DDL requieren acceso directo a la base de datos')
    console.log('📝 Por favor, ejecuta el siguiente SQL en Supabase SQL Editor:')
    
    const migrations = `
-- 1. Agregar columnas a la tabla solicitud
ALTER TABLE public.solicitud 
ADD COLUMN IF NOT EXISTS fecha_entrevista timestamp with time zone,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 2. Crear tabla entrevistas
CREATE TABLE IF NOT EXISTS public.entrevista (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  solicitud_id uuid NOT NULL,
  fecha_entrevista timestamp with time zone NOT NULL,
  estado character varying NOT NULL DEFAULT 'programada'::character varying,
  observaciones text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT entrevista_pkey PRIMARY KEY (id),
  CONSTRAINT entrevista_solicitud_id_fkey FOREIGN KEY (solicitud_id) 
    REFERENCES public.solicitud(id) ON DELETE CASCADE
);

-- 3. Crear índices
CREATE INDEX IF NOT EXISTS idx_entrevista_solicitud_id ON public.entrevista(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_entrevista_fecha ON public.entrevista(fecha_entrevista);
CREATE INDEX IF NOT EXISTS idx_entrevista_estado ON public.entrevista(estado);
CREATE INDEX IF NOT EXISTS idx_solicitud_fecha_entrevista ON public.solicitud(fecha_entrevista);
CREATE INDEX IF NOT EXISTS idx_solicitud_estado ON public.solicitud(estado);

-- 4. Actualizar timestamps para registros existentes
UPDATE public.solicitud 
SET created_at = COALESCE(created_at, now()), 
    updated_at = COALESCE(updated_at, now()) 
WHERE created_at IS NULL OR updated_at IS NULL;
    `
    
    console.log(migrations)
    console.log('🔗 Ve a: https://supabase.com/dashboard/project/[tu-proyecto]/sql')
    console.log('📋 Copia y pega el SQL de arriba')
    console.log('▶️  Haz clic en "Run" para ejecutar')
    
    return false // No podemos ejecutar automáticamente
    
  } catch (error) {
    console.error('💥 Error aplicando migraciones:', error)
    return false
  }
}

// Ejecutar verificación
if (require.main === module) {
  checkMigrationStatus().then(success => {
    if (!success) {
      console.log('\n🔧 Ejecutando aplicación de migraciones...')
      applyMigrations()
    }
  })
}

export { checkMigrationStatus, applyMigrations }