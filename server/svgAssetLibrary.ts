import { generateImage } from "./_core/imageGeneration";

export interface SVGAsset {
  id: string;
  title: string;
  keywords: string[];
  category: string;
  svgContent: string;
  style: "sketch" | "canvas" | "chalkboard";
  createdAt: Date;
}

export interface GeneratedAsset {
  url: string;
  svgContent: string;
  keywords: string[];
}

/**
 * SVG Asset Library - manages whiteboard illustrations
 * Supports both pre-built assets and AI-generated assets
 */

// Pre-built SVG asset library (basic shapes and common icons)
const PRESET_ASSETS: Record<string, SVGAsset> = {
  arrow: {
    id: "arrow",
    title: "Arrow",
    keywords: ["arrow", "direction", "point", "move"],
    category: "shapes",
    svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 10 50 L 80 50 M 70 40 L 80 50 L 70 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    style: "sketch",
    createdAt: new Date(),
  },
  chart: {
    id: "chart",
    title: "Chart",
    keywords: ["chart", "graph", "data", "analytics", "growth"],
    category: "business",
    svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="60" width="15" height="30" fill="none" stroke="currentColor" stroke-width="2"/>
      <rect x="40" y="40" width="15" height="50" fill="none" stroke="currentColor" stroke-width="2"/>
      <rect x="65" y="20" width="15" height="70" fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    style: "sketch",
    createdAt: new Date(),
  },
  lightbulb: {
    id: "lightbulb",
    title: "Lightbulb",
    keywords: ["idea", "lightbulb", "innovation", "creative", "solution"],
    category: "concepts",
    svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="35" r="20" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M 35 55 L 35 70 L 65 70 L 65 55" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="40" y1="75" x2="60" y2="75" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    style: "sketch",
    createdAt: new Date(),
  },
  person: {
    id: "person",
    title: "Person",
    keywords: ["person", "user", "people", "team", "human"],
    category: "people",
    svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="25" r="12" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M 50 40 L 50 70 M 35 55 L 65 55 M 50 70 L 40 85 M 50 70 L 60 85" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    style: "sketch",
    createdAt: new Date(),
  },
  gear: {
    id: "gear",
    title: "Gear",
    keywords: ["gear", "settings", "process", "automation", "system"],
    category: "technical",
    svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" stroke-width="2"/>
      <rect x="48" y="8" width="4" height="12" fill="currentColor"/>
      <rect x="48" y="80" width="4" height="12" fill="currentColor"/>
      <rect x="8" y="48" width="12" height="4" fill="currentColor"/>
      <rect x="80" y="48" width="12" height="4" fill="currentColor"/>
    </svg>`,
    style: "sketch",
    createdAt: new Date(),
  },
};

/**
 * Get asset by keyword matching
 */
export function getAssetByKeyword(keyword: string): SVGAsset | null {
  const normalizedKeyword = keyword.toLowerCase().trim();

  for (const asset of Object.values(PRESET_ASSETS)) {
    if (
      asset.keywords.some((k) =>
        k.toLowerCase().includes(normalizedKeyword) ||
        normalizedKeyword.includes(k.toLowerCase())
      )
    ) {
      return asset;
    }
  }

  return null;
}

/**
 * Get multiple assets matching keywords
 */
export function getAssetsByKeywords(keywords: string[]): SVGAsset[] {
  const assets: SVGAsset[] = [];
  const seen = new Set<string>();

  for (const keyword of keywords) {
    if (!keyword) continue;
    const asset = getAssetByKeyword(keyword);
    if (asset && !seen.has(asset.id)) {
      assets.push(asset);
      seen.add(asset.id);
    }
  }

  return assets;
}

/**
 * Generate custom SVG asset using AI image generation
 */
export async function generateCustomSVGAsset(
  keywords: string[],
  style: "sketch" | "canvas" | "chalkboard",
  narrationContext: string
): Promise<GeneratedAsset> {
  try {
    // Create a prompt for whiteboard-style illustration
    const prompt = createWhiteboardPrompt(keywords, style, narrationContext);

    // Generate image using AI
    const result = await generateImage({ prompt });
    const imageUrl = result.url || "";

    // In production, convert raster image to SVG using potrace or similar
    // For now, return the generated image URL
    const svgContent = createSVGFromImageUrl(imageUrl);

    return {
      url: imageUrl,
      svgContent,
      keywords,
    };
  } catch (error) {
    console.error("SVG asset generation error:", error);
    // Fallback to preset asset if generation fails
    const firstKeyword = keywords[0] || "chart";
    const fallbackAsset = getAssetByKeyword(firstKeyword);
    if (fallbackAsset) {
      return {
        url: "",
        svgContent: fallbackAsset.svgContent,
        keywords: fallbackAsset.keywords,
      };
    }
    throw new Error("Failed to generate SVG asset");
  }
}

/**
 * Create whiteboard-specific prompt for image generation
 */
function createWhiteboardPrompt(
  keywords: string[],
  style: "sketch" | "canvas" | "chalkboard",
  narrationContext: string
): string {
  const styleDescriptions = {
    sketch: "hand-drawn sketch style, pencil lines, rough edges",
    canvas: "canvas painting style, brush strokes, textured",
    chalkboard: "chalk drawing on blackboard, white chalk, educational",
  };

  const styleDesc = styleDescriptions[style];

  return `Create a minimalist whiteboard illustration in ${styleDesc}.
Subject: ${keywords.join(", ")}
Context: ${narrationContext}
Style: Clean, simple, educational, black and white (or white on black for chalkboard).
No text, only visual elements. Professional quality.`;
}

/**
 * Create SVG wrapper for generated image
 */
function createSVGFromImageUrl(imageUrl: string): string {
  return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <image x="0" y="0" width="400" height="300" xlink:href="${imageUrl}"/>
  </svg>`;
}

/**
 * Get all available categories
 */
export function getAssetCategories(): string[] {
  const categories = new Set<string>();
  for (const asset of Object.values(PRESET_ASSETS)) {
    categories.add(asset.category);
  }
  return Array.from(categories);
}

/**
 * Get assets by category
 */
export function getAssetsByCategory(category: string): SVGAsset[] {
  return Object.values(PRESET_ASSETS).filter((a) => a.category === category);
}

/**
 * Adapt asset to whiteboard style
 */
export function adaptAssetToStyle(
  asset: SVGAsset,
  targetStyle: "sketch" | "canvas" | "chalkboard"
): SVGAsset {
  if (asset.style === targetStyle) {
    return asset;
  }

  // Apply style-specific modifications
  let adaptedSvg = asset.svgContent;

  switch (targetStyle) {
    case "chalkboard":
      // Change stroke color to white for chalkboard
      adaptedSvg = adaptedSvg.replace(
        /stroke="currentColor"/g,
        'stroke="white"'
      );
      adaptedSvg = adaptedSvg.replace(/fill="currentColor"/g, 'fill="white"');
      break;
    case "canvas":
      // Add slight opacity and texture effect
      adaptedSvg = adaptedSvg.replace(
        /<svg/,
        '<svg style="filter: url(#canvas-texture)"'
      );
      break;
  }

  return {
    ...asset,
    style: targetStyle,
    svgContent: adaptedSvg,
  };
}

/**
 * Cache for generated assets (in production, use database)
 */
const generatedAssetCache = new Map<string, GeneratedAsset>();

/**
 * Get or generate asset with caching
 */
export async function getOrGenerateAsset(
  keywords: string[],
  style: "sketch" | "canvas" | "chalkboard",
  narrationContext: string
): Promise<GeneratedAsset> {
  const cacheKey = `${keywords.join("-")}-${style}`;

  if (generatedAssetCache.has(cacheKey)) {
    return generatedAssetCache.get(cacheKey)!;
  }

  const asset = await generateCustomSVGAsset(keywords, style, narrationContext);
  generatedAssetCache.set(cacheKey, asset);

  return asset;
}
