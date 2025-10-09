"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ImageFixPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fixLoading, setFixLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/diagnostic/images')
      const data = await response.json()
      console.log('Diagnostics result:', data)
      setDiagnostics(data)
    } catch (error) {
      console.error('Error running diagnostics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fixPolicies = async () => {
    setFixLoading(true)
    try {
      const response = await fetch('/api/setup/fix-policies', {
        method: 'POST'
      })
      const data = await response.json()
      console.log('Fix policies result:', data)
      setResult(data)
    } catch (error) {
      console.error('Error fixing policies:', error)
      setResult({ success: false, error: 'Failed to fix policies' })
    } finally {
      setFixLoading(false)
    }
  }

  const testImageAccess = async (imageUrl: string) => {
    try {
      const response = await fetch('/api/test/image-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      })
      const data = await response.json()
      console.log('Image access test:', data)
      return data
    } catch (error) {
      console.error('Error testing image access:', error)
      return { accessible: false, error: 'Test failed' }
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Image Storage Diagnostics & Fix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runDiagnostics} disabled={loading}>
              {loading ? 'Running...' : 'Run Diagnostics'}
            </Button>
            <Button onClick={fixPolicies} disabled={fixLoading} variant="destructive">
              {fixLoading ? 'Fixing...' : 'Fix Storage Policies'}
            </Button>
          </div>

          {diagnostics && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Diagnostics Results:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>✓ Buckets found: {diagnostics.diagnostics?.bucketsFound}</li>
                    <li>✓ Admin bucket exists: {diagnostics.diagnostics?.adminBucketExists ? 'Yes' : 'No'}</li>
                    <li>✓ Admin bucket public: {diagnostics.diagnostics?.adminBucketPublic ? 'Yes' : 'No'}</li>
                    <li>✓ Files in Mascotas folder: {diagnostics.diagnostics?.filesInMascotasFolder}</li>
                    <li>✓ Mascotas in DB: {diagnostics.diagnostics?.mascotasInDB}</li>
                    <li>✓ Mascotas with photos: {diagnostics.diagnostics?.mascotasWithPhotos}</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {diagnostics.diagnostics?.mascotasData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Mascotas Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {diagnostics.diagnostics.mascotasData.map((mascota: any) => (
                        <div key={mascota.id} className="border p-4 rounded">
                          <h4 className="font-bold">{mascota.nombre}</h4>
                          <p><strong>DB Path:</strong> {mascota.url_foto || 'No path'}</p>
                          <p><strong>Public URL:</strong> {mascota.publicUrl || 'No URL'}</p>
                          
                          {mascota.publicUrl && (
                            <div className="mt-2">
                              <img
                                src={mascota.publicUrl}
                                alt={mascota.nombre}
                                className="h-32 w-32 object-cover border rounded"
                                onError={(e) => {
                                  console.error('Image failed to load:', mascota.publicUrl)
                                  e.currentTarget.style.border = '2px solid red'
                                }}
                                onLoad={() => {
                                  console.log('Image loaded successfully:', mascota.publicUrl)
                                  // @ts-ignore
                                  e.currentTarget.style.border = '2px solid green'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {diagnostics.diagnostics?.urlTests && (
                <Card>
                  <CardHeader>
                    <CardTitle>Storage Files URL Tests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {diagnostics.diagnostics.urlTests.map((test: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span>{test.fileName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">({test.size} bytes)</span>
                            <Button
                              size="sm"
                              onClick={async () => {
                                const result = await testImageAccess(test.publicUrl)
                                alert(`Image ${test.fileName}: ${result.accessible ? 'Accessible' : 'Not accessible'}`)
                              }}
                            >
                              Test
                            </Button>
                            <a href={test.publicUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline">Open</Button>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {result && (
            <Alert>
              <AlertDescription>
                <strong>Fix Policies Result:</strong>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}