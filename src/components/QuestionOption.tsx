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
  const showResult = isChecked && isSelected;
  const isCorrectAnswer = letter === correctAnswer;
  const showCorrectIndicator = isChecked && isCorrectAnswer && !isSelected;

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer',
        isEliminated && 'opacity-40',
        !isChecked && !isEliminated && 'hover:border-primary/50 hover:bg-muted/30',
        !isChecked && isSelected && 'border-primary bg-primary/5',
        !isChecked && !isSelected && 'border-border bg-card',
        showResult && isCorrect && 'border-success bg-success/10',
        showResult && !isCorrect && 'border-destructive bg-destructive/10',
        showCorrectIndicator && 'border-success/50 bg-success/5'
      )}
      onClick={() => !isEliminated && onSelect()}
    >
      {/* Letter badge */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors',
          !isChecked && isSelected && 'bg-primary text-primary-foreground',
          !isChecked && !isSelected && 'bg-muted text-muted-foreground',
          showResult && isCorrect && 'bg-success text-success-foreground',
          showResult && !isCorrect && 'bg-destructive text-destructive-foreground',
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
          showResult && isCorrect && 'text-success font-medium',
          showResult && !isCorrect && 'text-destructive',
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
