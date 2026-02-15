/**
 * API Route: /api/generate-preview
 * Generates visual preview (image or video) for a single storyboard scene
 * Uses Minimax Image/Video API
 */

import { NextResponse } from 'next/server';
import { generateSceneImage, generateSceneVideo } from '@/lib/minimax';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Extended timeout for media generation

/**
 * POST /api/generate-preview
 * Body: { sceneDescription: string, duration?: string, type?: 'image'|'video' }
 * Returns: { url: string, type: 'image'|'video' }
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { sceneDescription, duration, type, options } = body;

    // Validate input
    if (!sceneDescription || typeof sceneDescription !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid sceneDescription field' },
        { status: 400 }
      );
    }

    if (sceneDescription.trim().length === 0) {
      return NextResponse.json(
        { error: 'Scene description cannot be empty' },
        { status: 400 }
      );
    }

    // Determine preview type (default to image for faster generation)
    const previewType = type || 'image';

    // Parse duration (e.g., "5s" → 5)
    const durationSeconds = duration
      ? parseInt(duration.replace(/[^0-9]/g, '')) || 5
      : 5;

    console.log(`🎨 Generating ${previewType} preview for scene...`);

    let previewUrl;
    let actualType = previewType;

    // Generate preview based on type
    if (previewType === 'video') {
      try {
        previewUrl = await generateSceneVideo(sceneDescription, durationSeconds);

        // If video generation returned an image URL (fallback), update type
        if (previewUrl && previewUrl.includes('placeholder')) {
          actualType = 'image';
        }
      } catch (error) {
        console.warn('Video generation failed, falling back to image:', error.message);
        previewUrl = await generateSceneImage(sceneDescription, options);
        actualType = 'image';
      }
    } else {
      previewUrl = await generateSceneImage(sceneDescription, options);
    }

    console.log(`✅ Preview generated: ${actualType}`);

    // Return preview URL
    return NextResponse.json({
      success: true,
      data: {
        url: previewUrl,
        type: actualType,
        sceneDescription: sceneDescription.substring(0, 100),
        duration: `${durationSeconds}s`,
        generatedAt: new Date().toISOString(),
      },
      message: `${actualType} preview generated successfully`,
    });
  } catch (error) {
    console.error('❌ Error generating preview:', error);

    // Return appropriate error response
    const statusCode = error.message.includes('credentials') ? 401 :
                       error.message.includes('rate limit') ? 429 :
                       error.message.includes('connect') ? 503 :
                       500;

    return NextResponse.json(
      {
        error: error.message || 'Failed to generate preview',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/generate-preview
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/generate-preview',
    status: 'ready',
    method: 'POST',
    description: 'Generates visual preview (image or video) for a storyboard scene',
    requiredFields: ['sceneDescription'],
    optionalFields: ['duration', 'type', 'options'],
    example: {
      sceneDescription: 'Close-up shot of creator holding Nike Air Max shoes with city skyline in background, golden hour lighting',
      duration: '5s',
      type: 'image', // or 'video'
      options: {
        aspectRatio: '9:16',
        style: 'realistic',
      },
    },
  });
}
