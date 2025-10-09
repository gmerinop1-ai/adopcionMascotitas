"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testPolicies = async () => {
    try {
      setLoading(true)
      setResult(null)
      
      const response = await fetch('/api/setup/policies', { method: 'POST' })
      const data = await response.json()
      setResult({ type: 'policies', data })
    } catch (error) {
      setResult({ type: 'policies', error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const testStorage = async () => {
    try {
      setLoading(true)
      setResult(null)
      
      const response = await fetch('/api/setup/storage')
      const data = await response.json()
      setResult({ type: 'storage', data })
    } catch (error) {
      setResult({ type: 'storage', error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const testUpload = async () => {
    if (!file) {
      setResult({ type: 'upload', error: 'Please select a file first' })
      return
    }

    try {
      setLoading(true)
      setResult(null)
      
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/test/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      setResult({ type: 'upload', data, status: response.status })
    } catch (error) {
      setResult({ type: 'upload', error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setFile(selectedFile || null)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Supabase Storage Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Storage Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testStorage} disabled={loading}>
              {loading ? 'Testing...' : 'Test Storage Setup'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check Policies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testPolicies} disabled={loading}>
              {loading ? 'Checking...' : 'Check Policies'}
            </Button>
            <p className="text-xs text-gray-600">
              Get instructions for configuring storage policies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test File Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <Button onClick={testUpload} disabled={loading || !file}>
              {loading ? 'Uploading...' : 'Test Upload'}
            </Button>
            {file && (
              <p className="text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)}KB)
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Test Result</CardTitle>
          </CardHeader>
          <CardContent>
            {result.error ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  Error: {result.error}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  Success!
                </AlertDescription>
              </Alert>
            )}
            <pre className="mt-4 p-4 bg-gray-100 rounded-lg overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}