// Database connection utility for Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database interfaces based on the provided schema
export interface Administrador {
  id: string
  nombre: string
  apellidos: string
}

export interface Roles {
  id: string
  nombre: string
}

export interface Usuario {
  usuario_id: string
  correo: string
  password: string
  estado: string
  rol_id?: string
  admin_id?: string
}

export interface Adoptante {
  id: string
  nombres: string
  apellidos: string
  nro_dni: string
  usuario_id: string
}

export interface Mascota {
  id: string
  nombre: string
  especie: string
  raza?: string
  sexo?: string
  edad?: number
  tamano?: string
  url_foto?: string
  foto_url?: string // Added for frontend compatibility
  estado: string
}

export interface AdoptanteMascota {
  id_adoptante: string
  id_mascota: string
}

export interface Solicitud {
  id: string
  edad?: number
  telefono?: string
  distrito_ciudad?: string
  razon?: string
  condicion_hogar?: string
  estado: string
  adoptante_id: string
  mascota_id: string
}

// Database helper functions with better error handling
export async function insertUsuario(data: {
  correo: string
  password: string
  rol_id: string | null
}) {
  try {
    const { data: result, error } = await supabase
      .from('usuario')
      .insert([{
        correo: data.correo,
        password: data.password,
        estado: 'activo',
        rol_id: data.rol_id
      }])
      .select()
      .single()

    if (error) {
      console.error('Error inserting usuario:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    return result
  } catch (error) {
    console.error('insertUsuario failed:', error)
    throw error
  }
}

export async function insertAdoptante(data: {
  nombres: string
  apellidos: string
  nro_dni: string
  usuario_id: string
}) {
  try {
    const { data: result, error } = await supabase
      .from('adoptante')
      .insert([data])
      .select()
      .single()

    if (error) {
      console.error('Error inserting adoptante:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    return result
  } catch (error) {
    console.error('insertAdoptante failed:', error)
    throw error
  }
}

export async function getUserByEmail(correo: string) {
  try {
    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('correo', correo)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting user by email:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    return data
  } catch (error) {
    console.error('getUserByEmail failed:', error)
    throw error
  }
}

export async function getRoleByName(nombre: string) {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('nombre', nombre)
      .single()

    if (error) {
      console.error('Error getting role by name:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    return data
  } catch (error) {
    console.error('getRoleByName failed:', error)
    throw error
  }
}

export async function getAdoptanteByDNI(nro_dni: string) {
  try {
    const { data, error } = await supabase
      .from('adoptante')
      .select('*')
      .eq('nro_dni', nro_dni)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting adoptante by DNI:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    return data
  } catch (error) {
    console.error('getAdoptanteByDNI failed:', error)
    throw error
  }
}

// Mascota functions
export async function insertMascota(data: {
  nombre: string
  especie: string
  raza?: string
  sexo?: string
  edad?: number
  tamano?: string
  url_foto?: string
  estado?: string
}) {
  try {
    const { data: result, error } = await supabase
      .from('mascota')
      .insert([{
        nombre: data.nombre,
        especie: data.especie,
        raza: data.raza,
        sexo: data.sexo,
        edad: data.edad,
        tamano: data.tamano,
        url_foto: data.url_foto,
        estado: data.estado || 'disponible'
      }])
      .select()
      .single()

    if (error) {
      console.error('Error inserting mascota:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    return result
  } catch (error) {
    console.error('insertMascota failed:', error)
    throw error
  }
}

export async function updateMascota(id: string, data: {
  nombre?: string
  especie?: string
  raza?: string
  sexo?: string
  edad?: number
  tamano?: string
  url_foto?: string
  estado?: string
}) {
  try {
    const { data: result, error } = await supabase
      .from('mascota')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating mascota:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    return result
  } catch (error) {
    console.error('updateMascota failed:', error)
    throw error
  }
}

export async function getMascotaById(id: string) {
  try {
    const { data, error } = await supabase
      .from('mascota')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error getting mascota by ID:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    // Transform data for frontend consumption
    const { transformMascotaForDisplay } = await import('./storage')
    return data ? transformMascotaForDisplay(data) : null
  } catch (error) {
    console.error('getMascotaById failed:', error)
    throw error
  }
}

export async function getAllMascotas() {
  try {
    const { data, error } = await supabase
      .from('mascota')
      .select('*')
      .order('id')

    if (error) {
      console.error('Error getting all mascotas:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    // Transform data for frontend consumption
    const { transformMascotaForDisplay } = await import('./storage')
    return data?.map(transformMascotaForDisplay) || []
  } catch (error) {
    console.error('getAllMascotas failed:', error)
    throw error
  }
}

export async function getMascotasDisponibles() {
  try {
    const { data, error } = await supabase
      .from('mascota')
      .select('*')
      .in('estado', ['disponible', 'reservado'])
      .order('id')

    if (error) {
      console.error('Error getting mascotas disponibles:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    // Transform data for frontend consumption
    const { transformMascotaForDisplay } = await import('./storage')
    return data?.map(transformMascotaForDisplay) || []
  } catch (error) {
    console.error('getMascotasDisponibles failed:', error)
    throw error
  }
}

export async function deleteMascota(id: string) {
  try {
    const { error } = await supabase
      .from('mascota')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting mascota:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    return { success: true }
  } catch (error) {
    console.error('deleteMascota failed:', error)
    throw error
  }
}

// Storage functions for pet photos
export async function uploadPetPhoto(file: File, petId: string) {
  try {
    console.log('uploadPetPhoto called with:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      petId
    })

    const { validateFile, generateFileName, getStoragePath } = await import('./storage')
    
    // Validate file
    console.log('Validating file...')
    const validation = validateFile(file)
    if (!validation.valid) {
      console.error('File validation failed:', validation.error)
      throw new Error(validation.error)
    }
    console.log('File validation passed')

    const fileName = generateFileName(file.name, petId)
    const filePath = getStoragePath(fileName)
    console.log('Generated file path:', filePath)

    console.log('Attempting to upload to Supabase storage...')
    const { data, error } = await supabase.storage
      .from('admin')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase storage error:', error)
      throw new Error(`Storage error: ${error.message}`)
    }

    console.log('Upload successful, data:', data)

    // Get public URL
    console.log('Getting public URL...')
    const { data: { publicUrl } } = supabase.storage
      .from('admin')
      .getPublicUrl(filePath)

    console.log('Public URL generated:', publicUrl)

    const result = {
      path: data.path,
      publicUrl,
      fileName
    }

    console.log('uploadPetPhoto completed successfully:', result)
    return result
  } catch (error) {
    console.error('uploadPetPhoto failed:', error)
    throw error
  }
}

export async function deletePetPhoto(filePath: string) {
  try {
    const { error } = await supabase.storage
      .from('admin')
      .remove([filePath])

    if (error) {
      console.error('Error deleting photo:', error)
      throw new Error(`Storage error: ${error.message}`)
    }
    return { success: true }
  } catch (error) {
    console.error('deletePetPhoto failed:', error)
    throw error
  }
}
