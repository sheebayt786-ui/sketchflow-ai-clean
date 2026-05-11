import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface SceneAnimatorProps {
  sceneTitle: string;
  narrationText: string;
  keywords: string[];
  duration: number;
  whiteboardStyle: "sketch" | "canvas" | "chalkboard";
  isPlaying: boolean;
  onComplete?: () => void;
}

/**
 * SVG-based whiteboard animation component
 * Renders hand-drawn style animations with stroke reveal effects
 */
export function SceneAnimator({
  sceneTitle,
  narrationText,
  keywords,
  duration,
  whiteboardStyle,
  isPlaying,
  onComplete,
}: SceneAnimatorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [progress, setProgress] = useState(0);

  // Get whiteboard style colors
  const getStyleColors = () => {
    switch (whiteboardStyle) {
      case "sketch":
        return {
          background: "#ffffff",
          stroke: "#1a1a1a",
          fill: "none",
          opacity: 0.8,
        };
      case "canvas":
        return {
          background: "#f5f5f0",
          stroke: "#2c2c2c",
          fill: "none",
          opacity: 0.85,
        };
      case "chalkboard":
        return {
          background: "#1a1a1a",
          stroke: "#ffffff",
          fill: "none",
          opacity: 0.9,
        };
      default:
        return {
          background: "#ffffff",
          stroke: "#1a1a1a",
          fill: "none",
          opacity: 0.8,
        };
    }
  };

  const colors = getStyleColors();

  // Generate simple SVG elements based on keywords
  const generateSVGElements = () => {
    const elements = [];
    const centerX = 200;
    const centerY = 150;
    const spacing = 80;

    // Add title
    elements.push(
      <text
        key="title"
        x={centerX}
        y={40}
        textAnchor="middle"
        fontSize="24"
        fontWeight="bold"
        fill={colors.stroke}
        className="animate-fade-in"
      >
        {sceneTitle}
      </text>
    );

    // Generate simple geometric shapes for each keyword
    keywords.slice(0, 4).forEach((keyword, index) => {
      const x = centerX + (index % 2) * spacing - spacing / 2;
      const y = centerY + Math.floor(index / 2) * spacing;

      // Alternate between circle, square, and triangle
      const shapeType = index % 3;

      switch (shapeType) {
        case 0:
          // Circle
          elements.push(
            <circle
              key={`shape-${index}`}
              cx={x}
              cy={y}
              r="30"
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth="2"
              opacity={colors.opacity}
              className="stroke-animation"
              style={{
                strokeDasharray: 188.4,
                strokeDashoffset: 188.4,
                animation: `drawStroke ${duration}s ease-in-out forwards`,
                animationDelay: `${(index * duration) / keywords.length}s`,
              }}
            />
          );
          break;
        case 1:
          // Square
          elements.push(
            <rect
              key={`shape-${index}`}
              x={x - 25}
              y={y - 25}
              width="50"
              height="50"
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth="2"
              opacity={colors.opacity}
              className="stroke-animation"
              style={{
                strokeDasharray: 200,
                strokeDashoffset: 200,
                animation: `drawStroke ${duration}s ease-in-out forwards`,
                animationDelay: `${(index * duration) / keywords.length}s`,
              }}
            />
          );
          break;
        case 2:
          // Triangle
          elements.push(
            <polygon
              key={`shape-${index}`}
              points={`${x},${y - 30} ${x + 30},${y + 20} ${x - 30},${y + 20}`}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth="2"
              opacity={colors.opacity}
              className="stroke-animation"
              style={{
                strokeDasharray: 180,
                strokeDashoffset: 180,
                animation: `drawStroke ${duration}s ease-in-out forwards`,
                animationDelay: `${(index * duration) / keywords.length}s`,
              }}
            />
          );
          break;
      }

      // Add keyword label
      elements.push(
        <text
          key={`label-${index}`}
          x={x}
          y={y + 50}
          textAnchor="middle"
          fontSize="12"
          fill={colors.stroke}
          opacity="0.7"
          className="animate-fade-in"
          style={{
            animation: `fadeIn ${0.5}s ease-in forwards`,
            animationDelay: `${(index * duration) / keywords.length + 0.2}s`,
            opacity: 0,
          }}
        >
          {keyword}
        </text>
      );
    });

    return elements;
  };

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    let animationFrame: number;
    let startTime: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const newProgress = Math.min(elapsed / (duration * 1000), 1);

      setProgress(newProgress);

      if (newProgress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, duration, onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg overflow-hidden">
      <style>{`
        @keyframes drawStroke {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes fadeIn {
          to {
            opacity: 0.7;
          }
        }
        .stroke-animation {
          transition: stroke-dashoffset 0.3s ease-in-out;
        }
      `}</style>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 400 300"
        style={{
          backgroundColor: colors.background,
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      >
        {generateSVGElements()}
      </svg>

      {/* Progress indicator */}
      {isPlaying && (
        <div className="absolute bottom-4 left-4 right-4 h-1 bg-background/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: "0%" }}
            animate={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Simple SVG generator for whiteboard illustrations
 * Creates basic shapes and icons based on keywords
 */
export function generateWhiteboardSVG(
  keywords: string[],
  style: "sketch" | "canvas" | "chalkboard"
): string {
  const colors =
    style === "chalkboard"
      ? { bg: "#1a1a1a", stroke: "#ffffff" }
      : { bg: "#ffffff", stroke: "#1a1a1a" };

  let svg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="${colors.bg}"/>`;

  // Add simple shapes for each keyword
  keywords.slice(0, 4).forEach((keyword, index) => {
    const x = 100 + (index % 2) * 150;
    const y = 80 + Math.floor(index / 2) * 100;

    svg += `<circle cx="${x}" cy="${y}" r="30" fill="none" stroke="${colors.stroke}" stroke-width="2" opacity="0.8"/>
      <text x="${x}" y="${y + 50}" text-anchor="middle" font-size="12" fill="${colors.stroke}" opacity="0.7">${keyword}</text>`;
  });

  svg += `</svg>`;
  return svg;
}
