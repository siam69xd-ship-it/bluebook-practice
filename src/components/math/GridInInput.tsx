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
      <div className="flex flex-col items-start">
        <label className="text-sm text-gray-600 mb-2">Enter your answer:</label>
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          disabled={disabled || isChecked}
          placeholder="Answer..."
          className={cn(
            "w-full max-w-[300px] px-4 py-3 text-lg border-2 rounded-lg transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            !isChecked && "border-gray-300 focus:border-gray-900 focus:ring-gray-900/20",
            isChecked && isCorrect && "border-green-500 bg-green-50 text-green-700",
            isChecked && !isCorrect && "border-red-500 bg-red-50 text-red-700",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      </div>
      
      {/* Show correct answer after check if wrong */}
      {isChecked && !isCorrect && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Correct answer:</span>
          <span className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
            {correctAnswer}
          </span>
        </div>
      )}
      
      {/* Input hints */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• For fractions, use / (e.g., 3/4)</p>
        <p>• For decimals, use . (e.g., 0.75)</p>
        <p>• For negative numbers, use - (e.g., -5)</p>
      </div>
    </div>
  );
}
