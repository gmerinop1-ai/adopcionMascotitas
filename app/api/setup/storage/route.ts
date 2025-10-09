import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET() {
  try {
    console.log('Testing storage configuration...')
    
    // Test 1: Check if we can connect to Supabase
    console.log('Testing Supabase connection...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Failed to connect to Supabase:', bucketsError)
      return NextResponse.json({ 
        status: 'error', 
        message: 'Cannot connect to Supabase',
        error: bucketsError.message 
      }, { status: 500 })
    }

    console.log('Available buckets:', buckets?.map(b => b.name))

    // Test 2: Check if admin bucket exists
    const adminBucket = buckets?.find(bucket => bucket.name === 'admin')
    
    if (!adminBucket) {
      console.error('Admin bucket not found')
      return NextResponse.json({ 
        status: 'error', 
        message: 'Bucket "admin" not found. Please create it in Supabase dashboard.',
        availableBuckets: buckets?.map(b => b.name) || []
      }, { status: 404 })
    }

    console.log('Admin bucket found:', adminBucket)

    // Test 3: Try to list files in the bucket
    console.log('Testing bucket access...')
    const { data: files, error: listError } = await supabase.storage
      .from('admin')
      .list('', { limit: 1 })

    if (listError) {
      console.error('Cannot access admin bucket:', listError)
      return NextResponse.json({ 
        status: 'error', 
        message: 'Cannot access admin bucket',
        error: listError.message
      }, { status: 500 })
    }

    console.log('Bucket access successful, files:', files?.length || 0)

    // Test 4: Check Mascotas folder
    const { data: mascotasFolder, error: folderError } = await supabase.storage
      .from('admin')
      .list('Mascotas', { limit: 1 })

    if (folderError) {
      console.log('Mascotas folder might not exist yet, this is normal for new setups')
    } else {
      console.log('Mascotas folder found with', mascotasFolder?.length || 0, 'files')
    }

    // Test 5: Try to create a test file (we'll delete it immediately)
    console.log('Testing upload capability...')
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('admin')
      .upload('test-upload.txt', testFile, { upsert: true })

    if (uploadError) {
      console.error('Upload test failed:', uploadError)
      return NextResponse.json({ 
        status: 'error', 
        message: 'Cannot upload to bucket - check permissions',
        error: uploadError.message
      }, { status: 500 })
    }

    // Clean up test file
    await supabase.storage.from('admin').remove(['test-upload.txt'])
    console.log('Upload test successful, test file cleaned up')

    return NextResponse.json({ 
      status: 'success', 
      message: 'Storage configuration is correct',
      details: {
        bucketsFound: buckets?.length || 0,
        adminBucketExists: true,
        canAccessBucket: true,
        canUpload: true,
        mascotasFolderExists: !folderError
      }
    })
  } catch (error) {
    console.error('Storage setup check failed:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to check storage setup',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}