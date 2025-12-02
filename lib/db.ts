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

export interface FranjaHoraria {
  id: string
  fecha: string
  hora_inicio: string
  duracion_minutos: number
  cupo_maximo: number
  cupo_disponible: number
  estado: 'borrador' | 'publicado' | 'completado'
  created_at: string
  updated_at: string
}

export interface ReservaFranja {
  id: string
  franja_horaria_id: string
  solicitud_id: string
  estado: 'reservado' | 'completado' | 'cancelado'
  created_at: string
  updated_at: string
}

export interface Donacion {
  id: string
  donor_name?: string
  donor_email?: string
  amount: number
  frequency: 'one-time' | 'monthly'
  payment_method: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  culqi_charge_id?: string
  culqi_token_id?: string
  yape_transaction_id?: string
  yape_code?: string
  transaction_data?: any
  message?: string
  created_at: string
  updated_at: string
}

export interface DonationPlan {
  id: string
  name: string
  description: string
  amount: number
  frequency: 'one-time' | 'monthly'
  features: string[]
  popular?: boolean
}

export interface PaymentMethod {
  id: string
  name: string
  type: 'card' | 'yape' | 'bank_transfer'
  icon: string
  available: boolean
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
    
    // Usar siempre el cliente público por ahora para testing
    const client = supabase
    console.log('[DB] Usando cliente: público (testing mode)')
    
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
      adoptante_id: solicitud.adoptante_id, // ✅ Agregar adoptante_id
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
    
