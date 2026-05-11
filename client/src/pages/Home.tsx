import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowRight, Zap, Sparkles, Play, Users, Layers, Download } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Script Generation",
    description: "Transform your ideas into structured video scripts with intelligent scene splitting and narration keywords.",
  },
  {
    icon: Layers,
    title: "SVG Whiteboard Animation",
    description: "Beautiful hand-drawn stroke reveal effects with automatic illustration matching for each scene.",
  },
  {
    icon: Zap,
    title: "Instant Video Creation",
    description: "From script to polished MP4 in minutes. No manual animation required.",
  },
  {
    icon: Users,
    title: "Multiple Whiteboard Styles",
    description: "Choose from sketch, canvas, and chalkboard styles to match your brand.",
  },
  {
    icon: Play,
    title: "Voice Narration",
    description: "Select male or female voice with automatic sync to your animation timeline.",
  },
  {
    icon: Download,
    title: "Export & Share",
    description: "Download as MP4 with optional watermark removal based on your plan.",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out SketchFlow AI",
    features: [
      "1 video per month",
      "Sketch style only",
      "Watermark included",
      "720p export",
      "Community support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$29",
    period: "per month",
    description: "Great for content creators",
    features: [
      "5 videos per month",
      "All 3 whiteboard styles",
      "No watermark",
      "720p export",
      "Email support",
      "Basic analytics",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Creator",
    price: "$79",
    period: "per month",
    description: "For serious video creators",
    features: [
      "20 videos per month",
      "All 3 whiteboard styles",
      "No watermark",
      "1080p export",
      "Priority email support",
      "Advanced analytics",
      "Custom voice settings",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Growth",
    price: "$199",
    period: "per month",
    description: "For agencies and teams",
    features: [
      "Unlimited videos",
      "All 3 whiteboard styles",
      "No watermark",
      "4K export",
      "24/7 priority support",
      "Team collaboration",
      "API access",
      "Custom branding",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const galleryExamples = [
  {
    title: "Educational Explainer",
    style: "Sketch",
    duration: "2:45",
  },
  {
    title: "Product Demo",
    style: "Canvas",
    duration: "1:30",
  },
  {
    title: "Business Pitch",
    style: "Chalkboard",
    duration: "3:15",
  },
  {
    title: "Tutorial Series",
    style: "Sketch",
    duration: "4:00",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md transition-smooth">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent" />
            <span className="text-xl font-bold">SketchFlow AI</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="default">Dashboard</Button>
              </Link>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="ghost">Sign In</Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button variant="default">Get Started</Button>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <motion.div
          className="container text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
            Create Whiteboard Videos
            <span className="gradient-text block">in Minutes</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your ideas into professional whiteboard explainer videos using AI. No animation skills required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/script-input">
              <Button size="lg" className="gap-2">
                Start Creating Free <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 border-t border-border/40">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create stunning whiteboard videos
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="p-6 h-full hover:shadow-lg-elegant transition-smooth hover:border-accent/50">
                    <Icon className="h-12 w-12 text-accent mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 sm:py-32 border-t border-border/40 bg-card/30">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Example Videos</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what you can create with SketchFlow AI
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {galleryExamples.map((example, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="overflow-hidden hover:shadow-lg-elegant transition-smooth group cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:from-accent/30 group-hover:to-accent/10 transition-smooth">
                    <Play className="h-12 w-12 text-accent/50 group-hover:text-accent transition-smooth" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{example.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{example.style}</span>
                      <span>{example.duration}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 sm:py-32 border-t border-border/40">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your needs
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {pricingTiers.map((tier, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card
                  className={`p-8 h-full flex flex-col transition-smooth ${
                    tier.highlighted
                      ? "ring-2 ring-accent relative"
                      : "hover:shadow-lg-elegant"
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{tier.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground">/{tier.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <a href={getLoginUrl()}>
                    <Button
                      className="w-full"
                      variant={tier.highlighted ? "default" : "outline"}
                    >
                      {tier.cta}
                    </Button>
                  </a>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 border-t border-border/40 bg-gradient-to-b from-accent/10 to-transparent">
        <motion.div
          className="container text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-6">Ready to Create?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators using SketchFlow AI to produce professional whiteboard videos
          </p>
          <Link href="/script-input">
            <Button size="lg" className="gap-2">
              Start Free Today <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded-lg bg-accent" />
                <span className="font-bold">SketchFlow AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Create professional whiteboard videos in minutes
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-smooth">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Gallery</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-smooth">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-smooth">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 SketchFlow AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
