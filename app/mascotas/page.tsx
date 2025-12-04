import { MascotasCatalog } from "@/components/public/mascotas-catalog"
import { PublicNav } from "@/components/public/public-nav"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function MascotasPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <PublicNav />

        <main className="container mx-auto max-w-7xl py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mascotas en Adopción</h1>
            <p className="text-muted-foreground">Encuentra a tu compañero perfecto entre nuestras mascotas disponibles</p>
          </div>

          <MascotasCatalog />
        </main>
      </div>
    </ProtectedRoute>
  )
}
