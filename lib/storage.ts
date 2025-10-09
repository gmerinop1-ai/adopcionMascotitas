// Storage configuration and utilities for Supabase
import { supabase } from './db'

// Storage bucket configuration
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'admin',
  PETS_FOLDER: 'Mascotas',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png'],
}

// Helper function to ensure bucket exists and has proper policies
export async function ensureStorageSetup() {
  try {
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      return false
    }

    const adminBucket = buckets?.find(bucket => bucket.name === STORAGE_CONFIG.BUCKET_NAME)
    
    if (!adminBucket) {
      console.warn(`Bucket '${STORAGE_CONFIG.BUCKET_NAME}' not found. Please create it in Supabase dashboard.`)
      console.log('Required bucket configuration:')
      console.log('- Bucket name: admin')
      console.log('- Public: true')
      console.log('- File size limit: 5MB')
      console.log('- Allowed MIME types: image/jpeg, image/png')
      return false
    }

    console.log('Storage bucket configuration verified')
    return true
  } catch (error) {
    console.error('Error checking storage setup:', error)
    return false
  }
}

// Helper function to validate file before upload
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size exceeds ${STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB limit` 
    }
  }

  if (!STORAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Only JPEG and PNG files are allowed' 
    }
  }

  return { valid: true }
}

// Helper function to generate unique file names
export function generateFileName(originalName: string, petId?: string): string {
  const extension = originalName.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  const prefix = petId || 'pet'
  return `${prefix}-${timestamp}.${extension}`
}

// Helper function to get full storage path
export function getStoragePath(fileName: string): string {
  return `${STORAGE_CONFIG.PETS_FOLDER}/${fileName}`
}

// Helper function to get public URL for a file
export function getPublicImageUrl(path: string | null | undefined): string | null {
  if (!path) {
    console.log('getPublicImageUrl: No path provided')
    return null
  }
  
  // If it's already a full URL, return as is
  if (path.startsWith('http')) {
    console.log('getPublicImageUrl: Already full URL:', path)
    return path
  }
  
  try {
    // If it's a storage path, get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .getPublicUrl(path)
    
    console.log('getPublicImageUrl: Generated public URL for path:', path, '-> URL:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error('getPublicImageUrl: Error generating URL for path:', path, error)
    return null
  }
}

// Helper function to transform mascota data for frontend consumption
export function transformMascotaForDisplay(mascota: any) {
  const transformedData = {
    ...mascota,
    foto_url: getPublicImageUrl(mascota.url_foto)
  }
  
  console.log('transformMascotaForDisplay:', {
    id: mascota.id,
    nombre: mascota.nombre,
    originalUrl: mascota.url_foto,
    transformedUrl: transformedData.foto_url
  })
  
  return transformedData
}