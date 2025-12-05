# Sistema de Verificación de DNI y Email con Recuperación de Contraseña

## Descripción

Se ha implementado un sistema completo de verificación que incluye:

1. **Verificación de DNI**: Validación con RENIEC (simulada en desarrollo)
2. **Verificación de Email**: Códigos de 6 dígitos enviados por email
3. **Recuperación de Contraseña**: Sistema seguro con códigos de verificación

## Configuración Inicial

### 1. Base de Datos

Ejecutar el script SQL en Supabase:
```sql
-- Ejecutar el archivo: scripts/create-verification-codes-table.sql
```

### 2. Variables de Entorno

Agregar las siguientes variables al archivo `.env.local`:

```env
# Email Configuration (Gmail ejemplo)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password-gmail
EMAIL_FROM="Adopción Mascotas <tu-email@gmail.com>"

# Para SMTP personalizado (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# API RENIEC (opcional, para producción)
RENIEC_API_KEY=tu-api-key-reniec
```

### 3. Configuración de Gmail

Para usar Gmail como proveedor de email:

1. Habilitar "Autenticación de dos factores" en tu cuenta Gmail
2. Generar una "Contraseña de aplicación" específica
3. Usar esa contraseña en `EMAIL_PASSWORD`

### 4. Instalación de Dependencias

```bash
npm install nodemailer @types/nodemailer
```

## Funcionalidades Implementadas

### 1. Registro con Verificación

**Flujo:**
1. Usuario completa formulario
2. Sistema valida DNI con RENIEC (simulado)
3. Envía código de verificación al email
4. Usuario verifica código
5. Se crea la cuenta

**Archivos modificados:**
- `components/auth/registration-form.tsx`
- `app/api/verification/send-code/route.ts`
- `app/api/verification/verify-code/route.ts`

### 2. Recuperación de Contraseña

**Flujo:**
1. Usuario ingresa email
2. Sistema envía código de verificación
3. Usuario ingresa código y nueva contraseña
4. Se actualiza la contraseña

**Archivos:**
- `app/recuperar-password/page.tsx`
- `app/api/auth/forgot-password/route.ts`

### 3. Validación de DNI

**Características:**
- Validación de formato (8 dígitos)
- Verificación con RENIEC (simulada)
- DNIs de prueba disponibles
- Prevención de duplicados

**DNIs de prueba válidos:**
- `12345678` - Juan Carlos Pérez González
- `87654321` - María Elena García Rodríguez
- `11111111` - Pedro José López Martínez
- `22222222` - Ana Sofía Hernández Cruz
- `33333333` - Carlos Alberto Mendoza Silva

## APIs Creadas

### POST `/api/verification/send-code`
Envía códigos de verificación

**Parámetros:**
```json
{
  "email": "usuario@email.com",
  "dni": "12345678", // opcional, solo para dni_verification
  "type": "email_verification|password_reset|dni_verification"
}
```

### POST `/api/verification/verify-code`
Verifica códigos

**Parámetros:**
```json
{
  "email": "usuario@email.com",
  "code": "123456",
  "type": "email_verification|password_reset|dni_verification",
  "newPassword": "nueva123" // solo para password_reset
}
```

### POST `/api/auth/forgot-password`
Inicia recuperación de contraseña

**Parámetros:**
```json
{
  "email": "usuario@email.com"
}
```

## Servicios Implementados

### 1. Email Service (`lib/email.ts`)
- Envío de emails con nodemailer
- Templates HTML responsivos
- Fallback para desarrollo
- Generación de códigos de 6 dígitos

### 2. DNI Validation (`lib/dni-validation.ts`)
- Validación de formato
- Integración con RENIEC (simulada)
- DNIs de prueba para desarrollo
- Verificación de duplicados

### 3. Database Functions (`lib/db.ts`)
- Gestión de códigos de verificación
- Actualización de contraseñas
- Limpieza automática de códigos expirados

## Seguridad Implementada

### 1. Códigos de Verificación
- Expiran en 15 minutos
- Solo 6 dígitos numéricos
- Se invalidan automáticamente al usarse
- Un código activo por email/tipo

### 2. Recuperación de Contraseña
- No revela si el email existe (previene enumeración)
- Códigos únicos y seguros
- Validación de contraseña fuerte

### 3. Validación DNI
- Verificación con RENIEC
- Prevención de duplicados
- Validación de formato estricta

## Modo Desarrollo

En desarrollo (sin configuración de email):
- Los emails se muestran en consola
- DNIs de prueba funcionan automáticamente
- Códigos son válidos por 15 minutos

## Estructura de Archivos Nuevos

```
lib/
├── email.ts              # Servicio de envío de emails
├── dni-validation.ts     # Validación de DNI con RENIEC
└── db.ts                 # Funciones de BD (actualizadas)

app/api/
├── verification/
│   ├── send-code/route.ts    # Enviar códigos
│   └── verify-code/route.ts  # Verificar códigos
└── auth/
    └── forgot-password/route.ts  # Recuperar contraseña

scripts/
└── create-verification-codes-table.sql  # Script de BD

components/auth/
├── registration-form.tsx     # Formulario con verificación
└── [otros archivos actualizados]

app/
└── recuperar-password/page.tsx  # Página de recuperación
```

## Próximos Pasos

1. **Configurar email real** - Configurar Gmail o SMTP
2. **Integrar RENIEC real** - Obtener API key de RENIEC
3. **Personalizar templates** - Ajustar diseño de emails
4. **Configurar limpieza automática** - Programar limpieza de códigos expirados

## Notas de Producción

- Configurar Rate Limiting para APIs
- Usar HTTPS siempre
- Configurar logs adecuados
- Monitorear intentos de verificación
- Implementar CAPTCHA si es necesario