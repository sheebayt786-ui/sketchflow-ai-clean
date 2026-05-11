import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";



type WhiteboardStyle = "sketch" | "canvas" | "chalkboard";
type VoiceStyle = "male" | "female";

export default function ScriptInput() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Form state
  const [scriptText, setScriptText] = useState("");
  const [whiteboardStyle, setWhiteboardStyle] = useState<WhiteboardStyle>("sketch");
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>("male");
  const [projectTitle, setProjectTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mutations
  const createProject = trpc.projects.create.useMutation();

  const handleCreateProject = async () => {
    if (!projectTitle.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    if (!scriptText.trim()) {
      toast.error("Please enter a script");
      return;
    }

    setIsLoading(true);

    try {
      // Create project
      const projectResponse = await createProject.mutateAsync({
        title: projectTitle,
        whiteboardStyle,
        voiceStyle,
      });

      toast.success("Project created! Redirecting to editor...");
      setTimeout(() => {
        setLocation(`/editor`);
      }, 1000);
    } catch (error) {
      toast.error("Failed to create project. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-card/30 sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent" />
            <span className="text-xl font-bold">SketchFlow AI</span>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Create Your Video</h1>
            <p className="text-lg text-muted-foreground">
              Enter your script and customize your whiteboard style
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Title */}
              <Card className="p-6">
                <label className="block text-sm font-semibold mb-3">
                  Project Title
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g., How Photosynthesis Works"
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-smooth"
                />
              </Card>

              {/* Script Input */}
              <Card className="p-6">
                <label className="block text-sm font-semibold mb-3">
                  Your Script
                </label>
                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder="Enter your video script here. You can write it as one continuous text or break it into scenes..."
                  rows={12}
                  className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-smooth resize-none"
                />
                <div className="text-xs text-muted-foreground mt-2">
                  {scriptText.length} characters
                </div>
              </Card>
            </div>

            {/* Sidebar - Style Selection */}
            <div className="space-y-6">
              {/* Whiteboard Style */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Whiteboard Style</h3>
                <div className="space-y-3">
                  {(["sketch", "canvas", "chalkboard"] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setWhiteboardStyle(style)}
                      className={`w-full p-3 rounded-lg border-2 transition-smooth text-left ${
                        whiteboardStyle === style
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="font-medium capitalize">{style}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {style === "sketch" && "Hand-drawn sketch style"}
                        {style === "canvas" && "Clean canvas style"}
                        {style === "chalkboard" && "Chalkboard style"}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Voice Style */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Voice Style</h3>
                <div className="space-y-3">
                  {(["male", "female"] as const).map((voice) => (
                    <button
                      key={voice}
                      onClick={() => setVoiceStyle(voice)}
                      className={`w-full p-3 rounded-lg border-2 transition-smooth text-left ${
                        voiceStyle === voice
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="font-medium capitalize">{voice}</div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Preview */}
              <Card className="p-6 bg-card/50">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Preview
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Style:</span>
                    <div className="font-medium capitalize">{whiteboardStyle}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Voice:</span>
                    <div className="font-medium capitalize">{voiceStyle}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Script Length:</span>
                    <div className="font-medium">
                      {scriptText.split(" ").length} words
                    </div>
                  </div>
                </div>
              </Card>

              {/* CTA Button */}
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleCreateProject}
                disabled={isLoading || !projectTitle.trim() || !scriptText.trim()}
                type="button"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>Create & Generate</>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
