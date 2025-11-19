import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

const mockSolicitud = {
  id: "1",
  usuario_id: "1",
  mascota_id: "1",
  mascota_nombre: "Luna",
  mascota_foto: "/friendly-labrador-dog.jpg",
  postulante_nombre: "Juan Pérez García",
  postulante_correo: "juan.perez@email.com",
  telefono: "987654321",
  distrito_ciudad: "Lima, San Isidro",
  razon: "Siempre he querido tener un perro y Luna parece perfecta para mi familia. Tenemos experiencia con mascotas y queremos darle un hogar lleno de amor.",
  condicion_hogar: "Vivo en una casa con jardín amplio. Tengo espacio suficiente para que Luna pueda correr y jugar. No tengo otras mascotas actualmente.",
  estado: "entrevista",
  fecha_entrevista: "2024-02-15T10:00:00Z",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-20T15:45:00Z",
}

const mockHistorial = [
  {
    id: 1,
    solicitud_id: "1",
    estado_anterior: null,
    estado_nuevo: "pendiente",
    admin_nombre: null,
    notas: "Solicitud creada",
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    solicitud_id: "1",
    estado_anterior: "pendiente",
    estado_nuevo: "entrevista",
    admin_nombre: "Admin Usuario",
    notas: "Candidato prometedor, programada entrevista.",
    created_at: "2024-01-20T15:45:00Z",
  },
]

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // TODO: Implementar consulta real a la base de datos
    // const { data: solicitud, error } = await supabase
    //   .from('solicitud')
    //   .select(`
    //     *,
    //     mascota:mascota_id (
    //       id,
    //       nombre,
    //       url_foto
    //     ),
    //     adoptante:adoptante_id (
    //       nombres,
    //       apellidos,
    //       nro_dni,
    //       usuario:usuario_id (
    //         correo
    //       )
    //     )
    //   `)
    //   .eq('id', id)
    //   .single()

    return NextResponse.json({
      solicitud: mockSolicitud,
      historial: mockHistorial,
    })
  } catch (error) {
    console.error("[v0] Error fetching solicitud:", error)
    return NextResponse.json({ error: "Error al obtener solicitud" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { estado, fecha_entrevista, observaciones } = body

    // Validaciones básicas
    if (estado && !['pendiente', 'entrevista', 'aprobada', 'rechazada'].includes(estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
    }

    if (estado === 'entrevista' && !fecha_entrevista) {
      return NextResponse.json({ error: "Fecha de entrevista requerida" }, { status: 400 })
    }

    // TODO: Verificar permisos de administrador
    // const session = await getServerSession()
    // if (!session?.user?.role === 'admin') {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    // }

    // TODO: Actualizar en la base de datos
    // const updateData: any = { updated_at: new Date().toISOString() }
    // if (estado) updateData.estado = estado
    // if (fecha_entrevista) updateData.fecha_entrevista = fecha_entrevista

    // const { data, error } = await supabase
    //   .from('solicitud')
    //   .update(updateData)
    //   .eq('id', id)
    //   .select()
    //   .single()

    // if (error) {
    //   console.error('Error updating solicitud:', error)
    //   return NextResponse.json({ error: "Error al actualizar solicitud" }, { status: 500 })
    // }

    // TODO: Crear entrada en el historial
    // if (estado) {
    //   await supabase.from('historial_solicitudes').insert({
    //     solicitud_id: id,
    //     estado_anterior: currentEstado,
    //     estado_nuevo: estado,
    //     admin_id: session.user.id,
    //     notas: observaciones
    //   })
    // }

    // TODO: Enviar notificación al usuario
    // if (estado === 'entrevista' && fecha_entrevista) {
    //   await sendInterviewNotification(userEmail, fecha_entrevista)
    // }

    return NextResponse.json({ 
      success: true, 
      message: "Solicitud actualizada correctamente",
      data: { id, estado, fecha_entrevista }
    })
  } catch (error) {
    console.error("[v0] Error updating solicitud:", error)
    return NextResponse.json({ error: "Error al actualizar solicitud" }, { status: 500 })
  }
}