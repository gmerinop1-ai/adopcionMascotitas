-- =================================================================
-- MIGRACIÓN DE ENTREVISTAS - ADOPCIÓN MASCOTITAS
-- =================================================================
-- Este script agrega las columnas necesarias para manejar entrevistas
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura actual de la tabla solicitud
DO $$
BEGIN
    -- Verificar si existe la columna fecha_entrevista
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'solicitud' 
        AND column_name = 'fecha_entrevista'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Agregando columna fecha_entrevista a tabla solicitud...';
        ALTER TABLE public.solicitud 
        ADD COLUMN fecha_entrevista timestamp with time zone;
    ELSE
        RAISE NOTICE 'Columna fecha_entrevista ya existe en tabla solicitud.';
    END IF;

    -- Verificar si existe la columna created_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'solicitud' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Agregando columna created_at a tabla solicitud...';
        ALTER TABLE public.solicitud 
        ADD COLUMN created_at timestamp with time zone DEFAULT now();
    ELSE
        RAISE NOTICE 'Columna created_at ya existe en tabla solicitud.';
    END IF;

    -- Verificar si existe la columna updated_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'solicitud' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Agregando columna updated_at a tabla solicitud...';
        ALTER TABLE public.solicitud 
        ADD COLUMN updated_at timestamp with time zone DEFAULT now();
    ELSE
        RAISE NOTICE 'Columna updated_at ya existe en tabla solicitud.';
    END IF;

END $$;

-- 2. Crear tabla entrevista si no existe
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

-- 3. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_entrevista_solicitud_id ON public.entrevista(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_entrevista_fecha ON public.entrevista(fecha_entrevista);
CREATE INDEX IF NOT EXISTS idx_entrevista_estado ON public.entrevista(estado);
CREATE INDEX IF NOT EXISTS idx_solicitud_fecha_entrevista ON public.solicitud(fecha_entrevista);
CREATE INDEX IF NOT EXISTS idx_solicitud_estado ON public.solicitud(estado);

-- 4. Actualizar registros existentes sin timestamps
UPDATE public.solicitud 
SET 
    created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now())
WHERE created_at IS NULL OR updated_at IS NULL;

-- 5. Verificación final
DO $$
DECLARE
    solicitud_count INTEGER;
    entrevista_exists BOOLEAN;
    fecha_entrevista_exists BOOLEAN;
    created_at_exists BOOLEAN;
    updated_at_exists BOOLEAN;
BEGIN
    -- Contar solicitudes
    SELECT COUNT(*) INTO solicitud_count FROM public.solicitud;
    
    -- Verificar tabla entrevista
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'entrevista' 
        AND table_schema = 'public'
    ) INTO entrevista_exists;
    
    -- Verificar columnas
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'solicitud' 
        AND column_name = 'fecha_entrevista'
        AND table_schema = 'public'
    ) INTO fecha_entrevista_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'solicitud' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) INTO created_at_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'solicitud' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) INTO updated_at_exists;
    
    -- Mostrar resultados
    RAISE NOTICE '=== VERIFICACIÓN COMPLETADA ===';
    RAISE NOTICE 'Solicitudes en la base de datos: %', solicitud_count;
    RAISE NOTICE 'Tabla entrevista existe: %', CASE WHEN entrevista_exists THEN 'SÍ ✅' ELSE 'NO ❌' END;
    RAISE NOTICE 'Columna fecha_entrevista existe: %', CASE WHEN fecha_entrevista_exists THEN 'SÍ ✅' ELSE 'NO ❌' END;
    RAISE NOTICE 'Columna created_at existe: %', CASE WHEN created_at_exists THEN 'SÍ ✅' ELSE 'NO ❌' END;
    RAISE NOTICE 'Columna updated_at existe: %', CASE WHEN updated_at_exists THEN 'SÍ ✅' ELSE 'NO ❌' END;
    
    IF entrevista_exists AND fecha_entrevista_exists AND created_at_exists AND updated_at_exists THEN
        RAISE NOTICE '🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE! 🎉';
        RAISE NOTICE 'Ahora puedes programar entrevistas en el sistema.';
    ELSE
        RAISE NOTICE '⚠️  Algunas migraciones fallaron. Revisa los mensajes anteriores.';
    END IF;
    
END $$;

-- 6. Mostrar estructura final de la tabla solicitud
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'solicitud' 
AND table_schema = 'public'
ORDER BY ordinal_position;