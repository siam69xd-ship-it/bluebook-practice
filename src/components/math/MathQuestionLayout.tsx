import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const isWrong = currentState?.checked && !isCorrect;

  // Allow selecting new answer after checking wrong - just track checked options
  const handleSelectAnswer = (letter: string) => {
    if (!currentQuestion) return;
    // Don't allow selecting already checked wrong options
    if (currentState?.checkedOptions?.includes(letter)) return;
    onUpdateState(currentQuestion.id, {
      userAnswer: currentState?.userAnswer === letter ? null : letter,
      // Reset checked state when selecting new answer after wrong
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
      "min-h-screen bg-white flex flex-col",
      isFullscreen && "h-screen overflow-hidden"
    )}>
      {/* Header - SAT Bluebook Style */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left: Back arrow, Title with Directions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/practice')}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-gray-900">SAT® Suite Question Bank</span>
              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                Directions <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Center: Timer with Pause and Hide */}
          <div className="flex items-center gap-2">
            <Timer 
              questionId={currentQuestion.id} 
              isHidden={isTimerHidden}
            />
            <button
              onClick={() => setIsTimerHidden(!isTimerHidden)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors border border-gray-300"
            >
              <span className="flex gap-0.5">
                <span className="w-0.5 h-3 bg-gray-700"></span>
                <span className="w-0.5 h-3 bg-gray-700"></span>
              </span>
              {isTimerHidden ? 'Show' : 'Hide'}
            </button>
          </div>

          {/* Right: Calculator, Reference, Fullscreen */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-md transition-colors",
                showCalculator ? "bg-gray-100" : "hover:bg-gray-100"
              )}
            >
              <Calculator className="w-5 h-5 text-gray-700" />
              <span className="text-xs text-gray-600">Calculator</span>
            </button>
            <button
              onClick={() => setShowReference(!showReference)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-md transition-colors",
                showReference ? "bg-gray-100" : "hover:bg-gray-100"
              )}
            >
              <BookOpen className="w-5 h-5 text-gray-700" />
              <span className="text-xs text-gray-600">Reference</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-gray-700" />
              ) : (
                <Maximize className="w-5 h-5 text-gray-700" />
              )}
              <span className="text-xs text-gray-600">Fullscreen</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Single Panel Centered */}
      <main className={cn(
        "flex-1 flex justify-center",
        isFullscreen ? "overflow-hidden" : "overflow-y-auto"
      )}>
        <div className={cn(
          "w-full max-w-4xl px-8 py-6",
          isFullscreen && "overflow-hidden"
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  {/* Question Number */}
                  <span className="flex items-center justify-center w-10 h-10 bg-gray-900 text-white text-base font-bold rounded">
                    {currentIndex + 1}
                  </span>
                  
                  {/* Mark for Review */}
                  <button
                    onClick={handleToggleMark}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      currentState?.markedForReview
                        ? "bg-amber-50 text-amber-700"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Bookmark className={cn(
                      "w-4 h-4",
                      currentState?.markedForReview && "fill-amber-500"
                    )} />
                    Mark for Review
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Report */}
                  <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                  
                  {/* Elimination Toggle */}
                  <button
                    onClick={() => setIsEliminationMode(!isEliminationMode)}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded transition-colors",
                      isEliminationMode 
                        ? "bg-gray-900 text-white" 
                        : "text-gray-500 hover:bg-gray-100 border border-gray-300"
                    )}
                    title={isEliminationMode ? "Exit elimination mode" : "Enter elimination mode"}
                  >
                    <span className="relative text-sm font-bold">
                      S
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-full h-[1.5px] bg-current rotate-[-20deg]" />
                      </span>
                    </span>
                  </button>
                  
                  {/* Undo Eliminations */}
                  {hasEliminations && (
                    <button
                      onClick={handleUndoEliminations}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                      title="Undo all eliminations"
                    >
                      <Undo2 className="w-4 h-4" />
                      Undo
                    </button>
                  )}
                </div>
              </div>

              {/* Question Text with LaTeX */}
              <div className="mb-8">
                <LatexRenderer 
                  content={currentQuestion.questionPrompt || ''} 
                  className="text-[17px] leading-relaxed text-gray-900"
                />
              </div>

              {/* Grid-In Input OR Multiple Choice Options */}
              {isGridInQuestion ? (
                <GridInInput
                  value={currentState?.userAnswer || ''}
                  onChange={(value) => onUpdateState(currentQuestion.id, { userAnswer: value })}
                  isChecked={currentState?.checked || false}
                  isCorrect={isCorrect}
                  correctAnswer={currentQuestion.correctAnswer}
                />
              ) : (
                <div className="space-y-3">
                  {Object.entries(currentQuestion.options).map(([letter, text]) => {
                    const isThisCheckedWrong = currentState?.checkedOptions?.includes(letter) && letter !== currentQuestion.correctAnswer;
                    const isThisSelected = currentState?.userAnswer === letter;
                    const showAsCorrect = currentState?.checked && isCorrect && letter === currentQuestion.correctAnswer;
                    const showAsWrong = currentState?.checked && isThisSelected && !isCorrect;
                    
                    return (
                      <MathQuestionOption
                        key={letter}
                        label={letter}
                        text={text}
                        isSelected={isThisSelected}
                        isCorrect={showAsCorrect}
                        isIncorrect={showAsWrong || isThisCheckedWrong}
                        showResult={currentState?.checked || isThisCheckedWrong}
                        onClick={() => handleSelectAnswer(letter)}
                        isEliminated={currentState?.eliminatedOptions?.includes(letter) || false}
                        showEliminationButtons={isEliminationMode || (currentState?.eliminatedOptions?.includes(letter) || false)}
                        onEliminate={() => handleToggleElimination(letter)}
                        disabled={(currentState?.checked && isCorrect) || isThisCheckedWrong}
                      />
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer - SAT Bluebook Style */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Question Navigator */}
          <button 
            onClick={() => setShowNavigator(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {currentIndex + 1} of {questions.length}
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Center: Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Info Button */}
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Info className="w-5 h-5 text-gray-500" />
            </button>
            
            {/* Explanation */}
            <button
              onClick={() => setShowExplanation(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors border border-purple-200"
            >
              <Lightbulb className="w-4 h-4" />
              Explanation
            </button>
            
            {/* Check Button - show check if not correct yet */}
            {!(currentState?.checked && isCorrect) ? (
              <button
                onClick={() => {
                  if (currentState?.userAnswer) {
                    // Track this option as checked
                    const checkedOptions = currentState?.checkedOptions || [];
                    if (!checkedOptions.includes(currentState.userAnswer)) {
                      onUpdateState(currentQuestion.id, {
                        checkedOptions: [...checkedOptions, currentState.userAnswer],
                      });
                    }
                    onCheckAnswer();
                  }
                }}
                disabled={!currentState?.userAnswer}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  currentState?.userAnswer
                    ? "bg-[#e6f7ff] text-[#0077cc] hover:bg-[#cceeff] border border-[#0077cc]"
                    : "text-gray-400 border border-gray-200 cursor-not-allowed"
                )}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Check
              </button>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-green-500 text-white">
                Correct!
              </span>
            )}
          </div>

          {/* Right: Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('prev')}
              disabled={currentIndex === 0}
              className="px-5 border-gray-300 text-gray-700"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('next')}
              disabled={currentIndex === questions.length - 1}
              className="px-5 border-gray-300 text-gray-700"
            >
              Next
            </Button>
          </div>
        </div>
        
        {/* SAT Disclaimer */}
        <div className="text-center py-2 text-xs text-gray-400 border-t border-gray-100">
          SAT® is a trademark registered by the College Board, which is not affiliated with, and does not endorse, this product.
        </div>
      </footer>

      {/* Modals */}
      <QuestionNavigator
        totalQuestions={questions.length}
        currentIndex={currentIndex}
        questionStates={questionStates}
        questionIds={questions.map(q => q.id)}
        onNavigate={(index) => onNavigate(index)}
        isOpen={showNavigator}
        onClose={() => setShowNavigator(false)}
      />

      <ExplanationPanel
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        explanation={currentQuestion.explanation}
        correctAnswer={currentQuestion.correctAnswer}
      />

      <DesmosCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
      <MathReferenceSheet isOpen={showReference} onClose={() => setShowReference(false)} />
    </div>
  );
}
