import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        details: 'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'
      }, { status: 400 })
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    console.log('Creating storage policies for public access...')

    // Create RLS policies for the admin bucket
    const policies = [
      {
        name: 'Public read access for admin bucket',
        sql: `
          CREATE POLICY "Public read access for admin bucket" ON storage.objects
          FOR SELECT USING (bucket_id = 'admin');
        `
      },
      {
        name: 'Authenticated upload for admin bucket',
        sql: `
          CREATE POLICY "Authenticated upload for admin bucket" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'admin' AND auth.role() = 'authenticated');
        `
      },
      {
        name: 'Authenticated update for admin bucket',
        sql: `
          CREATE POLICY "Authenticated update for admin bucket" ON storage.objects
          FOR UPDATE USING (bucket_id = 'admin' AND auth.role() = 'authenticated');
        `
      },
      {
        name: 'Authenticated delete for admin bucket',
        sql: `
          CREATE POLICY "Authenticated delete for admin bucket" ON storage.objects
          FOR DELETE USING (bucket_id = 'admin' AND auth.role() = 'authenticated');
        `
      }
    ]

    const results = []

    for (const policy of policies) {
      try {
        console.log(`Creating policy: ${policy.name}`)
        const { data, error } = await supabaseAdmin.rpc('exec_sql', { 
          query: policy.sql 
        })
        
        if (error) {
          console.error(`Error creating policy ${policy.name}:`, error)
          results.push({
            policy: policy.name,
            success: false,
            error: error.message
          })
        } else {
          console.log(`Policy created successfully: ${policy.name}`)
          results.push({
            policy: policy.name,
            success: true
          })
        }
      } catch (err) {
        console.error(`Exception creating policy ${policy.name}:`, err)
        results.push({
          policy: policy.name,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    // Try alternative approach using direct SQL execution
    const directSQL = `
      -- Enable RLS on storage.objects
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      
      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Public read access for admin bucket" ON storage.objects;
      DROP POLICY IF EXISTS "Authenticated upload for admin bucket" ON storage.objects;
      DROP POLICY IF EXISTS "Authenticated update for admin bucket" ON storage.objects;
      DROP POLICY IF EXISTS "Authenticated delete for admin bucket" ON storage.objects;
      
      -- Create new policies
      CREATE POLICY "Public read access for admin bucket" ON storage.objects
        FOR SELECT USING (bucket_id = 'admin');
        
      CREATE POLICY "Authenticated upload for admin bucket" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'admin');
        
      CREATE POLICY "Authenticated update for admin bucket" ON storage.objects
        FOR UPDATE USING (bucket_id = 'admin');
        
      CREATE POLICY "Authenticated delete for admin bucket" ON storage.objects
        FOR DELETE USING (bucket_id = 'admin');
    `

    console.log('Attempting direct SQL execution...')
    const { data: sqlResult, error: sqlError } = await supabaseAdmin.rpc('exec_sql', {
      query: directSQL
    })

    if (sqlError) {
      console.error('Direct SQL execution failed:', sqlError)
    } else {
      console.log('Direct SQL execution successful')
    }

    return NextResponse.json({
      success: true,
      message: 'Storage policies configuration attempted',
      results,
      directSQL: {
        success: !sqlError,
        error: sqlError?.message
      },
      instructions: {
        manual: 'If automatic setup failed, please configure policies manually in Supabase Dashboard:',
        steps: [
          '1. Go to Supabase Dashboard → Storage → admin bucket',
          '2. Click on Configuration → Policies',
          '3. Create a SELECT policy with condition: bucket_id = \'admin\'',
          '4. Set it to apply to "public" role',
          '5. Create INSERT/UPDATE/DELETE policies for authenticated users'
        ]
      }
    })

  } catch (error) {
    console.error('Storage policies setup failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to configure storage policies',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}