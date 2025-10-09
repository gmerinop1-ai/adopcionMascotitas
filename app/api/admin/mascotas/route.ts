import { NextResponse } from "next/server"
import { getAllMascotas, insertMascota, uploadPetPhoto } from "@/lib/db"

export async function GET() {
  try {
    const mascotas = await getAllMascotas()
    return NextResponse.json({ mascotas })
  } catch (error) {
    console.error("Error fetching mascotas:", error)
    return NextResponse.json({ error: "Error al obtener mascotas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/admin/mascotas - Starting request processing')
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    const formData = await request.formData()
    console.log('FormData entries:')
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size}bytes, ${value.type})`)
      } else {
        console.log(`${key}: ${value}`)
      }
    }
    
    // Extract form fields
    const nombre = formData.get('nombre') as string
    const especie = formData.get('especie') as string
    const raza = formData.get('raza') as string || undefined
    const sexo = formData.get('sexo') as string || undefined
    const edad = formData.get('edad') ? parseInt(formData.get('edad') as string) : undefined
    const tamano = formData.get('tamano') as string || undefined
    const estado = formData.get('estado') as string || 'disponible'
    const photo = formData.get('photo') as File | null

    console.log('Form data received:', {
      nombre,
      especie,
      raza,
      sexo,
      edad,
      tamano,
      estado,
      hasPhoto: !!photo,
      photoName: photo?.name,
      photoSize: photo?.size,
      photoType: photo?.type
    })

    // Validate required fields
    if (!nombre || !especie) {
      console.log('Validation error: Missing required fields')
      return NextResponse.json(
        { error: "Nombre y especie son requeridos" }, 
        { status: 400 }
      )
    }

    let url_foto: string | undefined

    // First create the mascota to get an ID
    console.log('Creating mascota in database...')
    const mascota = await insertMascota({
      nombre,
      especie,
      raza,
      sexo,
      edad,
      tamano,
      estado
    })
    console.log('Mascota created with ID:', mascota.id)

    // If there's a photo, upload it and update the mascota
    if (photo && photo.size > 0) {
      try {
        console.log('Uploading photo to storage...')
        const uploadResult = await uploadPetPhoto(photo, mascota.id)
        console.log('Photo upload result:', uploadResult)
        url_foto = uploadResult.publicUrl

        // Update mascota with photo URL
        console.log('Updating mascota with photo URL...')
        const { updateMascota } = await import("@/lib/db")
        await updateMascota(mascota.id, { url_foto })
        console.log('Mascota updated with photo URL:', url_foto)
      } catch (photoError) {
        console.error("Error uploading photo:", photoError)
        // Don't fail the entire operation if photo upload fails
        console.warn("Mascota created without photo due to upload error")
      }
    } else {
      console.log('No photo provided or photo is empty')
    }

    console.log('POST /api/admin/mascotas - Request completed successfully')
    
    // Transform the response for frontend consumption
    const { transformMascotaForDisplay } = await import("@/lib/storage")
    const transformedMascota = transformMascotaForDisplay({ ...mascota, url_foto })
    
    return NextResponse.json({ 
      success: true, 
      message: "Mascota registrada con éxito",
      mascota: transformedMascota
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating mascota:", error)
    return NextResponse.json({ error: "Error al registrar mascota" }, { status: 500 })
  }
}
