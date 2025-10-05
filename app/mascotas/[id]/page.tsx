import { MascotaDetail } from "@/components/public/mascota-detail"
import { PublicNav } from "@/components/public/public-nav"

export default async function MascotaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="container mx-auto max-w-6xl py-8 px-4">
        <MascotaDetail mascotaId={id} />
      </main>
    </div>
  )
}
