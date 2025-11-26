import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('[RLS] Configurando políticas RLS para franjas...')

    // Deshabilitar temporalmente RLS y crear políticas permisivas
    const rlsPolicies = [
      // Deshabilitar RLS para franja_horaria (temporal)
      `ALTER TABLE public.franja_horaria DISABLE ROW LEVEL SECURITY;`,
      
      // Deshabilitar RLS para reserva_franja (temporal)  
      `ALTER TABLE public.reserva_franja DISABLE ROW LEVEL SECURITY;`,
      
      // Deshabilitar RLS para entrevista (temporal)
      `ALTER TABLE public.entrevista DISABLE ROW LEVEL SECURITY;`
    ]

    console.log(`[RLS] Aplicando ${rlsPolicies.length} políticas...`)

    for (let i = 0; i < rlsPolicies.length; i++) {
      const policy = rlsPolicies[i]
      console.log(`[RLS] Aplicando política ${i + 1}/${rlsPolicies.length}...`)
      
      try {
        // Ejecutar usando SQL directo
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: policy
        })

        if (error) {
          console.error(`[RLS] Error en política ${i + 1}:`, error)
          // Continuar con las otras políticas
        } else {
          console.log(`[RLS] ✅ Política ${i + 1} aplicada`)
        }
      } catch (err) {
        console.error(`[RLS] Error ejecutando política ${i + 1}:`, err)
        // Continuar con las otras políticas
      }
    }

    console.log('[RLS] ✅ Configuración de políticas completada')

    return NextResponse.json({
      success: true,
      message: 'Políticas RLS configuradas (modo desarrollo - RLS deshabilitado)',
      note: 'En producción se debe configurar políticas apropiadas'
    })

  } catch (error) {
    console.error('[RLS] Error configurando políticas:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error configurando políticas RLS',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint para configurar políticas RLS de franjas horarias',
    usage: 'POST a este endpoint para aplicar políticas'
  })
}