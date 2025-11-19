import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 Verificando estado de migraciones...')

    // Verificar columnas de solicitud
    const { data: solicitudData, error: solicitudError } = await supabase
      .from('solicitud')
      .select('id, fecha_entrevista, created_at, updated_at')
      .limit(1)

    let solicitudStatus = {
      table_exists: true,
      fecha_entrevista_exists: true,
      created_at_exists: true,
      updated_at_exists: true,
      error: null as string | null,
      sample_data: null as any
    }

    if (solicitudError) {
      solicitudStatus.error = solicitudError.message
      
      if (solicitudError.message.includes('fecha_entrevista') && 
          solicitudError.message.includes('does not exist')) {
        solicitudStatus.fecha_entrevista_exists = false
      }
      
      if (solicitudError.message.includes('created_at') && 
          solicitudError.message.includes('does not exist')) {
        solicitudStatus.created_at_exists = false
      }
      
      if (solicitudError.message.includes('updated_at') && 
          solicitudError.message.includes('does not exist')) {
        solicitudStatus.updated_at_exists = false
      }
      
      if (solicitudError.message.includes('solicitud') && 
          solicitudError.message.includes('does not exist')) {
        solicitudStatus.table_exists = false
      }
    } else {
      solicitudStatus.sample_data = solicitudData
    }

    // Verificar tabla entrevista
    const { data: entrevistaData, error: entrevistaError } = await supabase
      .from('entrevista')
      .select('id')
      .limit(1)

    let entrevistaStatus = {
      table_exists: true,
      error: null as string | null,
      sample_data: null as any
    }

    if (entrevistaError) {
      entrevistaStatus.error = entrevistaError.message
      
      if (entrevistaError.message.includes('entrevista') && 
          entrevistaError.message.includes('does not exist')) {
        entrevistaStatus.table_exists = false
      }
    } else {
      entrevistaStatus.sample_data = entrevistaData
    }

    const allMigrationsComplete = 
      solicitudStatus.table_exists &&
      solicitudStatus.fecha_entrevista_exists &&
      solicitudStatus.created_at_exists &&
      solicitudStatus.updated_at_exists &&
      entrevistaStatus.table_exists

    const response = {
      migrations_complete: allMigrationsComplete,
      solicitud_table: solicitudStatus,
      entrevista_table: entrevistaStatus,
      sql_to_run: allMigrationsComplete ? null : `
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
      `,
      instructions: allMigrationsComplete ? 
        'All migrations are complete! ✅' : 
        'Missing migrations detected. Please run the SQL above in Supabase SQL Editor.'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('💥 Error verificando migraciones:', error)
    return NextResponse.json(
      {
        error: 'Error checking migration status',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}