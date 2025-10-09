import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const { correo } = await request.json();

    if (!correo) {
      return NextResponse.json({ error: "El correo es obligatorio" }, { status: 400 });
    }

    // Usar Supabase para enviar el correo de recuperación
    const { data, error } = await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/restablecer-password`
    });

    console.log('Respuesta de Supabase:', { data, error }); // Para depuración

    if (error) {
      console.error('Error al enviar correo de recuperación:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      message: "Se ha enviado un correo con instrucciones para restablecer tu contraseña."
    }, { status: 200 });
        success: true, 
        message: "Si la cuenta existe, recibirás un correo con el enlace de recuperación." 
    }, { status: 200 });
  } catch (error) {
    console.error("[v0] Recovery password error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}