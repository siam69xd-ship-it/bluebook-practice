import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

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
      
      // Simulate progress that speeds up as it approaches completion
      const intervals = [
        { target: 30, duration: 200 },
        { target: 50, duration: 300 },
        { target: 70, duration: 400 },
        { target: 85, duration: 500 },
        { target: 95, duration: 800 },
      ];
      
      let currentIndex = 0;
      const runInterval = () => {
        if (currentIndex >= intervals.length) return;
        
        const { target, duration } = intervals[currentIndex];
        setTimeout(() => {
          setProgress(target);
          currentIndex++;
          runInterval();
        }, duration);
      };
      
      runInterval();
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
          "h-full bg-primary transition-all duration-300 ease-out",
          progress === 100 && "opacity-0"
        )}
        style={{ 
          width: `${progress}%`,
          transition: progress === 100 ? 'width 200ms ease-out, opacity 300ms ease-out 100ms' : 'width 300ms ease-out'
        }}
      />
    </div>
  );
}
