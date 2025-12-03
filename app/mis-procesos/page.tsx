"use client"

import { useState } from "react"
import { PublicNav } from "@/components/public/public-nav"
import { MisProcesos } from "@/components/adoption/mis-procesos"
import { MisAportes } from "@/components/adoption/mis-aportes"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Heart } from "lucide-react"

export default function MisProcesosPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <PublicNav />

        <main className="container mx-auto max-w-6xl py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mi Cuenta</h1>
            <p className="text-muted-foreground">Gestiona tus solicitudes de adopción y revisa tu historial de aportes</p>
          </div>

          <Tabs defaultValue="adopciones" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="adopciones" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Procesos de Adopción
              </TabsTrigger>
              <TabsTrigger value="aportes" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Mis Aportes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="adopciones">
              <MisProcesos />
            </TabsContent>
            
            <TabsContent value="aportes">
              <MisAportes />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}
