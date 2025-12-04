import { cn } from '@/lib/utils';

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
  hideCheckButton?: boolean;
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
  hideCheckButton = false,
}: QuestionOptionProps) {
  const isCorrectAnswer = letter === correctAnswer;
  
  const showOptionWrong = isOptionChecked && !isCorrectAnswer;
  const showOptionCorrect = isOptionChecked && isCorrectAnswer;
  const showCorrectIndicator = isChecked && isCorrectAnswer && !isSelected && !isOptionChecked;

  return (
    <div
      className={cn(
        'group relative flex items-center gap-4 px-4 py-3 rounded-lg border transition-all duration-200 cursor-pointer',
        isEliminated && 'opacity-50',
        !isEliminated && !showOptionWrong && !showOptionCorrect && !showCorrectIndicator && !isSelected && 
          'border-gray-300 bg-white hover:border-gray-400',
        isSelected && !isOptionChecked && !isChecked && 
          'border-gray-400 bg-gray-200',
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
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm border transition-all duration-200',
          !isSelected && !isOptionChecked && !showCorrectIndicator && 
            'border-gray-400 bg-white text-gray-700',
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
          'flex-1 text-sm leading-relaxed',
          isEliminated && 'line-through text-gray-500',
          !isEliminated && !showOptionWrong && !showOptionCorrect && !showCorrectIndicator && 'text-gray-800',
          showOptionWrong && 'text-red-700',
          showOptionCorrect && 'text-green-700',
          showCorrectIndicator && 'text-green-700'
        )}
      >
        {text}
      </span>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Check button for selected option (before full check) - hidden in timed quiz mode */}
        {isSelected && !isOptionChecked && !isChecked && !hideCheckButton && (
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

        {/* Elimination button - always visible, circle with crossed arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEliminate();
          }}
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200',
            isEliminated
              ? 'border-gray-400 bg-gray-200 text-gray-600 hover:bg-gray-300'
              : 'border-gray-300 bg-white text-gray-400 hover:border-gray-400 hover:text-gray-600'
          )}
          title={isEliminated ? 'Restore option' : 'Eliminate option'}
          data-testid={`button-eliminate-${letter}`}
        >
          {/* Crossed arrows icon - strikethrough style */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M5 12l4 4" />
            <path d="M5 12l4-4" />
            <path d="M19 12l-4 4" />
            <path d="M19 12l-4-4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
