import { AdminNav } from "@/components/admin/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole="administrador">
      <div className="min-h-screen bg-background">
        <AdminNav />

        <main className="container mx-auto max-w-7xl py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
            <p className="text-muted-foreground mt-1">Gestión del catálogo de mascotas</p>
          </div>

          <div className="grid gap-6 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Mascotas</CardTitle>
                <CardDescription>Administra el catálogo de mascotas disponibles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <a
                    href="/admin/mascotas/nueva"
                    className="block p-3 rounded-lg border hover:bg-accent/10 transition-colors"
                  >
                    <p className="font-medium">Registrar Nueva Mascota</p>
                    <p className="text-xs text-muted-foreground">Agregar al catálogo</p>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
