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
  // Clean option text - remove A), B), etc. prefix if present
  const cleanText = text.replace(/^[A-D]\)\s*/, '');

  // Determine border/background states
  // Selected but not checked: blue highlight
  // After check: green for correct, red for incorrect (stays red for previously checked wrong)
  const getBorderColor = () => {
    if (isEliminated) return 'border-border';
    if (showResult && isCorrect) return 'border-green-500';
    if (showResult && isIncorrect) return 'border-red-400';
    if (isSelected && !showResult) return 'border-foreground';
    return 'border-foreground/30 hover:border-foreground/60';
  };

  const getBackgroundColor = () => {
    if (isEliminated) return 'bg-muted';
    if (showResult && isCorrect) return 'bg-green-50';
    if (showResult && isIncorrect) return 'bg-red-50';
    if (isSelected && !showResult) return 'bg-muted';
    return 'bg-background';
  };

  return (
    <div className="relative flex items-center gap-3">
      {/* Main Option Button - Bluebook Style */}
      <button
        onClick={onClick}
        disabled={disabled || isEliminated}
        className={cn(
          'flex-1 flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all text-left',
          getBorderColor(),
          getBackgroundColor(),
          isEliminated && 'opacity-40'
        )}
      >
        {/* Circle Letter Badge */}
        <div className={cn(
          'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-semibold text-base border transition-all',
          !isSelected && !showResult && 
            'border-foreground/40 bg-background text-foreground',
          isSelected && !showResult && 
            'border-foreground bg-foreground text-background',
          showResult && isCorrect && 'border-green-500 bg-green-500 text-white',
          showResult && isIncorrect && 'border-red-500 bg-red-500 text-white',
          showResult && !isCorrect && !isIncorrect && 
            'border-foreground/40 bg-background text-foreground'
        )}>
          {label}
        </div>

        {/* Option Text */}
        <span className={cn(
          'flex-1 text-[17px] leading-relaxed',
          isEliminated && 'line-through text-muted-foreground',
          !isEliminated && 'text-foreground',
          showResult && isIncorrect && 'text-red-700',
          showResult && isCorrect && 'text-green-700'
        )}>
          <LatexRenderer content={cleanText} className="inline" />
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
            'flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all relative',
            isEliminated
              ? 'border-muted-foreground/40 bg-transparent'
              : 'border-border bg-transparent hover:border-muted-foreground'
          )}
          title={isEliminated ? 'Restore option' : 'Eliminate option'}
        >
          <span className="text-xs font-semibold text-muted-foreground">
            {label}
          </span>
          {isEliminated && (
            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="w-[calc(100%+4px)] h-[2px] bg-muted-foreground rotate-[-45deg] absolute" />
            </span>
          )}
        </button>
      )}
    </div>
  );
}
