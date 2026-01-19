import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { subscribeToLoadingProgress } from '@/lib/questionUtils';

interface LoadingProgressBarProps {
  isLoading: boolean;
  className?: string;
}

export function LoadingProgressBar({ isLoading, className }: LoadingProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const animatedProgress = useRef(0);
  const animationFrame = useRef<number>();

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(0);
      animatedProgress.current = 0;
      
      // Subscribe to actual loading progress
      const unsubscribe = subscribeToLoadingProgress((loaded, total) => {
        const targetProgress = Math.round((loaded / total) * 100);
        
        // Smoothly animate to target progress
        const animate = () => {
          if (animatedProgress.current < targetProgress) {
            // Move faster when there's more distance to cover
            const distance = targetProgress - animatedProgress.current;
            const step = Math.max(1, Math.ceil(distance * 0.15));
            animatedProgress.current = Math.min(animatedProgress.current + step, targetProgress);
            setProgress(animatedProgress.current);
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
    } else {
      // Complete the progress bar smoothly
      const completeAnimation = () => {
        if (animatedProgress.current < 100) {
          animatedProgress.current = Math.min(animatedProgress.current + 5, 100);
          setProgress(animatedProgress.current);
          animationFrame.current = requestAnimationFrame(completeAnimation);
        } else {
          // Hide after completion animation
          setTimeout(() => {
            setVisible(false);
            setProgress(0);
            animatedProgress.current = 0;
          }, 200);
        }
      };
      
      completeAnimation();
      
      return () => {
        if (animationFrame.current) {
          cancelAnimationFrame(animationFrame.current);
        }
      };
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-[100] h-1 bg-muted/30", className)}>
      <div 
        className={cn(
          "h-full bg-primary transition-opacity duration-200",
          progress === 100 && "opacity-0"
        )}
        style={{ 
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
