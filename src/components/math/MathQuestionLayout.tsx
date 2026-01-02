import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  Flag,
  Undo2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '@/components/ui/resizable';
import MathQuestionOption from '@/components/math/MathQuestionOption';
import LatexRenderer from '@/components/math/LatexRenderer';
import GridInInput from '@/components/math/GridInInput';
import { parseOptionLabel, MathQuestion } from '@/lib/mathQuestionUtils';
import { QuestionState } from '@/lib/questionUtils';
import { cn } from '@/lib/utils';

interface MathQuestionLayoutProps {
  questions: any[];
  currentIndex: number;
  questionStates: { [key: number]: QuestionState };
  onNavigate: (direction: 'prev' | 'next' | number) => void;
  onUpdateState: (id: number, state: Partial<QuestionState>) => void;
  onCheckAnswer: () => void;
  showNavigator: boolean;
  setShowNavigator: (show: boolean) => void;
  isTimerHidden: boolean;
  setIsTimerHidden: (hide: boolean) => void;
}

export default function MathQuestionLayout({
  questions,
  currentIndex,
  questionStates,
  onNavigate,
  onUpdateState,
  onCheckAnswer,
  setShowNavigator,
}: MathQuestionLayoutProps) {
  const currentQuestion = questions[currentIndex];
  const currentState = questionStates[currentQuestion.id] || {
    userAnswer: null,
    checked: false,
    checkedOptions: [],
    eliminatedOptions: [],
    markedForReview: false,
    highlights: [],
  };

  const [isEliminationMode, setIsEliminationMode] = useState(false);

  // Helper for Grid-in check
  const isGridInCorrect = () => {
    if (!currentQuestion) return false;
    const userAnswer = (currentState.userAnswer || '').trim().toLowerCase();
    const correctAnswer = currentQuestion.correctAnswer.trim().toLowerCase();
    const acceptableAnswers = correctAnswer.split(/[,|]|or/).map(a => a.trim());
    return acceptableAnswers.some(ans => {
      if (userAnswer === ans) return true;
      const userNum = parseFloat(userAnswer);
      const ansNum = parseFloat(ans);
      if (!isNaN(userNum) && !isNaN(ansNum)) {
        return Math.abs(userNum - ansNum) < 0.01;
      }
      return false;
    });
  };

  const isCorrect = currentState.userAnswer === currentQuestion.correctAnswer;
  // For grid-ins, we use the helper if checked
  const isGridInRight = currentState.checked && isGridInCorrect();

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1 bg-white">
      {/* Left Pane - Question/Problem */}
      <ResizablePanel defaultSize={50} minSize={30}>
        <ScrollArea className="h-full">
          <div className="p-8">
            {/* Question Number and Flag */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-slate-500 font-medium">Question {currentIndex + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2",
                  currentState.markedForReview ? "text-amber-500" : "text-slate-400"
                )}
                onClick={() => onUpdateState(currentQuestion.id, { markedForReview: !currentState.markedForReview })}
              >
                <Flag className={cn("w-4 h-4", currentState.markedForReview && "fill-current")} />
              </Button>
            </div>

            {/* Question Text */}
            <div className="font-serif text-lg leading-relaxed text-[#1a1a1a]">
              <LatexRenderer content={currentQuestion.questionPrompt || currentQuestion.question} />
            </div>
          </div>
        </ScrollArea>
      </ResizablePanel>

      {/* Divider */}
      <ResizableHandle withHandle className="bg-slate-200" />

      {/* Right Pane - Answer Options */}
      <ResizablePanel defaultSize={50} minSize={30}>
        <ScrollArea className="h-full">
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Options / Grid-In */}
                {currentQuestion.isGridIn ? (
                  <GridInInput
                    value={currentState.userAnswer || ''}
                    onChange={(val) => onUpdateState(currentQuestion.id, { userAnswer: val })}
                    isChecked={currentState.checked}
                    isCorrect={isGridInRight}
                    correctAnswer={currentQuestion.correctAnswer}
                    disabled={currentState.checked}
                  />
                ) : (
                  Object.entries(currentQuestion.options).map(([letter, text], idx) => {
                    const { label, text: optionText } = parseOptionLabel(text as string);
                    const displayLabel = label || letter; // fallback
                    const displayText = optionText || text;

                    // Determine visual state
                    const isSelected = currentState.userAnswer === letter;
                    // If checked:
                    // Correct if it is the correct answer
                    const isOptionCorrect = currentState.checked && letter === currentQuestion.correctAnswer;
                    // Incorrect if selected AND not correct
                    const isOptionIncorrect = currentState.checked && isSelected && letter !== currentQuestion.correctAnswer;

                    return (
                      <MathQuestionOption
                        key={letter}
                        label={displayLabel}
                        text={displayText as string}
                        isSelected={isSelected}
                        isCorrect={isOptionCorrect}
                        isIncorrect={isOptionIncorrect}
                        showResult={currentState.checked}
                        onClick={() => {
                          if (!currentState.checked) {
                            onUpdateState(currentQuestion.id, { userAnswer: letter === currentState.userAnswer ? null : letter });
                          }
                        }}
                        isEliminated={currentState.eliminatedOptions?.includes(letter)}
                        showEliminationButtons={isEliminationMode}
                        onEliminate={() => {
                           const elim = currentState.eliminatedOptions || [];
                           const newElim = elim.includes(letter) ? elim.filter(e => e !== letter) : [...elim, letter];
                           onUpdateState(currentQuestion.id, { eliminatedOptions: newElim });
                        }}
                        disabled={currentState.checked}
                      />
                    );
                  })
                )}

                {/* Toolbar for Elimination (Matches Math.tsx features but embedded) */}
                <div className="flex justify-end gap-2 mt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEliminationMode(!isEliminationMode)}
                        className={cn("text-xs", isEliminationMode && "bg-slate-100")}
                    >
                       {isEliminationMode ? "Exit Elimination" : "Eliminate Options"}
                    </Button>
                </div>

                {/* Submit / Check Button */}
                {/* Note: In Quiz.tsx (Untimed), the check button is in the Footer. 
                    We render nothing here for the button if it's handled externally, 
                    OR we render explanation if checked. */}
                
                {currentState.checked && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-slate-50 rounded-lg border"
                  >
                    <h4 className="font-semibold text-slate-800 mb-2">Explanation</h4>
                    <div className="text-slate-600 font-serif">
                      <LatexRenderer content={currentQuestion.explanation} />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
