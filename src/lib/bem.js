/**
 * Simple Brief Parser for AdMaxxer
 * Parses brand briefs using pattern matching (no external API needed)
 * Accepts either raw text or pre-structured JSON
 */

/**
 * Parse brand brief text or JSON into structured format
 * @param {string|object} input - Raw brief text or pre-structured JSON
 * @returns {Promise<Object>} Structured brand brief object
 */
export async function parseBrief(input) {
  // If input is already a structured object, validate and return it
  if (typeof input === 'object' && input !== null) {
    return validateAndStructure(input);
  }

  // If input is a string, parse it
  if (typeof input !== 'string') {
    throw new Error('Brief must be a string or object');
  }

  const briefText = input.trim();

  if (briefText.length === 0) {
    throw new Error('Brief text cannot be empty');
  }

  // Try to parse as JSON first (in case frontend sends JSON string)
  try {
    const jsonData = JSON.parse(briefText);
    return validateAndStructure(jsonData);
  } catch (e) {
    // Not JSON, continue with text parsing
  }

  // Extract fields using simple pattern matching
  const extracted = {
    brandName: extractField(briefText, ['brand', 'company', 'sponsor']),
    productName: extractField(briefText, ['product', 'item', 'service']),
    campaignName: extractField(briefText, ['campaign', 'campaign name']),
    talkingPoints: extractList(briefText, ['talking points', 'mention', 'highlight', 'features', 'benefits', 'key messages']),
    hashtags: extractHashtags(briefText),
    restrictions: extractList(briefText, ['avoid', 'don\'t mention', 'do not', 'restrictions', 'limitations']),
    duration: extractField(briefText, ['duration', 'length', 'time']) || '15-30 seconds',
    callToAction: extractField(briefText, ['call to action', 'cta', 'link', 'visit']),
    brandGuidelines: extractField(briefText, ['guidelines', 'tone', 'voice', 'style']),
    deadline: extractField(briefText, ['deadline', 'due date', 'submit by']),
  };

  // Determine platform
  const platformSpecs = {
    platform: detectPlatform(briefText),
    format: detectFormat(briefText),
    aspectRatio: '9:16', // Default for social media
  };

  // Validate required fields
  if (!extracted.brandName) {
    throw new Error('Could not find brand name in brief. Please include "Brand: [name]" or provide structured data.');
  }

  if (!extracted.productName) {
    throw new Error('Could not find product name in brief. Please include "Product: [name]" or provide structured data.');
  }

  // Return structured brief
  return {
    brandName: extracted.brandName,
    productName: extracted.productName,
    campaignName: extracted.campaignName || null,
    talkingPoints: extracted.talkingPoints,
    hashtags: extracted.hashtags,
    restrictions: extracted.restrictions,
    duration: extracted.duration,
    platformSpecs: platformSpecs,
    callToAction: extracted.callToAction || null,
    brandGuidelines: extracted.brandGuidelines || null,
    deadline: extracted.deadline || null,
    compensation: null, // Can be added if needed
  };
}

/**
 * Validate and structure pre-formatted data
 */
function validateAndStructure(data) {
  if (!data.brandName || !data.productName) {
    throw new Error('Structured data must include brandName and productName');
  }

  return {
    brandName: data.brandName,
    productName: data.productName,
    campaignName: data.campaignName || null,
    talkingPoints: Array.isArray(data.talkingPoints) ? data.talkingPoints : [],
    hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
    restrictions: Array.isArray(data.restrictions) ? data.restrictions : [],
    duration: data.duration || '15-30 seconds',
    platformSpecs: data.platformSpecs || {
      platform: 'Instagram',
      format: 'Reel',
      aspectRatio: '9:16',
    },
    callToAction: data.callToAction || null,
    brandGuidelines: data.brandGuidelines || null,
    deadline: data.deadline || null,
    compensation: data.compensation || null,
  };
}

/**
 * Extract a single field value from text
 */
function extractField(text, keywords) {
  for (const keyword of keywords) {
    // Pattern: "Keyword: Value" or "Keyword - Value"
    const regex = new RegExp(`${keyword}\\s*[:\\-]\\s*([^\\n]+)`, 'i');
    const match = text.match(regex);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * Extract list items from text
 */
function extractList(text, keywords) {
  const items = [];

  for (const keyword of keywords) {
    // Find section with keyword
    const sectionRegex = new RegExp(`${keyword}\\s*[:\\-]?\\s*([\\s\\S]*?)(?=\\n\\n|\\n[A-Z][a-z]+:|$)`, 'i');
    const sectionMatch = text.match(sectionRegex);

    if (sectionMatch) {
      const section = sectionMatch[1];

      // Extract bullet points or numbered items
      const bulletRegex = /[-•*]\s*(.+)/g;
      const numberedRegex = /\d+[\.)]\s*(.+)/g;
      const commaRegex = /,\s*(.+?)(?=,|$)/g;

      let match;

      // Try bullet points
      while ((match = bulletRegex.exec(section)) !== null) {
        items.push(match[1].trim());
      }

      // Try numbered lists
      if (items.length === 0) {
        while ((match = numberedRegex.exec(section)) !== null) {
          items.push(match[1].trim());
        }
      }

      // Try comma-separated
      if (items.length === 0 && section.includes(',')) {
        const parts = section.split(',').map(p => p.trim()).filter(p => p.length > 0);
        items.push(...parts);
      }

      // Single line item
      if (items.length === 0 && section.trim().length > 0) {
        items.push(section.trim());
      }
    }
  }

  return items;
}

/**
 * Extract hashtags from text
 */
function extractHashtags(text) {
  const hashtagRegex = /#[\w]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Detect platform from text
 */
function detectPlatform(text) {
  const lower = text.toLowerCase();
  if (lower.includes('instagram') || lower.includes('ig') || lower.includes('reel')) return 'Instagram';
  if (lower.includes('tiktok') || lower.includes('tik tok')) return 'TikTok';
  if (lower.includes('youtube') || lower.includes('yt')) return 'YouTube';
  if (lower.includes('twitter') || lower.includes('tweet')) return 'Twitter';
  if (lower.includes('facebook') || lower.includes('fb')) return 'Facebook';
  return 'Instagram'; // Default
}

/**
 * Detect content format from text
 */
function detectFormat(text) {
  const lower = text.toLowerCase();
  if (lower.includes('reel')) return 'Reel';
  if (lower.includes('story') || lower.includes('stories')) return 'Story';
  if (lower.includes('post')) return 'Post';
  if (lower.includes('short')) return 'Short';
  if (lower.includes('video')) return 'Video';
  return 'Reel'; // Default
}

/**
 * Test the parser with a sample brief
 */
export async function testConnection() {
  const sampleBrief = `
    Brand: Nike
    Product: Air Max 2024 Running Shoes

    Campaign Requirements:
    - Highlight the new cushioning technology
    - Mention sustainability features (50% recycled materials)
    - Show the shoes in action during a run

    Must include hashtags: #Nike #AirMax2024 #JustDoIt
    Duration: 15-30 seconds
    Platform: Instagram Reels

    Please avoid mentioning competitors or comparing to other shoe brands.
    Deadline: Submit content by February 20th for review.
  `;

  try {
    const result = await parseBrief(sampleBrief);
    console.log('✅ Parser working successfully!');
    console.log('Sample extraction result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('❌ Parser failed:', error.message);
    throw error;
  }
}

// Export default
export default {
  parseBrief,
  testConnection,
};
