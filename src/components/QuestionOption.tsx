import { cn } from '@/lib/utils';
import { X, RotateCcw } from 'lucide-react';

interface QuestionOptionProps {
  letter: string;
  text: string;
  isSelected: boolean;
  isEliminated: boolean;
  isCorrect?: boolean;
  isChecked: boolean;
  correctAnswer: string;
  onSelect: () => void;
  onEliminate: () => void;
}

export function QuestionOption({
  letter,
  text,
  isSelected,
  isEliminated,
  isCorrect,
  isChecked,
  correctAnswer,
  onSelect,
  onEliminate,
}: QuestionOptionProps) {
  const isCorrectAnswer = letter === correctAnswer;
  const isWrongSelection = isSelected && !isCorrectAnswer;
  
  // Show wrong immediately on selection, but only show correct after Check
  const showWrongImmediately = isWrongSelection;
  const showCorrectAfterCheck = isChecked && isSelected && isCorrectAnswer;
  const showCorrectIndicator = isChecked && isCorrectAnswer && !isSelected;

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer',
        isEliminated && 'opacity-40',
        !isEliminated && !showWrongImmediately && !showCorrectAfterCheck && !showCorrectIndicator && 'hover:border-primary/50 hover:bg-muted/30',
        // Normal selected state (correct answer selected but not checked yet)
        isSelected && isCorrectAnswer && !isChecked && 'border-primary bg-primary/5',
        // Wrong selection - show red immediately
        showWrongImmediately && 'border-destructive bg-destructive/10',
        // Correct selection - show green only after check
        showCorrectAfterCheck && 'border-success bg-success/10',
        // Not selected default
        !isSelected && !showCorrectIndicator && 'border-border bg-card',
        // Correct indicator (user selected wrong, show correct answer after check)
        showCorrectIndicator && 'border-success/50 bg-success/5'
      )}
      onClick={() => !isEliminated && onSelect()}
    >
      {/* Letter badge */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors',
          // Normal selected (correct but not checked)
          isSelected && isCorrectAnswer && !isChecked && 'bg-primary text-primary-foreground',
          // Wrong selection - red immediately
          showWrongImmediately && 'bg-destructive text-destructive-foreground',
          // Correct after check
          showCorrectAfterCheck && 'bg-success text-success-foreground',
          // Default unselected
          !isSelected && !showCorrectIndicator && 'bg-muted text-muted-foreground',
          // Correct indicator
          showCorrectIndicator && 'bg-success/20 text-success'
        )}
      >
        {letter}
      </div>

      {/* Option text */}
      <span
        className={cn(
          'flex-1 text-sm leading-relaxed pt-1',
          isEliminated && 'line-through',
          showWrongImmediately && 'text-destructive',
          showCorrectAfterCheck && 'text-success font-medium',
          showCorrectIndicator && 'text-success'
        )}
      >
        {text}
      </span>

      {/* Eliminate/Restore button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEliminate();
        }}
        className={cn(
          'flex-shrink-0 p-1.5 rounded-md transition-all duration-200',
          isEliminated
            ? 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
            : 'opacity-0 group-hover:opacity-100 bg-muted/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
        )}
        title={isEliminated ? 'Restore option' : 'Eliminate option'}
      >
        {isEliminated ? (
          <RotateCcw className="w-4 h-4" />
        ) : (
          <X className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
