"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestImagesPage() {
  const [mascotas, setMascotas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testImageLoading = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/mascotas')
      const data = await response.json()
      console.log('Raw API Response:', data)
      setMascotas(data.mascotas || [])
    } catch (error) {
      console.error('Error fetching mascotas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testImageLoading()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Image Loading - Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testImageLoading} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh Mascotas'}
          </Button>
          
          <div className="mt-6 space-y-4">
            {mascotas.map((mascota) => (
              <Card key={mascota.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-bold text-lg">{mascota.nombre}</h3>
                      <p><strong>Especie:</strong> {mascota.especie}</p>
                      <p><strong>Estado:</strong> {mascota.estado}</p>
                      <p><strong>url_foto (DB):</strong> {mascota.url_foto || 'No URL'}</p>
                      <p><strong>foto_url (Frontend):</strong> {mascota.foto_url || 'No URL'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">Database URL (url_foto):</p>
                        <div className="h-32 w-32 border rounded overflow-hidden bg-gray-100">
                          {mascota.url_foto ? (
                            <img
                              src={mascota.url_foto}
                              alt={`${mascota.nombre} - DB URL`}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                console.error('DB URL failed:', mascota.url_foto)
                                e.currentTarget.src = '/placeholder.svg'
                              }}
                              onLoad={() => console.log('DB URL loaded:', mascota.url_foto)}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                              No DB URL
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Frontend URL (foto_url):</p>
                        <div className="h-32 w-32 border rounded overflow-hidden bg-gray-100">
                          {mascota.foto_url ? (
                            <img
                              src={mascota.foto_url}
                              alt={`${mascota.nombre} - Frontend URL`}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                console.error('Frontend URL failed:', mascota.foto_url)
                                e.currentTarget.src = '/placeholder.svg'
                              }}
                              onLoad={() => console.log('Frontend URL loaded:', mascota.foto_url)}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                              No Frontend URL
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {mascotas.length === 0 && !loading && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No mascotas found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}