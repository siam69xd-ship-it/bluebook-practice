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
  // Check if text contains LaTeX
  const hasLatex = /\$.*?\$|\\frac|\\sqrt/.test(text);

  return (
    <div className="relative flex items-center gap-3">
      {/* Main Option Button - Bluebook Style */}
      <button
        onClick={onClick}
        disabled={disabled || isEliminated}
        className={cn(
          'flex-1 flex items-center gap-4 px-5 py-4 rounded-lg border-2 transition-all text-left',
          // Eliminated state
          isEliminated && 'opacity-40 bg-gray-50',
          // Default state
          !isEliminated && !isSelected && !showResult && 
            'border-gray-200 bg-white hover:border-gray-400',
          // Selected state (before check)
          isSelected && !showResult && 
            'border-gray-900 bg-white',
          // Correct answer shown
          showResult && isCorrect && 'border-green-500 bg-green-50',
          // Incorrect answer shown
          showResult && isIncorrect && 'border-red-500 bg-red-50',
          // Show correct answer when not selected
          showResult && !isSelected && !isCorrect && !isIncorrect && 'border-gray-200 bg-white'
        )}
      >
        {/* Circle Letter Badge - SAT Bluebook Style */}
        <div className={cn(
          'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-semibold text-base border-2 transition-all',
          // Default state
          !isSelected && !showResult && 
            'border-gray-400 bg-white text-gray-900',
          // Selected state
          isSelected && !showResult && 
            'border-gray-900 bg-gray-900 text-white',
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
          'flex-1 text-[16px] leading-relaxed',
          isEliminated && 'line-through text-gray-400',
          !isEliminated && 'text-gray-900',
          showResult && isIncorrect && 'text-red-700',
          showResult && isCorrect && 'text-green-700'
        )}>
          {hasLatex ? (
            <LatexRenderer content={text} className="inline" />
          ) : (
            text
          )}
        </span>
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
