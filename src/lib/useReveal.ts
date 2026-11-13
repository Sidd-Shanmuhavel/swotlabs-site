"use client";

import { useEffect, useRef } from "react";

/** Hard ceiling on cumulative stagger, per design.md § Motion. */
const MAX_STAGGER = 500;

type RevealOptions = {
  /** Stagger between direct children that carry the `data-reveal-child` attr (ms). */
  stagger?: number;
  /** Delay before the container itself reveals (ms). */
  delay?: number;
  /** Fraction of the element visible before triggering. */
  threshold?: number;
  /** Reveal only once (default) or every time it enters the viewport. */
  once?: boolean;
};

/**
 * Lightweight IntersectionObserver-based reveal.
 *
 * Add the returned ref to a container. The container and any descendant
 * marked with `data-reveal-child` start hidden (via the `.reveal` class) and
 * animate in when scrolled into view. Pure CSS transitions — respects
 * prefers-reduced-motion automatically through globals.css.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(
  options: RevealOptions = {}
) {
  const { stagger = 90, delay = 0, threshold = 0.15, once = true } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = Array.from(
      el.querySelectorAll<HTMLElement>("[data-reveal-child]")
    );

    // Apply stagger delays up front so they're ready when .is-visible lands.
    // Total stagger is capped at 500ms: past that the section feels slow to
    // settle and the last item reads as lagging rather than sequenced.
    children.forEach((child, i) => {
      const offset = Math.min(i * stagger, MAX_STAGGER);
      child.style.setProperty("--reveal-delay", `${delay + offset}ms`);
    });
    if (delay) el.style.setProperty("--reveal-delay", `${delay}ms`);

    const reveal = () => {
      el.classList.add("is-visible");
      children.forEach((c) => c.classList.add("is-visible"));
    };
    const hide = () => {
      el.classList.remove("is-visible");
      children.forEach((c) => c.classList.remove("is-visible"));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            if (once) observer.disconnect();
          } else if (!once) {
            hide();
          }
        });
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [stagger, delay, threshold, once]);

  return ref;
}
