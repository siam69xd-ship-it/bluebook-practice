import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Flag,
  Menu,
  Strikethrough,
  Undo2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '@/components/ui/resizable';
import DraggableCalculator from '@/components/math/DraggableCalculator';
import MathReference from '@/components/math/MathReference';
import MathFilterSidebar from '@/components/math/MathFilterSidebar';
import MathQuestionOption from '@/components/math/MathQuestionOption';
import LatexRenderer from '@/components/math/LatexRenderer';
import GridInInput from '@/components/math/GridInInput';
import { loadAllMathQuestions, filterMathQuestions, parseOptionLabel, MathQuestion } from '@/lib/mathQuestionUtils';
import { LoadingProgressBar } from '@/components/LoadingProgressBar';
import { MathSkeleton } from '@/components/LoadingSkeleton';

export default function Math() {
  const navigate = useNavigate();
  const [allQuestions, setAllQuestions] = useState<MathQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<MathQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [gridInValue, setGridInValue] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  
  // UI States
  const [showCalculator, setShowCalculator] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [activeFilter, setActiveFilter] = useState<{ section?: string; topic?: string }>({});
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<string>>(new Set());
  const [isEliminationMode, setIsEliminationMode] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

  // Load questions
  useEffect(() => {
    loadAllMathQuestions().then(questions => {
      setAllQuestions(questions);
      setFilteredQuestions(questions);
      setIsLoading(false);
    });
  }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter questions
  useEffect(() => {
    const filtered = filterMathQuestions(allQuestions, activeFilter);
    setFilteredQuestions(filtered);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setEliminatedOptions(new Set());
  }, [activeFilter, allQuestions]);

  const currentQuestion = filteredQuestions[currentIndex];

  const formatTimer = (seconds: number) => {
    const mins = window.Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (currentQuestion?.isGridIn) {
      if (gridInValue.trim()) {
        setShowResult(true);
      }
    } else if (selectedAnswer) {
      setShowResult(true);
    }
  };

  const isGridInCorrect = () => {
    if (!currentQuestion) return false;
    const userAnswer = gridInValue.trim().toLowerCase();
    const correctAnswer = currentQuestion.answer.trim().toLowerCase();
    // Handle multiple acceptable answers (separated by comma or 'or')
    const acceptableAnswers = correctAnswer.split(/[,|]|or/).map(a => a.trim());
    return acceptableAnswers.some(ans => {
      // Check exact match or evaluate as number
      if (userAnswer === ans) return true;
      const userNum = parseFloat(userAnswer);
      const ansNum = parseFloat(ans);
      if (!isNaN(userNum) && !isNaN(ansNum)) {
        return window.Math.abs(userNum - ansNum) < 0.01;
      }
      return false;
    });
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setGridInValue('');
      setShowResult(false);
      setEliminatedOptions(new Set());
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setGridInValue('');
      setShowResult(false);
      setEliminatedOptions(new Set());
    }
  };

  const handleFilterChange = (filter: { section?: string; topic?: string }) => {
    setActiveFilter(filter);
    setShowFilterSidebar(false);
  };

  const toggleElimination = (optionLabel: string) => {
    const newEliminated = new Set(eliminatedOptions);
    if (newEliminated.has(optionLabel)) {
      newEliminated.delete(optionLabel);
    } else {
      newEliminated.add(optionLabel);
    }
    setEliminatedOptions(newEliminated);
  };

  const handleUndoEliminations = () => {
    setEliminatedOptions(new Set());
    setIsEliminationMode(false);
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentIndex)) {
      newFlagged.delete(currentIndex);
    } else {
      newFlagged.add(currentIndex);
    }
    setFlaggedQuestions(newFlagged);
  };

  if (!showContent) {
    return (
      <>
        <LoadingProgressBar isLoading={isLoading} onLoadingComplete={() => setShowContent(true)} />
        <MathSkeleton />
      </>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#1e2b3e] text-white">
        <p className="text-xl mb-4">No questions found for this filter.</p>
        <Button onClick={() => setActiveFilter({})} variant="outline" className="text-white border-white hover:bg-white/20">
          Show All Topics
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white">
      {/* Calculator */}
      <DraggableCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
      
      {/* Reference */}
      <MathReference isOpen={showReference} onClose={() => setShowReference(false)} />
      
      {/* Filter Sidebar */}
      <MathFilterSidebar
        questions={allQuestions}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        isOpen={showFilterSidebar}
        onClose={() => setShowFilterSidebar(false)}
      />

      {/* Header */}
      <header className="h-[60px] bg-[#1e2b3e] flex items-center justify-between px-4 flex-shrink-0">
        {/* Left */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setShowFilterSidebar(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="text-white font-bold text-lg">Section 2: Math</span>
          {activeFilter.topic && (
            <span className="text-white/70 text-sm">| {activeFilter.topic}</span>
          )}
        </div>

        {/* Center - Timer */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="bg-white text-black px-4 py-1.5 rounded-full font-mono font-medium">
            {formatTimer(timer)}
          </div>
        </div>

        {/* Right - Tools */}
        <div className="flex items-center gap-2">
          {/* Elimination Tool */}
          <Button
            variant="ghost"
            className={`text-white hover:bg-white/20 flex flex-col items-center gap-0.5 h-auto py-1 px-3 ${
              isEliminationMode ? 'bg-white/20' : ''
            }`}
            onClick={() => setIsEliminationMode(!isEliminationMode)}
          >
            <Strikethrough className="w-5 h-5" />
            <span className="text-[10px]">ABC</span>
          </Button>

          {eliminatedOptions.size > 0 && (
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 flex flex-col items-center gap-0.5 h-auto py-1 px-3"
              onClick={handleUndoEliminations}
            >
              <Undo2 className="w-5 h-5" />
              <span className="text-[10px]">Undo</span>
            </Button>
          )}

          <Button
            variant="ghost"
            className={`text-white hover:bg-white/20 flex flex-col items-center gap-0.5 h-auto py-1 px-3 ${
              showCalculator ? 'bg-white/20' : ''
            }`}
            onClick={() => setShowCalculator(!showCalculator)}
          >
            <Calculator className="w-5 h-5" />
            <span className="text-[10px]">Calculator</span>
          </Button>
          
          <Button
            variant="ghost"
            className={`text-white hover:bg-white/20 flex flex-col items-center gap-0.5 h-auto py-1 px-3 ${
              showReference ? 'bg-white/20' : ''
            }`}
            onClick={() => setShowReference(!showReference)}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px]">Reference</span>
          </Button>
          
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 flex flex-col items-center gap-0.5 h-auto py-1 px-3"
            onClick={() => navigate('/')}
          >
            <X className="w-5 h-5" />
            <span className="text-[10px]">Close</span>
          </Button>
        </div>
      </header>

      {/* Main Content - Split Pane */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
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
                  className={`h-7 px-2 ${flaggedQuestions.has(currentIndex) ? 'text-amber-500' : 'text-slate-400'}`}
                  onClick={toggleFlag}
                >
                  <Flag className={`w-4 h-4 ${flaggedQuestions.has(currentIndex) ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Question Text */}
              <div className="font-serif text-lg leading-relaxed text-[#1a1a1a]">
                <LatexRenderer content={currentQuestion.question} />
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
                  {currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((option, idx) => {
                      const { label, text } = parseOptionLabel(option);
                      const optionLabel = label || String.fromCharCode(65 + idx);
                      const isCorrect = showResult && optionLabel === currentQuestion.answer;
                      const isIncorrect = showResult && selectedAnswer === optionLabel && optionLabel !== currentQuestion.answer;
                      
                      return (
                        <MathQuestionOption
                          key={idx}
                          label={optionLabel}
                          text={text || option}
                          isSelected={selectedAnswer === optionLabel}
                          isCorrect={isCorrect}
                          isIncorrect={isIncorrect}
                          showResult={showResult}
                          onClick={() => handleAnswer(optionLabel)}
                          isEliminated={eliminatedOptions.has(optionLabel)}
                          showEliminationButtons={isEliminationMode}
                          onEliminate={() => toggleElimination(optionLabel)}
                          disabled={showResult}
                        />
                      );
                    })
                  ) : (
                    // Grid-in question
                    <GridInInput
                      value={gridInValue}
                      onChange={setGridInValue}
                      isChecked={showResult}
                      isCorrect={isGridInCorrect()}
                      correctAnswer={currentQuestion.answer}
                      disabled={showResult}
                    />
                  )}

                  {/* Submit Button */}
                  {!showResult && (
                    <Button
                      onClick={handleSubmit}
                      disabled={currentQuestion.isGridIn ? !gridInValue.trim() : !selectedAnswer}
                      className="w-full mt-6 bg-[#0077c8] hover:bg-[#005fa3] text-white"
                    >
                      Submit Answer
                    </Button>
                  )}

                  {/* Explanation */}
                  {showResult && (
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

      {/* Footer */}
      <footer className="h-[70px] bg-white border-t border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
        {/* Left - Question Count */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium">
            Question {currentIndex + 1} of {filteredQuestions.length}
          </div>
        </div>

        {/* Right - Navigation */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentIndex === filteredQuestions.length - 1}
            className="gap-2 bg-[#0077c8] hover:bg-[#005fa3] text-white rounded-full px-6"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
