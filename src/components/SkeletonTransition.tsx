import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonTransitionProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Crossfade transition: skeleton fades out while content fades in simultaneously.
 * No blank gap between states.
 */
export function SkeletonTransition({ isLoading, skeleton, children, className }: SkeletonTransitionProps) {
  const [phase, setPhase] = useState<'skeleton' | 'crossfade' | 'content'>('skeleton');

  useEffect(() => {
    if (!isLoading && phase === 'skeleton') {
      setPhase('crossfade');
      const timer = setTimeout(() => setPhase('content'), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, phase]);

  if (phase === 'content') {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative", className)}>
      {/* Skeleton layer — fades out */}
      <div
        className={cn(
          "transition-opacity duration-300 ease-out",
          phase === 'crossfade' ? 'opacity-0' : 'opacity-100'
        )}
      >
        {skeleton}
      </div>

      {/* Content layer — fades in on top */}
      {phase === 'crossfade' && (
        <div className="absolute inset-0 animate-[skeleton-reveal_0.3s_ease-out_forwards]">
          {children}
        </div>
      )}
    </div>
  );
}
