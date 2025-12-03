import { cn } from '@/lib/utils';
import { X, RotateCcw, Check } from 'lucide-react';

interface QuestionOptionProps {
  letter: string;
  text: string;
  isSelected: boolean;
  isEliminated: boolean;
  isChecked: boolean; // Full answer check (reveals correct)
  isOptionChecked: boolean; // Individual option check
  correctAnswer: string;
  onSelect: () => void;
  onEliminate: () => void;
  onCheckOption: () => void;
}

export function QuestionOption({
  letter,
  text,
  isSelected,
  isEliminated,
  isChecked,
  isOptionChecked,
  correctAnswer,
  onSelect,
  onEliminate,
  onCheckOption,
}: QuestionOptionProps) {
  const isCorrectAnswer = letter === correctAnswer;
  
  // Individual option check: shows red if wrong, green if correct (no other reveals)
  const showOptionWrong = isOptionChecked && !isCorrectAnswer;
  const showOptionCorrect = isOptionChecked && isCorrectAnswer;
  
  // Full check: reveals correct answer indicator for non-selected correct option
  const showCorrectIndicator = isChecked && isCorrectAnswer && !isSelected && !isOptionChecked;

  return (
    <div
      className={cn(
        'group relative flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer',
        'shadow-sm hover:shadow-md',
        isEliminated && 'opacity-40',
        // Hover states (only when not checked)
        !isEliminated && !showOptionWrong && !showOptionCorrect && !showCorrectIndicator && 'hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.01]',
        // Normal selected (blue border before checking)
        isSelected && !isOptionChecked && !isChecked && 'border-primary bg-primary/5 shadow-primary/20',
        // Individual option checked - wrong (red)
        showOptionWrong && 'border-destructive bg-destructive/10 shadow-destructive/20',
        // Individual option checked - correct (green)
        showOptionCorrect && 'border-success bg-success/10 shadow-success/20',
        // Default unselected
        !isSelected && !isOptionChecked && !showCorrectIndicator && 'border-border bg-card',
        // Full check reveals correct answer
        showCorrectIndicator && 'border-success/50 bg-success/5'
      )}
      onClick={() => !isEliminated && !isOptionChecked && onSelect()}
    >
      {/* Circle Letter Badge */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-base transition-all duration-300',
          'ring-2 ring-offset-2 ring-offset-background',
          // Normal selected
          isSelected && !isOptionChecked && !isChecked && 'bg-primary text-primary-foreground ring-primary',
          // Option wrong
          showOptionWrong && 'bg-destructive text-destructive-foreground ring-destructive',
          // Option correct
          showOptionCorrect && 'bg-success text-success-foreground ring-success',
          // Default unselected
          !isSelected && !isOptionChecked && !showCorrectIndicator && 'bg-muted text-muted-foreground ring-muted',
          // Correct indicator
          showCorrectIndicator && 'bg-success/20 text-success ring-success/50'
        )}
      >
        {letter}
      </div>

      {/* Option text */}
      <span
        className={cn(
          'flex-1 text-sm leading-relaxed',
          isEliminated && 'line-through',
          showOptionWrong && 'text-destructive',
          showOptionCorrect && 'text-success font-medium',
          showCorrectIndicator && 'text-success'
        )}
      >
        {text}
      </span>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Individual Check button - only show if not already checked */}
        {!isOptionChecked && !isChecked && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCheckOption();
            }}
            className={cn(
              'flex-shrink-0 p-2 rounded-full transition-all duration-200',
              'opacity-0 group-hover:opacity-100 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
            )}
            title="Check this option"
          >
            <Check className="w-4 h-4" />
          </button>
        )}

        {/* Eliminate/Restore button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEliminate();
          }}
          className={cn(
            'flex-shrink-0 p-2 rounded-full transition-all duration-200',
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
    </div>
  );
}
