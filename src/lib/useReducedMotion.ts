"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/**
 * Tracks the user's prefers-reduced-motion setting reactively via
 * useSyncExternalStore — the React-recommended way to subscribe to an external
 * store like matchMedia. Returns `false` during SSR (the server snapshot) so
 * markup stays stable, then reflects the real value after hydration.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches, // client snapshot
    () => false // server snapshot
  );
}

/** Synchronous read for use inside effects / event handlers. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(QUERY).matches;
}
