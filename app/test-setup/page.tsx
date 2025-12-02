'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestSetupPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDatabaseSetup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/setup/donaciones')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({ error: 'Error conectando con la API' })
    }
    setLoading(false)
  }

  const recreateTable = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/setup/donaciones', { method: 'POST' })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({ error: 'Error recreando tabla' })
    }
    setLoading(false)
  }

  const testCulqiConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test/culqi-config')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({ error: 'Error probando configuración Culqi' })
    }
    setLoading(false)
  }

  const testDonacionTable = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test/donacion-table', { method: 'POST' })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({ error: 'Error probando tabla donacion' })
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">🔧 Test de Configuración - Sistema de Donaciones</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>🗄️ Base de Datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Verificar y crear la tabla de donaciones en Supabase
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={testDatabaseSetup}
                disabled={loading}
                className="flex-1"
              >
                Verificar/Crear Tabla
              </Button>
              <Button 
                onClick={testDonacionTable}
                disabled={loading}
                variant="secondary"
                className="flex-1"
              >
                Test Tabla
              </Button>
            </div>
            <Button 
              onClick={recreateTable}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Recrear Tabla
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💳 Culqi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Verificar configuración de claves Culqi
            </p>
            <Button 
              onClick={testCulqiConfig}
              disabled={loading}
              className="w-full"
            >
              Probar Configuración
            </Button>
          </CardContent>
        </Card>
      </div>

      {results && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📋 Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            {results.error ? (
              <Alert variant="destructive">
                <AlertDescription>
                  ❌ Error: {results.error}
                  {results.details && <pre className="mt-2 text-xs">{JSON.stringify(results.details, null, 2)}</pre>}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertDescription>
                  ✅ {results.message || 'Operación exitosa'}
                  <pre className="mt-2 text-xs bg-muted p-2 rounded">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📝 Variables de Entorno</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>NEXT_PUBLIC_CULQI_PUBLIC_KEY:</span>
              <code className="bg-muted px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY ? '✅ Configurada' : '❌ Faltante'}
              </code>
            </div>
            <div className="flex justify-between">
              <span>CULQI_SECRET_KEY:</span>
              <code className="bg-muted px-2 py-1 rounded">
                {process.env.CULQI_SECRET_KEY ? '✅ Configurada' : '❌ Faltante'}
              </code>
            </div>
            <div className="flex justify-between">
              <span>SUPABASE_URL:</span>
              <code className="bg-muted px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ Faltante'}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="mt-6">
        <AlertDescription>
          <strong>💡 Instrucciones:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Primero ejecuta "Verificar/Crear Tabla" para configurar la base de datos</li>
            <li>Luego prueba "Probar Configuración" para verificar Culqi</li>
            <li>Si todo está ✅, ve a <code>/donaciones</code> para probar el sistema completo</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  )
}