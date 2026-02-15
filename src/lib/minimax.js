/**
 * Minimax API Client for AdMaxxer
 * Handles LLM calls for storyboard generation and media generation for scene previews
 */

import axios from 'axios';

// Minimax API configuration
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_GROUP_ID = process.env.MINIMAX_GROUP_ID;
const MINIMAX_BASE_URL = process.env.MINIMAX_BASE_URL || 'https://api.minimax.chat/v1';

/**
 * Generate storyboard using Minimax LLM
 * Takes a structured brief and creator style, returns a scene-by-scene storyboard
 *
 * @param {Object} structuredBrief - Parsed brand brief from bem.ai
 * @param {Object} creatorStyle - Creator's content style profile
 * @param {string} customPrompt - Optional custom prompt template
 * @returns {Promise<Array>} Array of scene objects
 */
export async function generateStoryboard(structuredBrief, creatorStyle, customPrompt = null) {
  if (!MINIMAX_API_KEY || !MINIMAX_GROUP_ID) {
    throw new Error('Minimax credentials not configured. Please add MINIMAX_API_KEY and MINIMAX_GROUP_ID to .env.local');
  }

  // TEMPORARY: Mock mode for testing while debugging Minimax API
  const USE_MOCK = process.env.USE_MOCK_MODE === 'true';

  if (USE_MOCK) {
    console.log('🎭 Using MOCK mode for storyboard generation');
    return generateMockStoryboard(structuredBrief, creatorStyle);
  }

  try {
    // Import prompt template
    const { generateStoryboardPrompt } = await import('./prompts.js');
    const prompt = customPrompt || generateStoryboardPrompt(structuredBrief, creatorStyle);

    const response = await axios.post(
      `${MINIMAX_BASE_URL}/text/chatcompletion_v2`,
      {
        model: 'abab6.5-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI creative director specializing in social media sponsored content. You generate authentic, engaging storyboards that balance brand requirements with creator authenticity. Always return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7, // Balanced creativity
        top_p: 0.9,
        max_tokens: 2000,
        reply_constraints: {
          sender_type: 'BOT',
          sender_name: 'Creative Director',
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${MINIMAX_API_KEY}`,
          'Content-Type': 'application/json',
          'GroupId': MINIMAX_GROUP_ID,
        },
        timeout: 45000, // 45 second timeout for LLM generation
      }
    );

    // Log full response for debugging
    console.log('🔍 Minimax API response:', JSON.stringify(response.data, null, 2));

    // Extract the LLM response
    const llmResponse = response.data.choices?.[0]?.message?.content || response.data.reply;

    if (!llmResponse) {
      console.error('❌ Full Minimax response:', response.data);
      throw new Error('No response from Minimax LLM');
    }

    // Parse JSON response (remove markdown code blocks if present)
    let storyboard;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = llmResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      storyboard = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse LLM response as JSON:', llmResponse);
      throw new Error('LLM returned invalid JSON. Response: ' + llmResponse.substring(0, 200));
    }

    // Validate storyboard structure
    if (!Array.isArray(storyboard)) {
      throw new Error('Storyboard must be an array of scenes');
    }

    if (storyboard.length === 0) {
      throw new Error('Storyboard is empty');
    }

    // Validate each scene has required fields
    const requiredFields = ['scene', 'duration', 'visual', 'script'];
    storyboard.forEach((scene, index) => {
      requiredFields.forEach(field => {
        if (!scene[field]) {
          throw new Error(`Scene ${index + 1} is missing required field: ${field}`);
        }
      });
    });

    return storyboard;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error || 'Unknown API error';

      if (status === 401) {
        throw new Error('Invalid Minimax API key. Please check MINIMAX_API_KEY in .env.local');
      } else if (status === 429) {
        throw new Error('Minimax rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Minimax LLM API error (${status}): ${message}`);
      }
    } else if (error.request) {
      throw new Error('Failed to connect to Minimax API. Please check your internet connection.');
    } else {
      throw error;
    }
  }
}

