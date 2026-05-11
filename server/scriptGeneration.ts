import { invokeLLM } from "./_core/llm";
import { z } from "zod";

/**
 * Scene structure generated from script
 */
export interface GeneratedScene {
  sceneNumber: number;
  title: string;
  narrationText: string;
  illustrationKeywords: string[];
  duration: number;
}

/**
 * Parse user script and generate structured scenes using LLM
 */
export async function generateScenesFromScript(
  scriptText: string
): Promise<GeneratedScene[]> {
  const systemPrompt = `You are an expert video script analyzer. Your task is to break down a script into distinct scenes for a whiteboard animation video.

For each scene, provide:
1. A clear, concise title (max 50 characters)
2. The narration text for that scene
3. A list of 3-5 illustration keywords that describe what should be drawn (nouns and verbs)

Return a JSON array of scenes with this exact structure:
[
  {
    "sceneNumber": 1,
    "title": "Scene title",
    "narrationText": "The narration text...",
    "illustrationKeywords": ["keyword1", "keyword2", "keyword3"],
    "duration": 5
  }
]

Guidelines:
- Each scene should be 1-3 sentences of narration
- Duration should be estimated based on narration length (roughly 1 second per 2-3 words)
- Keywords should be visual elements that can be drawn or animated
- Minimum 2 scenes, maximum 15 scenes per script
- Make scenes flow logically and tell a coherent story`;

  const userPrompt = `Please analyze this script and break it into scenes:

${scriptText}

Return ONLY valid JSON array, no other text.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "scenes",
          strict: true,
          schema: {
            type: "object",
            properties: {
              scenes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    sceneNumber: { type: "integer" },
                    title: { type: "string" },
                    narrationText: { type: "string" },
                    illustrationKeywords: {
                      type: "array",
                      items: { type: "string" },
                    },
                    duration: { type: "integer" },
                  },
                  required: [
                    "sceneNumber",
                    "title",
                    "narrationText",
                    "illustrationKeywords",
                    "duration",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["scenes"],
            additionalProperties: false,
          },
        },
      },
    });

    // Extract the response content
    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error("No response from LLM");
    }

    // Handle both string and array content formats
    let content: string;
    if (typeof messageContent === "string") {
      content = messageContent;
    } else if (Array.isArray(messageContent)) {
      const textContent = messageContent.find((c: any) => c.type === "text") as any;
      content = textContent?.text || "";
    } else {
      throw new Error("Unexpected response format");
    }

    // Parse the JSON response
    const parsed = JSON.parse(content);
    const scenes = parsed.scenes || [];

    // Validate and normalize scenes
    return scenes.map((scene: any, index: number) => ({
      sceneNumber: index + 1,
      title: scene.title || `Scene ${index + 1}`,
      narrationText: scene.narrationText || "",
      illustrationKeywords: Array.isArray(scene.illustrationKeywords)
        ? scene.illustrationKeywords.filter((k: any) => typeof k === "string")
        : [],
      duration: Math.max(3, Math.min(15, scene.duration || 5)),
    }));
  } catch (error) {
    console.error("Error generating scenes:", error);
    throw new Error("Failed to generate scenes from script");
  }
}

/**
 * Extract keywords from narration text for illustration matching
 */
export function extractKeywordsFromNarration(narrationText: string): string[] {
  // Simple keyword extraction - in production, use more sophisticated NLP
  const words = narrationText
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  // Remove common words
  const stopwords = new Set([
    "the",
    "and",
    "that",
    "this",
    "with",
    "from",
    "have",
    "been",
    "are",
    "was",
    "were",
    "will",
    "would",
    "could",
    "should",
    "about",
    "which",
    "their",
  ]);

  return Array.from(new Set(words.filter((w) => !stopwords.has(w)))).slice(
    0,
    10
  );
}

/**
 * Generate illustration prompts for image generation
 */
export function generateIllustrationPrompt(
  sceneTitle: string,
  narrationText: string,
  keywords: string[]
): string {
  return `Create a whiteboard-style illustration for: "${sceneTitle}". 
Context: ${narrationText}
Key elements to include: ${keywords.join(", ")}

Style: Clean whiteboard sketch, hand-drawn appearance, minimalist, educational, black ink on white background.
No text, only visual elements.`;
}
