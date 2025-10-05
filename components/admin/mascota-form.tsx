"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { validateMascotaForm } from "@/lib/validations"
import { Loader2, Upload } from "lucide-react"

interface MascotaFormProps {
  mascotaId?: string
}

export function MascotaForm({ mascotaId }: MascotaFormProps) {
  const router = useRouter()
  const isEditing = !!mascotaId

  const [formData, setFormData] = useState({
    nombre: "",
    especie: "",
    raza: "",
    sexo: "",
    edad: "",
    tamano: "",
    ubicacion: "",
    foto_url: "",
    descripcion: "",
    estado: "disponible",
    motivo_no_disponible: "",
    nota_estado: "",
    esterilizado: false,
  })

  const [datosMedicos, setDatosMedicos] = useState({
    vacunas: "",
    desparasitacion: "",
    tratamientos: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (isEditing) {
      fetchMascota()
    }
  }, [mascotaId])

  const fetchMascota = async () => {
    try {
      const response = await fetch(`/api/admin/mascotas/${mascotaId}`)
      const data = await response.json()
      if (data.mascota) {
        setFormData({
          nombre: data.mascota.nombre || "",
          especie: data.mascota.especie || "",
          raza: data.mascota.raza || "",
          sexo: data.mascota.sexo || "",
          edad: data.mascota.edad?.toString() || "",
          tamano: data.mascota.tamano || "",
          ubicacion: data.mascota.ubicacion || "",
          foto_url: data.mascota.foto_url || "",
          descripcion: data.mascota.descripcion || "",
          estado: data.mascota.estado || "disponible",
          motivo_no_disponible: data.mascota.motivo_no_disponible || "",
          nota_estado: data.mascota.nota_estado || "",
          esterilizado: data.mascota.esterilizado || false,
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching mascota:", error)
    }
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

  const handleSelectChange = (name: string, value: string) => {
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
    setSuccessMessage("")

    // Validate form
    const validationErrors = validateMascotaForm({
      nombre: formData.nombre,
      especie: formData.especie,
      sexo: formData.sexo,
      foto_url: formData.foto_url,
      edad: formData.edad ? Number.parseInt(formData.edad) : undefined,
    })

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
      const url = isEditing ? `/api/admin/mascotas/${mascotaId}` : "/api/admin/mascotas"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          edad: formData.edad ? Number.parseInt(formData.edad) : null,
          datosMedicos,
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
          setErrors({ general: data.error || "Error al guardar la mascota" })
        }
        return
      }

      setSuccessMessage(isEditing ? "Mascota actualizada con éxito" : "Mascota registrada con éxito")
      setTimeout(() => {
        router.push("/admin/mascotas")
      }, 1500)
    } catch (error) {
      setErrors({ general: "Error de conexión. Por favor, intenta de nuevo." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <Alert variant="destructive">
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-accent/10 text-accent-foreground border-accent">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
          <CardDescription>Datos principales de la mascota</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={errors.nombre ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.nombre && <p className="text-sm text-destructive">{errors.nombre}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="especie">
                Especie <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.especie} onValueChange={(value) => handleSelectChange("especie", value)}>
                <SelectTrigger className={errors.especie ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecciona especie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perro">Perro</SelectItem>
                  <SelectItem value="gato">Gato</SelectItem>
                  <SelectItem value="conejo">Conejo</SelectItem>
                  <SelectItem value="ave">Ave</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
              {errors.especie && <p className="text-sm text-destructive">{errors.especie}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="raza">Raza</Label>
              <Input
                id="raza"
                name="raza"
                value={formData.raza}
                onChange={handleChange}
                placeholder="Opcional"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexo">
                Sexo <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.sexo} onValueChange={(value) => handleSelectChange("sexo", value)}>
                <SelectTrigger className={errors.sexo ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecciona sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="macho">Macho</SelectItem>
                  <SelectItem value="hembra">Hembra</SelectItem>
                </SelectContent>
              </Select>
              {errors.sexo && <p className="text-sm text-destructive">{errors.sexo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edad">Edad (años)</Label>
              <Input
                id="edad"
                name="edad"
                type="number"
                min="0"
                max="20"
                value={formData.edad}
                onChange={handleChange}
                placeholder="0-20"
                className={errors.edad ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.edad && <p className="text-sm text-destructive">{errors.edad}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tamano">Tamaño</Label>
              <Select value={formData.tamano} onValueChange={(value) => handleSelectChange("tamano", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tamaño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pequeño">Pequeño</SelectItem>
                  <SelectItem value="mediano">Mediano</SelectItem>
                  <SelectItem value="grande">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ubicacion">Ubicación (Ciudad/Distrito)</Label>
              <Input
                id="ubicacion"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                placeholder="Ej: Lima, San Isidro"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="foto_url">
              URL de Foto Principal <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="foto_url"
                name="foto_url"
                value={formData.foto_url}
                onChange={handleChange}
                placeholder="https://ejemplo.com/foto.jpg"
                className={errors.foto_url ? "border-destructive" : ""}
                disabled={isLoading}
              />
              <Button type="button" variant="outline" disabled>
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            {errors.foto_url && <p className="text-sm text-destructive">{errors.foto_url}</p>}
            <p className="text-xs text-muted-foreground">Formatos aceptados: JPG, PNG</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe la personalidad y características de la mascota..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="esterilizado"
              checked={formData.esterilizado}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, esterilizado: checked as boolean }))}
            />
            <Label htmlFor="esterilizado" className="cursor-pointer">
              Esterilizado
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Datos Médicos */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Médicos</CardTitle>
          <CardDescription>Información sobre vacunas, desparasitación y tratamientos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vacunas">Vacunas</Label>
            <Textarea
              id="vacunas"
              value={datosMedicos.vacunas}
              onChange={(e) => setDatosMedicos((prev) => ({ ...prev, vacunas: e.target.value }))}
              placeholder="Ej: Rabia (15/01/2024), Parvovirus (20/01/2024)"
              rows={2}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desparasitacion">Desparasitación</Label>
            <Textarea
              id="desparasitacion"
              value={datosMedicos.desparasitacion}
              onChange={(e) => setDatosMedicos((prev) => ({ ...prev, desparasitacion: e.target.value }))}
              placeholder="Ej: Interna (10/02/2024), Externa (10/02/2024)"
              rows={2}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tratamientos">Tratamientos Actuales</Label>
            <Textarea
              id="tratamientos"
              value={datosMedicos.tratamientos}
              onChange={(e) => setDatosMedicos((prev) => ({ ...prev, tratamientos: e.target.value }))}
              placeholder="Ej: Antibiótico por infección, 2 veces al día, hasta 20/03/2024"
              rows={3}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Estado */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Estado de Disponibilidad</CardTitle>
            <CardDescription>Gestiona la visibilidad de la mascota en el catálogo público</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => handleSelectChange("estado", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="reservado">Reservado</SelectItem>
                  <SelectItem value="no_disponible">No Disponible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.estado === "no_disponible" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="motivo_no_disponible">Motivo</Label>
                  <Select
                    value={formData.motivo_no_disponible}
                    onValueChange={(value) => handleSelectChange("motivo_no_disponible", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adoptada">Adoptada</SelectItem>
                      <SelectItem value="en_tratamiento">En Tratamiento</SelectItem>
                      <SelectItem value="reintegrada">Reintegrada</SelectItem>
                      <SelectItem value="fallecida">Fallecida</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nota_estado">Nota Adicional</Label>
                  <Textarea
                    id="nota_estado"
                    name="nota_estado"
                    value={formData.nota_estado}
                    onChange={handleChange}
                    placeholder="Información adicional sobre el estado..."
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : isEditing ? (
            "Actualizar Mascota"
          ) : (
            "Registrar Mascota"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/mascotas")} disabled={isLoading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
