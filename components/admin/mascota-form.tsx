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
import { Loader2, Upload, Plus, X } from "lucide-react"

interface MascotaFormProps {
  mascotaId?: string
}

interface Vacuna {
  tipo: string
  fecha: string
}

interface Tratamiento {
  diagnostico: string
  plan: string
  medicacion: string
  frecuencia: string
  fecha: string
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

  const [vacunas, setVacunas] = useState<Vacuna[]>([])
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [previewImage, setPreviewImage] = useState<string>("")

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
        if (data.mascota.foto_url) {
          setPreviewImage(data.mascota.foto_url)
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching mascota:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
    
    // Clear error when user starts typing
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|png)$/)) {
        setErrors(prev => ({ ...prev, foto_url: "Solo se permiten archivos JPEG y PNG" }))
        return
      }
      
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        setPreviewImage(result)
        setFormData(prev => ({ ...prev, foto_url: file.name }))
        
        // Clear error
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.foto_url
          return newErrors
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Vacunas functions
  const addVacuna = () => {
    setVacunas(prev => [...prev, { tipo: "", fecha: "" }])
  }

  const removeVacuna = (index: number) => {
    setVacunas(prev => prev.filter((_, i) => i !== index))
  }

  const updateVacuna = (index: number, field: keyof Vacuna, value: string) => {
    setVacunas(prev => prev.map((vacuna, i) => 
      i === index ? { ...vacuna, [field]: value } : vacuna
    ))
  }

  // Tratamientos functions
  const addTratamiento = () => {
    setTratamientos(prev => [...prev, { 
      diagnostico: "", 
      plan: "", 
      medicacion: "", 
      frecuencia: "", 
      fecha: "" 
    }])
  }

  const removeTratamiento = (index: number) => {
    setTratamientos(prev => prev.filter((_, i) => i !== index))
  }

  const updateTratamiento = (index: number, field: keyof Tratamiento, value: string) => {
    setTratamientos(prev => prev.map((tratamiento, i) => 
      i === index ? { ...tratamiento, [field]: value } : tratamiento
    ))
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
          vacunas,
          tratamientos,
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
      console.error("[v0] Error saving mascota:", error)
      setErrors({ general: "Error de conexión. Inténtalo de nuevo." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {errors.general && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
          <CardDescription>Datos principales de la mascota</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre de la mascota"
                disabled={isLoading}
              />
              {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="especie">
                Especie <span className="text-red-500">*</span>
              </Label>
              <Input
                id="especie"
                name="especie"
                value={formData.especie}
                onChange={handleChange}
                placeholder="Ej: Perro, Gato"
                disabled={isLoading}
              />
              {errors.especie && <p className="text-sm text-red-500">{errors.especie}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="raza">Raza</Label>
              <Input
                id="raza"
                name="raza"
                value={formData.raza}
                onChange={handleChange}
                placeholder="Raza de la mascota"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexo">
                Sexo <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.sexo} onValueChange={(value) => handleSelectChange("sexo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="macho">Macho</SelectItem>
                  <SelectItem value="hembra">Hembra</SelectItem>
                </SelectContent>
              </Select>
              {errors.sexo && <p className="text-sm text-red-500">{errors.sexo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edad">Edad (años)</Label>
              <Input
                id="edad"
                name="edad"
                type="number"
                min="0"
                max="25"
                value={formData.edad}
                onChange={handleChange}
                placeholder="Edad en años"
                disabled={isLoading}
              />
              {errors.edad && <p className="text-sm text-red-500">{errors.edad}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tamano">Tamaño</Label>
              <Select value={formData.tamano} onValueChange={(value) => handleSelectChange("tamano", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tamaño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pequeño">Pequeño</SelectItem>
                  <SelectItem value="mediano">Mediano</SelectItem>
                  <SelectItem value="grande">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
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
              Foto de la Mascota <span className="text-red-500">*</span>
            </Label>
            <Input
              id="foto_url"
              name="foto_url"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">Formatos permitidos: JPEG, PNG</p>
            {errors.foto_url && <p className="text-sm text-red-500">{errors.foto_url}</p>}
            
            {previewImage && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Vista previa:</p>
                <img
                  src={previewImage}
                  alt="Vista previa"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción de la personalidad y características de la mascota"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="esterilizado"
              checked={formData.esterilizado}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, esterilizado: !!checked }))
              }
            />
            <Label htmlFor="esterilizado">¿Está esterilizado?</Label>
          </div>
        </CardContent>
      </Card>

      {/* Datos Médicos */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Médicos</CardTitle>
          <CardDescription>Información sobre vacunas, desparasitación y tratamientos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Vacunas/Desparasitación */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Vacunas/Desparasitación</Label>
              <Button type="button" variant="outline" size="sm" onClick={addVacuna}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Vacuna
              </Button>
            </div>
            
            {vacunas.map((vacuna, index) => (
              <div key={index} className="flex gap-4 items-end p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`vacuna-tipo-${index}`}>Tipo de Vacuna/Desparasitante</Label>
                  <Input
                    id={`vacuna-tipo-${index}`}
                    value={vacuna.tipo}
                    onChange={(e) => updateVacuna(index, "tipo", e.target.value)}
                    placeholder="Ej: Rabia, Parvovirus"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`vacuna-fecha-${index}`}>Fecha de Aplicación</Label>
                  <Input
                    id={`vacuna-fecha-${index}`}
                    type="date"
                    value={vacuna.fecha}
                    onChange={(e) => updateVacuna(index, "fecha", e.target.value)}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeVacuna(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {vacunas.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No hay vacunas registradas. Haz clic en "Agregar Vacuna" para añadir una.
              </p>
            )}
          </div>

          {/* Tratamientos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Tratamientos</Label>
              <Button type="button" variant="outline" size="sm" onClick={addTratamiento}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Tratamiento
              </Button>
            </div>
            
            {tratamientos.map((tratamiento, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Tratamiento #{index + 1}</h4>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeTratamiento(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`tratamiento-diagnostico-${index}`}>Diagnóstico</Label>
                    <Input
                      id={`tratamiento-diagnostico-${index}`}
                      value={tratamiento.diagnostico}
                      onChange={(e) => updateTratamiento(index, "diagnostico", e.target.value)}
                      placeholder="Diagnóstico médico"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`tratamiento-medicacion-${index}`}>Medicación</Label>
                    <Input
                      id={`tratamiento-medicacion-${index}`}
                      value={tratamiento.medicacion}
                      onChange={(e) => updateTratamiento(index, "medicacion", e.target.value)}
                      placeholder="Medicamentos prescritos"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`tratamiento-frecuencia-${index}`}>Frecuencia</Label>
                    <Input
                      id={`tratamiento-frecuencia-${index}`}
                      value={tratamiento.frecuencia}
                      onChange={(e) => updateTratamiento(index, "frecuencia", e.target.value)}
                      placeholder="Ej: Cada 8 horas, 2 veces al día"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`tratamiento-fecha-${index}`}>Fecha de Inicio</Label>
                    <Input
                      id={`tratamiento-fecha-${index}`}
                      type="date"
                      value={tratamiento.fecha}
                      onChange={(e) => updateTratamiento(index, "fecha", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`tratamiento-plan-${index}`}>Plan de Tratamiento</Label>
                  <Textarea
                    id={`tratamiento-plan-${index}`}
                    value={tratamiento.plan}
                    onChange={(e) => updateTratamiento(index, "plan", e.target.value)}
                    placeholder="Descripción detallada del plan de tratamiento"
                    rows={3}
                  />
                </div>
              </div>
            ))}
            
            {tratamientos.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No hay tratamientos registrados. Haz clic en "Agregar Tratamiento" para añadir uno.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estado y Gestión */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Estado y Gestión</CardTitle>
            <CardDescription>Gestiona el estado de disponibilidad de la mascota</CardDescription>
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
                  <Label htmlFor="motivo_no_disponible">Motivo del Retiro</Label>
                  <Select 
                    value={formData.motivo_no_disponible} 
                    onValueChange={(value) => handleSelectChange("motivo_no_disponible", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adoptada">Adoptada</SelectItem>
                      <SelectItem value="en_tratamiento">En tratamiento</SelectItem>
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