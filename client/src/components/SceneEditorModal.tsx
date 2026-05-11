import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Save } from "lucide-react";
import { motion } from "framer-motion";

export interface SceneData {
  sceneNumber: number;
  title: string;
  narrationText: string;
  illustrationKeywords: string[];
  duration: number;
}

interface SceneEditorModalProps {
  isOpen: boolean;
  scene: SceneData | null;
  onSave: (scene: SceneData) => void;
  onClose: () => void;
}

/**
 * Modal for editing individual scene details
 */
export function SceneEditorModal({
  isOpen,
  scene,
  onSave,
  onClose,
}: SceneEditorModalProps) {
  const [title, setTitle] = useState(scene?.title || "");
  const [narrationText, setNarrationText] = useState(scene?.narrationText || "");
  const [keywords, setKeywords] = useState<string[]>(
    scene?.illustrationKeywords || []
  );
  const [duration, setDuration] = useState(scene?.duration || 5);
  const [newKeyword, setNewKeyword] = useState("");

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleSave = () => {
    if (!scene) return;

    onSave({
      ...scene,
      title,
      narrationText,
      illustrationKeywords: keywords,
      duration,
    });
  };

  if (!isOpen || !scene) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-96 overflow-y-auto"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Edit Scene {scene.sceneNumber}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-accent/10 rounded-lg transition-smooth"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Scene title"
              />
            </div>

            {/* Narration Text */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Narration Text
              </label>
              <textarea
                value={narrationText}
                onChange={(e) => setNarrationText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                placeholder="Enter narration text for this scene"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {narrationText.length} characters
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Duration (seconds)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="flex-1"
                />
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded-lg bg-input border border-border text-foreground text-center focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            {/* Illustration Keywords */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Illustration Keywords
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddKeyword();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Add keyword and press Enter"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddKeyword}
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <motion.div
                    key={keyword}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-sm"
                  >
                    <span>{keyword}</span>
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="hover:text-accent-foreground transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleSave}
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
