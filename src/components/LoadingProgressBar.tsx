import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { subscribeToLoadingProgress } from '@/lib/questionUtils';

interface LoadingProgressBarProps {
  isLoading: boolean;
  className?: string;
}

export function LoadingProgressBar({ isLoading, className }: LoadingProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(0);
      
      // Subscribe to actual loading progress
      const unsubscribe = subscribeToLoadingProgress((loaded, total) => {
        const percentage = Math.round((loaded / total) * 100);
        setProgress(percentage);
      });
      
      return unsubscribe;
    } else {
      // Complete the progress bar
      setProgress(100);
      
      // Hide after animation completes
      const hideTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
      
      return () => clearTimeout(hideTimer);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-[100] h-1 bg-muted/50", className)}>
      <div 
        className={cn(
          "h-full bg-primary transition-all duration-200 ease-out",
          progress === 100 && "opacity-0"
        )}
        style={{ 
          width: `${progress}%`,
          transition: progress === 100 ? 'width 150ms ease-out, opacity 300ms ease-out 100ms' : 'width 200ms ease-out'
        }}
      />
    </div>
  );
}
