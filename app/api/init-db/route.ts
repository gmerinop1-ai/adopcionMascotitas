import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function POST() {
  try {
    // Verificar si ya existen roles
    const { data: existingRoles } = await supabase
      .from('roles')
      .select('*')

    if (existingRoles && existingRoles.length > 0) {
      return NextResponse.json({ message: "Los roles ya están inicializados" })
    }

    // Crear roles iniciales
    const { error: rolesError } = await supabase
      .from('roles')
      .insert([
        { nombre: 'adoptante' },
        { nombre: 'administrador' }
      ])

    if (rolesError) {
      console.error('Error creating roles:', rolesError)
      return NextResponse.json({ error: "Error al crear roles" }, { status: 500 })
    }

    return NextResponse.json({ 
      message: "Base de datos inicializada correctamente",
      roles: ["adoptante", "administrador"]
    })
  } catch (error) {
    console.error('[INIT-DB] Error:', error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}