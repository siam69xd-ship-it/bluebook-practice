import { cn } from '@/lib/utils';
import { X, RotateCcw } from 'lucide-react';

interface QuestionOptionProps {
  letter: string;
  text: string;
  isSelected: boolean;
  isEliminated: boolean;
  isChecked: boolean;
  isOptionChecked: boolean;
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
  
  const showOptionWrong = isOptionChecked && !isCorrectAnswer;
  const showOptionCorrect = isOptionChecked && isCorrectAnswer;
  const showCorrectIndicator = isChecked && isCorrectAnswer && !isSelected && !isOptionChecked;

  return (
    <div
      className={cn(
        'group relative flex items-center gap-4 px-4 py-3 rounded-lg border transition-all duration-200 cursor-pointer',
        isEliminated && 'opacity-40',
        !isEliminated && !showOptionWrong && !showOptionCorrect && !showCorrectIndicator && !isSelected && 
          'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
        isSelected && !isOptionChecked && !isChecked && 
          'border-bluebook-cyan-border bg-bluebook-cyan shadow-sm',
        showOptionWrong && 'border-red-300 bg-red-50',
        showOptionCorrect && 'border-green-300 bg-green-50',
        showCorrectIndicator && 'border-green-200 bg-green-50/50'
      )}
      onClick={() => !isEliminated && !isOptionChecked && onSelect()}
      data-testid={`option-${letter}`}
    >
      {/* Circle Letter Badge */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-200',
          !isSelected && !isOptionChecked && !showCorrectIndicator && 
            'border-gray-300 bg-white text-gray-700',
          isSelected && !isOptionChecked && !isChecked && 
            'border-gray-800 bg-gray-800 text-white',
          showOptionWrong && 'border-red-500 bg-red-500 text-white',
          showOptionCorrect && 'border-green-500 bg-green-500 text-white',
          showCorrectIndicator && 'border-green-400 bg-green-100 text-green-700'
        )}
      >
        {letter}
      </div>

      {/* Option text */}
      <span
        className={cn(
          'flex-1 text-sm leading-relaxed text-gray-800',
          isEliminated && 'line-through',
          showOptionWrong && 'text-red-700',
          showOptionCorrect && 'text-green-700',
          showCorrectIndicator && 'text-green-700'
        )}
      >
        {text}
      </span>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Check button for selected option (before full check) - always visible when selected */}
        {isSelected && !isOptionChecked && !isChecked && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCheckOption();
            }}
            className="flex-shrink-0 px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full hover:bg-gray-800 transition-colors"
            title="Check this option"
            data-testid={`button-check-option-${letter}`}
          >
            Check
          </button>
        )}

        {/* Eliminate/Restore button - circular with icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEliminate();
          }}
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200',
            isEliminated
              ? 'border-gray-400 bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'border-gray-200 bg-white text-gray-400 opacity-0 group-hover:opacity-100 hover:border-gray-300 hover:text-gray-600'
          )}
          title={isEliminated ? 'Restore option' : 'Eliminate option'}
          data-testid={`button-eliminate-${letter}`}
        >
          {isEliminated ? (
            <RotateCcw className="w-3.5 h-3.5" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
