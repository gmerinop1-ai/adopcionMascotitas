import { AdoptionForm } from "@/components/adoption/adoption-form"
import { PublicNav } from "@/components/public/public-nav"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function PostularPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="container mx-auto max-w-3xl py-8 px-4">
        <Button asChild variant="ghost" className="mb-6">
          <Link href={`/mascotas/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la mascota
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Solicitud de Adopción</h1>
          <p className="text-muted-foreground">
            Completa el formulario para iniciar tu proceso de adopción. Revisaremos tu solicitud y nos pondremos en
            contacto contigo pronto.
          </p>
        </div>

        <AdoptionForm mascotaId={id} />
      </main>
    </div>
  )
}
