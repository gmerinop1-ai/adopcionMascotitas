import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET() {
  try {
    console.log('=== TESTING SUPABASE CONNECTION ===')
    
    // Test 1: Basic connection
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

    // Test 2: Check admin bucket
    const adminBucket = buckets?.find(b => b.name === 'admin')
    
    if (!adminBucket) {
      return NextResponse.json({
        success: false,
        error: 'Admin bucket not found',
        buckets: buckets?.map(b => b.name)
      })
    }

    // Test 3: Check bucket access
    const { data: files, error: listError } = await supabase.storage
      .from('admin')
      .list('', { limit: 1 })

    if (listError) {
      console.error('List error:', listError)
      return NextResponse.json({
        success: false,
        error: 'Cannot access admin bucket',
        details: listError
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      buckets: buckets?.map(b => ({ name: b.name, public: b.public })),
      adminBucketExists: true,
      filesInAdmin: files?.length || 0
    })
  } catch (error) {
    console.error('Connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}