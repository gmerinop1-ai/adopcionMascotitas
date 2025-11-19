// Simulación de base de datos en memoria para desarrollo
// En producción esto sería reemplazado por una base de datos real

interface MockSolicitud {
  id: string
  mascota_id: string
  mascota_nombre?: string
  mascota_foto?: string
  dni: string
  telefono: string
  distrito_ciudad: string
  razon: string
  condicion_hogar: string
  estado: 'pendiente' | 'entrevista' | 'aprobada' | 'rechazada' | 'cancelada'
  fecha_entrevista?: string
  postulante_nombre?: string
  postulante_correo?: string
  created_at: string
  updated_at: string
}

interface MockMascota {
  id: string
  nombre: string
  especie: string
  url_foto?: string
}

// Storage temporal en memoria
class MockDatabase {
  private solicitudes: MockSolicitud[] = [
    // Mock data limpiado - ahora todas las solicitudes vienen de la base de datos real
  ]

  private mascotas: MockMascota[] = [
    {
      id: "1",
      nombre: "Luna",
      especie: "Perro",
      url_foto: "/friendly-labrador-dog.jpg"
    },
    {
      id: "2", 
      nombre: "Max",
      especie: "Gato",
      url_foto: "/siamese-cat.png"
    },
    {
      id: "3",
      nombre: "Rocky",
      especie: "Perro", 
      url_foto: "/german-shepherd-dog.jpg"
    }
  ]

  // Métodos para solicitudes
  createSolicitud(data: Omit<MockSolicitud, 'id' | 'created_at' | 'updated_at' | 'estado'>): MockSolicitud {
    const mascota = this.mascotas.find(m => m.id === data.mascota_id)
    
    const solicitud: MockSolicitud = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      estado: 'pendiente',
      mascota_nombre: mascota?.nombre,
      mascota_foto: mascota?.url_foto,
      postulante_nombre: "Usuario Adoptante", // En un sistema real vendría de la sesión
      postulante_correo: "usuario@email.com", // En un sistema real vendría de la sesión
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    this.solicitudes.push(solicitud)
    console.log("[MOCK DB] Solicitud creada:", solicitud)
    console.log("[MOCK DB] Total solicitudes:", this.solicitudes.length)
    return solicitud
  }

  getSolicitudesByUser(userId?: string): MockSolicitud[] {
    // En un sistema real filtrarían por userId
    // Para el mock, devolvemos todas las solicitudes del "usuario actual"
    return this.solicitudes.filter(s => 
      s.postulante_correo === "usuario@email.com" || 
      s.postulante_nombre?.includes("Usuario")
    ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  getAllSolicitudes(): MockSolicitud[] {
    return [...this.solicitudes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  getSolicitudById(id: string): MockSolicitud | undefined {
    return this.solicitudes.find(s => s.id === id)
  }

  updateSolicitud(id: string, updates: Partial<MockSolicitud>): MockSolicitud | null {
    const index = this.solicitudes.findIndex(s => s.id === id)
    if (index === -1) return null

    this.solicitudes[index] = {
      ...this.solicitudes[index],
      ...updates,
      updated_at: new Date().toISOString()
    }

    return this.solicitudes[index]
  }

  // Métodos para mascotas
  getMascotaById(id: string): MockMascota | undefined {
    return this.mascotas.find(m => m.id === id)
  }

  // Métodos para entrevistas
  getEntrevistas(startDate?: string, endDate?: string): any[] {
    let entrevistas = this.solicitudes
      .filter(s => s.estado === 'entrevista' && s.fecha_entrevista)
      .map(s => ({
        id: s.id,
        solicitud_id: s.id,
        fecha_entrevista: s.fecha_entrevista!,
        estado: 'programada',
        mascota_nombre: s.mascota_nombre,
        postulante_nombre: s.postulante_nombre,
        postulante_telefono: s.telefono,
        observaciones: "Entrevista programada"
      }))

    if (startDate || endDate) {
      entrevistas = entrevistas.filter(e => {
        const fecha = new Date(e.fecha_entrevista)
        const start = startDate ? new Date(startDate) : null
        const end = endDate ? new Date(endDate) : null
        
        if (start && fecha < start) return false
        if (end && fecha > end) return false
        return true
      })
    }

    return entrevistas
  }
}

// Instancia singleton
export const mockDB = new MockDatabase()

// Tipos exportados
export type { MockSolicitud, MockMascota }