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

    // Verificar tabla donacion
    const { data: donacionData, error: donacionError } = await supabase
      .from('donacion')
      .select('id')
      .limit(1)

    console.log('📋 Estado tabla donacion:')
    if (donacionError) {
      console.error('❌ Error:', donacionError.message)
      if (donacionError.message.includes('does not exist')) {
        console.log('🚨 PROBLEMA: La tabla donacion NO existe')
        console.log('💡 SOLUCIÓN: Ejecutar las migraciones de donaciones en Supabase')
        return false
      }
    } else {
      console.log('✅ Tabla donacion - OK')
    }

    // Verificar tabla franja_horaria
    const { data: franjaData, error: franjaError } = await supabase
      .from('franja_horaria')
      .select('id')
      .limit(1)

    console.log('📋 Estado tabla franja_horaria:')
    if (franjaError) {
      console.error('❌ Error:', franjaError.message)
      if (franjaError.message.includes('does not exist')) {
        console.log('🚨 PROBLEMA: La tabla franja_horaria NO existe')
        console.log('💡 SOLUCIÓN: Ejecutar las migraciones de franjas en Supabase')
        return false
      }
    } else {
      console.log('✅ Tabla franja_horaria - OK')
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

-- 3. Crear tabla franjas horarias
CREATE TABLE IF NOT EXISTS public.franja_horaria (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fecha date NOT NULL,
  hora_inicio time NOT NULL,
  duracion_minutos integer NOT NULL DEFAULT 30,
  cupo_maximo integer NOT NULL DEFAULT 1,
  cupo_disponible integer NOT NULL DEFAULT 1,
  estado character varying NOT NULL DEFAULT 'borrador',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT franja_horaria_pkey PRIMARY KEY (id),
  CONSTRAINT franja_horaria_estado_check CHECK (estado IN ('borrador', 'publicado', 'completado')),
  CONSTRAINT franja_horaria_cupo_check CHECK (cupo_disponible >= 0 AND cupo_disponible <= cupo_maximo)
);

-- 4. Crear tabla reservas de franjas
CREATE TABLE IF NOT EXISTS public.reserva_franja (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  franja_horaria_id uuid NOT NULL,
  solicitud_id uuid NOT NULL,
  estado character varying NOT NULL DEFAULT 'reservado',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reserva_franja_pkey PRIMARY KEY (id),
  CONSTRAINT reserva_franja_franja_id_fkey FOREIGN KEY (franja_horaria_id) 
    REFERENCES public.franja_horaria(id) ON DELETE CASCADE,
  CONSTRAINT reserva_franja_solicitud_id_fkey FOREIGN KEY (solicitud_id) 
    REFERENCES public.solicitud(id) ON DELETE CASCADE,
  CONSTRAINT reserva_franja_estado_check CHECK (estado IN ('reservado', 'completado', 'cancelado'))
);

-- 5. Crear tabla de donaciones
CREATE TABLE IF NOT EXISTS public.donacion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  donor_name character varying,
  donor_email character varying,
  amount decimal(10,2) NOT NULL,
  frequency character varying NOT NULL DEFAULT 'one-time',
  payment_method character varying NOT NULL,
  status character varying NOT NULL DEFAULT 'pending',
  stripe_session_id character varying,
  yape_transaction_id character varying,
  transaction_data jsonb,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT donacion_pkey PRIMARY KEY (id),
  CONSTRAINT donacion_frequency_check CHECK (frequency IN ('one-time', 'monthly')),
  CONSTRAINT donacion_status_check CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  CONSTRAINT donacion_payment_method_check CHECK (payment_method IN ('stripe', 'culqi', 'yape', 'bank_transfer')),
  CONSTRAINT donacion_amount_check CHECK (amount > 0)
);

-- 6. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_entrevista_solicitud_id ON public.entrevista(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_entrevista_fecha ON public.entrevista(fecha_entrevista);
CREATE INDEX IF NOT EXISTS idx_entrevista_estado ON public.entrevista(estado);
CREATE INDEX IF NOT EXISTS idx_solicitud_fecha_entrevista ON public.solicitud(fecha_entrevista);
CREATE INDEX IF NOT EXISTS idx_solicitud_estado ON public.solicitud(estado);

CREATE INDEX IF NOT EXISTS idx_franja_horaria_fecha ON public.franja_horaria(fecha);
CREATE INDEX IF NOT EXISTS idx_franja_horaria_estado ON public.franja_horaria(estado);
CREATE INDEX IF NOT EXISTS idx_reserva_franja_horaria_id ON public.reserva_franja(franja_horaria_id);
CREATE INDEX IF NOT EXISTS idx_reserva_franja_solicitud_id ON public.reserva_franja(solicitud_id);

CREATE INDEX IF NOT EXISTS idx_donacion_email ON public.donacion(donor_email);
CREATE INDEX IF NOT EXISTS idx_donacion_status ON public.donacion(status);
CREATE INDEX IF NOT EXISTS idx_donacion_payment_method ON public.donacion(payment_method);
CREATE INDEX IF NOT EXISTS idx_donacion_created_at ON public.donacion(created_at);

-- 7. Actualizar timestamps para registros existentes
UPDATE public.solicitud 
SET created_at = COALESCE(created_at, now()), 
    updated_at = COALESCE(updated_at, now()) 
WHERE created_at IS NULL OR updated_at IS NULL;

-- 8. Habilitar Row Level Security (RLS)
ALTER TABLE public.donacion ENABLE ROW LEVEL SECURITY;

-- 9. Crear políticas RLS para donaciones (permitir lectura/escritura pública para donaciones)
CREATE POLICY IF NOT EXISTS "Donaciones públicas" ON public.donacion
    FOR ALL USING (true);
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