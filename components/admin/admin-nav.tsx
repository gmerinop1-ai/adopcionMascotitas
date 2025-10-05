import Link from "next/link"
import { PawPrint, LayoutDashboard, PlusCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AdminNav() {
  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-2 text-xl font-bold text-primary">
              <PawPrint className="h-6 w-6" />
              <span>Admin Panel</span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/mascotas">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Mascotas
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/solicitudes">
                  <FileText className="mr-2 h-4 w-4" />
                  Solicitudes
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/mascotas">Ver Sitio Público</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
