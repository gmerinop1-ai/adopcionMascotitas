-- Tabla para códigos de verificación
-- Ejecutar en Supabase SQL Editor

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

-- Programar limpieza automática de códigos expirados (opcional)
-- Se puede ejecutar manualmente o programar como un cron job
-- SELECT cleanup_expired_verification_codes();

-- Comentarios para documentación
COMMENT ON TABLE verification_codes IS 'Tabla para almacenar códigos de verificación de email, DNI y recuperación de contraseñas';
COMMENT ON COLUMN verification_codes.email IS 'Email del usuario al que se envía el código';
COMMENT ON COLUMN verification_codes.dni IS 'DNI a verificar (opcional, solo para dni_verification)';
COMMENT ON COLUMN verification_codes.code IS 'Código de verificación de 6 dígitos';
COMMENT ON COLUMN verification_codes.type IS 'Tipo de verificación: email_verification, password_reset, dni_verification';
COMMENT ON COLUMN verification_codes.expires_at IS 'Timestamp cuando expira el código (normalmente 15 minutos)';
COMMENT ON COLUMN verification_codes.used IS 'Indica si el código ya fue utilizado';

-- Row Level Security (RLS) - opcional, depende de tu configuración de Supabase
-- ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Política de seguridad básica (ajustar según necesidades)
-- CREATE POLICY "Service role can manage verification codes" ON verification_codes
--   FOR ALL USING (auth.role() = 'service_role');