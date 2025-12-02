import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  questionId: number;
}

export function Timer({ questionId }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset timer whenever question changes
    setSeconds(0);
    
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Start new timer
    intervalRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [questionId]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border border-border">
      <Clock className="w-4 h-4 text-muted-foreground" />
      <span className="font-mono text-sm font-medium text-foreground">
        {formatTime(seconds)}
      </span>
    </div>
  );
}
