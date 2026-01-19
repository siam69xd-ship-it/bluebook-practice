import { cn } from '@/lib/utils';

export function PracticeSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-screen gradient-hero", className)}>
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="w-16 h-8 rounded bg-muted animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
              <div className="w-20 h-5 rounded bg-muted animate-pulse" />
            </div>
            <div className="w-16" />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Title skeleton */}
        <div className="text-center mb-10">
          <div className="w-64 h-10 rounded bg-muted animate-pulse mx-auto mb-3" />
          <div className="w-80 h-5 rounded bg-muted animate-pulse mx-auto max-w-full" />
        </div>

        {/* Difficulty filter skeleton */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded bg-muted animate-pulse" />
            <div className="w-32 h-5 rounded bg-muted animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Practice all button skeleton */}
        <div className="mb-8">
          <div className="h-20 rounded-2xl bg-muted/50 animate-pulse" />
        </div>

        {/* Topics skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded bg-muted animate-pulse" />
            <div className="w-16 h-5 rounded bg-muted animate-pulse" />
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 rounded-2xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}

export function QuizSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header skeleton */}
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-muted animate-pulse" />
            <div className="w-40 h-5 rounded bg-muted animate-pulse" />
          </div>
          <div className="w-20 h-6 rounded bg-muted animate-pulse" />
          <div className="w-24 h-8 rounded bg-muted animate-pulse" />
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="flex flex-1">
        {/* Left panel - passage */}
        <div className="flex-1 p-6 border-r border-border">
          <div className="space-y-3">
            <div className="w-3/4 h-4 rounded bg-muted animate-pulse" />
            <div className="w-full h-4 rounded bg-muted animate-pulse" />
            <div className="w-5/6 h-4 rounded bg-muted animate-pulse" />
            <div className="w-full h-4 rounded bg-muted animate-pulse" />
            <div className="w-2/3 h-4 rounded bg-muted animate-pulse" />
            <div className="h-4" />
            <div className="w-full h-4 rounded bg-muted animate-pulse" />
            <div className="w-4/5 h-4 rounded bg-muted animate-pulse" />
            <div className="w-full h-4 rounded bg-muted animate-pulse" />
            <div className="w-3/4 h-4 rounded bg-muted animate-pulse" />
          </div>
        </div>
        
        {/* Right panel - question */}
        <div className="flex-1 p-6">
          <div className="space-y-4">
            <div className="w-full h-5 rounded bg-muted animate-pulse" />
            <div className="w-3/4 h-5 rounded bg-muted animate-pulse" />
            <div className="h-6" />
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-border">
                <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 h-4 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}