import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function POST(request: Request) {
  try {
    console.log('Testing direct file upload...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Test direct upload to admin bucket
    const fileName = `test-${Date.now()}-${file.name}`
    const filePath = `Mascotas/${fileName}`

    console.log('Attempting upload to path:', filePath)

    const { data, error } = await supabase.storage
      .from('admin')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ 
        error: 'Upload failed', 
        details: error 
      }, { status: 500 })
    }

    console.log('Upload successful:', data)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('admin')
      .getPublicUrl(filePath)

    console.log('Public URL:', publicUrl)

    return NextResponse.json({ 
      success: true, 
      data,
      publicUrl,
      message: 'File uploaded successfully' 
    })
  } catch (error) {
    console.error('Test upload failed:', error)
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}