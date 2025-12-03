"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Search, TrendingUp, Users, Calendar, CreditCard, Download, RefreshCw } from "lucide-react"
import type { Donacion } from "@/lib/db"

interface DonationStatistics {
  totalAmount: number
  totalCount: number
  completedCount: number
  failedCount: number
  monthlyAmount: number
  oneTimeAmount: number
}

export function DonationsTable() {
  const [donations, setDonations] = useState<Donacion[]>([])
  const [filteredDonations, setFilteredDonations] = useState<Donacion[]>([])
  const [statistics, setStatistics] = useState<DonationStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("completed")
  const [methodFilter, setMethodFilter] = useState("all")
  const [frequencyFilter, setFrequencyFilter] = useState("all")

  useEffect(() => {
    fetchDonations()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [donations, searchTerm, statusFilter, methodFilter, frequencyFilter])

  const fetchDonations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/donations")
      const data = await response.json()
      
      if (data.success) {
        setDonations(data.donations || [])
        calculateStatistics(data.donations || [])
      }
    } catch (error) {
      console.error("Error fetching donations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStatistics = (donationsData: Donacion[]) => {
    const completed = donationsData.filter(d => d.status === 'completed')
    const failed = donationsData.filter(d => d.status === 'failed')
    const monthly = completed.filter(d => d.frequency === 'monthly')
    const oneTime = completed.filter(d => d.frequency === 'one-time')

    setStatistics({
      totalAmount: completed.reduce((sum, d) => sum + d.amount, 0),
      totalCount: completed.length,
      completedCount: completed.length,
      failedCount: failed.length,
      monthlyAmount: monthly.reduce((sum, d) => sum + d.amount, 0),
      oneTimeAmount: oneTime.reduce((sum, d) => sum + d.amount, 0)
    })
  }

  const applyFilters = () => {
    let filtered = donations

    if (searchTerm) {
      filtered = filtered.filter(donation => 
        donation.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.donor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.culqi_charge_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(donation => donation.status === statusFilter)
    }

    if (methodFilter !== "all") {
      filtered = filtered.filter(donation => donation.payment_method === methodFilter)
    }

    if (frequencyFilter !== "all") {
      filtered = filtered.filter(donation => donation.frequency === frequencyFilter)
    }

    setFilteredDonations(filtered)
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

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "culqi":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Culqi (Tarjeta)</Badge>
      case "yape":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Yape</Badge>
      default:
        return <Badge variant="outline">{method}</Badge>
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

  const exportToCSV = () => {
    const headers = ['Fecha', 'Donante', 'Email', 'Monto', 'Frecuencia', 'Método', 'Estado', 'ID Transacción']
    const csvData = filteredDonations.map(donation => [
      formatDate(donation.created_at),
      donation.donor_name || 'Anónimo',
      donation.donor_email || '',
      `S/ ${donation.amount.toFixed(2)}`,
      donation.frequency,
      donation.payment_method,
      donation.status,
      donation.culqi_charge_id || donation.yape_transaction_id || ''
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `donaciones-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Total Recaudado</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                S/ {statistics.totalAmount.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {statistics.completedCount} donaciones exitosas
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Donaciones Exitosas</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {statistics.totalCount}
              </div>
              <div className="text-xs text-muted-foreground">
                {statistics.failedCount} fallidas
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Mensual</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                S/ {statistics.monthlyAmount.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Única</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                S/ {statistics.oneTimeAmount.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros y acciones */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle>Historial de Donaciones</CardTitle>
            <div className="flex gap-2">
              <Button onClick={fetchDonations} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar donante, email o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="failed">Fallido</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los métodos</SelectItem>
                <SelectItem value="culqi">Culqi (Tarjeta)</SelectItem>
                <SelectItem value="yape">Yape</SelectItem>
              </SelectContent>
            </Select>

            <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Frecuencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las frecuencias</SelectItem>
                <SelectItem value="one-time">Única</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              {filteredDonations.length} donación{filteredDonations.length !== 1 ? 'es' : ''} 
              {statusFilter === 'completed' ? ' exitosa' + (filteredDonations.length !== 1 ? 's' : '') : ''}
            </div>
          </div>

          {/* Tabla */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Donante</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Frecuencia</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>ID Transacción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron donaciones con los filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDonations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell className="text-sm">
                        {formatDate(donation.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {donation.donor_name || 'Anónimo'}
                          </div>
                          {donation.donor_email && (
                            <div className="text-xs text-muted-foreground">
                              {donation.donor_email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        S/ {donation.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getFrequencyBadge(donation.frequency)}
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodBadge(donation.payment_method)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(donation.status)}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {donation.culqi_charge_id || donation.yape_transaction_id || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}