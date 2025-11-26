import { AdminNav } from "@/components/admin/admin-nav"
import { SolicitudDetail } from "@/components/admin/solicitud-detail"
import { ArrowLeft, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function SolicitudDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto max-w-6xl py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <Button asChild variant="ghost">
            <Link href="/admin/solicitudes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al listado
            </Link>
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            Vista Completa de Solicitud
          </div>
        </div>

        <SolicitudDetail solicitudId={id} />
      </main>
    </div>
  )
}
