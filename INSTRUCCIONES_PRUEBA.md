# 🔧 GUÍA DE PRUEBA PARA SOLUCIONAR "Ups! Algo salió mal"

## 📋 PASO A PASO EXACTO

### 1. 🧪 PRUEBA RÁPIDA DE DIAGNÓSTICO
```
http://localhost:3000/test-culqi
```

**Hacer en orden:**
1. **"🗄️ Probar Base de Datos"** - Debe mostrar `"success": true`
2. **"Probar Config Básica"** - Debe mostrar claves configuradas  
3. **"🧪 Probar Pago Completo"** - Debe mostrar cargo exitoso

**Si cualquiera falla → revisar logs en F12**

### 2. 🎯 PRUEBA DE PAGO COMPLETO (Frontend)
```
http://localhost:3000/donaciones
```

**Datos EXACTOS a usar:**
- **Monto:** S/ 10.00 (o cualquier monto)
- **Método:** "Tarjeta (Culqi)" 
- **Email:** `review@culqi.com` (IMPORTANTE - usar este email)

**En el modal de Culqi usar:**
- **Tarjeta:** `4111 1111 1111 1111`
- **CVV:** `123` 
- **Vencimiento:** `12/30`
- **Email:** `review@culqi.com`

### 3. 🔍 QUÉ BUSCAR EN LOGS (F12 → Console)

#### ✅ **LOGS DE ÉXITO:**
```
[CULQI] Token recibido: tkn_test_xxxxx
[CULQI] Respuesta del servidor: {success: true...}
[CULQI] ✅ Pago exitoso!
[CULQI CHARGE] ✅ Donación guardada en BD
```

#### ❌ **LOGS DE ERROR COMUNES:**
```
[CULQI] ❌ Error procesando pago: [mensaje]
[API] Error creating donation: [detalle]
[CULQI CHARGE] Error: [problema específico]
```

### 4. 🚨 SI SIGUE FALLANDO

**Verificar en orden:**

1. **Variables de entorno en .env.local:**
```env
NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_test_XcaT7eUAdQ6y7CBp
CULQI_SECRET_KEY=sk_test_d0k1OohbDJnJ8KBg
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

2. **Tabla de base de datos:** 
   - Ir a `http://localhost:3000/test-culqi`
   - Probar "🗄️ Probar Base de Datos"
   - Debe devolver `success: true`

3. **Conectividad a Culqi:**
   - Verificar que puedes acceder a `https://api.culqi.com`
   - Sin proxy/firewall bloqueando

4. **Revisar Network tab en F12:**
   - Buscar llamadas a `/api/payments/culqi/create-charge`
   - Ver si retorna 200 OK o algún error

### 5. 📧 EMAIL CRÍTICO

**USAR SIEMPRE:** `review@culqi.com`

Este email es especial para las pruebas de Culqi. Otros emails podrían causar errores.

### 6. ⚡ SOLUCIÓN RÁPIDA

Si nada funciona, reiniciar servidor:
1. Ctrl+C en terminal
2. `npm run dev` de nuevo
3. Probar con datos exactos arriba

## 🎯 RESULTADO ESPERADO

Después del pago exitoso deberías ver:
1. Modal de Culqi se cierra
2. Mensaje "¡Pago exitoso!" 
3. Redirección a página de éxito
4. Donación guardada en base de datos

**Ya no debería aparecer "Ups! Algo salió mal"**