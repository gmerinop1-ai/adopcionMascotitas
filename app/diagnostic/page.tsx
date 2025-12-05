"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DiagnosticPage() {
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [tableCreation, setTableCreation] = useState<any>(null)
  const [resetTest, setResetTest] = useState<any>(null)
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})

  const testDatabase = async () => {
    setLoading({...loading, db: true})
    try {
      const res = await fetch('/api/test-db')
      const data = await res.json()
      setDbStatus({ status: res.status, ...data })
    } catch (error) {
      setDbStatus({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
    setLoading({...loading, db: false})
  }

  const createTable = async () => {
    setLoading({...loading, table: true})
    try {
      const res = await fetch('/api/setup/create-verification-table', { method: 'POST' })
      const data = await res.json()
      setTableCreation({ status: res.status, ...data })
    } catch (error) {
      setTableCreation({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
    setLoading({...loading, table: false})
  }

  const testPasswordReset = async () => {
    setLoading({...loading, reset: true})
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' })
      })
      const data = await res.json()
      setResetTest({ status: res.status, ...data })
    } catch (error) {
      setResetTest({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
    setLoading({...loading, reset: false})
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      <h1 className="text-3xl font-bold">System Diagnostics</h1>

      <Card>
        <CardHeader>
          <CardTitle>Database Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testDatabase} disabled={loading.db}>
            {loading.db ? 'Testing...' : 'Test Database Connection'}
          </Button>
          
          {dbStatus && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <h4 className="font-bold mb-2">Database Test Results:</h4>
              <pre className="text-xs overflow-auto whitespace-pre-wrap">
                {JSON.stringify(dbStatus, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification Codes Table</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={createTable} disabled={loading.table}>
            {loading.table ? 'Creating...' : 'Create Verification Table'}
          </Button>
          
          {tableCreation && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <h4 className="font-bold mb-2">Table Creation Results:</h4>
              <pre className="text-xs overflow-auto whitespace-pre-wrap">
                {JSON.stringify(tableCreation, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password Reset API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testPasswordReset} disabled={loading.reset}>
            {loading.reset ? 'Testing...' : 'Test Password Reset'}
          </Button>
          
          {resetTest && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <h4 className="font-bold mb-2">Password Reset Test Results:</h4>
              <pre className="text-xs overflow-auto whitespace-pre-wrap">
                {JSON.stringify(resetTest, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual SQL Script</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-2">
            Si las pruebas automáticas fallan, ejecuta manualmente este script en el SQL Editor de Supabase:
          </p>
          <code className="text-xs bg-gray-200 p-2 block rounded">
            scripts/create-verification-codes-table.sql
          </code>
        </CardContent>
      </Card>
    </div>
  )
}