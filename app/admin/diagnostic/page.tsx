'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function DiagnosticPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkMigrations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/diagnostic/migrations')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error checking migrations:', error)
      setResults({
        error: 'Error connecting to API',
        message: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Diagnóstico de Base de Datos</CardTitle>
          <CardDescription>
            Verificar el estado de las migraciones necesarias para las entrevistas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={checkMigrations} 
              disabled={loading}
              className="w-full"
            >
              {loading ? '🔍 Verificando...' : '🚀 Verificar Migraciones'}
            </Button>

            {results && (
              <div className="space-y-4">
                {results.error ? (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription>
                      <strong>❌ Error:</strong> {results.message || results.error}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <Alert className={
                      results.migrations_complete 
                        ? "border-green-200 bg-green-50" 
                        : "border-yellow-200 bg-yellow-50"
                    }>
                      <AlertDescription>
                        <strong>
                          {results.migrations_complete ? '✅' : '⚠️'} Estado:
                        </strong> {results.instructions}
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">📋 Tabla solicitud</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Tabla existe:</span>
                              <span className={results.solicitud_table.table_exists ? 'text-green-600' : 'text-red-600'}>
                                {results.solicitud_table.table_exists ? '✅' : '❌'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>fecha_entrevista:</span>
                              <span className={results.solicitud_table.fecha_entrevista_exists ? 'text-green-600' : 'text-red-600'}>
                                {results.solicitud_table.fecha_entrevista_exists ? '✅' : '❌'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>created_at:</span>
                              <span className={results.solicitud_table.created_at_exists ? 'text-green-600' : 'text-red-600'}>
                                {results.solicitud_table.created_at_exists ? '✅' : '❌'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>updated_at:</span>
                              <span className={results.solicitud_table.updated_at_exists ? 'text-green-600' : 'text-red-600'}>
                                {results.solicitud_table.updated_at_exists ? '✅' : '❌'}
                              </span>
                            </div>
                            {results.solicitud_table.error && (
                              <div className="text-xs text-red-600 mt-2">
                                Error: {results.solicitud_table.error}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">📋 Tabla entrevista</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Tabla existe:</span>
                              <span className={results.entrevista_table.table_exists ? 'text-green-600' : 'text-red-600'}>
                                {results.entrevista_table.table_exists ? '✅' : '❌'}
                              </span>
                            </div>
                            {results.entrevista_table.error && (
                              <div className="text-xs text-red-600 mt-2">
                                Error: {results.entrevista_table.error}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {results.sql_to_run && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">🔧 SQL para ejecutar en Supabase</CardTitle>
                          <CardDescription>
                            Ve a Supabase Dashboard → SQL Editor → Pega este código → Run
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                            {results.sql_to_run}
                          </pre>
                          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                            <h4 className="font-semibold text-sm text-blue-800">📝 Instrucciones:</h4>
                            <ol className="text-sm text-blue-700 mt-2 space-y-1">
                              <li>1. Ve a <a href="https://supabase.com/dashboard" className="underline" target="_blank">Supabase Dashboard</a></li>
                              <li>2. Selecciona tu proyecto</li>
                              <li>3. Ve a "SQL Editor" en el menú lateral</li>
                              <li>4. Copia y pega el SQL de arriba</li>
                              <li>5. Haz clic en "Run" para ejecutar</li>
                              <li>6. Vuelve aquí y verifica nuevamente</li>
                            </ol>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}