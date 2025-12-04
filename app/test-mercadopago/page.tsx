'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function TestMercadoPagoPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testMercadoPagoConfig = async () => {
    setIsLoading(true)
    try {
      // Test 1: Verificar variables de entorno
      const envTest = {
        publicKey: !!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
        publicKeyValue: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.substring(0, 15) + '...',
        baseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
        baseUrlValue: process.env.NEXT_PUBLIC_BASE_URL
      }

      // Test 2: Probar creación de preferencia
      const preferenceTest = await fetch('/api/payments/mercadopago/test-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      })

      const preferenceResult = await preferenceTest.json()

      setTestResults({
        env: envTest,
        preference: preferenceResult
      })

    } catch (error: any) {
      setTestResults({
        error: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">🧪 Test MercadoPago Configuration</h1>
        <p className="text-muted-foreground">
          Verifica que tu configuración de MercadoPago esté correcta
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Verificación de Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testMercadoPagoConfig} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Verificando...' : 'Verificar Configuración de MercadoPago'}
            </Button>

            {testResults && (
              <div className="mt-6 space-y-4">
                {testResults.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="font-semibold text-red-800">Error</span>
                    </div>
                    <p className="text-red-700 mt-1">{testResults.error}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Variables de Entorno */}
                    <div className="bg-white border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Variables de Entorno</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Public Key:</span>
                          <div className="flex items-center">
                            {testResults.env.publicKey ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <Badge variant="secondary">{testResults.env.publicKeyValue}</Badge>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                <Badge variant="destructive">Faltante</Badge>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Base URL:</span>
                          <div className="flex items-center">
                            {testResults.env.baseUrl ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <Badge variant="secondary">{testResults.env.baseUrlValue}</Badge>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                <Badge variant="destructive">Faltante</Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Test de Preferencia */}
                    <div className="bg-white border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Test de Preferencia</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Configuración:</span>
                          <div className="flex items-center">
                            {testResults.preference.success ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <Badge variant="default">OK</Badge>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                <Badge variant="destructive">Error</Badge>
                              </>
                            )}
                          </div>
                        </div>
                        {testResults.preference.details && (
                          <div className="text-sm bg-gray-50 p-3 rounded">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(testResults.preference.details, null, 2)}
                            </pre>
                          </div>
                        )}
                        {testResults.preference.error && (
                          <div className="text-sm bg-red-50 p-3 rounded border border-red-200">
                            <p className="text-red-700 font-mono">{testResults.preference.error}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p><strong>Puerto del servidor:</strong> {typeof window !== 'undefined' ? window.location.port || '3000' : '3000'}</p>
              <p><strong>URL actual:</strong> {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}</p>
              <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}