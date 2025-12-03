import { AdminNav } from "@/components/admin/admin-nav"
import { DonationsTable } from "@/components/admin/donations-table"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AdminDonacionesPage() {
  return (
    <ProtectedRoute requiredRole="administrador">
      <div className="min-h-screen bg-background">
        <AdminNav />

        <main className="container mx-auto max-w-7xl py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Gestión de Donaciones</h1>
            <p className="text-muted-foreground mt-1">Administra y supervisa todas las donaciones recibidas</p>
          </div>

          <DonationsTable />
        </main>
      </div>
    </ProtectedRoute>
  )
}