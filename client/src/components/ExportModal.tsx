import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ExportModalProps {
  isOpen: boolean;
  projectTitle: string;
  totalDuration: number;
  userPlanTier: string;
  onExport: (options: {
    quality: "720p" | "1080p" | "4K";
    includeWatermark: boolean;
  }) => Promise<void>;
  onClose: () => void;
}

/**
 * Export modal with quality and watermark options
 */
export function ExportModal({
  isOpen,
  projectTitle,
  totalDuration,
  userPlanTier,
  onExport,
  onClose,
}: ExportModalProps) {
  const [quality, setQuality] = useState<"720p" | "1080p" | "4K">("1080p");
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine available options based on plan tier
  const getAvailableQualities = (): Array<"720p" | "1080p" | "4K"> => {
    switch (userPlanTier) {
      case "Free":
        return ["720p"];
      case "Starter":
        return ["720p", "1080p"];
      case "Creator":
      case "Growth":
        return ["720p", "1080p", "4K"];
      default:
        return ["720p"];
    }
  };

  const canRemoveWatermark = (): boolean => {
    return userPlanTier !== "Free";
  };

  const getQualityDescription = (q: "720p" | "1080p" | "4K"): string => {
    switch (q) {
      case "720p":
        return "Standard HD - Best for web";
      case "1080p":
        return "Full HD - Best for social media";
      case "4K":
        return "Ultra HD - Best for presentations";
      default:
        return "";
    }
  };

  const calculateCredits = (): number => {
    const baseCost = {
      "720p": 1,
      "1080p": 2,
      "4K": 5,
    };
    const durationMinutes = Math.ceil(totalDuration / 60);
    return baseCost[quality] * durationMinutes;
  };

  const handleExport = async () => {
    setError(null);
    setIsExporting(true);

    try {
      await onExport({
        quality,
        includeWatermark,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Export failed. Please try again."
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  const availableQualities = getAvailableQualities();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <Card className="w-full max-w-md p-6">
          <h2 className="text-2xl font-bold mb-2">Export Video</h2>
          <p className="text-sm text-muted-foreground mb-6">{projectTitle}</p>

          <div className="space-y-6">
            {/* Quality Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Quality</label>
              <div className="space-y-2">
                {(["720p", "1080p", "4K"] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    disabled={!availableQualities.includes(q) || isExporting}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-smooth ${
                      quality === q
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    } ${
                      !availableQualities.includes(q)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <div className="font-medium text-sm">{q}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getQualityDescription(q)}
                    </div>
                    {!availableQualities.includes(q) && (
                      <div className="text-xs text-destructive mt-1">
                        Upgrade to {
                          q === "4K"
                            ? "Creator"
                            : q === "1080p"
                              ? "Starter"
                              : "Free"
                        }{" "}
                        plan
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Watermark Toggle */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Watermark</label>
                {!canRemoveWatermark() && (
                  <span className="text-xs text-muted-foreground">
                    Free tier only
                  </span>
                )}
              </div>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-border/40 cursor-pointer hover:border-accent/50 transition-smooth">
                <input
                  type="checkbox"
                  checked={includeWatermark}
                  onChange={(e) => setIncludeWatermark(e.target.checked)}
                  disabled={!canRemoveWatermark() || isExporting}
                  className="rounded"
                />
                <div>
                  <div className="text-sm font-medium">
                    Include SketchFlow AI watermark
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {includeWatermark
                      ? "Watermark will appear in your video"
                      : "No watermark"}
                  </div>
                </div>
              </label>
            </div>

            {/* Credits Info */}
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">
                  {Math.ceil(totalDuration / 60)} min
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quality:</span>
                <span className="font-medium">{quality}</span>
              </div>
              <div className="border-t border-accent/20 pt-2 flex justify-between">
                <span className="text-sm font-medium">Credits Required:</span>
                <span className="text-accent font-bold">{calculateCredits()}</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

/**
 * Export success notification
 */
export function ExportSuccessNotification({
  videoUrl,
  quality,
  onDownload,
}: {
  videoUrl: string;
  quality: string;
  onDownload: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg max-w-sm"
    >
      <div className="flex gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Export Successful!</h3>
          <p className="text-xs text-muted-foreground">
            Your {quality} video is ready to download.
          </p>
        </div>
        <Button size="sm" onClick={onDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>
    </motion.div>
  );
}
