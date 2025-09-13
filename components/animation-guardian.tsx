"use client"

import { useEffect } from "react"

const SELECTOR = [
  '[class*="animate-fade-in"]',
  '[class*="animate-slide-in"]',
  '[class*="animate-rotate"]',
  '.animate-slide-up',
  '.animate-zoom-in',
  '.animate-bounce-in',
  // no pre-ocultamos pero sí forzamos estado final en utilidades arbitrarias si las usan de entrada
  '[class*="animate-[fade"], [class*="animate-[slide"], [class*="animate-[zoom"], [class*="animate-[bounce"], [class*="animate-[rotate"]',
].join(', ')

export function AnimationGuardian() {
  useEffect(() => {
    const isEntryAnim = (el: Element) => (el as HTMLElement).matches?.(SELECTOR)

    // 1) Enforce visible state after animation
    const onEnd = (e: AnimationEvent) => {
      const target = e.target as HTMLElement
      if (!target || !isEntryAnim(target)) return
      target.style.opacity = "1"
      target.style.animationPlayState = "running"
    }

    document.addEventListener("animationend", onEnd, true)
    document.addEventListener("animationcancel", onEnd, true)

    // 2) For elements NOT using AnimatedSection, pause/hide until in viewport
    const processed = new WeakSet<Element>()
    const shouldGuard = (el: Element) => isEntryAnim(el) && !(el as HTMLElement).hasAttribute("data-animated")

    const reveal = (el: HTMLElement) => {
      // No forzamos opacity:1 aquí; dejamos que la animación haga el fade-in desde 0 a 1
      el.style.animationPlayState = "running"
    }

    const hide = (el: HTMLElement) => {
      el.style.opacity = "0"
      el.style.animationPlayState = "paused"
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement
          if (!shouldGuard(el)) continue
          if (entry.isIntersecting) {
            reveal(el)
            io.unobserve(el)
          }
        }
      },
      { threshold: 0.15 }
    )

    const prime = (root: ParentNode) => {
      const nodes = root.querySelectorAll(SELECTOR)
      nodes.forEach((el) => {
        if (!shouldGuard(el) || processed.has(el)) return
        processed.add(el)
        const hel = el as HTMLElement
        // Hide initially, will reveal when intersecting
        hide(hel)
        io.observe(hel)
      })
    }

    // Prime existing nodes
    prime(document)

    // Watch for new nodes
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((n) => {
            if (n.nodeType === Node.ELEMENT_NODE) {
              const el = n as Element
              if (shouldGuard(el)) {
                prime(el)
              } else {
                prime(el)
              }
            }
          })
        }
      }
    })
    mo.observe(document.documentElement, { childList: true, subtree: true })

    return () => {
      document.removeEventListener("animationend", onEnd, true)
      document.removeEventListener("animationcancel", onEnd, true)
      mo.disconnect()
      io.disconnect()
    }
  }, [])

  return null
}
