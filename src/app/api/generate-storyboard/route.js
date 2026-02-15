/**
 * API Route: /api/generate-storyboard
 * Generates scene-by-scene storyboard using Minimax LLM
 * Takes structured brief (from bem.ai) + creator style → returns storyboard JSON
 */

import { NextResponse } from 'next/server';
import { generateStoryboard } from '@/lib/minimax';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Extended timeout for LLM generation

/**
 * POST /api/generate-storyboard
 * Body: { structuredBrief: object, creatorStyle: object }
 * Returns: Array of scene objects
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { structuredBrief, creatorStyle } = body;

    // Validate inputs
    if (!structuredBrief) {
      return NextResponse.json(
        { error: 'Missing structuredBrief field' },
        { status: 400 }
      );
    }

    if (!structuredBrief.brandName || !structuredBrief.productName) {
      return NextResponse.json(
        { error: 'structuredBrief must include brandName and productName' },
        { status: 400 }
      );
    }

    // Use default creator style if not provided
    const style = creatorStyle || {
      contentFormat: 'talking head vlog',
      tone: 'casual and authentic',
      aestheticTags: ['modern', 'clean', 'relatable'],
      typicalDuration: '15-30 seconds',
    };

    // Generate storyboard using Minimax LLM
    console.log('🎬 Generating storyboard for:', structuredBrief.brandName);
    console.log('📋 Brief details:', {
      product: structuredBrief.productName,
      talkingPoints: structuredBrief.talkingPoints?.length || 0,
      duration: structuredBrief.duration,
    });

    const storyboard = await generateStoryboard(structuredBrief, style);

    console.log(`✅ Storyboard generated: ${storyboard.length} scenes`);

    // Calculate total duration
    const totalDuration = storyboard.reduce((sum, scene) => {
      const duration = parseInt(scene.duration) || 5;
      return sum + duration;
    }, 0);

    // Return storyboard with metadata
    return NextResponse.json({
      success: true,
      data: {
        storyboard: storyboard,
        metadata: {
          sceneCount: storyboard.length,
          totalDuration: `${totalDuration}s`,
          brandName: structuredBrief.brandName,
          productName: structuredBrief.productName,
          generatedAt: new Date().toISOString(),
        },
      },
      message: `Generated ${storyboard.length} scenes`,
    });
  } catch (error) {
    console.error('❌ Error generating storyboard:', error);

    // Return appropriate error response
    const statusCode = error.message.includes('credentials') ? 401 :
                       error.message.includes('rate limit') ? 429 :
                       error.message.includes('connect') ? 503 :
                       error.message.includes('invalid JSON') ? 422 :
                       500;

    return NextResponse.json(
      {
        error: error.message || 'Failed to generate storyboard',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/generate-storyboard
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/generate-storyboard',
    status: 'ready',
    method: 'POST',
    description: 'Generates scene-by-scene storyboard using Minimax LLM',
    requiredFields: ['structuredBrief'],
    optionalFields: ['creatorStyle'],
    example: {
      structuredBrief: {
        brandName: 'Nike',
        productName: 'Air Max 2024',
        talkingPoints: ['New cushioning technology', 'Sustainable materials'],
        hashtags: ['#Nike', '#AirMax2024'],
        duration: '15-30 seconds',
      },
      creatorStyle: {
        contentFormat: 'talking head vlog',
        tone: 'energetic and enthusiastic',
        aestheticTags: ['urban', 'athletic'],
      },
    },
  });
}
