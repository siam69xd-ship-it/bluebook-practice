import { cn } from '@/lib/utils';

const skeletonPulse = "animate-[pulse_2.5s_cubic-bezier(0.4,0,0.6,1)_infinite] opacity-60";

export function PracticeSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-screen gradient-hero", className)}>
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className={cn("w-16 h-8 rounded bg-muted", skeletonPulse)} />
            <div className="flex items-center gap-2">
              <div className={cn("w-8 h-8 rounded-lg bg-muted", skeletonPulse)} />
              <div className={cn("w-20 h-5 rounded bg-muted", skeletonPulse)} />
            </div>
            <div className="w-16" />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Title skeleton */}
        <div className="text-center mb-10">
          <div className={cn("w-64 h-10 rounded bg-muted mx-auto mb-3", skeletonPulse)} />
          <div className={cn("w-80 h-5 rounded bg-muted mx-auto max-w-full", skeletonPulse)} />
        </div>

        {/* Difficulty filter skeleton */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className={cn("w-5 h-5 rounded bg-muted", skeletonPulse)} />
            <div className={cn("w-32 h-5 rounded bg-muted", skeletonPulse)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn("h-24 rounded-2xl bg-muted/50", skeletonPulse)} />
            ))}
          </div>
        </div>

        {/* Practice all button skeleton */}
        <div className="mb-8">
          <div className={cn("h-20 rounded-2xl bg-muted/50", skeletonPulse)} />
        </div>

        {/* Topics skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn("w-5 h-5 rounded bg-muted", skeletonPulse)} />
            <div className={cn("w-16 h-5 rounded bg-muted", skeletonPulse)} />
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={cn("h-16 rounded-2xl bg-muted/30", skeletonPulse)} />
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
            <div className={cn("w-8 h-8 rounded-md bg-muted", skeletonPulse)} />
            <div className={cn("w-40 h-5 rounded bg-muted", skeletonPulse)} />
          </div>
          <div className={cn("w-20 h-6 rounded bg-muted", skeletonPulse)} />
          <div className={cn("w-24 h-8 rounded bg-muted", skeletonPulse)} />
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="flex flex-1">
        {/* Left panel - passage */}
        <div className="flex-1 p-6 border-r border-border">
          <div className="space-y-3">
            <div className={cn("w-3/4 h-4 rounded bg-muted", skeletonPulse)} />
            <div className={cn("w-full h-4 rounded bg-muted", skeletonPulse)} />
            <div className={cn("w-5/6 h-4 rounded bg-muted", skeletonPulse)} />
            <div className={cn("w-full h-4 rounded bg-muted", skeletonPulse)} />
            <div className={cn("w-2/3 h-4 rounded bg-muted", skeletonPulse)} />
            <div className="h-4" />
            <div className={cn("w-full h-4 rounded bg-muted", skeletonPulse)} />
            <div className={cn("w-4/5 h-4 rounded bg-muted", skeletonPulse)} />
            <div className={cn("w-full h-4 rounded bg-muted", skeletonPulse)} />
            <div className={cn("w-3/4 h-4 rounded bg-muted", skeletonPulse)} />
          </div>
        </div>
        
        {/* Right panel - question */}
        <div className="flex-1 p-6">
          <div className="space-y-4">
            <div className={cn("w-full h-5 rounded bg-muted", skeletonPulse)} />
            <div className={cn("w-3/4 h-5 rounded bg-muted", skeletonPulse)} />
            <div className="h-6" />
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-border">
                <div className={cn("w-6 h-6 rounded-full bg-muted", skeletonPulse)} />
                <div className={cn("flex-1 h-4 rounded bg-muted", skeletonPulse)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MathSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("h-screen w-screen overflow-hidden flex flex-col bg-white", className)}>
      {/* Header skeleton */}
      <header className="h-[60px] bg-[#1e2b3e] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className={cn("w-8 h-8 rounded bg-white/20", skeletonPulse)} />
          <div className={cn("w-32 h-5 rounded bg-white/20", skeletonPulse)} />
        </div>
        <div className={cn("w-20 h-8 rounded-full bg-white/30", skeletonPulse)} />
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={cn("w-12 h-10 rounded bg-white/20", skeletonPulse)} />
          ))}
        </div>
      </header>

      {/* Main Content - Split Pane */}
      <div className="flex-1 flex">
        {/* Left Pane - Question */}
        <div className="flex-1 p-8 border-r border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className={cn("w-24 h-4 rounded bg-muted", skeletonPulse)} />
            <div className={cn("w-6 h-6 rounded bg-muted", skeletonPulse)} />
          </div>
          <div className="space-y-3">
            <div className={cn("w-full h-5 rounded bg-muted", skeletonPulse)} />
            <div className={cn("w-5/6 h-5 rounded bg-muted", skeletonPulse)} />
            <div className={cn("w-4/5 h-5 rounded bg-muted", skeletonPulse)} />
            <div className="h-4" />
            <div className={cn("w-3/4 h-5 rounded bg-muted", skeletonPulse)} />
            <div className={cn("w-2/3 h-5 rounded bg-muted", skeletonPulse)} />
          </div>
        </div>

        {/* Right Pane - Options */}
        <div className="flex-1 p-8">
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-slate-200">
                <div className={cn("w-8 h-8 rounded-full bg-muted", skeletonPulse)} />
                <div className={cn("flex-1 h-5 rounded bg-muted", skeletonPulse)} />
              </div>
            ))}
            <div className={cn("w-full h-10 rounded bg-muted/70 mt-6", skeletonPulse)} />
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <footer className="h-[70px] bg-white border-t border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
        <div className={cn("w-40 h-10 rounded-lg bg-muted", skeletonPulse)} />
        <div className="flex items-center gap-3">
          <div className={cn("w-20 h-9 rounded bg-muted", skeletonPulse)} />
          <div className={cn("w-20 h-9 rounded-full bg-muted", skeletonPulse)} />
        </div>
      </footer>
    </div>
  );
}

