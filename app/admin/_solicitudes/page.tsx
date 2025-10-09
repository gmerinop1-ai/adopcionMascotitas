import { AdminNav } from "@/components/admin/admin-nav"
import { SolicitudesTable } from "@/components/admin/solicitudes-table"

export default function AdminSolicitudesPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto max-w-7xl py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Solicitudes de Adopción</h1>
          <p className="text-muted-foreground mt-1">Gestiona y da seguimiento a las solicitudes de adopción</p>
        </div>

        <SolicitudesTable />
      </main>
    </div>
  )
}
