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
  const getOptionStyles = () => {
    if (showResult) {
      if (isCorrect) {
        return 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500';
      }
      if (isIncorrect) {
        return 'border-red-500 bg-red-50 ring-2 ring-red-500';
      }
    }
    if (isSelected) {
      return 'border-[#0077c8] bg-blue-50 ring-2 ring-[#0077c8]';
    }
    if (isEliminated) {
      return 'opacity-50 line-through bg-slate-100';
    }
    return 'border-slate-300 hover:border-[#0077c8] hover:bg-blue-50/50';
  };

  return (
    <div className="relative flex items-center gap-3">
      <button
        onClick={onClick}
        disabled={disabled || isEliminated}
        className={cn(
          'flex-1 flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left',
          getOptionStyles()
        )}
      >
        {/* Radio Circle */}
        <div className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
          isSelected ? 'border-[#0077c8] bg-[#0077c8]' : 'border-slate-400',
          showResult && isCorrect && 'border-emerald-500 bg-emerald-500',
          showResult && isIncorrect && 'border-red-500 bg-red-500'
        )}>
          {isSelected && (
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
          )}
        </div>

        {/* Option Content */}
        <div className="flex-1">
          <span className="font-semibold text-slate-700 mr-2">{label})</span>
          <LatexRenderer content={text} className="inline text-slate-800" />
        </div>
      </button>

      {/* Elimination Button */}
      {showEliminationButtons && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEliminate?.();
          }}
          className={cn(
            'w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all',
            isEliminated
              ? 'border-slate-400 bg-slate-200 text-slate-500'
              : 'border-slate-300 hover:border-red-400 hover:bg-red-50 text-slate-600'
          )}
        >
          {isEliminated ? (
            <span className="relative">
              {label}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-6 h-0.5 bg-slate-500 rotate-45" />
              </span>
            </span>
          ) : (
            label
          )}
        </button>
      )}
    </div>
  );
}
