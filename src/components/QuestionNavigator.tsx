import { cn } from '@/lib/utils';
import { QuestionState } from '@/lib/questionUtils';
import { motion } from 'framer-motion';

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  questionStates: { [key: number]: QuestionState };
  questionIds: number[];
  onNavigate: (index: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function QuestionNavigator({
  totalQuestions,
  currentIndex,
  questionStates,
  questionIds,
  onNavigate,
  isOpen,
  onClose,
}: QuestionNavigatorProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-2xl shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Question Navigator</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted border border-border" />
            <span className="text-muted-foreground">Not visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span className="text-muted-foreground">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success/20 border-2 border-success" />
            <span className="text-muted-foreground">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-accent/20 border-2 border-accent relative">
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full" />
            </div>
            <span className="text-muted-foreground">Marked for review</span>
          </div>
        </div>

        {/* Question grid */}
        <div className="grid grid-cols-10 gap-2">
          {questionIds.map((qId, index) => {
            const state = questionStates[qId];
            const isCurrent = index === currentIndex;
            const isAnswered = state?.userAnswer !== null;
            const isMarked = state?.markedForReview;

            return (
              <button
                key={qId}
                onClick={() => {
                  onNavigate(index);
                  onClose();
                }}
                className={cn(
                  'relative w-full aspect-square rounded-lg text-xs font-medium transition-all duration-200',
                  'hover:scale-110 hover:shadow-md',
                  isCurrent && 'bg-primary text-primary-foreground shadow-md',
                  !isCurrent && !isAnswered && 'bg-muted border border-border text-muted-foreground hover:border-primary',
                  !isCurrent && isAnswered && 'bg-success/20 border-2 border-success text-success',
                )}
              >
                {index + 1}
                {isMarked && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background" />
                )}
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-6 pt-4 border-t border-border flex justify-between text-sm text-muted-foreground">
          <span>
            Answered: {Object.values(questionStates).filter(s => s?.userAnswer).length} / {totalQuestions}
          </span>
          <span>
            Marked: {Object.values(questionStates).filter(s => s?.markedForReview).length}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
