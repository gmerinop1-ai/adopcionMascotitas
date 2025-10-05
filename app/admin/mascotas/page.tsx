import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { AdminNav } from "@/components/admin/admin-nav"
import { MascotasTable } from "@/components/admin/mascotas-table"

export default function AdminMascotasPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto max-w-7xl py-8 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Mascotas</h1>
            <p className="text-muted-foreground mt-1">Administra el catálogo de mascotas disponibles para adopción</p>
          </div>
          <Button asChild>
            <Link href="/admin/mascotas/nueva">
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar Mascota
            </Link>
          </Button>
        </div>

        <MascotasTable />
      </main>
    </div>
  )
}
