import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET() {
  try {
    console.log('[DEBUG] Verificando estructura de tabla donacion...')
    
    // Verificar si la tabla existe y su estructura
    const { data: tableInfo, error: tableError } = await supabase
      .from('donacion')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('[DEBUG] Error accediendo a tabla donacion:', tableError)
      return NextResponse.json({
        error: 'Error accediendo a tabla donacion',
        details: tableError,
        suggestion: 'La tabla donacion podría no existir o tener problemas de permisos'
      }, { status: 500 })
    }
    
    // Intentar insertar un registro de prueba
    const testDonation = {
      amount: 10.00,
      donor_name: 'Test Debug',
      donor_email: 'debug@test.com',
      payment_method: 'test',
      frequency: 'one-time',
      status: 'pending',
      message: 'Test de debug',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('[DEBUG] Intentando insertar donación de prueba:', testDonation)
    
    const { data: insertData, error: insertError } = await supabase
      .from('donacion')
      .insert([testDonation])
      .select()
      .single()
    
    if (insertError) {
      console.error('[DEBUG] Error insertando donación de prueba:', insertError)
      return NextResponse.json({
        error: 'Error insertando en tabla donacion',
        details: insertError,
        tableExists: true,
        testData: testDonation
      }, { status: 500 })
    }
    
    // Limpiar el registro de prueba
    await supabase
      .from('donacion')
      .delete()
      .eq('id', insertData.id)
    
    console.log('[DEBUG] ✅ Tabla donacion funciona correctamente')
    
    return NextResponse.json({
      success: true,
      message: 'Tabla donacion funciona correctamente',
      tableExists: true,
      insertTest: 'OK',
      testId: insertData.id,
      structure: Object.keys(insertData)
    })
    
  } catch (error: any) {
    console.error('[DEBUG] Error general:', error)
    return NextResponse.json({
      error: 'Error general verificando base de datos',
      details: error.message
    }, { status: 500 })
  }
}