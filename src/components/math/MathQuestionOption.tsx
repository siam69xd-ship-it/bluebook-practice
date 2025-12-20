import { cn } from '@/lib/utils';
import LatexRenderer from './LatexRenderer';

interface MathQuestionOptionProps {
  label: string;
  text: string;
  isSelected: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  showResult: boolean;
  onClick: () => void;
  isEliminated?: boolean;
  showEliminationButtons?: boolean;
  onEliminate?: () => void;
  disabled?: boolean;
}

export default function MathQuestionOption({
  label,
  text,
  isSelected,
  isCorrect,
  isIncorrect,
  showResult,
  onClick,
  isEliminated,
  showEliminationButtons,
  onEliminate,
  disabled
}: MathQuestionOptionProps) {
  // Check if text contains LaTeX patterns
  const hasLatex = /\$.*?\$|\\frac|\\sqrt|\\times|\\div|\^|_\{/.test(text);
  
  // Clean option text - remove A), B), etc. prefix if present
  const cleanText = text.replace(/^[A-D]\)\s*/, '');

  // Determine border/background states
  // Selected but not checked: blue highlight
  // After check: green for correct, red for incorrect
  const getBorderColor = () => {
    if (isEliminated) return 'border-gray-200';
    if (showResult && isCorrect) return 'border-green-500';
    if (showResult && isIncorrect) return 'border-red-500';
    if (isSelected && !showResult) return 'border-[#0077cc]'; // Blue selection like reference
    return 'border-gray-200 hover:border-gray-400';
  };

  const getBackgroundColor = () => {
    if (isEliminated) return 'bg-gray-50';
    if (showResult && isCorrect) return 'bg-green-50';
    if (showResult && isIncorrect) return 'bg-red-50';
    if (isSelected && !showResult) return 'bg-[#e6f3ff]'; // Light blue selection
    return 'bg-white';
  };

  return (
    <div className="relative flex items-center gap-3">
      {/* Main Option Button - Bluebook Style */}
      <button
        onClick={onClick}
        disabled={disabled || isEliminated}
        className={cn(
          'flex-1 flex items-center gap-4 px-5 py-4 rounded-lg border-2 transition-all text-left',
          getBorderColor(),
          getBackgroundColor(),
          isEliminated && 'opacity-40'
        )}
      >
        {/* Circle Letter Badge - SAT Bluebook Style */}
        <div className={cn(
          'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-semibold text-base border-2 transition-all',
          // Default state
          !isSelected && !showResult && 
            'border-gray-400 bg-white text-gray-900',
          // Selected state (blue like reference)
          isSelected && !showResult && 
            'border-[#0077cc] bg-[#0077cc] text-white',
          // Correct state
          showResult && isCorrect && 'border-green-500 bg-green-500 text-white',
          // Incorrect state
          showResult && isIncorrect && 'border-red-500 bg-red-500 text-white',
          // Default when showing result but not this option
          showResult && !isCorrect && !isIncorrect && 
            'border-gray-400 bg-white text-gray-900'
        )}>
          {label}
        </div>

        {/* Option Text with LaTeX support */}
        <span className={cn(
          'flex-1 text-[17px] leading-relaxed',
          isEliminated && 'line-through text-gray-400',
          !isEliminated && 'text-gray-900',
          showResult && isIncorrect && 'text-red-700',
          showResult && isCorrect && 'text-green-700'
        )}>
          {hasLatex ? (
            <LatexRenderer content={cleanText} className="inline" />
          ) : (
            cleanText
          )}
        </span>

        {/* Check button on the right for selected option - only before checking */}
        {isSelected && !showResult && (
          <div className="flex-shrink-0 px-3 py-1 bg-gray-900 text-white text-sm font-medium rounded">
            Check
          </div>
        )}
      </button>

      {/* Elimination Button - SAT style circle with diagonal strikethrough */}
      {showEliminationButtons && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEliminate?.();
          }}
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all relative',
            isEliminated
              ? 'border-gray-400 bg-transparent'
              : 'border-gray-300 bg-transparent hover:border-gray-500'
          )}
          title={isEliminated ? 'Restore option' : 'Eliminate option'}
        >
          {/* Letter */}
          <span className="text-xs font-semibold text-gray-600">
            {label}
          </span>
          {/* Diagonal strikethrough when eliminated */}
          {isEliminated && (
            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="w-[calc(100%+4px)] h-[2px] bg-gray-500 rotate-[-45deg] absolute" />
            </span>
          )}
        </button>
      )}
    </div>
  );
}
