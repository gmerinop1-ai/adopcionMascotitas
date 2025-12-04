# 🔐 GUÍA DE SEGURIDAD PARA CREDENCIALES DE PRODUCCIÓN

## ✅ **Configuración completada:**
- ✅ Llaves de producción configuradas en `.env.local`
- ✅ Fallbacks actualizados a credenciales de producción
- ✅ Sistema listo para transacciones reales

## 🚨 **MEDIDAS DE SEGURIDAD CRÍTICAS:**

### 1. **Archivo `.env.local`**
- ⚠️ **NUNCA** hacer commit de `.env.local` al repositorio
- ✅ Verificar que `.env.local` está en `.gitignore`
- 🔒 Mantener este archivo solo en tu servidor de producción

### 2. **Credenciales configuradas:**
- 🟢 **Pública (frontend):** `pk_live_I5HoDzRiSWhBtcnq`
- 🔴 **Privada (backend):** `sk_live_o1ZOCqibG4JOsNzD`

### 3. **Variables de entorno:**
```env
NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_live_I5HoDzRiSWhBtcnq
CULQI_SECRET_KEY=sk_live_o1ZOCqibG4JOsNzD
```

## 🚀 **Para despliegue en producción:**

### **Vercel:**
```bash
vercel env add NEXT_PUBLIC_CULQI_PUBLIC_KEY
vercel env add CULQI_SECRET_KEY
vercel env add NEXT_PUBLIC_BASE_URL
```

### **Netlify:**
```bash
netlify env:set NEXT_PUBLIC_CULQI_PUBLIC_KEY pk_live_I5HoDzRiSWhBtcnq
netlify env:set CULQI_SECRET_KEY sk_live_o1ZOCqibG4JOsNzD
```

## ⚠️ **IMPORTANTE - Diferencias con credenciales de prueba:**

### **Tarjetas de prueba YA NO funcionarán**
- ❌ `4111 1111 1111 1111` ya no funciona
- ❌ `4444 3333 2222 1111` ya no funciona
- ✅ Ahora necesitas tarjetas reales para probar

### **Transacciones serán REALES**
- 💰 Se cobrarán montos reales
- 📧 Se enviarán emails reales a los donantes
- 💳 Se procesarán con bancos reales

## 🧪 **Recomendación para testing:**

### **Crear ambiente de staging:**
1. Mantener un `.env.local.test` con credenciales de prueba
2. Usar `.env.local.production` con credenciales reales
3. Cambiar según el ambiente que necesites

## 🔍 **Verificación antes de ir live:**
- [ ] Probar con una donación pequeña real (S/ 1)
- [ ] Verificar que lleguen los emails correctamente
- [ ] Comprobar que se registren las donaciones en la BD
- [ ] Revisar los logs de Culqi en su dashboard

## 📞 **Soporte:**
- **Culqi Dashboard:** https://integ-panel.culqi.com/
- **Documentación:** https://docs.culqi.com/
- **Soporte:** soporte@culqi.com

**¡Tu aplicación ya está lista para procesar donaciones reales!** 🎉