/**
 * Generate image preview for a single scene using Minimax Image API
 *
 * @param {string} sceneDescription - Visual description of the scene
 * @param {Object} options - Additional options (aspectRatio, style, etc.)
 * @returns {Promise<string>} URL to generated image
 */
export async function generateSceneImage(sceneDescription, options = {}) {
  if (!MINIMAX_API_KEY || !MINIMAX_GROUP_ID) {
    throw new Error('Minimax credentials not configured');
  }

  try {
    // Enhance the description for better image generation
    const { enhanceVisualDescriptionPrompt } = await import('./prompts.js');

    // First, enhance the description using LLM
    const enhancedPrompt = await enhanceDescription(sceneDescription);

    const response = await axios.post(
      `${MINIMAX_BASE_URL}/image/generation`,
      {
        model: 'image-01',
        prompt: enhancedPrompt,
        aspect_ratio: options.aspectRatio || '9:16', // Instagram Reel default
        num_images: 1,
        style: options.style || 'realistic',
      },
      {
        headers: {
          'Authorization': `Bearer ${MINIMAX_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 second timeout for image generation
      }
    );

    // Extract image URL from response
    const imageUrl = response.data.images?.[0]?.url || response.data.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('No image URL returned from Minimax');
    }

    return imageUrl;
  } catch (error) {
    console.error('Image generation failed:', error.message);

    // Fallback: return placeholder
    return generatePlaceholderImage(sceneDescription);
  }
}

/**
 * Generate video preview for a single scene using Minimax Video API
 *
 * @param {string} sceneDescription - Visual description of the scene
 * @param {number} duration - Duration in seconds
 * @returns {Promise<string>} URL to generated video or null if failed
 */
export async function generateSceneVideo(sceneDescription, duration = 5) {
  if (!MINIMAX_API_KEY || !MINIMAX_GROUP_ID) {
    throw new Error('Minimax credentials not configured');
  }

  try {
    const response = await axios.post(
      `${MINIMAX_BASE_URL}/video/generation`,
      {
        model: 'video-01',
        prompt: sceneDescription,
        duration: duration,
        aspect_ratio: '9:16',
      },
      {
        headers: {
          'Authorization': `Bearer ${MINIMAX_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 120000, // 2 minute timeout for video generation
      }
    );

    // Video generation is usually async, check for task ID
    const taskId = response.data.task_id;

    if (taskId) {
      // Poll for completion (simplified for hackathon)
      return await pollVideoGeneration(taskId);
    }

    // If direct URL is returned
    const videoUrl = response.data.video_url || response.data.data?.url;
    return videoUrl;
  } catch (error) {
    console.error('Video generation failed:', error.message);
    // Fallback to image generation
    console.log('Falling back to image generation...');
    return await generateSceneImage(sceneDescription);
  }
}

/**
 * Poll Minimax API for video generation completion
 * @param {string} taskId - Task ID from initial video generation request
 * @returns {Promise<string>} URL to generated video
 */
async function pollVideoGeneration(taskId, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds

    try {
      const response = await axios.get(
        `${MINIMAX_BASE_URL}/video/generation/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${MINIMAX_API_KEY}`,
          },
        }
      );

      const status = response.data.status;

      if (status === 'completed' || status === 'success') {
        return response.data.video_url || response.data.data?.url;
      } else if (status === 'failed') {
        throw new Error('Video generation failed');
      }
      // Status is 'processing', continue polling
    } catch (error) {
      console.error('Polling error:', error.message);
    }
  }

  throw new Error('Video generation timeout');
}

/**
 * Enhance scene description using LLM for better image/video generation
 * @param {string} description - Original scene description
 * @returns {Promise<string>} Enhanced description
 */
