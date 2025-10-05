import { PublicNav } from "@/components/public/public-nav"
import { MisProcesos } from "@/components/adoption/mis-procesos"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function MisProcesosPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <PublicNav />

        <main className="container mx-auto max-w-6xl py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mis Procesos de Adopción</h1>
            <p className="text-muted-foreground">Seguimiento del estado de tus solicitudes de adopción</p>
          </div>

          <MisProcesos />
        </main>
      </div>
    </ProtectedRoute>
  )
}
