"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestPasswordReset() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)

  const handleTest = async () => {
    setLoading(true)
    setResponse(null)
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })
      
      const data = await res.json()
      setResponse({ status: res.status, data })
    } catch (error) {
      setResponse({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <h1 className="text-2xl font-bold mb-4">Test Password Reset</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="test@example.com"
          />
        </div>
        
        <Button 
          onClick={handleTest}
          disabled={loading || !email}
          className="w-full"
        >
          {loading ? 'Testing...' : 'Test Password Reset'}
        </Button>
        
        {response && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold">Response:</h3>
            <pre className="text-xs mt-2 overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}