export function HomeSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30", className)}>
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-11 h-11 rounded-xl bg-muted", skeletonPulse)} />
              <div>
                <div className={cn("w-24 h-5 rounded bg-muted mb-1", skeletonPulse)} />
                <div className={cn("w-20 h-3 rounded bg-muted", skeletonPulse)} />
              </div>
            </div>
            <div className={cn("w-20 h-8 rounded bg-muted", skeletonPulse)} />
          </nav>
        </div>
      </header>

      <main>
        {/* Hero skeleton */}
        <section className="container mx-auto px-4 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className={cn("w-48 h-8 rounded-full bg-muted mx-auto mb-6", skeletonPulse)} />
            <div className={cn("w-96 max-w-full h-12 rounded bg-muted mx-auto mb-3", skeletonPulse)} />
            <div className={cn("w-80 max-w-full h-12 rounded bg-muted mx-auto mb-6", skeletonPulse)} />
            <div className={cn("w-full max-w-2xl h-6 rounded bg-muted mx-auto mb-2", skeletonPulse)} />
            <div className={cn("w-3/4 max-w-xl h-6 rounded bg-muted mx-auto mb-10", skeletonPulse)} />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className={cn("w-40 h-14 rounded-lg bg-muted", skeletonPulse)} />
              <div className={cn("w-40 h-14 rounded-lg bg-muted", skeletonPulse)} />
            </div>
          </div>
        </section>

        {/* Stats skeleton */}
        <section className="container mx-auto px-4 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
                  <div className={cn("w-12 h-12 rounded-xl bg-muted mb-4", skeletonPulse)} />
                  <div className={cn("w-16 h-8 rounded bg-muted mb-2", skeletonPulse)} />
                  <div className={cn("w-24 h-4 rounded bg-muted", skeletonPulse)} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features skeleton */}
        <section className="container mx-auto px-4 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className={cn("w-72 h-8 rounded bg-muted mx-auto mb-3", skeletonPulse)} />
              <div className={cn("w-64 h-5 rounded bg-muted mx-auto", skeletonPulse)} />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
                  <div className={cn("w-14 h-14 rounded-xl bg-muted mb-5", skeletonPulse)} />
                  <div className={cn("w-28 h-5 rounded bg-muted mb-2", skeletonPulse)} />
                  <div className={cn("w-full h-4 rounded bg-muted mb-1", skeletonPulse)} />
                  <div className={cn("w-3/4 h-4 rounded bg-muted", skeletonPulse)} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer skeleton */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-lg bg-muted", skeletonPulse)} />
              <div className={cn("w-20 h-5 rounded bg-muted", skeletonPulse)} />
            </div>
            <div className={cn("w-64 h-4 rounded bg-muted", skeletonPulse)} />
          </div>
        </div>
      </footer>
    </div>
  );
}