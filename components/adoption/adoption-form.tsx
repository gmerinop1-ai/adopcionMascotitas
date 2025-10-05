"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validateSolicitudForm } from "@/lib/validations"
import { Loader2, CheckCircle } from "lucide-react"
import type { Mascota } from "@/lib/db"

interface AdoptionFormProps {
  mascotaId: string
}

export function AdoptionForm({ mascotaId }: AdoptionFormProps) {
  const router = useRouter()
  const [mascota, setMascota] = useState<Mascota | null>(null)
  const [formData, setFormData] = useState({
    dni: "",
    telefono: "",
    distrito: "",
    motivacion: "",
    disponibilidad_tiempo: "",
    condiciones_hogar: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    fetchMascota()
    checkAuth()
  }, [mascotaId])

  const fetchMascota = async () => {
    try {
      const response = await fetch(`/api/mascotas/${mascotaId}`)
      const data = await response.json()
      setMascota(data.mascota)
    } catch (error) {
      console.error("[v0] Error fetching mascota:", error)
    }
  }

  const checkAuth = () => {
    // TODO: Check if user is logged in
    // If not, redirect to login with return URL
    // const session = await getSession()
    // if (!session) {
    //   router.push(`/login?returnUrl=/mascotas/${mascotaId}/postular`)
    // }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate form
    const validationErrors = validateSolicitudForm(formData)
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {}
      validationErrors.forEach((error) => {
        errorMap[error.field] = error.message
      })
      setErrors(errorMap)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          mascota_id: mascotaId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          const errorMap: Record<string, string> = {}
          data.errors.forEach((error: { field: string; message: string }) => {
            errorMap[error.field] = error.message
          })
          setErrors(errorMap)
        } else {
          setErrors({ general: data.error || "Error al enviar la solicitud" })
        }
        return
      }

      setIsSubmitted(true)
    } catch (error) {
      setErrors({ general: "Error de conexión. Por favor, intenta de nuevo." })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Tu solicitud de adopción para <span className="font-semibold">{mascota?.nombre}</span> ha sido registrada
            correctamente. Próximamente nos comunicaremos contigo para coordinar la entrevista.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <a href="/mis-procesos">Ver Mis Procesos</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/mascotas">Ver Más Mascotas</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <Alert variant="destructive">
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {mascota && (
        <Card className="bg-secondary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                {mascota.nombre[0]}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Postulando para adoptar a:</p>
                <p className="text-xl font-bold">{mascota.nombre}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Datos Personales</CardTitle>
          <CardDescription>Información básica de contacto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dni">
                DNI <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dni"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                placeholder="12345678"
                maxLength={8}
                className={errors.dni ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.dni && <p className="text-sm text-destructive">{errors.dni}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">
                Teléfono <span className="text-destructive">*</span>
              </Label>
              <Input
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="987654321"
                className={errors.telefono ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.telefono && <p className="text-sm text-destructive">{errors.telefono}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="distrito">
              Distrito/Ciudad <span className="text-destructive">*</span>
            </Label>
            <Input
              id="distrito"
              name="distrito"
              value={formData.distrito}
              onChange={handleChange}
              placeholder="Ej: Lima, San Isidro"
              className={errors.distrito ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.distrito && <p className="text-sm text-destructive">{errors.distrito}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de Adopción</CardTitle>
          <CardDescription>Cuéntanos más sobre ti y tu hogar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="motivacion">
              Motivación para Adoptar <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="motivacion"
              name="motivacion"
              value={formData.motivacion}
              onChange={handleChange}
              placeholder="¿Por qué quieres adoptar a esta mascota? ¿Qué esperas de la adopción?"
              rows={4}
              className={errors.motivacion ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.motivacion && <p className="text-sm text-destructive">{errors.motivacion}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="disponibilidad_tiempo">
              Disponibilidad de Tiempo <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="disponibilidad_tiempo"
              name="disponibilidad_tiempo"
              value={formData.disponibilidad_tiempo}
              onChange={handleChange}
              placeholder="¿Cuánto tiempo puedes dedicarle a la mascota? ¿Trabajas desde casa o fuera?"
              rows={3}
              className={errors.disponibilidad_tiempo ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.disponibilidad_tiempo && <p className="text-sm text-destructive">{errors.disponibilidad_tiempo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="condiciones_hogar">
              Condiciones del Hogar <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="condiciones_hogar"
              name="condiciones_hogar"
              value={formData.condiciones_hogar}
              onChange={handleChange}
              placeholder="Describe tu hogar: ¿Casa o departamento? ¿Tienes jardín? ¿Vives solo o con familia? ¿Hay otras mascotas?"
              rows={4}
              className={errors.condiciones_hogar ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.condiciones_hogar && <p className="text-sm text-destructive">{errors.condiciones_hogar}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" size="lg" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando solicitud...
            </>
          ) : (
            "Enviar Solicitud"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push(`/mascotas/${mascotaId}`)}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Al enviar esta solicitud, aceptas que revisaremos tu información y nos pondremos en contacto contigo para
        coordinar una entrevista.
      </p>
    </form>
  )
}
