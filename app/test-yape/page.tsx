'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestYapePage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testYapePayment = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/payments/yape/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          otp,
          amount: 10.50,
          donorName: 'Test User',
          donorEmail: 'test@example.com',
          frequency: 'one-time',
          message: 'Test donation'
        })
      })

      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const checkCredentials = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/yape-test')
      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Test Yape Payment</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Yape Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label>Phone Number:</label>
              <Input 
                type="text" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="9XXXXXXXX or 111111111 for test"
              />
            </div>
            <div>
              <label>OTP:</label>
              <Input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6 digits or 123456 for test"
              />
            </div>
            <Button onClick={testYapePayment} disabled={loading}>
              {loading ? 'Testing...' : 'Test Yape Payment'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={checkCredentials} disabled={loading}>
              {loading ? 'Checking...' : 'Check Credentials Status'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}