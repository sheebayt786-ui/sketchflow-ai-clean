import { storagePut } from "./storage";

export interface ExportOptions {
  projectId: number;
  quality: "720p" | "1080p" | "4K";
  includeWatermark: boolean;
  voiceStyle: "male" | "female";
}

export interface ExportProgress {
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message: string;
  videoUrl?: string;
}

/**
 * Export video project as MP4
 * Combines animation, narration, and audio into a single video file
 */
export async function exportVideoAsMP4(
  options: ExportOptions,
  scenes: Array<{
    sceneNumber: number;
    title: string;
    narrationText: string;
    duration: number;
  }>
): Promise<{ videoUrl: string; duration: number }> {
  try {
    // In production, this would use Remotion or FFmpeg to render the video
    // For now, we'll simulate the export process

    const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

    // Get quality settings
    const qualitySettings = getQualitySettings(options.quality);

    // Simulate video generation
    const videoBuffer = await generateVideoBuffer(
      scenes,
      options,
      qualitySettings
    );

    // Upload to cloud storage
    const fileKey = `videos/${options.projectId}-${Date.now()}.mp4`;
    const { url } = await storagePut(fileKey, videoBuffer, "video/mp4");

    return {
      videoUrl: url,
      duration: totalDuration,
    };
  } catch (error) {
    console.error("Video export error:", error);
    throw new Error("Failed to export video");
  }
}

/**
 * Get quality settings for video export
 */
function getQualitySettings(
  quality: "720p" | "1080p" | "4K"
): {
  width: number;
  height: number;
  bitrate: string;
  fps: number;
} {
  switch (quality) {
    case "720p":
      return { width: 1280, height: 720, bitrate: "2500k", fps: 30 };
    case "1080p":
      return { width: 1920, height: 1080, bitrate: "5000k", fps: 30 };
    case "4K":
      return { width: 3840, height: 2160, bitrate: "15000k", fps: 60 };
    default:
      return { width: 1920, height: 1080, bitrate: "5000k", fps: 30 };
  }
}

/**
 * Generate video buffer (simulated)
 * In production, use Remotion or FFmpeg
 */
async function generateVideoBuffer(
  scenes: Array<any>,
  options: ExportOptions,
  qualitySettings: any
): Promise<Buffer> {
  // Simulate video generation delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Create a simple MP4-like buffer with metadata
  // In production, this would be actual video data from Remotion/FFmpeg
  const metadata = {
    projectId: options.projectId,
    quality: options.quality,
    watermark: options.includeWatermark,
    voice: options.voiceStyle,
    sceneCount: scenes.length,
    timestamp: new Date().toISOString(),
  };

  const jsonStr = JSON.stringify(metadata);
  return Buffer.from(jsonStr, "utf-8");
}

/**
 * Check if watermark should be included based on user plan
 */
export function canRemoveWatermark(userPlanTier: string): boolean {
  // Watermark removal is available for Starter tier and above
  const tiers = ["Free", "Starter", "Creator", "Growth"];
  const tierIndex = tiers.indexOf(userPlanTier);
  const starterIndex = tiers.indexOf("Starter");

  return tierIndex >= starterIndex;
}

/**
 * Get watermark text based on plan tier
 */
export function getWatermarkText(
  userPlanTier: string,
  includeWatermark: boolean
): string | null {
  if (!includeWatermark || canRemoveWatermark(userPlanTier)) {
    return null;
  }

  return "Created with SketchFlow AI";
}

/**
 * Validate export options against user plan
 */
export function validateExportOptions(
  options: ExportOptions,
  userPlanTier: string
): { valid: boolean; error?: string } {
  // Free tier: 720p only, watermark required
  if (userPlanTier === "Free") {
    if (options.quality !== "720p") {
      return {
        valid: false,
        error: "Free tier only supports 720p export",
      };
    }
    if (!options.includeWatermark) {
      return {
        valid: false,
        error: "Free tier requires watermark",
      };
    }
  }

  // Starter tier: up to 1080p, watermark optional
  if (userPlanTier === "Starter") {
    if (options.quality === "4K") {
      return {
        valid: false,
        error: "Starter tier does not support 4K export",
      };
    }
  }

  return { valid: true };
}

/**
 * Calculate export cost in credits based on quality and duration
 */
export function calculateExportCost(
  quality: "720p" | "1080p" | "4K",
  durationSeconds: number
): number {
  const baseCost = {
    "720p": 1,
    "1080p": 2,
    "4K": 5,
  };

  const qualityCost = baseCost[quality];
  const durationMinutes = Math.ceil(durationSeconds / 60);

  // Cost = quality multiplier × duration in minutes
  return qualityCost * durationMinutes;
}

/**
 * Track export history for analytics
 */
export interface ExportRecord {
  projectId: number;
  userId: number;
  quality: string;
  duration: number;
  creditsCost: number;
  watermarkIncluded: boolean;
  exportedAt: Date;
  videoUrl: string;
}

/**
 * Generate export report
 */
export function generateExportReport(
  exports: ExportRecord[]
): {
  totalExports: number;
  totalCreditsUsed: number;
  averageQuality: string;
  averageDuration: number;
} {
  const totalExports = exports.length;
  const totalCreditsUsed = exports.reduce((sum, e) => sum + e.creditsCost, 0);
  const averageDuration =
    exports.length > 0
      ? exports.reduce((sum, e) => sum + e.duration, 0) / exports.length
      : 0;

  // Most common quality
  const qualityCounts: Record<string, number> = {};
  exports.forEach((e) => {
    qualityCounts[e.quality] = (qualityCounts[e.quality] || 0) + 1;
  });
  const averageQuality =
    Object.entries(qualityCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
    "1080p";

  return {
    totalExports,
    totalCreditsUsed,
    averageQuality,
    averageDuration,
  };
}
