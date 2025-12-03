"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, Calendar, ArrowRight, Heart, TrendingUp } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { Donacion } from "@/lib/db"

interface DonationStatistics {
  totalDonated: number
  totalTransactions: number
  monthlyDonations: number
  oneTimeDonations: number
  lastDonation: string | null
}

export function MisAportes() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<Donacion[]>([])
  const [statistics, setStatistics] = useState<DonationStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.correo) {
      fetchDonations()
    }
  }, [user])

  const fetchDonations = async () => {
    if (!user?.correo) return

    try {
      const response = await fetch("/api/donations/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.correo }),
      })
      const data = await response.json()
      
      if (data.success) {
        // Filtrar solo donaciones completadas
        const completedDonations = (data.donations || []).filter((d: Donacion) => d.status === 'completed')
        setDonations(completedDonations)
        setStatistics(data.statistics || null)
      }
    } catch (error) {
      console.error("Error fetching donations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600">Completado</Badge>
      case "pending":
        return <Badge variant="secondary">Pendiente</Badge>
      case "failed":
        return <Badge variant="destructive">Fallido</Badge>
      case "refunded":
        return <Badge variant="outline">Reembolsado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFrequencyBadge = (frequency: string) => {
    switch (frequency) {
      case "monthly":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Mensual</Badge>
      case "one-time":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Única</Badge>
      default:
        return <Badge variant="outline">{frequency}</Badge>
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "culqi":
        return <CreditCard className="h-4 w-4" />
      case "yape":
        return <div className="h-4 w-4 bg-purple-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">Y</div>
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (donations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Mis Aportes
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aún no has realizado donaciones</h3>
          <p className="text-muted-foreground mb-6">
            Tu apoyo hace la diferencia en la vida de las mascotas que esperan un hogar
          </p>
          <a 
            href="/donaciones" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
          >
            Hacer primera donación
            <ArrowRight className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Total Donado</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                S/ {statistics.totalDonated.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Transacciones</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {statistics.totalTransactions}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Mensual</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {statistics.monthlyDonations}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Únicas</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {statistics.oneTimeDonations}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Historial de donaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Historial de Aportes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {donations.map((donation) => (
            <div key={donation.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">S/ {donation.amount.toFixed(2)}</span>
                    {getFrequencyBadge(donation.frequency)}
                    {getStatusBadge(donation.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getPaymentMethodIcon(donation.payment_method)}
                    <span className="capitalize">{donation.payment_method}</span>
                    <span>•</span>
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(donation.created_at)}</span>
                  </div>
                </div>
              </div>

              {donation.message && (
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm text-muted-foreground italic">
                    "{donation.message}"
                  </p>
                </div>
              )}

              {donation.culqi_charge_id && (
                <div className="text-xs text-muted-foreground">
                  ID: {donation.culqi_charge_id}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}