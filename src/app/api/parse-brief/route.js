/**
 * API Route: /api/parse-brief
 * Parses brand brief text or JSON into structured format
 * Accepts either raw text (pattern matching) or pre-structured JSON
 */

import { NextResponse } from 'next/server';
import { parseBrief } from '@/lib/bem';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/parse-brief
 * Body: { briefText: string }
 * Returns: Structured brand brief object
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { briefText } = body;

    // Validate input
    if (!briefText || typeof briefText !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid briefText field' },
        { status: 400 }
      );
    }

    if (briefText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Brief text cannot be empty' },
        { status: 400 }
      );
    }

    // Parse the brief using pattern matching
    console.log('📄 Parsing brand brief...');
    const structuredBrief = await parseBrief(briefText);

    console.log('✅ Brief parsed successfully:', structuredBrief.brandName);

    // Return structured data
    return NextResponse.json({
      success: true,
      data: structuredBrief,
      message: 'Brief parsed successfully',
    });
  } catch (error) {
    console.error('❌ Error parsing brief:', error);

    // Return appropriate error response
    const statusCode = error.message.includes('Could not find') ? 400 :
                       500;

    return NextResponse.json(
      {
        error: error.message || 'Failed to parse brief',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/parse-brief
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/parse-brief',
    status: 'ready',
    method: 'POST',
    description: 'Parses brand briefs into structured JSON using pattern matching (no external API)',
    requiredFields: ['briefText'],
    example: {
      briefText: 'Brand: Nike\nProduct: Air Max 2024\nTalking points: New cushioning, sustainable materials\nHashtags: #Nike #AirMax2024',
    },
  });
}
