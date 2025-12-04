import { useState, useEffect, useRef } from 'react';

interface TimerProps {
  questionId: number;
  isPaused?: boolean;
  isHidden?: boolean;
}

export function Timer({ questionId, isPaused = false, isHidden = false }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastQuestionRef = useRef<number>(questionId);

  // Reset timer when question changes
  useEffect(() => {
    if (questionId !== lastQuestionRef.current) {
      lastQuestionRef.current = questionId;
      setSeconds(0); // Reset timer for new question
    }
  }, [questionId]);

  // Handle timer interval
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isHidden) {
    return null;
  }

  return (
    <span className="font-mono text-2xl font-medium text-gray-900 tracking-wider" data-testid="text-timer">
      {formatTime(seconds)}
    </span>
  );
}
