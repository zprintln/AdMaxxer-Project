/**
 * Prompt templates for AdMaxxer AI storyboard generation
 * All prompts use Minimax LLM to generate structured content
 */

/**
 * Main storyboard generation prompt
 * Takes structured brief from bem.ai + creator style and generates scene-by-scene storyboard
 */
export function generateStoryboardPrompt(structuredBrief, creatorStyle) {
  return `You are an AI creative director for social media sponsored content.
Your task is to generate a compelling, authentic storyboard for a sponsored Instagram video.

CREATOR STYLE PROFILE:
${JSON.stringify(creatorStyle, null, 2)}

BRAND BRIEF (Structured):
${JSON.stringify(structuredBrief, null, 2)}

REQUIREMENTS:
1. Generate 4-6 scenes for a ${structuredBrief.duration || '15-30 second'} Instagram video
2. Each scene must feel authentic to the creator's style while meeting brand requirements
3. Include all mandatory talking points: ${structuredBrief.talkingPoints?.join(', ') || 'N/A'}
4. Incorporate required hashtags: ${structuredBrief.hashtags?.join(', ') || 'N/A'}
5. Follow all restrictions: ${structuredBrief.restrictions?.join(', ') || 'None specified'}
6. Ensure product placement feels natural, not forced

OUTPUT FORMAT:
Return ONLY a valid JSON array. Do not include any explanatory text before or after the JSON.

[
  {
    "scene": 1,
    "duration": "5s",
    "visual": "detailed description of what viewers see on screen",
    "script": "exact words the creator says in this scene",
    "notes": "which brand requirement this scene fulfills (e.g., 'mentions product benefit X', 'shows product in use')"
  },
  ...
]

CREATIVE DIRECTION:
- Hook viewers in the first 3 seconds (scene 1 must be attention-grabbing)
- Match the creator's typical content format (${creatorStyle.contentFormat || 'vlog-style'})
- Use the creator's tone of voice (${creatorStyle.tone || 'casual and authentic'})
- Make brand integration feel like a natural recommendation, not an ad
- End with a clear call-to-action that aligns with ${structuredBrief.brandName}'s goals

Generate the storyboard now:`;
}

/**
 * Scene regeneration prompt
 * Used when creator wants to regenerate a single scene
 */
export function regenerateScenePrompt(sceneNumber, currentScene, structuredBrief, creatorStyle, userFeedback) {
  return `You are regenerating scene ${sceneNumber} of a sponsored content storyboard.

CURRENT SCENE:
${JSON.stringify(currentScene, null, 2)}

USER FEEDBACK: "${userFeedback}"

CREATOR STYLE:
${JSON.stringify(creatorStyle, null, 2)}

BRAND REQUIREMENTS:
${JSON.stringify(structuredBrief, null, 2)}

Generate an improved version of this scene that addresses the feedback while maintaining:
- Authenticity to creator's style
- Compliance with brand requirements
- Natural flow with surrounding scenes

Return ONLY valid JSON for the single scene:
{
  "scene": ${sceneNumber},
  "duration": "5s",
  "visual": "...",
  "script": "...",
  "notes": "..."
}`;
}

/**
 * Visual scene description enhancement prompt
 * Makes scene descriptions more detailed for image/video generation
 */
export function enhanceVisualDescriptionPrompt(sceneDescription) {
  return `Convert this scene description into a detailed visual prompt for AI image/video generation:

Original: "${sceneDescription}"

Create a detailed prompt that includes:
- Specific visual composition (camera angle, framing, lighting)
- Color palette and aesthetic style
- Key visual elements and their placement
- Mood and atmosphere
- Any text overlays or graphics

Return a single detailed paragraph (2-3 sentences max) optimized for AI image generation.`;
}

/**
 * Creator style analysis prompt
 * Analyzes Instagram feed screenshots to extract style profile
 */
export function analyzeCreatorStylePrompt(instagramHandle) {
  return `Analyze the Instagram profile @${instagramHandle} and create a style profile for sponsored content creation.

Return a JSON object with:
{
  "contentFormat": "typical video format (e.g., 'talking head vlog', 'product demo', 'lifestyle montage')",
  "tone": "communication style (e.g., 'energetic and enthusiastic', 'calm and informative', 'humorous')",
  "aestheticTags": ["tag1", "tag2", "tag3"],
  "typicalDuration": "average video length",
  "commonThemes": ["theme1", "theme2"],
  "uniqueHook": "what makes this creator's content distinctive"
}`;
}

/**
 * Brand approval summary prompt
 * Formats storyboard for brand review
 */
export function generateBrandApprovalPrompt(storyboard, creatorInfo, brandInfo) {
  return `Create a professional brand approval summary for this sponsored content storyboard.

CREATOR: ${creatorInfo.name || creatorInfo.instagramHandle}
BRAND: ${brandInfo.brandName}
PRODUCT: ${brandInfo.productName}

STORYBOARD:
${JSON.stringify(storyboard, null, 2)}

Generate a clear, professional summary that includes:
1. Executive overview (2-3 sentences)
2. How each brand requirement is fulfilled
3. Expected engagement metrics based on creator's typical performance
4. Scene-by-scene breakdown with visual previews
5. Compliance checklist (all talking points, hashtags, restrictions met)

Format as clean HTML for email or PDF export.`;
}

// Export all prompt functions
export default {
  generateStoryboardPrompt,
  regenerateScenePrompt,
  enhanceVisualDescriptionPrompt,
  analyzeCreatorStylePrompt,
  generateBrandApprovalPrompt,
};
