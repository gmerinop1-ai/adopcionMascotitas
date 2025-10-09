import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET() {
  try {
    console.log('=== IMAGE DIAGNOSTIC ===')
    
    // 1. Check Supabase connection
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Buckets error:', bucketsError)
      return NextResponse.json({
        success: false,
        error: 'Cannot connect to Supabase',
        details: bucketsError
      })
    }

    console.log('Available buckets:', buckets?.map(b => ({ name: b.name, public: b.public })))

    // 2. Check admin bucket
    const adminBucket = buckets?.find(b => b.name === 'admin')
    
    if (!adminBucket) {
      return NextResponse.json({
        success: false,
        error: 'Admin bucket not found',
        availableBuckets: buckets?.map(b => b.name)
      })
    }

    // 3. List files in Mascotas folder
    const { data: files, error: listError } = await supabase.storage
      .from('admin')
      .list('Mascotas', { limit: 10 })

    if (listError) {
      console.error('Cannot list files in Mascotas folder:', listError)
      return NextResponse.json({
        success: false,
        error: 'Cannot list files in Mascotas folder',
        details: listError
      })
    }

    console.log('Files in Mascotas folder:', files?.map(f => ({ name: f.name, size: f.metadata?.size })))

    // 4. Test public URL generation for each file
    const urlTests = files?.map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from('admin')
        .getPublicUrl(`Mascotas/${file.name}`)
      
      return {
        fileName: file.name,
        publicUrl,
        size: file.metadata?.size || 0
      }
    }) || []

    // 5. Get mascotas from database
    const { data: mascotasDB, error: dbError } = await supabase
      .from('mascota')
      .select('id, nombre, url_foto')
      .limit(5)

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Cannot read from database',
        details: dbError
      })
    }

    console.log('Mascotas in database:', mascotasDB?.map(m => ({ 
      id: m.id, 
      nombre: m.nombre, 
      url_foto: m.url_foto 
    })))

    return NextResponse.json({
      success: true,
      diagnostics: {
        bucketsFound: buckets?.length || 0,
        adminBucketExists: !!adminBucket,
        adminBucketPublic: adminBucket?.public,
        filesInMascotasFolder: files?.length || 0,
        urlTests,
        mascotasInDB: mascotasDB?.length || 0,
        mascotasWithPhotos: mascotasDB?.filter(m => m.url_foto)?.length || 0,
        mascotasData: mascotasDB?.map(m => ({
          id: m.id,
          nombre: m.nombre,
          url_foto: m.url_foto,
          publicUrl: m.url_foto ? supabase.storage.from('admin').getPublicUrl(m.url_foto).data.publicUrl : null
        }))
      }
    })

  } catch (error) {
    console.error('Diagnostic failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Diagnostic failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}