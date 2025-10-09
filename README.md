# Catálogo de Mascotas 🐾

Sistema de catálogo de mascotas con funciones de administración y recuperación de contraseñas.

## 🚀 Despliegue en Render

### Pasos para desplegar:

1. **Conectar el repositorio a Render**
   - Ve a [render.com](https://render.com)
   - Conecta tu cuenta de GitHub
   - Selecciona este repositorio

2. **Configurar las variables de entorno en Render:**

   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima

   # Email (SMTP)
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=tu_email@gmail.com
   EMAIL_SERVER_PASSWORD=tu_contraseña_de_aplicacion

   # URL de la aplicación
   NEXT_PUBLIC_APP_URL=https://tu-app.onrender.com
   ```

3. **Configuración del servicio:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Node Version:** 18.x o superior

### ⚙️ Configuración de Base de Datos

Asegúrate de que tu base de datos Supabase tenga estas tablas:

```sql
-- Agregar columnas para recuperación de contraseña
ALTER TABLE usuario 
ADD COLUMN reset_token TEXT, 
ADD COLUMN reset_token_expires TIMESTAMP WITH TIME ZONE;
```

### 📧 Configuración de Email

Para Gmail, necesitas:
1. Activar la verificación en 2 pasos
2. Generar una contraseña de aplicación
3. Usar esa contraseña en `EMAIL_SERVER_PASSWORD`

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build
npm start
```

## 📋 Funcionalidades

- ✅ Catálogo de mascotas
- ✅ Panel administrativo
- ✅ Recuperación de contraseñas por email
- ✅ Autenticación de usuarios
- ✅ Gestión de mascotas

## 🔧 Tecnologías

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, Shadcn/UI
- **Backend:** Next.js API Routes
- **Base de Datos:** Supabase (PostgreSQL)
- **Email:** Nodemailer
- **Despliegue:** Render
