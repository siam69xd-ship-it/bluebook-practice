// Route prefetching utilities for instant page loads

// Store prefetch promises to avoid duplicate fetches
const prefetchedRoutes = new Set<string>();

// Lazy import functions for each route
const routeImports: Record<string, () => Promise<unknown>> = {
  '/practice': () => import('@/pages/Practice'),
  '/quiz': () => import('@/pages/Quiz'),
  '/timed-quiz': () => import('@/pages/TimedQuiz'),
  '/math': () => import('@/pages/Math'),
  '/auth': () => import('@/pages/Auth'),
};

/**
 * Prefetch a route's code bundle on hover/focus
 * This makes navigation feel instant
 */
export function prefetchRoute(path: string): void {
  if (prefetchedRoutes.has(path)) return;
  
  const importFn = routeImports[path];
  if (importFn) {
    prefetchedRoutes.add(path);
    // Use requestIdleCallback for non-blocking prefetch, fallback to setTimeout
    const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
    schedule(() => {
      importFn().catch(() => {
        // Remove from set if prefetch fails so it can be retried
        prefetchedRoutes.delete(path);
      });
    });
  }
}

/**
 * Prefetch multiple routes at once
 */
export function prefetchRoutes(paths: string[]): void {
  paths.forEach(prefetchRoute);
}

/**
 * Check if a route has been prefetched
 */
export function isRoutePrefetched(path: string): boolean {
  return prefetchedRoutes.has(path);
}