    // Usar siempre el cliente público por ahora para testing
    const client = supabase
    console.log('[DB] Usando cliente: público (testing mode)')
    
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
      console.error('[DB] Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('[DB] Solicitudes encontradas:', data?.length || 0)
    console.log('[DB] Primera solicitud (si existe):', data?.[0] ? {
      id: data[0].id,
      estado: data[0].estado,
      fecha_entrevista: data[0].fecha_entrevista
    } : 'Ninguna')

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
    console.log(`[DB] === INICIO updateSolicitudEstado ===`)
    console.log(`[DB] Actualizando solicitud ${solicitudId} a estado: ${nuevoEstado}`)
    console.log(`[DB] Fecha entrevista: ${fechaEntrevista}`)
    
    const clientToUse = supabaseAdmin || supabase
    const clientType = supabaseAdmin ? 'administrativo (service role)' : 'público'
    console.log(`[DB] Usando cliente: ${clientType}`)
    
    // Primero obtener la solicitud para saber qué mascota es
    const { data: solicitud, error: fetchError } = await clientToUse
      .from('solicitud')
      .select('mascota_id, estado')
      .eq('id', solicitudId)
      .single()

    if (fetchError || !solicitud) {
      console.error('[DB] Error obteniendo solicitud:', fetchError)
      throw new Error('Solicitud no encontrada')
    }

    console.log(`[DB] Solicitud encontrada - ID: ${solicitud.mascota_id}, Estado actual: ${solicitud.estado}`)

    // Actualizar la solicitud
    const updateData: any = { 
      estado: nuevoEstado,
      updated_at: new Date().toISOString()
    }
    if (fechaEntrevista) {
      updateData.fecha_entrevista = fechaEntrevista
    }

    console.log(`[DB] Datos de actualización:`, updateData)

    const { data: updateResult, error: updateError } = await clientToUse
      .from('solicitud')
      .update(updateData)
      .eq('id', solicitudId)
      .select()
      .single()

    if (updateError) {
      console.error('[DB] Error en actualización:', updateError)
      throw new Error(`Error actualizando solicitud: ${updateError.message}`)
    }

    console.log(`[DB] ✅ Solicitud actualizada exitosamente:`, updateResult)

    // Manejar el estado de la mascota según el estado de la solicitud
    let nuevoEstadoMascota = 'disponible' // Por defecto, volver a disponible

    if (nuevoEstado === 'aprobada') {
      nuevoEstadoMascota = 'adoptado'
    } else if (nuevoEstado === 'pendiente' || nuevoEstado === 'entrevista') {
      nuevoEstadoMascota = 'reservado'
    } else if (nuevoEstado === 'rechazada' || nuevoEstado === 'cancelada') {
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

    console.log('[DB] === FIN updateSolicitudEstado ===')
    return { 
      success: true, 
      solicitud_id: solicitudId,
      nuevo_estado: nuevoEstado,
      fecha_entrevista: fechaEntrevista || null
    }
  } catch (error) {
    console.error('[DB] === ERROR en updateSolicitudEstado ===')
    console.error('[DB] updateSolicitudEstado failed:', error)
    throw error
  }
}

export async function getEntrevistasProgramadas(startDate?: string, endDate?: string) {
  try {
    console.log('[DB] === INICIO getEntrevistasProgramadas ===')
    console.log('[DB] Parámetros:', { startDate, endDate })
    
    const clientToUse = supabaseAdmin || supabase
    const clientType = supabaseAdmin ? 'administrativo (service role)' : 'público'
    console.log(`[DB] Usando cliente: ${clientType}`)

    let query = clientToUse
      .from('solicitud')
      .select(`
        id,
        fecha_entrevista,
        telefono,
        mascota_id,
        adoptante_id
      `)
      .eq('estado', 'entrevista')
      .not('fecha_entrevista', 'is', null)

    if (startDate) {
      query = query.gte('fecha_entrevista', startDate)
    }
    if (endDate) {
      query = query.lte('fecha_entrevista', endDate)
    }

    const { data: solicitudes, error } = await query.order('fecha_entrevista')

    if (error) {
      console.error('[DB] Error getting solicitudes con entrevista:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log(`[DB] Solicitudes con entrevista encontradas: ${solicitudes?.length || 0}`)

    if (!solicitudes || solicitudes.length === 0) {
      console.log('[DB] No hay entrevistas programadas')
      return []
    }

    // Obtener información de mascotas
    const mascotaIds = [...new Set(solicitudes.map(s => s.mascota_id))]
    const { data: mascotas, error: mascotaError } = await clientToUse
      .from('mascota')
      .select('id, nombre')
      .in('id', mascotaIds)

    if (mascotaError) {
      console.error('[DB] Error getting mascotas:', mascotaError)
    }

    // Obtener información de adoptantes
    const adoptanteIds = [...new Set(solicitudes.map(s => s.adoptante_id))]
    const { data: adoptantes, error: adoptanteError } = await clientToUse
      .from('adoptante')
      .select('id, nombres, apellidos')
      .in('id', adoptanteIds)

    if (adoptanteError) {
      console.error('[DB] Error getting adoptantes:', adoptanteError)
    }

    // Mapear los resultados
    const entrevistas = solicitudes.map((item: any) => {
      const mascota = mascotas?.find(m => m.id === item.mascota_id)
      const adoptante = adoptantes?.find(a => a.id === item.adoptante_id)
      
      return {
        id: item.id,
        solicitud_id: item.id,
        fecha_entrevista: item.fecha_entrevista,
        estado: 'programada',
        mascota_nombre: mascota?.nombre || 'Mascota no encontrada',
        postulante_nombre: adoptante ? `${adoptante.nombres} ${adoptante.apellidos}` : 'Adoptante no encontrado',
        postulante_telefono: item.telefono || 'No disponible',
        observaciones: 'Entrevista programada'
      }
    })

    console.log(`[DB] ✅ Entrevistas mapeadas exitosamente: ${entrevistas.length}`)
    return entrevistas
    
  } catch (error) {
    console.error('[DB] getEntrevistasProgramadas failed:', error)
    throw error
  }
}

// === FUNCIONES PARA FRANJAS HORARIAS ===

export async function insertFranjaHoraria(data: {
  fecha: string
  hora_inicio: string
  duracion_minutos: number
  cupo_maximo?: number
}) {
  try {
    console.log('[DB] === INICIO insertFranjaHoraria ===')
    console.log('[DB] Datos recibidos:', JSON.stringify(data, null, 2))
    
    // Usar siempre el cliente público por ahora para testing
    const clientToUse = supabase
    console.log(`[DB] Usando cliente: público (testing mode)`)

    const insertData = {
      fecha: data.fecha,
      hora_inicio: data.hora_inicio,
      duracion_minutos: data.duracion_minutos,
      cupo_maximo: data.cupo_maximo || 1,
      cupo_disponible: data.cupo_maximo || 1,
      estado: 'borrador' as const
    }

    console.log('[DB] Datos preparados para inserción:', JSON.stringify(insertData, null, 2))
    
    // Intentar insertar sin el array wrapper
    const { data: result, error } = await clientToUse
      .from('franja_horaria')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error(`[DB] Error en inserción:`, error)
      console.error(`[DB] Error code:`, error.code)
      console.error(`[DB] Error details:`, error.details)
      console.error(`[DB] Error hint:`, error.hint)
      console.error(`[DB] Error message:`, error.message)
      throw new Error(`Error de base de datos: ${error.message} (código: ${error.code})`)
    }
    
    console.log(`[DB] ✅ Franja horaria insertada exitosamente:`, result)
    return result
    
  } catch (error) {
    console.error('[DB] === ERROR en insertFranjaHoraria ===')
    console.error('[DB] Error completo:', error)
    console.error('[DB] Error stack:', error instanceof Error ? error.stack : 'No stack available')
    throw error
  }
}

export async function getFranjasHorarias(estado?: 'borrador' | 'publicado' | 'completado') {
  try {
    console.log('[DB] === INICIO getFranjasHorarias ===')
    console.log('[DB] Estado filtro:', estado)
    
    // Usar siempre el cliente público por ahora para testing
    const clientToUse = supabase
    console.log(`[DB] Usando cliente: público (testing mode)`)

    let query = clientToUse
      .from('franja_horaria')
      .select('*')
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true })

    if (estado) {
      query = query.eq('estado', estado)
    }

    const { data, error } = await query

    if (error) {
      console.error('[DB] Error getting franjas horarias:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log(`[DB] ✅ Franjas horarias obtenidas: ${data?.length || 0}`)
    return data || []
    
  } catch (error) {
    console.error('[DB] getFranjasHorarias failed:', error)
    throw error
  }
}

export async function deleteFranjaHoraria(id: string) {
  try {
    console.log('[DB] === INICIO deleteFranjaHoraria ===')
    console.log('[DB] ID franja a eliminar:', id)
    
    // Usar siempre el cliente público por ahora para testing
    const clientToUse = supabase
    console.log(`[DB] Usando cliente: público (testing mode)`)

    const { error } = await clientToUse
      .from('franja_horaria')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[DB] Error deleting franja horaria:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    console.log('[DB] ✅ Franja horaria eliminada exitosamente')
    return { success: true }
    
  } catch (error) {
    console.error('[DB] deleteFranjaHoraria failed:', error)
    throw error
  }
}

export async function publicarFranjasHorarias(ids: string[]) {
  try {
    console.log('[DB] === INICIO publicarFranjasHorarias ===')
    console.log('[DB] IDs a publicar:', ids)
    
    // Usar siempre el cliente público por ahora para testing
    const clientToUse = supabase
    console.log(`[DB] Usando cliente: público (testing mode)`)

    // Verificar traslapes antes de publicar
    const { data: franjasExistentes, error: fetchError } = await clientToUse
      .from('franja_horaria')
      .select('fecha, hora_inicio, duracion_minutos')
      .eq('estado', 'publicado')

    if (fetchError) {
      console.error('[DB] Error fetching franjas existentes:', fetchError)
      throw new Error(`Database error: ${fetchError.message}`)
    }

    // Obtener las franjas que se van a publicar
    const { data: franjasAPublicar, error: fetchNewError } = await clientToUse
      .from('franja_horaria')
      .select('fecha, hora_inicio, duracion_minutos')
      .in('id', ids)

    if (fetchNewError) {
      console.error('[DB] Error fetching franjas a publicar:', fetchNewError)
      throw new Error(`Database error: ${fetchNewError.message}`)
    }

    // Validar traslapes
    const todasLasFranjas = [...(franjasExistentes || []), ...(franjasAPublicar || [])]
    const traslapes = validarTraslapesHorarios(todasLasFranjas)
    
    if (traslapes.length > 0) {
      throw new Error(`Se detectaron traslapes de horarios: ${traslapes.join(', ')}`)
    }

    // Si no hay traslapes, publicar las franjas
    const { data: result, error } = await clientToUse
      .from('franja_horaria')
      .update({ estado: 'publicado' })
      .in('id', ids)
      .select()

    if (error) {
      console.error('[DB] Error publishing franjas:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    console.log(`[DB] ✅ Franjas horarias publicadas exitosamente: ${result?.length || 0}`)
    return result || []
    
  } catch (error) {
    console.error('[DB] publicarFranjasHorarias failed:', error)
    throw error
  }
}

// Función auxiliar para validar traslapes
function validarTraslapesHorarios(franjas: any[]): string[] {
  const traslapes: string[] = []
  
  for (let i = 0; i < franjas.length; i++) {
    for (let j = i + 1; j < franjas.length; j++) {
      const franja1 = franjas[i]
      const franja2 = franjas[j]
      
      // Solo comparar si son del mismo día
      if (franja1.fecha !== franja2.fecha) continue
      
      const inicio1 = new Date(`${franja1.fecha}T${franja1.hora_inicio}`)
      const fin1 = new Date(inicio1.getTime() + franja1.duracion_minutos * 60000)
      
      const inicio2 = new Date(`${franja2.fecha}T${franja2.hora_inicio}`)
      const fin2 = new Date(inicio2.getTime() + franja2.duracion_minutos * 60000)
      
      // Verificar si hay traslape
      if (inicio1 < fin2 && inicio2 < fin1) {
        traslapes.push(`${franja1.fecha} ${franja1.hora_inicio} - ${franja2.hora_inicio}`)
      }
    }
  }
  
  return traslapes
}

export async function getFranjasPublicadasParaUsuario() {
  try {
    console.log('[DB] === INICIO getFranjasPublicadasParaUsuario ===')
    
    // Usar siempre el cliente público por ahora para testing
    const clientToUse = supabase
    console.log(`[DB] Usando cliente: público (testing mode)`)

    // Solo franjas publicadas y con cupos disponibles
    const { data, error } = await clientToUse
      .from('franja_horaria')
      .select('*')
      .eq('estado', 'publicado')
      .gt('cupo_disponible', 0)
      .gte('fecha', new Date().toISOString().split('T')[0]) // Solo fechas futuras
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true })

    if (error) {
      console.error('[DB] Error getting franjas para usuario:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log(`[DB] ✅ Franjas disponibles para usuario: ${data?.length || 0}`)
    return data || []
    
  } catch (error) {
    console.error('[DB] getFranjasPublicadasParaUsuario failed:', error)
    throw error
  }
}

export async function reservarFranjaHoraria(franjaId: string, solicitudId: string) {
  try {
    console.log('[DB] === INICIO reservarFranjaHoraria ===')
    console.log('[DB] Reservando franja:', franjaId, 'para solicitud:', solicitudId)
    
    // Usar siempre el cliente público por ahora para testing
    const clientToUse = supabase
    console.log(`[DB] Usando cliente: público (testing mode)`)

    // Verificar que la franja esté disponible
    const { data: franja, error: franjaError } = await clientToUse
      .from('franja_horaria')
      .select('*')
      .eq('id', franjaId)
      .eq('estado', 'publicado')
      .gt('cupo_disponible', 0)
      .single()

    if (franjaError || !franja) {
      throw new Error('La franja horaria no está disponible o no existe')
    }

    console.log('[DB] Franja encontrada:', franja)

    // Crear la reserva
    const { data: reserva, error: reservaError } = await clientToUse
      .from('reserva_franja')
      .insert([{
        franja_horaria_id: franjaId,
        solicitud_id: solicitudId,
        estado: 'reservado'
      }])
      .select()
      .single()

    if (reservaError) {
      console.error('[DB] Error creating reserva:', reservaError)
      throw new Error(`Error creando reserva: ${reservaError.message}`)
    }

    console.log('[DB] Reserva creada:', reserva)

    // Decrementar cupo disponible
    const { data: franjaActualizada, error: updateError } = await clientToUse
      .from('franja_horaria')
      .update({ 
        cupo_disponible: franja.cupo_disponible - 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', franjaId)
      .select()
      .single()

    if (updateError) {
      console.error('[DB] Error updating franja cupo:', updateError)
      // Intentar limpiar la reserva creada
      await clientToUse
        .from('reserva_franja')
        .delete()
        .eq('id', reserva.id)
      
      throw new Error(`Error actualizando cupo: ${updateError.message}`)
    }

    console.log('[DB] ✅ Franja horaria reservada exitosamente')
    return {
      reserva,
      franjaActualizada,
      fechaEntrevista: `${franja.fecha}T${franja.hora_inicio}`
    }
    
  } catch (error) {
    console.error('[DB] reservarFranjaHoraria failed:', error)
    throw error
  }
}

// === FUNCIONES PARA DONACIONES ===
export async function insertDonation(data: {
  donor_name?: string
  donor_email?: string
  amount: number
  frequency: 'one-time' | 'monthly'
  payment_method: string
  status: 'pending' | 'completed' | 'failed'
  stripe_session_id?: string
  yape_transaction_id?: string
  message?: string
}) {
  try {
    console.log('[DB] === INICIO insertDonation ===')
    console.log('[DB] Datos recibidos:', JSON.stringify(data, null, 2))
    
    const clientToUse = supabase
    
    const { data: donation, error } = await clientToUse
      .from('donacion')
      .insert([{
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) {
      console.error('[DB] Error inserting donation:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    console.log('[DB] ✅ Donación insertada:', donation)
    return donation
  } catch (error) {
    console.error('[DB] insertDonation failed:', error)
    throw error
  }
}

export async function updateDonationStatus(id: string, status: 'completed' | 'failed', transactionData?: any) {
  try {
    console.log(`[DB] Actualizando donación ${id} a estado: ${status}`)
    
    const clientToUse = supabase
    
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
      ...(transactionData && { transaction_data: transactionData })
    }
    
    const { data, error } = await clientToUse
      .from('donacion')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('[DB] Error updating donation status:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    console.log('[DB] ✅ Estado de donación actualizado')
    return data
  } catch (error) {
    console.error('[DB] updateDonationStatus failed:', error)
    throw error
  }
}

export async function getDonationsByEmail(email: string) {
  try {
    console.log(`[DB] Obteniendo donaciones para email: ${email}`)
    
    const clientToUse = supabase
    
    const { data, error } = await clientToUse
      .from('donacion')
      .select('*')
      .eq('donor_email', email)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('[DB] Error getting donations by email:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    console.log(`[DB] ✅ Donaciones encontradas: ${data?.length || 0}`)
    return data || []
  } catch (error) {
    console.error('[DB] getDonationsByEmail failed:', error)
    throw error
  }
}

export async function getAllDonations() {
  try {
    console.log('[DB] Obteniendo todas las donaciones')
    
    const clientToUse = supabase
    
    const { data, error } = await clientToUse
      .from('donacion')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('[DB] Error getting all donations:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    console.log(`[DB] ✅ Total donaciones: ${data?.length || 0}`)
    return data || []
  } catch (error) {
    console.error('[DB] getAllDonations failed:', error)
    throw error
  }
}
