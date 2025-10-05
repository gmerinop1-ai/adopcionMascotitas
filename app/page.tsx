import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, PawPrint, Users, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-secondary/30 to-background py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <PawPrint className="h-4 w-4" />
            <span>Plataforma de Adopción Responsable</span>
          </div>

          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Encuentra tu compañero perfecto
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
            Miles de mascotas esperan por un hogar lleno de amor. Adopta, no compres. Cambia una vida y transforma la
            tuya.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/mascotas">
                <Heart className="mr-2 h-5 w-5" />
                Ver Mascotas Disponibles
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base bg-transparent">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">¿Por qué adoptar con nosotros?</h2>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Adopción Responsable</h3>
                <p className="text-muted-foreground">
                  Proceso de adopción cuidadoso que asegura el bienestar de las mascotas y la compatibilidad con las
                  familias.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Mascotas Verificadas</h3>
                <p className="text-muted-foreground">
                  Todas nuestras mascotas cuentan con historial médico completo, vacunas al día y esterilización.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/50">
                  <Users className="h-6 w-6 text-secondary-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Seguimiento Continuo</h3>
                <p className="text-muted-foreground">
                  Te acompañamos durante todo el proceso y después de la adopción para asegurar una transición exitosa.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">¿Listo para adoptar?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Regístrate hoy y comienza el proceso de adopción. Es rápido, fácil y gratuito.
          </p>
          <Button asChild size="lg">
            <Link href="/registro">Crear Cuenta Gratis</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
