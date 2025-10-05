import { AdminNav } from "@/components/admin/admin-nav"
import { MascotaForm } from "@/components/admin/mascota-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function EditarMascotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto max-w-4xl py-8 px-4">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/admin/mascotas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al listado
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Editar Mascota</h1>
          <p className="text-muted-foreground mt-1">Actualiza la información de la mascota</p>
        </div>

        <MascotaForm mascotaId={id} />
      </main>
    </div>
  )
}
