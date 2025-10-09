"use client"

import Link from "next/link"
import { PawPrint, Heart, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function PublicNav() {
  const pathname = usePathname()
  const { user, logout, isLoading, isHydrated } = useAuth()

  // Prevent hydration mismatch by not rendering user-dependent content until hydrated
  const shouldShowUserContent = isHydrated && !isLoading

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
              <PawPrint className="h-6 w-6" />
              <span>Catálogo de Mascotas</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {!shouldShowUserContent ? (
              // Show skeleton/placeholder during loading and hydration
              <div className="flex items-center gap-2">
                <div className="h-9 w-32 bg-muted animate-pulse rounded-md"></div>
                <div className="h-9 w-24 bg-muted animate-pulse rounded-md"></div>
              </div>
            ) : user ? (
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
