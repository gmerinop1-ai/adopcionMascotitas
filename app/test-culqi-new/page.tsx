'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle, Smartphone, CreditCard, Search } from 'lucide-react'

// Declarar Culqi global
declare global {
  interface Window {
    Culqi: any
    CulqiCheckout: any
  }
}

interface DiagnosticResult {
  success: boolean
  diagnostic?: {
    environment: {
      detected: string
      isProduction: boolean
    }
    credentials: {
      valid?: boolean
      publicKeyPresent: boolean
    }
    yapeConfiguration: {
      supportedInEnvironment: boolean
      shouldBeEnabled: boolean
      inProductionEnvironment: boolean
      configurationSteps: string[]
      contactInfo: {
        email: string
        phone: string
        question: string
      }
    }
    troubleshooting: {
      commonIssues: string[]
      solutions: string[]
    }
  }
  error?: string
}

export default function CulqiTestPage() {
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [scriptsLoaded, setScriptsLoaded] = useState(false)
  const [testingCheckout, setTestingCheckout] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[CULQI TEST] ${message}`)
  }

  // Cargar diagnóstico inicial
  useEffect(() => {
    runDiagnostic()
  }, [])

  // Cargar scripts de Culqi
  useEffect(() => {
    loadCulqiScripts()
  }, [])

  const runDiagnostic = async () => {
    setIsLoading(true)
    addLog('Iniciando diagnóstico de Culqi...')
    
    try {
      const response = await fetch('/api/debug/culqi')
      const result = await response.json()
      setDiagnosticResult(result)
      
      if (result.success) {
        addLog(`✅ Diagnóstico completado - Entorno: ${result.diagnostic.environment.detected}`)
        addLog(`Yape soportado: ${result.diagnostic.yapeConfiguration.supportedInEnvironment ? 'Sí' : 'No'}`)
        addLog(`En entorno de producción: ${result.diagnostic.yapeConfiguration.inProductionEnvironment ? 'Sí' : 'No'}`)
      } else {
        addLog(`❌ Error en diagnóstico: ${result.error}`)
      }
    } catch (error: any) {
      addLog(`❌ Error ejecutando diagnóstico: ${error.message}`)
      setDiagnosticResult({ success: false, error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const loadCulqiScripts = () => {
    addLog('Cargando scripts de Culqi...')
    
    if (window.CulqiCheckout) {
      addLog('✅ CulqiCheckout ya está disponible')
      setScriptsLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://js.culqi.com/checkout-js'
    script.async = true
    
    script.onload = () => {
      addLog('✅ Script de Culqi cargado exitosamente')
      addLog(`CulqiCheckout disponible: ${typeof window.CulqiCheckout}`)
      addLog(`Culqi disponible: ${typeof window.Culqi}`)
      setScriptsLoaded(true)
    }
    
    script.onerror = () => {
      addLog('❌ Error cargando script de Culqi')
    }
    
    document.head.appendChild(script)
  }

  const testCheckout = async () => {
    if (!scriptsLoaded) {
      addLog('❌ Scripts no están cargados')
      return
    }

    setTestingCheckout(true)
    addLog('🧪 Iniciando prueba de checkout...')

    try {
      // Obtener clave pública
      const sessionResponse = await fetch('/api/payments/culqi/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 10,
          frequency: 'one-time',
          donor_name: 'Prueba Yape',
          donor_email: 'prueba@test.com',
          message: 'Prueba de configuración Yape'
        })
      })

      const sessionResult = await sessionResponse.json()
      
      if (!sessionResult.success) {
        addLog(`❌ Error creando sesión: ${sessionResult.error}`)
        return
      }

      addLog('✅ Sesión creada exitosamente')
      addLog(`Monto: ${sessionResult.culqiData.amount / 100} PEN`)

      // Configurar checkout de prueba con configuración específica para Yape
      const config = {
        settings: {
          title: 'Prueba - Donación Yape',
          currency: 'PEN',
          amount: sessionResult.culqiData.amount,
          description: 'Prueba de configuración Yape'
        },
        client: {
          email: 'prueba@test.com'
        },
        options: {
          lang: 'es',
          modal: true,
          paymentMethods: {
            tarjeta: true,
            yape: true,
            billetera_movil: true
          },
          style: {
            maincolor: '#3b82f6'
          }
        }
      }

      addLog('Configuración del checkout:')
      addLog(JSON.stringify(config, null, 2))

      if (window.CulqiCheckout) {
        addLog('🚀 Abriendo checkout con CulqiCheckout...')
        
        const checkout = new window.CulqiCheckout(sessionResult.publicKey, config)
        
        checkout.culqi = () => {
          addLog('💰 Callback de Culqi ejecutado')
          addLog(`Token generado: ${window.Culqi?.token?.id ? 'Sí' : 'No'}`)
          if (window.Culqi?.error) {
            addLog(`❌ Error: ${window.Culqi.error.user_message}`)
          }
          checkout.close()
          setTestingCheckout(false)
        }
        
        checkout.open()
        addLog('✅ Modal de checkout abierto')
        
        // Verificar métodos de pago visibles después de un breve delay
        setTimeout(() => {
          addLog('🔍 Verificando métodos de pago visibles en el modal...')
          
          // Buscar elementos específicos de métodos de pago
          const modal = document.querySelector('.culqi-modal') || document.querySelector('.culqi-checkout-modal') || document.querySelector('[class*="culqi"]')
          if (modal) {
            addLog('✅ Modal encontrado en DOM')
            
            // Buscar indicadores de métodos de pago
            const paymentMethods = modal.querySelectorAll('.payment-method, .culqi-payment-method, [data-payment-method]')
            addLog(`📊 Métodos de pago encontrados: ${paymentMethods.length}`)
            
            // Buscar específicamente Yape
            const yapeElements = modal.querySelectorAll('[data-payment-method="yape"], .yape, .payment-yape')
            const yapeText = modal.textContent?.toLowerCase().includes('yape')
            
            addLog(`🟣 Elementos Yape encontrados: ${yapeElements.length}`)
            addLog(`📝 Texto "yape" en modal: ${yapeText ? 'Sí' : 'No'}`)
            
            // Buscar tarjetas
            const cardElements = modal.querySelectorAll('[data-payment-method="card"], .card, .payment-card, .tarjeta')
            const cardText = modal.textContent?.toLowerCase().includes('tarjeta') || modal.textContent?.toLowerCase().includes('card')
            
            addLog(`💳 Elementos tarjeta encontrados: ${cardElements.length}`)
            addLog(`📝 Texto "tarjeta/card" en modal: ${cardText ? 'Sí' : 'No'}`)
            
            // Log del contenido del modal para debug
            const modalText = modal.textContent?.substring(0, 300)
            addLog(`📄 Contenido del modal: ${modalText}`)
            
          } else {
            addLog('❌ Modal no encontrado en DOM')
            inspectDOM()
          }
        }, 2000)
        
      } else {
        addLog('❌ CulqiCheckout no está disponible')
      }

    } catch (error: any) {
      addLog(`❌ Error en prueba: ${error.message}`)
    } finally {
      setTestingCheckout(false)
    }
  }

  const inspectDOM = () => {
    addLog('🔍 Inspeccionando DOM completo para elementos de Culqi...')
    
    // Buscar todos los elementos relacionados con Culqi
    const culqiElements = document.querySelectorAll('[class*="culqi"], [id*="culqi"], [data-culqi]')
    addLog(`📊 Elementos Culqi totales: ${culqiElements.length}`)
    
    if (culqiElements.length > 0) {
      culqiElements.forEach((element, index) => {
        const className = element.className
        const id = element.id
        const content = element.textContent?.substring(0, 100) || ''
        addLog(`${index + 1}. Clase: "${className}", ID: "${id}", Contenido: "${content.replace(/\n/g, ' ')}"`)
      })
    }
    
    // Verificar si hay iframes (Culqi a veces usa iframes)
    const iframes = document.querySelectorAll('iframe')
    addLog(`🖼️ iFrames encontrados: ${iframes.length}`)
    
    if (iframes.length > 0) {
      iframes.forEach((iframe, index) => {
        const src = iframe.src || 'sin src'
        addLog(`iframe ${index + 1}: ${src}`)
      })
    }

    // Buscar cualquier elemento con texto relevante
    const allElements = document.querySelectorAll('*')
    let yapeFound = false
    let cardFound = false
    
    allElements.forEach((element) => {
      const text = element.textContent?.toLowerCase() || ''
      if (text.includes('yape') && !yapeFound) {
        addLog(`🟣 Encontrado texto "yape" en: ${element.tagName} con clase: ${element.className}`)
        yapeFound = true
      }
      if ((text.includes('tarjeta') || text.includes('card')) && !cardFound) {
        addLog(`💳 Encontrado texto tarjeta/card en: ${element.tagName} con clase: ${element.className}`)
        cardFound = true
      }
    })
  }

  const getStatusIcon = (status: boolean | undefined) => {
    if (status === true) return <CheckCircle className="w-5 h-5 text-green-500" />
    if (status === false) return <XCircle className="w-5 h-5 text-red-500" />
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />
  }

  const getStatusColor = (status: boolean | undefined) => {
    if (status === true) return 'bg-green-100 text-green-800 border-green-200'
    if (status === false) return 'bg-red-100 text-red-800 border-red-200'
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔧 Diagnóstico Avanzado de Culqi y Yape</h1>
        <p className="text-muted-foreground">
          Herramienta completa para diagnosticar y resolver problemas con Culqi y Yape
        </p>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button onClick={runDiagnostic} disabled={isLoading}>
          {isLoading ? 'Ejecutando...' : '🔍 Diagnóstico'}
        </Button>
        <Button 
          onClick={testCheckout} 
          disabled={!scriptsLoaded || testingCheckout}
          variant="outline"
        >
          {testingCheckout ? 'Probando...' : '🧪 Probar Checkout'}
        </Button>
        <Button 
          onClick={inspectDOM} 
          variant="outline"
          size="sm"
        >
          <Search className="w-4 h-4 mr-1" />
          Inspeccionar DOM
        </Button>
        <Button 
          onClick={() => setLogs([])} 
          variant="outline"
          size="sm"
        >
          🗑️ Limpiar Logs
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Resultado del Diagnóstico */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📊 Estado del Sistema</CardTitle>
              <CardDescription>
                Diagnóstico de la configuración actual de Culqi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!diagnosticResult ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Ejecuta el diagnóstico para ver el estado</p>
                </div>
              ) : diagnosticResult.success ? (
                <div className="space-y-4">
                  {/* Entorno */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Entorno:</span>
                    <Badge className={getStatusColor(diagnosticResult.diagnostic?.environment.isProduction)}>
                      {diagnosticResult.diagnostic?.environment.detected}
                    </Badge>
                  </div>

                  {/* Credenciales */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Credenciales:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(diagnosticResult.diagnostic?.credentials.valid)}
                      <span className="text-sm">
                        {diagnosticResult.diagnostic?.credentials.valid === true ? 'Válidas' : 
                         diagnosticResult.diagnostic?.credentials.valid === false ? 'Inválidas' : 
                         'No verificadas'}
                      </span>
                    </div>
                  </div>

                  {/* Yape */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Yape Disponible:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(diagnosticResult.diagnostic?.yapeConfiguration.inProductionEnvironment)}
                      <span className="text-sm">
                        {diagnosticResult.diagnostic?.yapeConfiguration.inProductionEnvironment ? 'Sí (requiere activación)' : 'No (solo producción)'}
                      </span>
                    </div>
                  </div>

                  {/* Scripts */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Scripts Cargados:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(scriptsLoaded)}
                      <span className="text-sm">{scriptsLoaded ? 'Sí' : 'No'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="w-4 h-4" />
                  <AlertDescription>
                    Error en diagnóstico: {diagnosticResult.error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Métodos de Pago */}
          <Card>
            <CardHeader>
              <CardTitle>💳 Métodos de Pago</CardTitle>
              <CardDescription>
                Estado de los métodos de pago disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  <span className="flex-1">Tarjetas de Crédito/Débito</span>
                  <Badge className="bg-green-100 text-green-800">Habilitado</Badge>
                </div>
                
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-purple-500" />
                  <span className="flex-1">Yape</span>
                  <Badge className={
                    diagnosticResult?.diagnostic?.environment.isProduction 
                      ? "bg-yellow-100 text-yellow-800" 
                      : "bg-red-100 text-red-800"
                  }>
                    {diagnosticResult?.diagnostic?.environment.isProduction ? 'Requiere activación en Culqi' : 'Solo en producción'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Contacto */}
          {diagnosticResult?.diagnostic?.yapeConfiguration?.contactInfo && (
            <Card>
              <CardHeader>
                <CardTitle>📞 Contactar Soporte Culqi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> {diagnosticResult.diagnostic.yapeConfiguration.contactInfo.email}</p>
                  <p><strong>Teléfono:</strong> {diagnosticResult.diagnostic.yapeConfiguration.contactInfo.phone}</p>
                  <p><strong>Pregunta específica:</strong></p>
                  <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                    "{diagnosticResult.diagnostic.yapeConfiguration.contactInfo.question}"
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Logs en Tiempo Real</CardTitle>
            <CardDescription>
              Registro de eventos y debugging detallado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No hay logs aún...</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instrucciones */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📋 Instrucciones de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-3">
            <div>
              <h4 className="font-medium mb-1">1. Ejecutar Diagnóstico:</h4>
              <p className="text-muted-foreground">Verifica el estado actual de tu configuración y entorno de Culqi.</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">2. Probar Checkout:</h4>
              <p className="text-muted-foreground">Abre el modal de pago y observa qué métodos aparecen realmente.</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">3. Inspeccionar DOM:</h4>
              <p className="text-muted-foreground">Analiza los elementos HTML para identificar problemas de renderizado.</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">4. Contactar Culqi:</h4>
              <p className="text-muted-foreground">Si Yape no aparece, usa la información de contacto para solicitar activación.</p>
            </div>

            <Alert className="mt-4">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>Importante:</strong> Yape solo está disponible en cuentas de producción habilitadas. 
                Contacta a Culqi para verificar y activar Yape en tu cuenta específica.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}