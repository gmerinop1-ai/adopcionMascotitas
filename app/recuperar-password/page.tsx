import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PawPrint, ArrowLeft } from "lucide-react"

export default function RecuperarPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-secondary/20 to-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary mb-2">
            <PawPrint className="h-8 w-8" />
            <span>Adopta una Mascota</span>
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Recuperar Contraseña</h1>
          <p className="text-muted-foreground">Te enviaremos un enlace para restablecer tu contraseña</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ingresa tu correo</CardTitle>
            <CardDescription>Recibirás instrucciones para recuperar tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input id="correo" type="email" placeholder="tu@email.com" />
              </div>

              <Button type="submit" className="w-full">
                Enviar Enlace de Recuperación
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
