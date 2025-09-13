"use client"

import type React from "react"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  animation?: "fade-up" | "slide-left" | "slide-right" | "zoom-in" | "bounce-in"
  delay?: number
  threshold?: number
  style?: React.CSSProperties
}

export function AnimatedSection({
  children,
  className,
  animation = "fade-up",
  delay = 0,
  threshold = 0.2,
  style,
}: AnimatedSectionProps) {
  const { elementRef, isVisible } = useScrollAnimation({ threshold })

  const animationClasses = {
    "fade-up": "animate-fade-in-up",
    "slide-left": "animate-slide-in-left",
    "slide-right": "animate-slide-in-right",
    "zoom-in": "animate-zoom-in",
    "bounce-in": "animate-bounce-in",
  }

  const delayClasses = {
    0: "",
    100: "animation-delay-100",
    200: "animation-delay-200",
    300: "animation-delay-300",
    400: "animation-delay-400",
    500: "animation-delay-500",
    600: "animation-delay-600",
    700: "animation-delay-700",
    800: "animation-delay-800",
  }

  return (
    <div
      ref={elementRef}
      data-animated
      data-visible={isVisible ? "true" : "false"}
      className={cn(
        "will-change-transform will-change-opacity",
        !isVisible && "translate-y-4 anim-paused",
        isVisible && animationClasses[animation],
        isVisible && "anim-running",
        isVisible && delayClasses[delay as keyof typeof delayClasses],
        className,
      )}
      style={{ ...(style || {}) }}
    >
      {children}
    </div>
  )
}
