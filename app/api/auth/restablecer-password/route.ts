import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Intentar actualizar la contraseña usando el token de recuperación
    const { data, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Error al obtener la sesión:', sessionError)
      return NextResponse.json(
        { error: 'Error al verificar la sesión' },
        { status: 401 }
      )
    }

    // Actualizar la contraseña
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      console.error('Error al restablecer la contraseña:', error)
      return NextResponse.json(
        { error: 'Error al restablecer la contraseña' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Contraseña restablecida exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error en el endpoint de restablecer contraseña:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}