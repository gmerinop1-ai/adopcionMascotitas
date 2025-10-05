"use client"

import Link from "next/link"
import { PawPrint, Heart, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function PublicNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
              <PawPrint className="h-6 w-6" />
              <span>Adopta una Mascota</span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant={pathname === "/mascotas" ? "default" : "ghost"} size="sm">
                <Link href="/mascotas">
                  <Heart className="mr-2 h-4 w-4" />
                  Adoptar
                </Link>
              </Button>
              <Button asChild variant={pathname === "/mis-procesos" ? "default" : "ghost"} size="sm">
                <Link href="/mis-procesos">Mis Procesos</Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  Hola, {user.nombres || user.correo}
                </span>
                {user.rol === "administrador" && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button onClick={logout} variant="ghost" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">
                    <User className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/registro">Registrarse</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
