/**
 * API Route: /api/export
 * Exports storyboard for brand approval
 * Formats the complete storyboard as a shareable document
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/export
 * Body: { storyboard: Scene[], brandInfo: object, creatorInfo: object }
 * Returns: Formatted HTML or JSON summary
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { storyboard, brandInfo, creatorInfo, format } = body;

    // Validate inputs
    if (!storyboard || !Array.isArray(storyboard)) {
      return NextResponse.json(
        { error: 'Missing or invalid storyboard array' },
        { status: 400 }
      );
    }

    if (storyboard.length === 0) {
      return NextResponse.json(
        { error: 'Storyboard cannot be empty' },
        { status: 400 }
      );
    }

    // Extract brand and creator info
    const brand = brandInfo || { brandName: 'Brand', productName: 'Product' };
    const creator = creatorInfo || { name: 'Creator', handle: '@creator' };

    console.log('📤 Exporting storyboard for:', brand.brandName);

    // Determine export format
    const exportFormat = format || 'html';

    let exportData;

    if (exportFormat === 'html') {
      exportData = generateHTMLExport(storyboard, brand, creator);
    } else if (exportFormat === 'json') {
      exportData = generateJSONExport(storyboard, brand, creator);
    } else {
      return NextResponse.json(
        { error: 'Invalid format. Use "html" or "json"' },
        { status: 400 }
      );
    }

    console.log('✅ Storyboard exported successfully');

    // Return export data
    return NextResponse.json({
      success: true,
      data: exportData,
      format: exportFormat,
      message: 'Storyboard exported successfully',
    });
  } catch (error) {
    console.error('❌ Error exporting storyboard:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to export storyboard',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Generate HTML export for brand approval
 */
function generateHTMLExport(storyboard, brandInfo, creatorInfo) {
  // Calculate metrics
  const totalDuration = storyboard.reduce((sum, scene) => {
    const duration = parseInt(scene.duration) || 5;
    return sum + duration;
  }, 0);

  // Build requirements checklist
  const allTalkingPoints = brandInfo.talkingPoints || [];
  const allHashtags = brandInfo.hashtags || [];

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Storyboard - ${brandInfo.brandName} x ${creatorInfo.name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
      background: #f9fafb;
      color: #1f2937;
    }
    .header {
      background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .header h1 { margin: 0 0 10px 0; font-size: 28px; }
    .header p { margin: 5px 0; opacity: 0.95; }
    .metadata {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }
    .metadata-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .metadata-card h3 { margin: 0 0 5px 0; font-size: 14px; color: #6b7280; }
    .metadata-card p { margin: 0; font-size: 20px; font-weight: 600; }
    .scene {
      background: white;
      padding: 25px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-left: 4px solid #0ea5e9;
    }
    .scene-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .scene-number {
      font-size: 18px;
      font-weight: 700;
      color: #0ea5e9;
    }
    .scene-duration {
      background: #e0f2fe;
      color: #0369a1;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }
    .scene-section {
      margin-bottom: 15px;
    }
    .scene-section h4 {
      margin: 0 0 8px 0;
      font-size: 13px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .scene-section p {
      margin: 0;
      line-height: 1.6;
    }
    .script {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 6px;
      font-style: italic;
    }
    .notes {
      color: #059669;
      font-size: 14px;
    }
    .checklist {
      background: white;
      padding: 25px;
      border-radius: 8px;
      margin-top: 30px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .checklist h2 { margin-top: 0; color: #0ea5e9; }
    .checklist ul { list-style: none; padding: 0; }
    .checklist li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .checklist li:last-child { border-bottom: none; }
    .check { color: #059669; margin-right: 8px; }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${brandInfo.brandName} x ${creatorInfo.name || creatorInfo.handle}</h1>
    <p><strong>Product:</strong> ${brandInfo.productName}</p>
    <p><strong>Creator:</strong> ${creatorInfo.handle || creatorInfo.name}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</p>
  </div>

  <div class="metadata">
    <div class="metadata-card">
      <h3>Total Scenes</h3>
      <p>${storyboard.length}</p>
    </div>
    <div class="metadata-card">
      <h3>Total Duration</h3>
      <p>${totalDuration}s</p>
    </div>
    <div class="metadata-card">
      <h3>Platform</h3>
      <p>${brandInfo.platformSpecs?.platform || 'Instagram'}</p>
    </div>
    <div class="metadata-card">
      <h3>Format</h3>
      <p>${brandInfo.platformSpecs?.format || 'Reel'}</p>
    </div>
  </div>

  <h2 style="margin: 30px 0 20px 0;">Storyboard Scenes</h2>

  ${storyboard.map(scene => `
    <div class="scene">
      <div class="scene-header">
        <div class="scene-number">Scene ${scene.scene}</div>
        <div class="scene-duration">${scene.duration}</div>
      </div>

      <div class="scene-section">
        <h4>Visual</h4>
        <p>${scene.visual}</p>
      </div>

      <div class="scene-section">
        <h4>Script</h4>
        <div class="script">${scene.script}</div>
      </div>

      ${scene.notes ? `
        <div class="scene-section">
          <h4>Brand Requirement</h4>
          <p class="notes">✓ ${scene.notes}</p>
        </div>
      ` : ''}
    </div>
  `).join('')}

  <div class="checklist">
    <h2>Brand Requirements Checklist</h2>
    <ul>
      ${allTalkingPoints.length > 0 ? `
        <li><span class="check">✓</span> <strong>Talking Points:</strong> ${allTalkingPoints.join(', ')}</li>
      ` : ''}
      ${allHashtags.length > 0 ? `
        <li><span class="check">✓</span> <strong>Hashtags:</strong> ${allHashtags.join(' ')}</li>
      ` : ''}
      <li><span class="check">✓</span> <strong>Duration:</strong> ${totalDuration}s (Target: ${brandInfo.duration || '15-30s'})</li>
      <li><span class="check">✓</span> <strong>Total Scenes:</strong> ${storyboard.length}</li>
    </ul>
  </div>

  <div class="footer">
    <p>Generated by <strong>AdMaxxer</strong> - AI-Powered Storyboard Creator</p>
    <p>Powered by bem.ai, Minimax, and Vercel</p>
  </div>
</body>
</html>
  `;

  return {
    html: html.trim(),
    title: `${brandInfo.brandName} x ${creatorInfo.name} - Storyboard`,
  };
}

/**
 * Generate JSON export
 */
function generateJSONExport(storyboard, brandInfo, creatorInfo) {
  const totalDuration = storyboard.reduce((sum, scene) => {
    const duration = parseInt(scene.duration) || 5;
    return sum + duration;
  }, 0);

  return {
    metadata: {
      brandName: brandInfo.brandName,
      productName: brandInfo.productName,
      creatorHandle: creatorInfo.handle || creatorInfo.name,
      sceneCount: storyboard.length,
      totalDuration: `${totalDuration}s`,
      platform: brandInfo.platformSpecs?.platform || 'Instagram',
      format: brandInfo.platformSpecs?.format || 'Reel',
      exportedAt: new Date().toISOString(),
    },
    storyboard: storyboard,
    requirements: {
      talkingPoints: brandInfo.talkingPoints || [],
      hashtags: brandInfo.hashtags || [],
      restrictions: brandInfo.restrictions || [],
    },
  };
}

/**
 * GET /api/export
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/export',
    status: 'ready',
    method: 'POST',
    description: 'Exports storyboard for brand approval',
    requiredFields: ['storyboard'],
    optionalFields: ['brandInfo', 'creatorInfo', 'format'],
    supportedFormats: ['html', 'json'],
  });
}
