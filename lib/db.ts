// Database connection utility for Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Cliente público (para operaciones normales)
export const supabase = createClient(supabaseUrl, supabaseKey)

// Cliente de servicio (para operaciones administrativas que bypassen RLS)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

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
  fecha_entrevista?: string
  created_at?: string
  updated_at?: string
}

export interface SolicitudAdopcion extends Solicitud {
  mascota_nombre?: string
  mascota_foto?: string
  adoptante_nombres?: string
  adoptante_apellidos?: string
  adoptante_correo?: string
}

export interface Entrevista {
  id: string
  solicitud_id: string
  fecha_entrevista: string
  estado: 'programada' | 'realizada' | 'cancelada'
  observaciones?: string
  created_at: string
  updated_at: string
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
      .eq('estado', 'disponible') // Solo mascotas disponibles para adopción
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

// Solicitud functions
export async function insertSolicitud(data: {
  dni: string
  telefono: string
  distrito_ciudad: string
  razon: string
  condicion_hogar: string
  adoptante_id: string
  mascota_id: string
}) {
  try {
    console.log('[DB] === INICIO insertSolicitud ===')
    console.log('[DB] Datos recibidos:', JSON.stringify(data, null, 2))
    console.log('[DB] Variables de entorno cargadas:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseAdminAvailable: !!supabaseAdmin
    })
    
    // Verificar que los IDs no estén vacíos
    if (!data.adoptante_id || !data.mascota_id) {
      throw new Error(`IDs requeridos faltantes: adoptante_id=${data.adoptante_id}, mascota_id=${data.mascota_id}`)
    }

    const insertData = {
      edad: null,
      telefono: data.telefono,
      distrito_ciudad: data.distrito_ciudad,
      razon: data.razon,
      condicion_hogar: data.condicion_hogar,
      estado: 'pendiente',
      adoptante_id: data.adoptante_id,
      mascota_id: data.mascota_id
    }

    console.log('[DB] Datos preparados para inserción:', JSON.stringify(insertData, null, 2))
    
    // Usar cliente administrativo si está disponible
    const clientToUse = supabaseAdmin || supabase
    const clientType = supabaseAdmin ? 'administrativo (service role)' : 'público'
    console.log(`[DB] Usando cliente ${clientType}`)
    
    const { data: result, error } = await clientToUse
      .from('solicitud')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error(`[DB] Error con cliente ${clientType}:`, error)
      console.log('[DB] Detalles del error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      throw new Error(`Error de base de datos: ${error.message}`)
    }
    
    console.log(`[DB] ✅ Solicitud insertada exitosamente con cliente ${clientType}:`, result)
    
    // Actualizar el estado de la mascota a "reservado"
    console.log('[DB] Actualizando estado de mascota a reservado...')
    const { error: updateError } = await clientToUse
      .from('mascota')
      .update({ estado: 'reservado' })
      .eq('id', data.mascota_id)

    if (updateError) {
      console.error('[DB] Error actualizando estado de mascota:', updateError)
      // No fallar la transacción por esto, solo log el error
      console.log('[DB] ⚠️ Solicitud creada pero no se pudo actualizar estado de mascota')
    } else {
      console.log('[DB] ✅ Estado de mascota actualizado a reservado')
    }
    
    return result
    
  } catch (error) {
    console.error('[DB] === ERROR en insertSolicitud ===')
    console.error('[DB] Error completo:', error)
    throw error
  }
}

