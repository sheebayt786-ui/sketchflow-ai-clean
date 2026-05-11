import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Plus,
  Play,
  Trash2,
  Settings,
  Zap,
  TrendingUp,
  FileText,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // Queries
  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: subscription } = trpc.subscription.getCurrentPlan.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: credits } = trpc.credits.getBalance.useQuery(
    undefined,
    { enabled: !!user }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Please log in to access your dashboard</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-card/30 sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent" />
            <span className="text-xl font-bold">SketchFlow AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}!</h1>
              <p className="text-muted-foreground">
                Create and manage your whiteboard videos
              </p>
            </div>
            <Button
              size="lg"
              className="gap-2"
              onClick={() => setShowNewProjectModal(true)}
            >
              <Plus className="h-5 w-5" />
              New Project
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Plan</p>
                  <h3 className="text-2xl font-bold capitalize">
                    {subscription?.tier || "Free"}
                  </h3>
                </div>
                <TrendingUp className="h-8 w-8 text-accent/50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Credits</p>
                  <h3 className="text-2xl font-bold">{credits?.balance || 0}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {credits?.usedThisMonth || 0} used this month
                  </p>
                </div>
                <Zap className="h-8 w-8 text-accent/50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Videos</p>
                  <h3 className="text-2xl font-bold">{projects?.length || 0}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total created
                  </p>
                </div>
                <Play className="h-8 w-8 text-accent/50" />
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Your Projects</h2>
            <p className="text-muted-foreground">
              Manage and view all your created videos
            </p>
          </div>

          {projectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-40 bg-muted rounded-lg mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </Card>
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg-elegant transition-smooth group cursor-pointer h-full flex flex-col">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:from-accent/30 group-hover:to-accent/10 transition-smooth relative">
                      <Play className="h-12 w-12 text-accent/50 group-hover:text-accent transition-smooth" />
                      <div className="absolute top-2 right-2 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs font-semibold capitalize">
                        {project.status}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold mb-1 line-clamp-2">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="space-y-2 mb-4 mt-auto text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          <span className="capitalize">{project.whiteboardStyle}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/editor/${project.id}`} className="flex-1">
                          <Button size="sm" variant="default" className="w-full">
                            Edit
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Play className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first whiteboard video to get started
              </p>
              <Button onClick={() => setShowNewProjectModal(true)}>
                Create Project
              </Button>
            </Card>
          )}
        </motion.div>

        {/* Upgrade CTA */}
        {subscription?.tier === "free" && (
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-8 bg-gradient-to-r from-accent/10 to-accent/5 border-accent/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Ready to unlock more?</h3>
                  <p className="text-muted-foreground">
                    Upgrade to create unlimited videos and remove watermarks
                  </p>
                </div>
                <Link href="/pricing">
                  <Button size="lg">View Plans</Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* New Project Modal (simplified) */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Title</label>
                <input
                  type="text"
                  placeholder="My Awesome Video"
                  className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Whiteboard Style</label>
                <select className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent">
                  <option>sketch</option>
                  <option>canvas</option>
                  <option>chalkboard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Voice Style</label>
                <select className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent">
                  <option>male</option>
                  <option>female</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNewProjectModal(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1">Create</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
