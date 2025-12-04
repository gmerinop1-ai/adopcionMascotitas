# 🔄 ACTUALIZACIÓN A CUSTOM CULQI CHECKOUT

## ✅ **Cambios realizados según documentación:**

### 1. **Script actualizado:**
```javascript
// ❌ ANTES: Checkout básico
script.src = 'https://checkout.culqi.com/js/v4'

// ✅ AHORA: Custom Culqi Checkout (mismo URL pero implementación diferente)
script.src = 'https://checkout.culqi.com/js/v4' // Custom version
```

### 2. **Nueva implementación según documentación:**

**Configuración completa:**
```javascript
const settings = {
  title: 'Donación - Adopción Mascotas',
  currency: 'PEN',
  amount: amount, // En centavos
  description: 'Donación para mascotas'
}

const paymentMethods = {
  tarjeta: true,
  yape: true,     // ✅ Yape habilitado según documentación
  billetera: false,
  bancaMovil: false,
  agente: false,
  cuotealo: false
}

const options = {
  lang: 'es',
  installments: true,
  modal: true,
  paymentMethods: paymentMethods,
  paymentMethodsSort: Object.keys(paymentMethods)
}
```

### 3. **Nuevo constructor:**
```javascript
// ❌ ANTES: API antigua
window.Culqi.publicKey = publicKey
window.Culqi.settings({...})
window.Culqi.options({...})
window.Culqi.open()

// ✅ AHORA: Custom Culqi Checkout
const culqiCheckout = new window.CulqiCheckout(publicKey, config)
culqiCheckout.culqi = handleCulqiAction
culqiCheckout.open()
```

## 🎯 **Beneficios del Custom Checkout:**

### ✅ **Yape mejorado:**
- 📱 Mejor integración con Yape
- 🎨 Más opciones de personalización
- 🚀 Renderizado más rápido

### ✅ **Más opciones de configuración:**
- 🎨 `appearance` para estilos personalizados
- 🌍 `lang: 'es'` para idioma español
- 💳 `installments: true` para cuotas
- 📱 Mejor soporte para métodos de pago peruanos

## 🧪 **Para probar:**

### **1. Con credenciales de prueba (Yape funciona):**
```env
NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_test_XcaT7eUAdQ6y7CBp
CULQI_SECRET_KEY=sk_test_d0k1OohbDJnJ8KBg
```

### **2. Con credenciales de producción:**
```env
NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_live_I5HoDzRiSWhBtcnq
CULQI_SECRET_KEY=sk_live_o1ZOCqibG4JOsNzD
```

## 📋 **Diferencias clave:**

| Aspecto | Checkout Básico | Custom Checkout |
|---------|----------------|-----------------|
| **Constructor** | `window.Culqi` | `new window.CulqiCheckout()` |
| **Configuración** | `.settings()` + `.options()` | `config` object |
| **Yape** | Limitado | Mejor soporte |
| **Personalización** | Básica | Avanzada con `appearance` |
| **Callbacks** | `window.culqi` | `culqiCheckout.culqi` |

## 🎯 **Resultado esperado:**

### ✅ **Con credenciales de prueba:**
- 💳 Tarjetas de prueba funcionan
- 📱 **Yape aparece como opción**
- 🧪 Transacciones simuladas

### ⚠️ **Con credenciales de producción:**
- 💳 Solo tarjetas reales (Yape requiere activación de Culqi)
- 💰 Transacciones reales
- 📧 Emails reales

---

**🚀 SIGUIENTE PASO:** Probar con credenciales de prueba para verificar que Yape aparezca como opción en el nuevo Custom Checkout.