export async function getAllSolicitudesAdmin() {
  try {
    console.log('[DB] Obteniendo todas las solicitudes para admin...')
    
    // Usar cliente administrativo para operaciones de admin
    const client = supabaseAdmin || supabase
    console.log('[DB] Usando cliente:', supabaseAdmin ? 'administrativo' : 'público')
    
    const { data, error } = await client
      .from('solicitud')
      .select(`
        *,
        mascota:mascota_id (
          nombre,
          url_foto
        ),
        adoptante:adoptante_id (
          nombres,
          apellidos,
          nro_dni,
          usuario:usuario_id (
            correo
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[DB] Error getting solicitudes for admin:', error)
      console.error('[DB] Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('[DB] Solicitudes obtenidas exitosamente. Total:', data?.length || 0)

    // Transform data for frontend
    return data?.map(solicitud => ({
      id: solicitud.id,
      fecha: solicitud.created_at,
      mascota_nombre: solicitud.mascota?.nombre,
      mascota_id: solicitud.mascota_id,
      mascota_foto: solicitud.mascota?.url_foto,
      postulante_nombre: `${solicitud.adoptante?.nombres} ${solicitud.adoptante?.apellidos}`,
      postulante_correo: solicitud.adoptante?.usuario?.correo,
      postulante_telefono: solicitud.telefono,
      postulante_dni: solicitud.adoptante?.nro_dni,
      distrito_ciudad: solicitud.distrito_ciudad,
      estado: solicitud.estado,
      fecha_entrevista: solicitud.fecha_entrevista,
      razon: solicitud.razon,
      condicion_hogar: solicitud.condicion_hogar,
      created_at: solicitud.created_at,
      updated_at: solicitud.updated_at,
    })) || []
  } catch (error) {
    console.error('[DB] getAllSolicitudesAdmin failed:', error)
    throw error
  }
}

export async function getSolicitudById(id: string) {
  try {
    const { data, error } = await supabase
      .from('solicitud')
      .select(`
        *,
        mascota:mascota_id (
          id,
          nombre,
          url_foto
        ),
        adoptante:adoptante_id (
          nombres,
          apellidos,
          nro_dni,
          usuario:usuario_id (
            correo
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error getting solicitud by ID:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data) return null

    // Transform data for frontend
    return {
      id: data.id,
      mascota_id: data.mascota_id,
      mascota_nombre: data.mascota?.nombre,
      mascota_foto: data.mascota?.url_foto,
      dni: data.adoptante?.nro_dni,
      telefono: data.telefono,
      distrito_ciudad: data.distrito_ciudad,
      razon: data.razon,
      condicion_hogar: data.condicion_hogar,
      estado: data.estado,
      fecha_entrevista: data.fecha_entrevista,
      postulante_nombre: `${data.adoptante?.nombres} ${data.adoptante?.apellidos}`,
      postulante_correo: data.adoptante?.usuario?.correo,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  } catch (error) {
    console.error('getSolicitudById failed:', error)
    throw error
  }
}

export async function updateSolicitud(id: string, updates: {
  estado?: string
  fecha_entrevista?: string
}) {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    if (updates.estado) updateData.estado = updates.estado
    if (updates.fecha_entrevista) updateData.fecha_entrevista = updates.fecha_entrevista

    const { data, error } = await supabase
      .from('solicitud')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating solicitud:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    return data
  } catch (error) {
    console.error('updateSolicitud failed:', error)
    throw error
  }
}

export async function getSolicitudesByAdoptante(adoptanteId: string) {
  try {
    console.log('[DB] Obteniendo solicitudes del adoptante:', adoptanteId)
    
    // Usar cliente administrativo para bypasear RLS
    const client = supabaseAdmin || supabase
    console.log('[DB] Usando cliente:', supabaseAdmin ? 'administrativo' : 'público')
    
    const { data, error } = await client
      .from('solicitud')
      .select(`
        *,
        mascota:mascota_id (
          nombre,
          url_foto
        )
      `)
      .eq('adoptante_id', adoptanteId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[DB] Error getting solicitudes by adoptante:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('[DB] Solicitudes encontradas:', data?.length || 0)

    return data?.map(solicitud => ({
      id: solicitud.id,
      mascota_id: solicitud.mascota_id,
      mascota_nombre: solicitud.mascota?.nombre,
      mascota_foto: solicitud.mascota?.url_foto,
      telefono: solicitud.telefono,
      distrito_ciudad: solicitud.distrito_ciudad,
      razon: solicitud.razon,
      condicion_hogar: solicitud.condicion_hogar,
      estado: solicitud.estado,
      fecha_entrevista: solicitud.fecha_entrevista,
      created_at: solicitud.created_at,
      updated_at: solicitud.updated_at,
    })) || []
  } catch (error) {
    console.error('[DB] getSolicitudesByAdoptante failed:', error)
    throw error
  }
}

// Función para actualizar estado de solicitud y manejar estado de mascota
export async function updateSolicitudEstado(solicitudId: string, nuevoEstado: string, fechaEntrevista?: string) {
  try {
    console.log(`[DB] Actualizando solicitud ${solicitudId} a estado: ${nuevoEstado}`)
    
    const clientToUse = supabaseAdmin || supabase
    const clientType = supabaseAdmin ? 'administrativo (service role)' : 'público'
    
    // Primero obtener la solicitud para saber qué mascota es
    const { data: solicitud, error: fetchError } = await clientToUse
      .from('solicitud')
      .select('mascota_id')
      .eq('id', solicitudId)
      .single()

    if (fetchError || !solicitud) {
      throw new Error('Solicitud no encontrada')
    }

    // Actualizar la solicitud
    const updateData: any = { estado: nuevoEstado }
    if (fechaEntrevista) {
      updateData.fecha_entrevista = fechaEntrevista
    }

    const { error: updateError } = await clientToUse
      .from('solicitud')
      .update(updateData)
      .eq('id', solicitudId)

    if (updateError) {
      throw new Error(`Error actualizando solicitud: ${updateError.message}`)
    }

    // Manejar el estado de la mascota según el estado de la solicitud
    let nuevoEstadoMascota = 'disponible' // Por defecto, volver a disponible

    if (nuevoEstado === 'aprobado') {
      nuevoEstadoMascota = 'adoptado'
    } else if (nuevoEstado === 'pendiente') {
      nuevoEstadoMascota = 'reservado'
    } else if (nuevoEstado === 'rechazado' || nuevoEstado === 'cancelado') {
      nuevoEstadoMascota = 'disponible'
    }

    console.log(`[DB] Actualizando mascota ${solicitud.mascota_id} a estado: ${nuevoEstadoMascota}`)
    
    const { error: mascotaError } = await clientToUse
      .from('mascota')
      .update({ estado: nuevoEstadoMascota })
      .eq('id', solicitud.mascota_id)

    if (mascotaError) {
      console.error('[DB] Error actualizando estado de mascota:', mascotaError)
      // No fallar la transacción
    } else {
      console.log('[DB] ✅ Estado de mascota actualizado correctamente')
    }

    return { success: true }
  } catch (error) {
    console.error('[DB] updateSolicitudEstado failed:', error)
    throw error
  }
}

export async function getEntrevistasProgramadas(startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from('solicitud')
      .select(`
        id,
        fecha_entrevista,
        telefono,
        mascota:mascota_id!inner (
          nombre
        ),
        adoptante:adoptante_id!inner (
          nombres,
          apellidos
        )
      `)
      .eq('estado', 'entrevista')
      .not('fecha_entrevista', 'is', null)

    if (startDate) {
      query = query.gte('fecha_entrevista', startDate)
    }
    if (endDate) {
      query = query.lte('fecha_entrevista', endDate)
    }

    const { data, error } = await query.order('fecha_entrevista')

    if (error) {
      console.error('Error getting entrevistas programadas:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data?.map((item: any) => ({
      id: item.id,
      solicitud_id: item.id,
      fecha_entrevista: item.fecha_entrevista,
      estado: 'programada',
      mascota_nombre: item.mascota?.nombre,
      postulante_nombre: `${item.adoptante?.nombres} ${item.adoptante?.apellidos}`,
      postulante_telefono: item.telefono,
      observaciones: 'Entrevista programada'
    })) || []
  } catch (error) {
    console.error('getEntrevistasProgramadas failed:', error)
    throw error
  }
}
