# 🔄 CORRECCIÓN: URL CORRECTA CUSTOM CULQI CHECKOUT

## ❌ **Problema identificado:**
Estabas usando la URL incorrecta para el Custom Culqi Checkout.

### **❌ ANTES (URL incorrecta):**
```javascript
script.src = 'https://checkout.culqi.com/js/v4'
// Esto cargaba solo: window.Culqi (básico)
// NO cargaba: window.CulqiCheckout (undefined)
```

### **✅ AHORA (URL correcta según documentación):**
```javascript
script.src = 'https://js.culqi.com/checkout-js'
// Esto cargará: window.CulqiCheckout (Custom)
// Y también: window.Culqi
```

## ✅ **Cambios aplicados:**

### 1. **URL del script corregida:**
- 🔧 Cambié de `checkout.culqi.com/js/v4` → `js.culqi.com/checkout-js`
- 📚 Según documentación oficial de Culqi

### 2. **Configuración mejorada:**
```javascript
const settings = {
  title: 'Donación - Adopción Mascotas',
  currency: 'PEN',
  amount: amount, // En centavos
  description: 'Donación para mascotas'
}

const paymentMethods = {
  tarjeta: true,
  yape: true,        // ✅ Habilitado según documentación
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

const appearance = {
  theme: "default",
  hiddenCulqiLogo: false,
  menuType: "sidebar",
  buttonCardPayText: "Pagar donación",
  defaultStyle: {
    bannerColor: "#0074D9",
    buttonBackground: "#0074D9",
    buttonTextColor: "#FFFFFF"
  }
}
```

### 3. **Constructor correcto:**
```javascript
// ✅ Según documentación exacta
const culqiCheckout = new window.CulqiCheckout(publicKey, config)
culqiCheckout.culqi = handleCulqiAction
culqiCheckout.open()
```

## 🧪 **Para probar:**

### **1. Recarga la página** para que cargue el script correcto
### **2. Click en "🔍 Debug Culqi"** - ahora debería mostrar:
```
Culqi: object
CulqiCheckout: function ← ¡Esto es lo importante!
Scripts js.culqi: 1
```

### **3. Intenta donar** - ahora debería abrir el Custom Checkout

## 🎯 **Resultado esperado:**

Con la URL correcta, deberías ver:
- ✅ **Interfaz mejorada** con menú sidebar
- ✅ **Yape como opción** (si tu cuenta lo tiene habilitado)
- ✅ **Mejor experiencia de usuario**
- ✅ **Más opciones de personalización**

## 📚 **Referencias:**

**Documentación oficial Culqi:**
- URL del script: `https://js.culqi.com/checkout-js`
- Constructor: `new CulqiCheckout(publicKey, config)`
- Personalización: `appearance` object
- Métodos de pago: `paymentMethods` object

---

**🎯 NEXT STEP:** Recarga la página y usa el botón debug para verificar que ahora `CulqiCheckout` sea `function` en lugar de `undefined`.