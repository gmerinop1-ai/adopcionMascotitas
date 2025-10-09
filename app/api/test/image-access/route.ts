import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json()
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 })
    }

    console.log('Testing image accessibility:', imageUrl)

    // Try to fetch the image
    const response = await fetch(imageUrl, {
      method: 'HEAD', // Just check headers, don't download the image
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)'
      }
    })

    const result = {
      url: imageUrl,
      accessible: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      headers: Object.fromEntries(response.headers.entries())
    }

    console.log('Image accessibility test result:', result)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Image accessibility test failed:', error)
    return NextResponse.json({
      error: 'Failed to test image accessibility',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}