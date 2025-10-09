import { AdminNav } from "@/components/admin/admin-nav"
import { SolicitudDetail } from "@/components/admin/solicitud-detail"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function SolicitudDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto max-w-5xl py-8 px-4">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/admin/solicitudes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al listado
          </Link>
        </Button>

        <SolicitudDetail solicitudId={id} />
      </main>
    </div>
  )
}
