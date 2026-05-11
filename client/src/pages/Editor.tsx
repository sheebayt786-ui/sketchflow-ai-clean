import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { SceneAnimator } from "@/components/SceneAnimator";
import { NarrationPlayer } from "@/components/NarrationPlayer";
import { ExportModal, ExportSuccessNotification } from "@/components/ExportModal";
import { SceneEditorModal } from "@/components/SceneEditorModal";
import {
  Play,
  Pause,
  Download,
  Settings,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Editor() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [projectId, setProjectId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [exportedQuality, setExportedQuality] = useState<string>("");
  const [showSceneEditor, setShowSceneEditor] = useState(false);
  const [editingSceneIndex, setEditingSceneIndex] = useState<number | null>(null);

  // Get project from URL or session
  useEffect(() => {
    // In production, get from URL params
    // For now, use a mock project ID
    setProjectId(1);
  }, []);

  // Queries
  const { data: project, isLoading: projectLoading } = trpc.projects.get.useQuery(
    { id: projectId || 0 },
    { enabled: !!projectId }
  );

  const { data: scenes, isLoading: scenesLoading } = trpc.scenes.list.useQuery(
    { projectId: projectId || 0 },
    { enabled: !!projectId }
  );

  if (projectLoading || scenesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading project...</div>
      </div>
    );
  }

  if (!project || !scenes) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Project not found</h2>
          <Button onClick={() => setLocation("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentScene = scenes[currentSceneIndex];
  const totalDuration = scenes.reduce((sum, s) => sum + (s.duration || 5), 0);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleAnimationComplete = () => {
    if (currentSceneIndex < scenes.length - 1) {
      handleNextScene();
    } else {
      setIsPlaying(false);
    }
  };

  const handleNextScene = () => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(currentSceneIndex - 1);
    }
  };

  const handleExport = async (options: {
    quality: "720p" | "1080p" | "4K";
    includeWatermark: boolean;
  }) => {
    try {
      // In production, call export mutation via tRPC
      toast.success("Export started! Your video will be ready soon.");
      
      // Simulate export completion
      setTimeout(() => {
        setExportedVideoUrl("/api/videos/sample.mp4");
        setExportedQuality(options.quality);
        setShowExportModal(false);
      }, 2000);
    } catch (error) {
      toast.error("Export failed. Please try again.");
    }
  };

  const handleEditScene = (index: number) => {
    setEditingSceneIndex(index);
    setShowSceneEditor(true);
  };

  const handleSaveScene = (updatedScene: any) => {
    if (editingSceneIndex !== null && scenes[editingSceneIndex]) {
      scenes[editingSceneIndex] = updatedScene;
      toast.success("Scene updated successfully");
      setShowSceneEditor(false);
      setEditingSceneIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project?.title}</h1>
            <p className="text-sm text-muted-foreground">
              {scenes.length} scenes • {totalDuration}s total
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLocation("/dashboard")}
            >
              Back
            </Button>
            <Button
              className="gap-2"
              onClick={() => setShowExportModal(true)}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Animation Preview */}
          <Card className="p-6">
            <div className="aspect-video bg-card/50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              {currentScene ? (
                <SceneAnimator
                  sceneTitle={currentScene.title}
                  narrationText={currentScene.narrationText}
                  keywords={currentScene.illustrationKeywords || []}
                  duration={currentScene.duration || 5}
                  isPlaying={isPlaying}
                  onComplete={handleAnimationComplete}
                  whiteboardStyle={project.whiteboardStyle || "sketch"}
                />
              ) : (
                <div className="text-muted-foreground">No scene selected</div>
              )}
            </div>

            {/* Playback Controls */}
            <div className="flex gap-2 items-center justify-center mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevScene}
                disabled={currentSceneIndex === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handlePlayPause}
                className="gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Play
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextScene}
                disabled={currentSceneIndex === scenes.length - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Scene Details */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Scene Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Title</label>
                <p className="font-medium">{currentScene?.title}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  Illustration Keywords
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentScene?.illustrationKeywords?.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  Duration
                </label>
                <p className="font-medium">{currentScene?.duration}s</p>
              </div>
            </div>
          </Card>

          {/* Narration Player */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Narration</h3>
            <NarrationPlayer
              narrationText={currentScene?.narrationText || ""}
              voice={project.voiceStyle}
              isPlaying={isPlaying}
              duration={currentScene?.duration || 5}
              onComplete={handleAnimationComplete}
            />
          </Card>
        </div>

        {/* Timeline Sidebar */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Timeline</h3>
            <div className="text-sm text-muted-foreground mb-4">
              Scene {currentSceneIndex + 1} of {scenes.length}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {scenes.map((scene, index) => (
                <motion.div key={index} className="space-y-2">
                  <motion.button
                    onClick={() => setCurrentSceneIndex(index)}
                    whileHover={{ scale: 1.02 }}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-smooth ${
                      currentSceneIndex === index
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="font-medium text-sm line-clamp-1">
                      {scene.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {scene.duration}s
                    </div>
                  </motion.button>
                  {currentSceneIndex === index && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => handleEditScene(index)}
                    >
                      <Settings className="h-3 w-3" />
                      Edit Scene
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-4 bg-card/50">
            <h3 className="font-semibold mb-4">Project Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Scenes:</span>
                <span className="font-medium">{scenes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Duration:</span>
                <span className="font-medium">{totalDuration}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Voice:</span>
                <span className="font-medium capitalize">
                  {project.voiceStyle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Style:</span>
                <span className="font-medium capitalize">
                  {project.whiteboardStyle}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        projectTitle={project?.title || "Project"}
        totalDuration={totalDuration}
        userPlanTier={user?.role === "admin" ? "Growth" : "Free"}
        onExport={handleExport}
        onClose={() => setShowExportModal(false)}
      />

      {/* Export Success Notification */}
      {exportedVideoUrl && (
        <ExportSuccessNotification
          videoUrl={exportedVideoUrl}
          quality={exportedQuality}
          onDownload={() => {
            window.open(exportedVideoUrl, "_blank");
            setExportedVideoUrl(null);
          }}
        />
      )}

      {/* Scene Editor Modal */}
      {currentScene && editingSceneIndex !== null && (
        <SceneEditorModal
          isOpen={showSceneEditor}
          scene={{
            sceneNumber: editingSceneIndex + 1,
            title: currentScene.title,
            narrationText: currentScene.narrationText,
            illustrationKeywords: currentScene.illustrationKeywords || [],
            duration: currentScene.duration || 5,
          }}
          onSave={handleSaveScene}
          onClose={() => setShowSceneEditor(false)}
        />
      )}
    </div>
  );
}
