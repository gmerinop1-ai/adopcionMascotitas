import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('[MIGRATE] Iniciando migración de base de datos...')

    // Verificar si las columnas ya existen
    const { data: tableInfo, error: tableError } = await supabase.rpc('check_table_columns')
    
    if (tableError) {
      console.log('[MIGRATE] No se pudo verificar columnas existentes, procediendo con migración...')
    }

    // Ejecutar migraciones
    const migrations = [
      // 1. Agregar fecha de entrevista a la tabla solicitud
      `
        ALTER TABLE public.solicitud 
        ADD COLUMN IF NOT EXISTS fecha_entrevista timestamp with time zone,
        ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
        ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
      `,
      
      // 2. Crear tabla entrevistas si no existe
      `
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
      `,
      
      // 3. Crear índices para mejorar rendimiento
      `
        CREATE INDEX IF NOT EXISTS idx_entrevista_solicitud_id ON public.entrevista(solicitud_id);
        CREATE INDEX IF NOT EXISTS idx_entrevista_fecha ON public.entrevista(fecha_entrevista);
        CREATE INDEX IF NOT EXISTS idx_entrevista_estado ON public.entrevista(estado);
        CREATE INDEX IF NOT EXISTS idx_solicitud_fecha_entrevista ON public.solicitud(fecha_entrevista);
        CREATE INDEX IF NOT EXISTS idx_solicitud_estado ON public.solicitud(estado);
      `,
      
      // 4. Actualizar timestamps para registros existentes sin created_at
      `
        UPDATE public.solicitud 
        SET created_at = now(), updated_at = now() 
        WHERE created_at IS NULL;
      `
    ]

    console.log(`[MIGRATE] Ejecutando ${migrations.length} migraciones...`)

    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i]
      console.log(`[MIGRATE] Ejecutando migración ${i + 1}/${migrations.length}...`)
      
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: migration
      })

      if (error) {
        console.error(`[MIGRATE] Error en migración ${i + 1}:`, error)
        
        // Para algunos errores, intentar un enfoque alternativo
        if (error.message.includes("rpc")) {
          console.log(`[MIGRATE] Intentando enfoque alternativo para migración ${i + 1}...`)
          
          // Para la primera migración (agregar columnas), usar un enfoque directo
          if (i === 0) {
            try {
              // Intentar agregar las columnas una por una
              await supabase.from('solicitud').select('fecha_entrevista').limit(1)
            } catch (columnError: any) {
              if (columnError.message.includes('does not exist') || columnError.message.includes('column')) {
                console.log('[MIGRATE] La columna fecha_entrevista no existe, necesita ser agregada manualmente en Supabase')
                return NextResponse.json({
                  success: false,
                  message: 'Se necesita agregar la columna fecha_entrevista a la tabla solicitud en Supabase',
                  action: 'manual_migration_required',
                  sql: `
                    ALTER TABLE public.solicitud 
                    ADD COLUMN fecha_entrevista timestamp with time zone,
                    ADD COLUMN created_at timestamp with time zone DEFAULT now(),
                    ADD COLUMN updated_at timestamp with time zone DEFAULT now();
                  `
                })
              }
            }
          }
        } else {
          // Error crítico, detener migraciones
          throw error
        }
      } else {
        console.log(`[MIGRATE] ✅ Migración ${i + 1} completada`)
      }
    }

    // Verificar que las columnas fueron agregadas
    try {
      const { data: testData, error: testError } = await supabase
        .from('solicitud')
        .select('id, fecha_entrevista, created_at, updated_at')
        .limit(1)

      if (testError) {
        if (testError.message.includes('fecha_entrevista') && testError.message.includes('does not exist')) {
          return NextResponse.json({
            success: false,
            message: 'La columna fecha_entrevista aún no existe en la tabla solicitud',
            action: 'manual_migration_required',
            sql_to_run: `
              ALTER TABLE public.solicitud 
              ADD COLUMN fecha_entrevista timestamp with time zone,
              ADD COLUMN created_at timestamp with time zone DEFAULT now(),
              ADD COLUMN updated_at timestamp with time zone DEFAULT now();
            `
          })
        }
        throw testError
      }

      console.log('[MIGRATE] ✅ Verificación exitosa - todas las columnas existen')
      
      return NextResponse.json({
        success: true,
        message: 'Migraciones de base de datos completadas exitosamente',
        columns_verified: true,
        test_data: testData
      })

    } catch (verificationError) {
      console.error('[MIGRATE] Error en verificación:', verificationError)
      throw verificationError
    }

  } catch (error) {
    console.error('[MIGRATE] Error en migración:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error durante la migración de base de datos',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// Endpoint para verificar el estado de las migraciones
export async function GET() {
  try {
    console.log('[MIGRATE] Verificando estado de migraciones...')

    // Verificar columnas de solicitud
    const { data: solicitudData, error: solicitudError } = await supabase
      .from('solicitud')
      .select('id, fecha_entrevista, created_at, updated_at')
      .limit(1)

    const solicitudStatus = {
      table_exists: !solicitudError || !solicitudError.message.includes('does not exist'),
      fecha_entrevista_exists: !solicitudError || !solicitudError.message.includes('fecha_entrevista'),
      created_at_exists: !solicitudError || !solicitudError.message.includes('created_at'),
      updated_at_exists: !solicitudError || !solicitudError.message.includes('updated_at'),
      error: solicitudError?.message
    }

    // Verificar tabla entrevista
    const { data: entrevistaData, error: entrevistaError } = await supabase
      .from('entrevista')
      .select('id')
      .limit(1)

    const entrevistaStatus = {
      table_exists: !entrevistaError || !entrevistaError.message.includes('does not exist'),
      error: entrevistaError?.message
    }

    const allMigrationsComplete = 
      solicitudStatus.fecha_entrevista_exists &&
      solicitudStatus.created_at_exists &&
      solicitudStatus.updated_at_exists &&
      entrevistaStatus.table_exists

    return NextResponse.json({
      migrations_complete: allMigrationsComplete,
      solicitud_table: solicitudStatus,
      entrevista_table: entrevistaStatus,
      recommendation: allMigrationsComplete 
        ? 'All migrations are complete' 
        : 'Run POST /api/setup/migrate to apply missing migrations'
    })

  } catch (error) {
    console.error('[MIGRATE] Error verificando estado:', error)
    return NextResponse.json(
      {
        error: 'Error checking migration status',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}