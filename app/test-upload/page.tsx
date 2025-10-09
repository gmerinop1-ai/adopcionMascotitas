"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDirectUpload = async () => {
    if (!file) return

    try {
      setLoading(true)
      setResult(null)

      const formData = new FormData()
      formData.append('nombre', 'Test Mascota')
      formData.append('especie', 'perro')
      formData.append('photo', file)

      console.log('=== TESTING DIRECT UPLOAD ===')
      console.log('File:', {
        name: file.name,
        size: file.size,
        type: file.type
      })

      const response = await fetch('/api/admin/mascotas', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      console.log('Response:', {
        status: response.status,
        data
      })

      setResult({
        status: response.status,
        success: response.ok,
        data
      })
    } catch (error) {
      console.error('Test failed:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Direct Photo Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          
          <Button 
            onClick={testDirectUpload} 
            disabled={!file || loading}
          >
            {loading ? 'Uploading...' : 'Test Upload'}
          </Button>

          {result && (
            <div className="mt-4">
              <h3 className="font-bold">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}