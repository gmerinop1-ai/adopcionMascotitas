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
