import { NextResponse } from "next/server"
import { getMascotaById, updateMascota, deleteMascota, uploadPetPhoto, deletePetPhoto, supabase } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const mascota = await getMascotaById(id)
    
    if (!mascota) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ mascota })
  } catch (error) {
    console.error("Error fetching mascota:", error)
    return NextResponse.json({ error: "Error al obtener mascota" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const formData = await request.formData()
    
    // Extract form fields
    const nombre = formData.get('nombre') as string
    const especie = formData.get('especie') as string
    const raza = formData.get('raza') as string || undefined
    const sexo = formData.get('sexo') as string || undefined
    const edad = formData.get('edad') ? parseInt(formData.get('edad') as string) : undefined
    const tamano = formData.get('tamano') as string || undefined
    const estado = formData.get('estado') as string || undefined
    const photo = formData.get('photo') as File | null
    const currentPhotoUrl = formData.get('currentPhotoUrl') as string || undefined

    // Get current mascota to check if it exists
    const currentMascota = await getMascotaById(id)
    if (!currentMascota) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    // Get the raw url_foto from database directly since currentMascota uses foto_url after transformation
    const { data: rawMascota } = await supabase
      .from('mascota')
      .select('url_foto')
      .eq('id', id)
      .single()

    let url_foto = rawMascota?.url_foto

    // Handle photo update
    if (photo && photo.size > 0) {
      try {
        // Delete old photo if exists
        if (rawMascota?.url_foto) {
          const oldPath = rawMascota.url_foto.includes('/') 
            ? rawMascota.url_foto.split('/').slice(-2).join('/')
            : rawMascota.url_foto
          await deletePetPhoto(oldPath)
        }

        // Upload new photo
        const uploadResult = await uploadPetPhoto(photo, id)
        url_foto = uploadResult.publicUrl
      } catch (photoError) {
        console.error("Error handling photo update:", photoError)
        // Continue with update without changing photo
      }
    }

    // Update mascota
    const updatedData = {
      nombre,
      especie,
      raza,
      sexo,
      edad,
      tamano,
      estado,
      url_foto
    }

    const mascota = await updateMascota(id, updatedData)

    // Transform the response for frontend consumption
    const { transformMascotaForDisplay } = await import("@/lib/storage")
    const transformedMascota = transformMascotaForDisplay(mascota)

    return NextResponse.json({ 
      success: true, 
      message: "Mascota actualizada con éxito",
      mascota: transformedMascota
    })
  } catch (error) {
    console.error("Error updating mascota:", error)
    return NextResponse.json({ error: "Error al actualizar mascota" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Get raw mascota data to check for photo path
    const { data: rawMascota } = await supabase
      .from('mascota')
      .select('url_foto')
      .eq('id', id)
      .single()

    if (!rawMascota) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    // Delete photo if exists
    if (rawMascota.url_foto) {
      try {
        const photoPath = rawMascota.url_foto.includes('/') 
          ? rawMascota.url_foto.split('/').slice(-2).join('/')
          : rawMascota.url_foto
        await deletePetPhoto(photoPath)
      } catch (photoError) {
        console.error("Error deleting photo:", photoError)
        // Continue with mascota deletion even if photo deletion fails
      }
    }

    // Delete mascota from database
    await deleteMascota(id)

    return NextResponse.json({ success: true, message: "Mascota eliminada con éxito" })
  } catch (error) {
    console.error("Error deleting mascota:", error)
    return NextResponse.json({ error: "Error al eliminar mascota" }, { status: 500 })
  }
}
