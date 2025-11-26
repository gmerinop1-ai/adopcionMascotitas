import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('[TEST] Probando inserción directa en franja_horaria...')
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const fechaStr = tomorrow.toISOString().split('T')[0]
    
    const testData = {
      fecha: fechaStr,
      hora_inicio: '10:00',
      duracion_minutos: 60,
      cupo_maximo: 2,
      cupo_disponible: 2,
      estado: 'borrador'
    }

    console.log('[TEST] Datos de prueba:', testData)

    const { data, error } = await supabase
      .from('franja_horaria')
      .insert([testData])
      .select()
      .single()

    if (error) {
      console.error('[TEST] Error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 400 })
    }

    console.log('[TEST] ✅ Inserción exitosa:', data)

    return NextResponse.json({
      success: true,
      message: 'Franja de prueba creada exitosamente',
      data
    })

  } catch (error) {
    console.error('[TEST] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    console.log('[TEST] Probando lectura de franjas...')

    const { data, error } = await supabase
      .from('franja_horaria')
      .select('*')
      .limit(5)

    if (error) {
      console.error('[TEST] Error leyendo:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 400 })
    }

    console.log('[TEST] ✅ Lectura exitosa:', data?.length || 0, 'franjas')

    return NextResponse.json({
      success: true,
      message: 'Franjas obtenidas exitosamente',
      count: data?.length || 0,
      data
    })

  } catch (error) {
    console.error('[TEST] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}