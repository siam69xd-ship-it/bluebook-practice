import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronDown,
  Bookmark,
  Flag,
  Calculator,
  BookOpen,
  Maximize,
  Minimize,
  Undo2,
  Info,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Timer } from '@/components/Timer';
import { QuestionNavigator } from '@/components/QuestionNavigator';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import DesmosCalculator from '@/components/math/DesmosCalculator';
import MathReferenceSheet from '@/components/math/MathReferenceSheet';
import GridInInput from '@/components/math/GridInInput';
import LatexRenderer from '@/components/math/LatexRenderer';
import MathQuestionOption from '@/components/math/MathQuestionOption';
import {
  Question,
  QuestionState,
  getInitialQuestionState,
} from '@/lib/questionUtils';
import { cn } from '@/lib/utils';
import { useFullscreen } from '@/hooks/useFullscreen';

interface MathQuestionLayoutProps {
  questions: Question[];
  currentIndex: number;
  questionStates: { [key: number]: QuestionState };
  onNavigate: (direction: 'prev' | 'next' | number) => void;
  onUpdateState: (questionId: number, updates: Partial<QuestionState>) => void;
  onCheckAnswer: () => void;
  showNavigator: boolean;
  setShowNavigator: (show: boolean) => void;
  isTimerHidden: boolean;
  setIsTimerHidden: (hidden: boolean) => void;
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
  setIsTimerHidden,
}: MathQuestionLayoutProps) {
  const navigate = useNavigate();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const [showCalculator, setShowCalculator] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isEliminationMode, setIsEliminationMode] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentState = currentQuestion 
    ? questionStates[currentQuestion.id] || getInitialQuestionState() 
    : null;
  
  const isGridInQuestion = currentQuestion?.isGridIn;
  const hasEliminations = (currentState?.eliminatedOptions?.length || 0) > 0;
  const isCorrect = currentState?.userAnswer === currentQuestion?.correctAnswer;

  const handleSelectAnswer = (letter: string) => {
    if (!currentQuestion) return;
    if (currentState?.checkedOptions?.includes(letter)) return;
    onUpdateState(currentQuestion.id, {
      userAnswer: currentState?.userAnswer === letter ? null : letter,
      checked: false,
    });
  };

  const handleToggleElimination = (letter: string) => {
    if (!currentQuestion) return;
    const eliminated = currentState?.eliminatedOptions || [];
    const newEliminated = eliminated.includes(letter)
      ? eliminated.filter(l => l !== letter)
      : [...eliminated, letter];
    onUpdateState(currentQuestion.id, { eliminatedOptions: newEliminated });
  };

  const handleUndoEliminations = () => {
    if (!currentQuestion) return;
    onUpdateState(currentQuestion.id, { eliminatedOptions: [] });
  };

  const handleToggleMark = () => {
    if (!currentQuestion) return;
    onUpdateState(currentQuestion.id, {
      markedForReview: !currentState?.markedForReview,
    });
  };

  if (!currentQuestion) return null;

  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col",
      isFullscreen && "h-screen overflow-hidden"
    )}>
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center justify-between px-2 sm:px-4 h-12 sm:h-14">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-1 sm:gap-3 min-w-0">
            <button onClick={() => navigate('/practice')} className="p-1.5 sm:p-2 rounded-md hover:bg-muted transition-colors flex-shrink-0">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-semibold text-foreground truncate">Question Bank</span>
              <button className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                Directions <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Center: Timer (hidden on small mobile) */}
          <div className="hidden sm:flex items-center gap-2">
            <Timer questionId={currentQuestion.id} isHidden={isTimerHidden} />
            <button onClick={() => setIsTimerHidden(!isTimerHidden)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground hover:bg-muted rounded-md transition-colors border border-border">
              <span className="flex gap-0.5"><span className="w-0.5 h-3 bg-foreground"></span><span className="w-0.5 h-3 bg-foreground"></span></span>
              {isTimerHidden ? 'Show' : 'Hide'}
            </button>
          </div>

          {/* Right: Tools */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button onClick={() => setShowCalculator(!showCalculator)} className={cn("flex flex-col items-center gap-0.5 px-2 sm:px-3 py-1 rounded-md transition-colors", showCalculator ? "bg-muted" : "hover:bg-muted")}>
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Calculator</span>
            </button>
            <button onClick={() => setShowReference(!showReference)} className={cn("flex flex-col items-center gap-0.5 px-2 sm:px-3 py-1 rounded-md transition-colors", showReference ? "bg-muted" : "hover:bg-muted")}>
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Reference</span>
            </button>
            <button onClick={toggleFullscreen} className="hidden sm:flex flex-col items-center gap-0.5 px-3 py-1 rounded-md hover:bg-muted transition-colors">
              {isFullscreen ? <Minimize className="w-5 h-5 text-foreground" /> : <Maximize className="w-5 h-5 text-foreground" />}
              <span className="text-xs text-muted-foreground">Fullscreen</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex justify-center overflow-y-auto">
        <div className="w-full max-w-4xl px-4 sm:px-8 py-4 sm:py-6">
          <AnimatePresence mode="wait">
            <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {/* Question toolbar */}
              <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-border">
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-foreground text-background text-sm sm:text-base font-bold rounded">{currentIndex + 1}</span>
                  <button onClick={handleToggleMark} className={cn("flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm transition-colors", currentState?.markedForReview ? "bg-amber-50 text-amber-700" : "text-muted-foreground hover:bg-muted")}>
                    <Bookmark className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", currentState?.markedForReview && "fill-amber-500")} />
                    <span className="hidden sm:inline">Mark for Review</span>
                    <span className="sm:hidden">Mark</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><Flag className="w-4 h-4" /> Report</button>
                  <button onClick={() => setIsEliminationMode(!isEliminationMode)} className={cn("flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded transition-colors", isEliminationMode ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted border border-border")} title={isEliminationMode ? "Exit elimination mode" : "Enter elimination mode"}>
                    <span className="relative text-xs sm:text-sm font-bold">S<span className="absolute inset-0 flex items-center justify-center"><span className="w-full h-[1.5px] bg-current rotate-[-20deg]" /></span></span>
                  </button>
                  {hasEliminations && <button onClick={handleUndoEliminations} className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground" title="Undo all eliminations"><Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Undo</button>}
                </div>
              </div>

              {/* Question text */}
              <div className="mb-6 sm:mb-8">
                <LatexRenderer content={currentQuestion.questionPrompt || ''} className="text-[15px] sm:text-[17px] leading-relaxed text-foreground" />
                {(currentQuestion as any).image && (
                  <div className="mt-4 sm:mt-6 flex justify-center">
                    <img 
                      src={(currentQuestion as any).image} 
                      alt="Question Diagram" 
                      className="max-w-[280px] sm:max-w-[360px] w-auto h-auto"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              {/* Options */}
              {isGridInQuestion ? (
                <GridInInput value={currentState?.userAnswer || ''} onChange={(value) => onUpdateState(currentQuestion.id, { userAnswer: value })} isChecked={currentState?.checked || false} isCorrect={isCorrect} correctAnswer={currentQuestion.correctAnswer} />
              ) : (
                <div className="space-y-2.5 sm:space-y-3">
                  {Object.entries(currentQuestion.options || {}).map(([letter, text]) => {
                    const isThisCheckedWrong = currentState?.checkedOptions?.includes(letter) && letter !== currentQuestion.correctAnswer;
                    const isThisSelected = currentState?.userAnswer === letter;
                    const isOptionChecked = currentState?.checkedOptions?.includes(letter) || false;
                    
                    return (
                      <MathQuestionOption
                        key={letter}
                        label={letter}
                        text={text as string}
                        isSelected={isThisSelected}
                        onClick={() => handleSelectAnswer(letter)}
                        isEliminated={currentState?.eliminatedOptions?.includes(letter) || false}
                        showEliminationButtons={isEliminationMode || (currentState?.eliminatedOptions?.includes(letter) || false)}
                        onEliminate={() => handleToggleElimination(letter)}
                        isChecked={currentState?.checked || false}
                        isOptionChecked={isOptionChecked}
                        correctAnswer={currentQuestion.correctAnswer}
                        showResult={currentState?.checked || isThisCheckedWrong}
                        isCorrect={currentState?.checked && isCorrect && letter === currentQuestion.correctAnswer}
                        isIncorrect={(currentState?.checked && isThisSelected && !isCorrect) || isThisCheckedWrong}
                        disabled={(currentState?.checked && isCorrect) || isThisCheckedWrong}
                        onCheckOption={() => {
                          const checkedOptions = currentState?.checkedOptions || [];
                          if (!checkedOptions.includes(letter)) {
                            onUpdateState(currentQuestion.id, {
                              checkedOptions: [...checkedOptions, letter],
                              checked: letter === currentQuestion.correctAnswer,
                            });
                            if (letter === currentQuestion.correctAnswer) {
                              onCheckAnswer();
                            }
                          }
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="sticky bottom-0 bg-background border-t border-border">
        {/* Mobile footer: stacked layout */}
        <div className="flex sm:hidden flex-col gap-2 px-3 py-2.5">
          <div className="flex items-center justify-between">
            <button onClick={() => setShowNavigator(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background rounded-full text-xs font-medium">
              {currentIndex + 1} of {questions.length} <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setShowExplanation(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                <Lightbulb className="w-3.5 h-3.5" /> Explain
              </button>
              {!(currentState?.checked && isCorrect) ? (
                <button
                  onClick={() => {
                    if (currentState?.userAnswer) {
                      const checkedOptions = currentState?.checkedOptions || [];
                      if (!checkedOptions.includes(currentState.userAnswer)) {
                        onUpdateState(currentQuestion.id, { checkedOptions: [...checkedOptions, currentState.userAnswer], checked: true });
                      } else {
                        onUpdateState(currentQuestion.id, { checked: true });
                      }
                      onCheckAnswer();
                    }
                  }}
                  disabled={!currentState?.userAnswer}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors", currentState?.userAnswer ? "bg-foreground/10 text-foreground border border-foreground/30" : "text-muted-foreground border border-border cursor-not-allowed")}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> Check
                </button>
              ) : (<span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-500 text-white">Correct!</span>)}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => onNavigate('prev')} disabled={currentIndex === 0} className="px-4 text-xs h-8 border-border text-foreground">Previous</Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate('next')} disabled={currentIndex === questions.length - 1} className="px-4 text-xs h-8 border-border text-foreground">Next</Button>
          </div>
        </div>

        {/* Desktop footer: single row */}
        <div className="hidden sm:flex items-center justify-between px-4 py-3">
          <button onClick={() => setShowNavigator(true)} className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-full text-sm font-medium hover:bg-foreground/90 transition-colors">
            {currentIndex + 1} of {questions.length} <ChevronDown className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-muted transition-colors"><Info className="w-5 h-5 text-muted-foreground" /></button>
            <button onClick={() => setShowExplanation(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors border border-purple-200">
              <Lightbulb className="w-4 h-4" /> Explanation
            </button>
            {!(currentState?.checked && isCorrect) ? (
              <button
                onClick={() => {
                  if (currentState?.userAnswer) {
                    const checkedOptions = currentState?.checkedOptions || [];
                    if (!checkedOptions.includes(currentState.userAnswer)) {
                      onUpdateState(currentQuestion.id, { checkedOptions: [...checkedOptions, currentState.userAnswer], checked: true });
                    } else {
                      onUpdateState(currentQuestion.id, { checked: true });
                    }
                    onCheckAnswer();
                  }
                }}
                disabled={!currentState?.userAnswer}
                className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors", currentState?.userAnswer ? "bg-foreground/10 text-foreground hover:bg-foreground/20 border border-foreground/30" : "text-muted-foreground border border-border cursor-not-allowed")}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> Check
              </button>
            ) : (<span className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-green-500 text-white">Correct!</span>)}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onNavigate('prev')} disabled={currentIndex === 0} className="px-5 border-border text-foreground">Previous</Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate('next')} disabled={currentIndex === questions.length - 1} className="px-5 border-border text-foreground">Next</Button>
          </div>
        </div>
      </footer>

      <QuestionNavigator totalQuestions={questions.length} currentIndex={currentIndex} questionStates={questionStates} questionIds={questions.map(q => q.id)} onNavigate={(index) => onNavigate(index)} isOpen={showNavigator} onClose={() => setShowNavigator(false)} />
      <ExplanationPanel isOpen={showExplanation} onClose={() => setShowExplanation(false)} explanation={currentQuestion.explanation} correctAnswer={currentQuestion.correctAnswer} />
      <DesmosCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
      <MathReferenceSheet isOpen={showReference} onClose={() => setShowReference(false)} />
    </div>
  );
}
