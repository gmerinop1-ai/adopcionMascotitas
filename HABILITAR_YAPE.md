# 📱 GUÍA PARA HABILITAR YAPE EN CULQI PRODUCCIÓN

## ❌ **Problema identificado:**
Tu cuenta de Culqi en **producción** no tiene **Yape habilitado**. Esto es normal porque Yape requiere aprobación especial.

## ✅ **Configuración actual del código:**
- ✅ Yape está habilitado en la configuración de tu app
- ✅ Las credenciales de producción están configuradas
- ✅ El formulario está preparado para Yape

## 🔧 **Pasos para habilitar Yape en tu cuenta Culqi:**

### 1. **Contactar a Culqi**
📧 **Email:** soporte@culqi.com
📞 **Teléfono:** +51 1 700 8181

### 2. **Información que necesitas proporcionar:**
- 🏢 **Nombre del negocio:** Adopción Mascotitas
- 🆔 **ID de tu cuenta Culqi** (visible en tu dashboard)
- 📱 **Solicitud específica:** "Habilitar Yape como método de pago"
- 📄 **Documentos:** RUC, constitución de empresa (si aplica)

### 3. **Dashboard de Culqi - Configuración:**
1. Ingresa a: https://integ-panel.culqi.com/
2. Ve a **Configuración** → **Métodos de Pago**
3. Verifica si Yape aparece como opción disponible
4. Si no aparece, solicita habilitación a soporte

## 🧪 **Mientras tanto - Alternativas para probar:**

### **Opción 1: Volver a credenciales de prueba temporalmente**
```env
# En .env.local - Solo para probar Yape
NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_test_XcaT7eUAdQ6y7CBp
CULQI_SECRET_KEY=sk_test_d0k1OohbDJnJ8KBg
```

Con las credenciales de **prueba**, Yape SÍ debería aparecer como opción.

### **Opción 2: Verificar en Dashboard**
1. Ingresa a tu dashboard de Culqi
2. Ve a **Configuración** → **Métodos de Pago**
3. Busca la sección "Yape"
4. Si está deshabilitado, solicita activación

## 📋 **Checklist para soporte de Culqi:**

**Información a enviar:**
- [ ] Nombre del negocio: "Adopción Mascotitas"
- [ ] Tipo de negocio: "ONG/Donaciones para mascotas"
- [ ] Volumen estimado de transacciones mensuales
- [ ] Monto promedio de donaciones
- [ ] RUC o documento de constitución
- [ ] Solicitud específica: "Activar Yape para mi cuenta de producción"

## 🎯 **Respuesta esperada de Culqi:**
- ⏱️ **Tiempo de respuesta:** 1-3 días hábiles
- 📋 **Proceso:** Pueden solicitar documentación adicional
- ✅ **Activación:** Una vez aprobado, Yape aparecerá automáticamente

## 🔍 **Mientras esperas la activación:**

### **Puedes probar con tarjetas reales:**
- ✅ Visa, Mastercard funcionan inmediatamente
- ✅ Tarjetas de débito peruanas
- ✅ Todas las transacciones serán reales

### **Monitorear en Dashboard:**
- 📊 Ve a tu dashboard de Culqi
- 📈 Revisa las transacciones en tiempo real
- 💰 Verifica que se registren correctamente

## 📞 **Contactos de Culqi:**
- **Soporte:** soporte@culqi.com
- **Ventas:** ventas@culqi.com
- **Teléfono:** +51 1 700 8181
- **WhatsApp:** +51 999 999 999

---

**💡 IMPORTANTE:** Yape no es solo "otro método de pago" - requiere integración especial con el ecosistema bancario peruano, por eso Culqi lo activa bajo solicitud.

**🎯 RECOMENDACIÓN:** Envía el email a Culqi hoy mismo. Mientras tanto, tu sistema ya procesa tarjetas de crédito/débito perfectamente.