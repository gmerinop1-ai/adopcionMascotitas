# Fix para Error de Deployment en Vercel

## Problema Original
Error de compilación webpack en Vercel:
```
Assigning to rvalue (64:12)
"sk_live_o1ZOCqibG4JOsNzD" = secretKey;
```

## Correcciones Aplicadas

### 1. Archivo `app/api/payments/culqi/create-session/route.ts`
- ✅ Simplificado el código para evitar problemas de webpack
- ✅ Removida la importación problemática de `culqi` 
- ✅ Uso directo de constantes para credenciales con fallbacks
- ✅ Eliminados logs excesivos y manipulación de `process.env` en runtime

### 2. Archivo `lib/culqi.ts` 
- ✅ Cambiado de `require()` a `import * as` para mejor compatibilidad TypeScript
- ✅ Manejo mejorado de importación de módulo CommonJS

### 3. Archivo `types/culqi-node.d.ts`
- ✅ Creado declaración de tipos TypeScript para `culqi-node`
- ✅ Evita errores de tipos durante compilación

### 4. Archivo `next.config.mjs`
- ✅ Agregado `swcMinify: true`
- ✅ Agregado `transpilePackages: ['culqi-node']`
- ✅ Configuración optimizada del compilador

### 5. Archivo `tsconfig.json`
- ✅ Incluida carpeta `types/` en la compilación

### 6. Archivo `.npmrc`
- ✅ Agregado `strict-peer-deps=false` para evitar conflictos

## Notas Importantes

1. **Variables de Entorno**: Las credenciales de Culqi deben configurarse en Vercel:
   - `NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_live_I5HoDzRiSWhBtcnq`
   - `CULQI_SECRET_KEY=sk_live_o1ZOCqibG4JOsNzD`

2. **Fallbacks**: Si las variables de entorno fallan, el código usa fallbacks hardcoded.

3. **SWC**: El error inicial era relacionado con dependencias de SWC missing, solucionado con la configuración del `next.config.mjs`.

## Para Deployments Futuros

1. Mantener la simplicidad en los archivos API
2. Evitar manipulación dinámica de `process.env`
3. Usar tipos TypeScript apropiados
4. Verificar que todas las dependencias están en `package.json`