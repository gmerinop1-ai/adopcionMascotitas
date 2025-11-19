-- Tabla para las entrevistas de adopción
CREATE TABLE IF NOT EXISTS public.entrevista (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  solicitud_id uuid NOT NULL,
  fecha_entrevista timestamp with time zone NOT NULL,
  estado character varying NOT NULL DEFAULT 'programada'::character varying,
  observaciones text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT entrevista_pkey PRIMARY KEY (id),
  CONSTRAINT entrevista_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitud(id) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_entrevista_solicitud_id ON public.entrevista(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_entrevista_fecha ON public.entrevista(fecha_entrevista);
CREATE INDEX IF NOT EXISTS idx_entrevista_estado ON public.entrevista(estado);

-- Agregar fecha de entrevista a la tabla solicitud si no existe
ALTER TABLE public.solicitud 
ADD COLUMN IF NOT EXISTS fecha_entrevista timestamp with time zone,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();