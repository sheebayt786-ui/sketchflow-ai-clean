import { invokeLLM } from "./_core/llm";

export type VoiceStyle = "male" | "female";

export interface NarrationSegment {
  text: string;
  duration: number;
  audioUrl?: string;
}

/**
 * Generate speech audio from narration text using TTS API
 * Returns audio URL and estimated duration
 */
export async function generateNarration(
  text: string,
  voice: VoiceStyle
): Promise<{ audioUrl: string; duration: number }> {
  try {
    // Map voice styles to standard TTS voices
    const voiceMap: Record<VoiceStyle, string> = {
      male: "en-US-Neural2-C", // Google Cloud TTS male voice
      female: "en-US-Neural2-A", // Google Cloud TTS female voice
    };

    const selectedVoice = voiceMap[voice];

    // In production, call actual TTS API (Google Cloud, AWS Polly, Azure, etc.)
    // For now, simulate the response
    const estimatedDuration = estimateNarrationDuration(text);

    // Placeholder: In production, this would call the actual TTS service
    const audioUrl = `/api/tts/generate?text=${encodeURIComponent(text)}&voice=${selectedVoice}`;

    return {
      audioUrl,
      duration: estimatedDuration,
    };
  } catch (error) {
    console.error("Text-to-speech generation error:", error);
    throw new Error("Failed to generate narration audio");
  }
}

/**
 * Estimate narration duration based on text length
 * Average speaking rate: ~150 words per minute
 */
export function estimateNarrationDuration(text: string): number {
  const wordCount = text.trim().split(/\s+/).length;
  const wordsPerSecond = 150 / 60; // ~2.5 words per second
  const durationSeconds = Math.ceil(wordCount / wordsPerSecond);

  // Add 0.5 second buffer for natural pauses
  return Math.max(2, durationSeconds + 0.5);
}

/**
 * Split narration into segments for scene synchronization
 * Returns segments with timing information for animation sync
 */
export function splitNarrationIntoSegments(
  text: string,
  targetDuration: number
): NarrationSegment[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const segments: NarrationSegment[] = [];

  const totalWords = text.trim().split(/\s+/).length;
  const wordsPerSecond = totalWords / targetDuration;

  let currentTime = 0;

  sentences.forEach((sentence) => {
    const trimmed = sentence.trim();
    const wordCount = trimmed.split(/\s+/).length;
    const duration = Math.ceil(wordCount / wordsPerSecond);

    segments.push({
      text: trimmed,
      duration: Math.max(1, duration),
    });

    currentTime += duration;
  });

  return segments;
}

/**
 * Sync narration with animation timeline
 * Returns timing information for each scene
 */
export interface SceneNarrationSync {
  sceneId: number;
  narrationText: string;
  audioUrl: string;
  startTime: number;
  endTime: number;
  duration: number;
}

export function syncNarrationWithScenes(
  scenes: Array<{
    sceneNumber: number;
    narrationText: string;
    duration: number;
  }>,
  voice: VoiceStyle
): SceneNarrationSync[] {
  const syncedScenes: SceneNarrationSync[] = [];
  let currentTime = 0;

  scenes.forEach((scene) => {
    const narrationDuration = estimateNarrationDuration(scene.narrationText);
    const audioUrl = `/api/tts/generate?text=${encodeURIComponent(scene.narrationText)}&voice=${voice}`;

    syncedScenes.push({
      sceneId: scene.sceneNumber,
      narrationText: scene.narrationText,
      audioUrl,
      startTime: currentTime,
      endTime: currentTime + narrationDuration,
      duration: narrationDuration,
    });

    currentTime += narrationDuration;
  });

  return syncedScenes;
}

/**
 * Calculate optimal scene duration based on narration
 * Ensures animation timing matches speech
 */
export function calculateOptimalSceneDuration(
  narrationText: string,
  minDuration: number = 3,
  maxDuration: number = 15
): number {
  const estimatedDuration = estimateNarrationDuration(narrationText);
  return Math.max(minDuration, Math.min(maxDuration, estimatedDuration));
}
