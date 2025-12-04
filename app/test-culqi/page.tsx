'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle, Smartphone, CreditCard } from 'lucide-react'

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

      // Configurar checkout de prueba
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
        
      } else {
        addLog('❌ CulqiCheckout no está disponible')
      }

    } catch (error: any) {
      addLog(`❌ Error en prueba: ${error.message}`)
    } finally {
      setTestingCheckout(false)
    }
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔧 Diagnóstico de Culqi y Yape</h1>
        <p className="text-muted-foreground">
          Herramienta para diagnosticar y probar la configuración de pagos con Culqi y Yape
        </p>
      </div>

      {/* Controles */}
      <div className="flex gap-4 mb-6">
        <Button onClick={runDiagnostic} disabled={isLoading}>
          {isLoading ? 'Ejecutando...' : '🔍 Ejecutar Diagnóstico'}
        </Button>
        <Button 
          onClick={testCheckout} 
          disabled={!scriptsLoaded || testingCheckout}
          variant="outline"
        >
          {testingCheckout ? 'Probando...' : '🧪 Probar Checkout'}
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
                    <span className="font-medium">Yape Soportado:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(diagnosticResult.diagnostic?.yapeConfiguration.supportedInEnvironment)}
                      <span className="text-sm">
                        {diagnosticResult.diagnostic?.yapeConfiguration.supportedInEnvironment ? 'Sí' : 'No'}
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
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }>
                    {diagnosticResult?.diagnostic?.environment.isProduction ? 'Debería estar habilitado' : 'Solo en producción'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          {diagnosticResult?.diagnostic?.troubleshooting && (
            <Card>
              <CardHeader>
                <CardTitle>🛠️ Solución de Problemas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Problemas Comunes:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      {diagnosticResult.diagnostic.troubleshooting.commonIssues.map((issue, idx) => (
                        <li key={idx}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Soluciones:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      {diagnosticResult.diagnostic.troubleshooting.solutions.map((solution, idx) => (
                        <li key={idx}>• {solution}</li>
                      ))}
                    </ul>
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
              Registro de eventos y debugging
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
          <CardTitle>📋 Instrucciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>1. Ejecutar Diagnóstico:</strong> Verifica el estado actual de tu configuración de Culqi.</p>
            <p><strong>2. Probar Checkout:</strong> Abre el modal de pago para verificar que Yape aparezca como opción.</p>
            <p><strong>3. Revisar Logs:</strong> Observa los logs para identificar cualquier problema.</p>
            <p><strong>4. Si Yape no aparece:</strong> Contacta al soporte de Culqi para verificar que esté habilitado en tu cuenta.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
    if (status === false) return <XCircle className="w-5 h-5 text-red-500" />
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />
  }

  const getStatusColor = (status: boolean | undefined) => {
    if (status === true) return 'bg-green-100 text-green-800 border-green-200'
    if (status === false) return 'bg-red-100 text-red-800 border-red-200'
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔧 Diagnóstico de Culqi y Yape</h1>
        <p className="text-muted-foreground">
          Herramienta para diagnosticar y probar la configuración de pagos con Culqi y Yape
        </p>
      </div>

      {/* Controles */}
      <div className="flex gap-4 mb-6">
        <Button onClick={runDiagnostic} disabled={isLoading}>
          {isLoading ? 'Ejecutando...' : '🔍 Ejecutar Diagnóstico'}
        </Button>
        <Button 
          onClick={testCheckout} 
          disabled={!scriptsLoaded || testingCheckout}
          variant="outline"
        >
          {testingCheckout ? 'Probando...' : '🧪 Probar Checkout'}
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
                    <span className="font-medium">Yape Soportado:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(diagnosticResult.diagnostic?.yapeConfiguration.supportedInEnvironment)}
                      <span className="text-sm">
                        {diagnosticResult.diagnostic?.yapeConfiguration.supportedInEnvironment ? 'Sí' : 'No'}
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
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }>
                    {diagnosticResult?.diagnostic?.environment.isProduction ? 'Debería estar habilitado' : 'Solo en producción'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          {diagnosticResult?.diagnostic?.troubleshooting && (
            <Card>
              <CardHeader>
                <CardTitle>🛠️ Solución de Problemas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Problemas Comunes:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      {diagnosticResult.diagnostic.troubleshooting.commonIssues.map((issue, idx) => (
                        <li key={idx}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Soluciones:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      {diagnosticResult.diagnostic.troubleshooting.solutions.map((solution, idx) => (
                        <li key={idx}>• {solution}</li>
                      ))}
                    </ul>
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
              Registro de eventos y debugging
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
          <CardTitle>📋 Instrucciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>1. Ejecutar Diagnóstico:</strong> Verifica el estado actual de tu configuración de Culqi.</p>
            <p><strong>2. Probar Checkout:</strong> Abre el modal de pago para verificar que Yape aparezca como opción.</p>
            <p><strong>3. Revisar Logs:</strong> Observa los logs para identificar cualquier problema.</p>
            <p><strong>4. Si Yape no aparece:</strong> Contacta al soporte de Culqi para verificar que esté habilitado en tu cuenta.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
      setApiTest(data)
    } catch (error) {
      console.error('Error probando conexión:', error)
      setApiTest({ error: 'Error de conexión' })
    }
    setLoading(false)
  }

  const testServerEnv = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test/env-check')
      const data = await response.json()
      console.log('Variables del servidor:', data)
      setApiTest({
        ...data,
        comparison: {
          clientKey: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY,
          serverKey: data.server?.NEXT_PUBLIC_CULQI_PUBLIC_KEY,
          match: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY === data.server?.NEXT_PUBLIC_CULQI_PUBLIC_KEY
        }
      })
    } catch (error) {
      console.error('Error probando variables del servidor:', error)
      setApiTest({ error: 'Error verificando variables del servidor' })
    }
    setLoading(false)
  }

  const testDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test/database-check')
      const data = await response.json()
      console.log('Respuesta de base de datos:', data)
      setApiTest(data)
    } catch (error) {
      console.error('Error probando base de datos:', error)
      setApiTest({ error: 'Error de base de datos' })
    }
    setLoading(false)
  }

  const testCulqiPayment = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test/culqi-payment', {
        method: 'POST'
      })
      const data = await response.json()
      console.log('Respuesta de pago de prueba:', data)
      setApiTest(data)
    } catch (error) {
      console.error('Error probando pago:', error)
      setApiTest({ error: 'Error de pago' })
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Diagnóstico de Culqi</h1>
      
      <div className="grid gap-6">
        {/* Variables de Entorno Frontend */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 Configuración de Culqi (Nueva)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className={`p-3 rounded ${envVars?.publicKeyFromConfig ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p><strong>✅ Clave Pública (Nueva Configuración):</strong></p>
                <p className="font-mono text-sm">{envVars?.publicKeyFromConfig || 'ERROR'}</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded">
                <p><strong>📊 Comparación:</strong></p>
                <p>• <strong>Desde Config:</strong> {envVars?.publicKeyFromConfig?.substring(0, 15) + '...' || 'ERROR'}</p>
                <p>• <strong>Desde ENV:</strong> {envVars?.publicKeyFromEnv}</p>
                <p>• <strong>Usando Fallback:</strong> {envVars?.configWorking ? 'SÍ' : 'NO'}</p>
              </div>
              
              <div className="space-y-1">
                <p><strong>Base URL:</strong> {envVars?.baseUrl}</p>
                <p><strong>NODE_ENV:</strong> {envVars?.nodeEnv}</p>
                <p><strong>Fallback Key:</strong> {envVars?.fallbackKey?.substring(0, 15) + '...'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pruebas de API */}
        <Card>
          <CardHeader>
            <CardTitle>Pruebas de Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-x-2 space-y-2 flex flex-wrap">
              <Button onClick={testServerEnv} disabled={loading}>
                🔍 Variables Servidor vs Cliente
              </Button>
              <Button onClick={testCulqiConfig} disabled={loading}>
                Probar Config Básica
              </Button>
              <Button onClick={testCulqiConnection} disabled={loading}>
                Probar Conexión API
              </Button>
              <Button onClick={testDatabase} disabled={loading}>
                🗄️ Probar Base de Datos
              </Button>
              <Button onClick={testCulqiPayment} disabled={loading}>
                🧪 Probar Pago Completo
              </Button>
            </div>
            
            {apiTest && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(apiTest, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prueba de Culqi en Frontend */}
        <Card>
          <CardHeader>
            <CardTitle>Prueba de Culqi Frontend</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                // Cargar script de Culqi para probar
                const script = document.createElement('script')
                script.src = 'https://checkout.culqi.com/js/v4'
                script.onload = () => {
                  console.log('Culqi cargado:', window.Culqi)
                  alert(`Culqi cargado: ${window.Culqi ? 'SÍ' : 'NO'}`)
                }
                script.onerror = () => {
                  alert('Error cargando Culqi')
                }
                document.head.appendChild(script)
              }}
            >
              Cargar Script Culqi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}