"use client"

import { useState, useEffect } from "react"
import { MascotaCard } from "./mascota-card"
import { MascotasFilters } from "./mascotas-filters"
import type { Mascota } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function MascotasCatalog() {
  const [mascotas, setMascotas] = useState<Mascota[]>([])
  const [filteredMascotas, setFilteredMascotas] = useState<Mascota[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    especie: "",
    sexo: "",
    tamano: "",
  })

  useEffect(() => {
    fetchMascotas()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, mascotas])

  const fetchMascotas = async () => {
    try {
      const response = await fetch("/api/mascotas")
      const data = await response.json()
      setMascotas(data.mascotas || [])
      setFilteredMascotas(data.mascotas || [])
    } catch (error) {
      console.error("[v0] Error fetching mascotas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...mascotas]

    // Filtrar solo mascotas disponibles para adopción
    filtered = filtered.filter((m) => m.estado === 'disponible')

    if (filters.especie && filters.especie !== '') {
      filtered = filtered.filter((m) => m.especie?.toLowerCase() === filters.especie.toLowerCase())
    }

    if (filters.sexo && filters.sexo !== '') {
      filtered = filtered.filter((m) => m.sexo?.toLowerCase() === filters.sexo.toLowerCase())
    }

    if (filters.tamano && filters.tamano !== '') {
      filtered = filtered.filter((m) => m.tamano?.toLowerCase() === filters.tamano.toLowerCase())
    }

    setFilteredMascotas(filtered)
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
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside>
        <MascotasFilters filters={filters} onFiltersChange={setFilters} />
      </aside>

      <div>
        {filteredMascotas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No se encontraron mascotas con los filtros seleccionados</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Mostrando {filteredMascotas.length} {filteredMascotas.length === 1 ? "mascota" : "mascotas"}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMascotas.map((mascota) => (
                <MascotaCard key={mascota.id} mascota={mascota} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
