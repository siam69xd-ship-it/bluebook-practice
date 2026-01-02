import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Bookmark,
  Maximize,
  Minimize,
  Calculator,
  BookOpen,
  Home,
  Lightbulb,
  Flag,
  Undo2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Timer } from '@/components/Timer';
import { QuestionNavigator } from '@/components/QuestionNavigator';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import DraggableCalculator from '@/components/math/DraggableCalculator';
import MathReference from '@/components/math/MathReference';
import GridInInput from '@/components/math/GridInInput';
import MathQuestionOption from '@/components/math/MathQuestionOption';
import LatexRenderer from '@/components/math/LatexRenderer';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { parseOptionLabel } from '@/lib/mathQuestionUtils';
import { QuestionState } from '@/lib/questionUtils';
import { cn } from '@/lib/utils';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useNavigate } from 'react-router-dom';

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
  showNavigator,
  setShowNavigator,
  isTimerHidden,
  setIsTimerHidden
}: MathQuestionLayoutProps) {
  const navigate = useNavigate();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  
  const [showCalculator, setShowCalculator] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isEliminationMode, setIsEliminationMode] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentState = questionStates[currentQuestion.id] || {
    userAnswer: null,
    checked: false,
    checkedOptions: [],
    eliminatedOptions: [],
    markedForReview: false,
    highlights: [],
  };

  const isCorrect = currentState.userAnswer === currentQuestion.correctAnswer;
  
  const isGridInCorrect = () => {
    if (!currentQuestion) return false;
    const userAnswer = (currentState.userAnswer || '').trim().toLowerCase();
    const correctAnswer = currentQuestion.correctAnswer.trim().toLowerCase();
    const acceptableAnswers = correctAnswer.split(/[,|]|or/).map((a: string) => a.trim());
    return acceptableAnswers.some((ans: string) => {
      if (userAnswer === ans) return true;
      const userNum = parseFloat(userAnswer);
      const ansNum = parseFloat(ans);
      if (!isNaN(userNum) && !isNaN(ansNum)) {
        return Math.abs(userNum - ansNum) < 0.01;
      }
      return false;
    });
  };
  
  const isGridInRight = currentState.checked && isGridInCorrect();

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white">
      {/* Overlays */}
      <DraggableCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
      <MathReference isOpen={showReference} onClose={() => setShowReference(false)} />
      
      <QuestionNavigator
        totalQuestions={questions.length}
        questionIds={questions.map(q => q.id)}
        questionStates={questionStates}
        currentIndex={currentIndex}
        onNavigate={onNavigate}
        isOpen={showNavigator}
        onClose={() => setShowNavigator(false)}
      />

      <ExplanationPanel
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        explanation={currentQuestion.explanation}
        correctAnswer={currentQuestion.correctAnswer}
      />

      {/* Header */}
      <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-20">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-md">
            <Home className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-base font-medium text-gray-900 hidden sm:inline">SAT® Suite Question Bank</span>
        </div>

        <div className="flex items-center gap-2">
          <Timer questionId={currentQuestion.id} isHidden={isTimerHidden} />
          <button
            onClick={() => setIsTimerHidden(!isTimerHidden)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors border border-gray-300"
          >
            <span className="flex gap-0.5">
              <span className="w-0.5 h-3 bg-gray-600"></span>
              <span className="w-0.5 h-3 bg-gray-600"></span>
            </span>
            {isTimerHidden ? 'Show' : 'Hide'}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-md transition-colors",
              showCalculator ? "bg-gray-100" : "hover:bg-gray-100"
            )}
          >
            <Calculator className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Calculator</span>
          </button>
          
          <button
            onClick={() => setShowReference(!showReference)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-md transition-colors",
              showReference ? "bg-gray-100" : "hover:bg-gray-100"
            )}
          >
            <BookOpen className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Reference</span>
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-gray-600" />
            ) : (
              <Maximize className="w-4 h-4 text-gray-600" />
            )}
            <span className="text-xs text-gray-600">Fullscreen</span>
          </button>
        </div>
      </header>

      {/* Split Layout */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 bg-white">
        <ResizablePanel defaultSize={50} minSize={30}>
          <ScrollArea className="h-full">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center w-8 h-8 bg-slate-900 text-white text-sm font-bold rounded">
                  {currentIndex + 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 h-8",
                    currentState.markedForReview ? "text-amber-700 bg-amber-50" : "text-slate-500 hover:bg-slate-100"
                  )}
                  onClick={() => onUpdateState(currentQuestion.id, { markedForReview: !currentState.markedForReview })}
                >
                  <Bookmark className={cn("w-4 h-4", currentState.markedForReview && "fill-current")} />
                  {currentState.markedForReview ? "Marked" : "Mark for Review"}
                </Button>
              </div>

              <div className="font-serif text-lg leading-relaxed text-[#1a1a1a]">
                <LatexRenderer content={currentQuestion.questionPrompt || currentQuestion.question || ""} />
              </div>
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-slate-200" />

        <ResizablePanel defaultSize={50} minSize={30}>
          <ScrollArea className="h-full">
            <div className="p-8">
              <div className="flex justify-end mb-4 gap-2">
                 <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
                    <Flag className="w-4 h-4" /> Report
                 </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
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
                    <>
                      {Object.entries(currentQuestion.options).map(([letter, text]) => {
                        const { label, text: optionText } = parseOptionLabel(text as string);
                        return (
                          <MathQuestionOption
                            key={letter}
                            label={label || letter}
                            text={optionText || text as string}
                            isSelected={currentState.userAnswer === letter}
                            isCorrect={currentState.checked && letter === currentQuestion.correctAnswer}
                            isIncorrect={currentState.checked && currentState.userAnswer === letter && letter !== currentQuestion.correctAnswer}
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
                               const newElim = elim.includes(letter) ? elim.filter((e: string) => e !== letter) : [...elim, letter];
                               onUpdateState(currentQuestion.id, { eliminatedOptions: newElim });
                            }}
                            disabled={currentState.checked}
                          />
                        );
                      })}
                      
                      <div className="flex justify-end gap-2 mt-2">
                          <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEliminationMode(!isEliminationMode)}
                              className={cn("text-xs gap-2", isEliminationMode ? "bg-slate-900 text-white hover:bg-slate-800" : "text-slate-500")}
                          >
                             {isEliminationMode ? "Exit Elimination" : "Eliminate Options"}
                          </Button>
                          {(currentState.eliminatedOptions?.length || 0) > 0 && (
                             <Button variant="ghost" size="sm" onClick={() => onUpdateState(currentQuestion.id, { eliminatedOptions: [] })} className="text-xs text-slate-500">
                                <Undo2 className="w-3 h-3 mr-1"/> Undo
                             </Button>
                          )}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Footer */}
      <footer className="h-[70px] bg-white border-t border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-20">
        <Button 
            onClick={() => setShowNavigator(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
        >
            {currentIndex + 1} of {questions.length}
            <ChevronLeft className="w-4 h-4 rotate-[-90deg]" />
        </Button>

        <div className="flex items-center gap-2">
          {!currentState.checked ? (
            <Button
              onClick={onCheckAnswer} // NOTE: You can implement a local check here or pass logic to display immediate result without saving
              disabled={!currentState.userAnswer}
              className={cn(
                "rounded-full px-6",
                currentState.userAnswer ? "bg-green-600 hover:bg-green-700" : "bg-gray-200 text-gray-400"
              )}
            >
              Check Answer
            </Button>
          ) : (
             <div className={cn("px-4 py-2 rounded-full text-white font-bold", isCorrect ? "bg-green-600" : "bg-red-500")}>
                {isCorrect ? "Correct" : "Incorrect"}
             </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => onNavigate('prev')} disabled={currentIndex === 0}>Back</Button>
          <Button onClick={() => onNavigate('next')} disabled={currentIndex === questions.length - 1}>Next</Button>
        </div>
      </footer>
    </div>
  );
}
