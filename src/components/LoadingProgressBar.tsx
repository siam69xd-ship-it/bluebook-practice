import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { subscribeToLoadingProgress } from '@/lib/questionUtils';

interface LoadingProgressBarProps {
  isLoading: boolean;
  onLoadingComplete?: () => void;
  className?: string;
}

export function LoadingProgressBar({ isLoading, onLoadingComplete, className }: LoadingProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [completing, setCompleting] = useState(false);
  const animatedProgress = useRef(0);
  const animationFrame = useRef<number>();
  const hasCalledComplete = useRef(false);

  const finishAndReveal = useCallback(() => {
    if (hasCalledComplete.current) return;
    hasCalledComplete.current = true;
    
    // Quickly animate to 100%
    const finishAnimation = () => {
      if (animatedProgress.current < 100) {
        animatedProgress.current = Math.min(animatedProgress.current + 8, 100);
        setProgress(animatedProgress.current);
        animationFrame.current = requestAnimationFrame(finishAnimation);
      } else {
        // Immediately trigger content reveal
        onLoadingComplete?.();
        // Fade out progress bar
        setCompleting(true);
        setTimeout(() => {
          setVisible(false);
          setProgress(0);
          animatedProgress.current = 0;
          setCompleting(false);
          hasCalledComplete.current = false;
        }, 300);
      }
    };
    finishAnimation();
  }, [onLoadingComplete]);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(0);
      animatedProgress.current = 0;
      hasCalledComplete.current = false;
      setCompleting(false);
      
      // Subscribe to actual loading progress
      const unsubscribe = subscribeToLoadingProgress((loaded, total) => {
        // Cap at 90% until loading is truly complete
        const rawProgress = (loaded / total) * 100;
        const targetProgress = Math.min(Math.round(rawProgress * 0.9), 90);
        
        // Smoothly animate to target progress
        const animate = () => {
          if (animatedProgress.current < targetProgress) {
            const distance = targetProgress - animatedProgress.current;
            // Slower, smoother animation
            const step = Math.max(0.5, distance * 0.08);
            animatedProgress.current = Math.min(animatedProgress.current + step, targetProgress);
            setProgress(Math.round(animatedProgress.current));
            animationFrame.current = requestAnimationFrame(animate);
          }
        };
        
        if (animationFrame.current) {
          cancelAnimationFrame(animationFrame.current);
        }
        animate();
      });
      
      return () => {
        unsubscribe();
        if (animationFrame.current) {
          cancelAnimationFrame(animationFrame.current);
        }
      };
    } else if (visible && !completing) {
      // Loading finished - complete the animation
      finishAndReveal();
    }
  }, [isLoading, visible, completing, finishAndReveal]);

  if (!visible) return null;

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-[100] h-1 bg-muted/30", className)}>
      <div 
        className={cn(
          "h-full bg-primary relative overflow-hidden",
          completing && "transition-opacity duration-300 opacity-0"
        )}
        style={{ 
          width: `${progress}%`,
          transition: 'width 100ms ease-out',
        }}
      >
        {/* Shimmer effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.2s_ease-in-out_infinite]"
          style={{ transform: 'skewX(-20deg)' }}
        />
      </div>
    </div>
  );
}
