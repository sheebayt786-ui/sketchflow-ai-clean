import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface NarrationPlayerProps {
  narrationText: string;
  audioUrl?: string;
  voice: "male" | "female";
  isPlaying: boolean;
  duration: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

/**
 * Component for playing narration audio with text sync
 * Displays narration text and controls audio playback
 */
export function NarrationPlayer({
  narrationText,
  audioUrl,
  voice,
  isPlaying,
  duration,
  onProgress,
  onComplete,
}: NarrationPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      setIsLoading(true);
      audioRef.current.play().catch((error) => {
        console.error("Playback error:", error);
        setHasError(true);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle audio events
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = audioRef.current.currentTime / duration;
      setCurrentTime(audioRef.current.currentTime);
      onProgress?.(progress);
    }
  };

  const handleEnded = () => {
    onComplete?.();
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // Highlight current word in narration
  const highlightCurrentWord = () => {
    const words = narrationText.split(/\s+/);
    const wordsPerSecond = words.length / duration;
    const currentWordIndex = Math.floor(currentTime * wordsPerSecond);

    return words.map((word, index) => (
      <span
        key={index}
        className={`transition-colors ${
          index === currentWordIndex
            ? "text-accent font-semibold"
            : "text-foreground"
        }`}
      >
        {word}{" "}
      </span>
    ));
  };

  return (
    <div className="space-y-4">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onCanPlay={handleCanPlay}
        onError={handleError}
      />

      {/* Narration Text Display */}
      <div className="p-4 rounded-lg bg-card/50 border border-border/40 min-h-24">
        <div className="flex items-start gap-2 mb-3">
          <Volume2 className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-xs text-muted-foreground mb-2">
              Narration ({voice === "male" ? "Male" : "Female"} Voice)
            </div>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-foreground/80">
          {highlightCurrentWord()}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <div className="flex-1 h-1 bg-background/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent"
              initial={{ width: "0%" }}
              animate={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Status Messages */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading narration...
        </div>
      )}

      {hasError && (
        <div className="text-sm text-destructive">
          Error loading narration audio. Please try again.
        </div>
      )}

      {!audioUrl && (
        <div className="text-sm text-muted-foreground">
          Narration audio will be generated when you export the video.
        </div>
      )}
    </div>
  );
}

/**
 * Format time in MM:SS format
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Voice selector component
 */
interface VoiceSelectorProps {
  value: "male" | "female";
  onChange: (voice: "male" | "female") => void;
  disabled?: boolean;
}

export function VoiceSelector({
  value,
  onChange,
  disabled = false,
}: VoiceSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Voice Style</label>
      <div className="grid grid-cols-2 gap-3">
        {(["male", "female"] as const).map((voice) => (
          <button
            key={voice}
            onClick={() => onChange(voice)}
            disabled={disabled}
            className={`p-3 rounded-lg border-2 transition-smooth text-center ${
              value === voice
                ? "border-accent bg-accent/10"
                : "border-border hover:border-accent/50"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="font-medium text-sm capitalize">{voice} Voice</div>
            <div className="text-xs text-muted-foreground mt-1">
              {voice === "male" ? "Deep, clear tone" : "Warm, engaging tone"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
