import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface GridInInputProps {
  value: string;
  onChange: (value: string) => void;
  isChecked: boolean;
  isCorrect: boolean;
  correctAnswer: string;
  disabled?: boolean;
}

export default function GridInInput({ 
  value, 
  onChange, 
  isChecked, 
  isCorrect, 
  correctAnswer,
  disabled = false 
}: GridInInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow numbers, negative sign, decimal point, and fractions
    if (/^-?[\d./]*$/.test(newValue) || newValue === '') {
      setLocalValue(newValue);
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-4">
      {/* Grid-In Input - SAT Bluebook Style */}
      <div className="flex flex-col items-start">
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          disabled={disabled || isChecked}
          placeholder="Answer..."
          className={cn(
            "w-full max-w-[320px] px-4 py-3 text-lg border-2 rounded-lg transition-all duration-200",
            "focus:outline-none focus:ring-0",
            // Default state
            !isChecked && "border-gray-900 bg-white text-gray-900 placeholder:text-gray-400",
            // Correct state
            isChecked && isCorrect && "border-green-500 bg-green-50 text-green-700",
            // Incorrect state
            isChecked && !isCorrect && "border-red-500 bg-red-50 text-red-700",
            // Disabled
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{ fontFamily: 'inherit' }}
        />
      </div>
      
      {/* Show correct answer after check if wrong */}
      {isChecked && !isCorrect && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Correct answer:</span>
          <span className="font-semibold text-green-700 bg-green-50 px-3 py-1 rounded border border-green-200">
            {correctAnswer}
          </span>
        </div>
      )}
    </div>
  );
}
