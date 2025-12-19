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
        'group relative flex items-center gap-4 px-5 py-4 rounded-lg border-2 transition-all duration-200 cursor-pointer',
        isEliminated && 'opacity-40',
        !isEliminated && !showOptionWrong && !showOptionCorrect && !showCorrectIndicator && !isSelected && 
          'border-gray-300 bg-white hover:border-gray-400',
        isSelected && !isOptionChecked && !isChecked && 
          'border-gray-500 bg-white',
        showOptionWrong && 'border-red-400 bg-red-50',
        showOptionCorrect && 'border-green-400 bg-green-50',
        showCorrectIndicator && 'border-green-300 bg-green-50/50'
      )}
      onClick={() => !isEliminated && !isOptionChecked && onSelect()}
      data-testid={`option-${letter}`}
    >
      {/* Circle Letter Badge - SAT Style */}
      <div
        className={cn(
          'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-semibold text-base border-2 transition-all duration-200',
          !isSelected && !isOptionChecked && !showCorrectIndicator && 
            'border-gray-400 bg-white text-gray-700',
          isSelected && !isOptionChecked && !isChecked && 
            'border-gray-800 bg-gray-800 text-white',
          showOptionWrong && 'border-red-500 bg-red-500 text-white',
          showOptionCorrect && 'border-green-500 bg-green-500 text-white',
          showCorrectIndicator && 'border-green-500 bg-green-100 text-green-700'
        )}
      >
        {letter}
      </div>

      {/* Option text - SAT font style */}
      <span
        className={cn(
          'flex-1 text-base leading-relaxed font-normal',
          isEliminated && 'line-through text-gray-400',
          !isEliminated && !showOptionWrong && !showOptionCorrect && !showCorrectIndicator && 'text-gray-800',
          showOptionWrong && 'text-red-700',
          showOptionCorrect && 'text-green-700',
          showCorrectIndicator && 'text-green-700'
        )}
        style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
      >
        {text}
      </span>

      {/* Action buttons - Right side */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Check button for selected option (before full check) */}
        {isSelected && !isOptionChecked && !isChecked && !hideCheckButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCheckOption();
            }}
            className="flex-shrink-0 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors"
            title="Check this option"
            data-testid={`button-check-option-${letter}`}
          >
            Check
          </button>
        )}

        {/* Elimination button - SAT style circle with crossout */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEliminate();
          }}
          className={cn(
            'flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-200',
            isEliminated
              ? 'border-gray-500 bg-gray-100 text-gray-600'
              : 'border-gray-300 bg-white text-gray-400 hover:border-gray-400 hover:text-gray-500'
          )}
          title={isEliminated ? 'Restore option' : 'Eliminate option'}
          data-testid={`button-eliminate-${letter}`}
        >
          {/* Letter with strikethrough for elimination indicator */}
          <span className={cn(
            'text-sm font-medium relative',
            isEliminated && 'line-through'
          )}>
            {letter}
          </span>
        </button>
      </div>
    </div>
  );
}