async function enhanceDescription(description) {
  try {
    const { enhanceVisualDescriptionPrompt } = await import('./prompts.js');
    const prompt = enhanceVisualDescriptionPrompt(description);

    const response = await axios.post(
      `${MINIMAX_BASE_URL}/text/chatcompletion_v2`,
      {
        model: 'abab6.5-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 200,
      },
      {
        headers: {
          'Authorization': `Bearer ${MINIMAX_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    return response.data.choices?.[0]?.message?.content || description;
  } catch (error) {
    // If enhancement fails, return original description
    return description;
  }
}

/**
 * Generate placeholder image URL (for fallback when API fails)
 * @param {string} sceneDescription - Scene description to encode in placeholder
 * @returns {string} Placeholder image URL
 */
function generatePlaceholderImage(sceneDescription) {
  const text = encodeURIComponent(sceneDescription.substring(0, 50));
  return `https://via.placeholder.com/1080x1920/0ea5e9/ffffff?text=${text}`;
}

/**
 * Generate mock storyboard for testing (when Minimax API is unavailable)
 * @param {Object} structuredBrief - Brand brief data
 * @param {Object} creatorStyle - Creator style preferences
 * @returns {Array} Mock storyboard scenes
 */
function generateMockStoryboard(structuredBrief, creatorStyle) {
  const { brandName, productName, talkingPoints, hashtags, duration } = structuredBrief;
  const tone = creatorStyle?.tone || 'enthusiastic';

  // Parse duration to calculate scene count
  const totalSeconds = parseInt(duration) || 20;
  const sceneCount = Math.min(Math.max(Math.ceil(totalSeconds / 5), 4), 6);

  const scenes = [
    {
      scene: 1,
      duration: '3s',
      visual: `Close-up of creator holding ${productName}, bright natural lighting, ${creatorStyle?.aestheticTags?.[0] || 'modern'} background`,
      script: `Hey everyone! I'm so excited to show you the new ${productName} from ${brandName}!`,
      notes: 'Product introduction and hook',
    },
    {
      scene: 2,
      duration: '5s',
      visual: `Creator demonstrating ${productName} in action, dynamic camera movement`,
      script: `What I love most is ${talkingPoints?.[0] || 'how amazing this is'}. It's seriously a game-changer!`,
      notes: `Highlights first talking point: ${talkingPoints?.[0] || 'product feature'}`,
    },
  ];

  // Add middle scenes based on talking points
  if (talkingPoints && talkingPoints.length > 1) {
    scenes.push({
      scene: 3,
      duration: '5s',
      visual: `Detail shot of ${productName} features, clean product-focused framing`,
      script: `Plus, ${talkingPoints[1]}. ${brandName} really nailed it with this one!`,
      notes: `Highlights second talking point: ${talkingPoints[1]}`,
    });
  }

  // Add final scene with CTA
  scenes.push({
    scene: scenes.length + 1,
    duration: '4s',
    visual: `Creator smiling at camera, holding ${productName}, ${brandName} logo visible`,
    script: `Check out ${productName} - link in bio! ${hashtags?.join(' ') || ''}`,
    notes: 'Call-to-action with required hashtags',
  });

  return scenes.slice(0, sceneCount);
}

/**
 * Test Minimax LLM connection with a simple prompt
 */
export async function testLLMConnection() {
  const sampleBrief = {
    brandName: 'Nike',
    productName: 'Air Max 2024',
    talkingPoints: ['New cushioning technology', 'Sustainability features'],
    hashtags: ['#Nike', '#AirMax2024'],
    duration: '15 seconds',
  };

  const sampleStyle = {
    contentFormat: 'talking head vlog',
    tone: 'energetic and enthusiastic',
    aestheticTags: ['urban', 'athletic', 'minimal'],
  };

  try {
    const storyboard = await generateStoryboard(sampleBrief, sampleStyle);
    console.log('✅ Minimax LLM connection successful!');
    console.log('Generated storyboard:', JSON.stringify(storyboard, null, 2));
    return storyboard;
  } catch (error) {
    console.error('❌ Minimax LLM connection failed:', error.message);
    throw error;
  }
}

// Export all functions
export default {
  generateStoryboard,
  generateSceneImage,
  generateSceneVideo,
  testLLMConnection,
};
