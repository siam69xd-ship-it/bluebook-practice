import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Menu,
  Home,
  Lightbulb,
  Maximize,
  Minimize,
  Flag,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Timer } from '@/components/Timer';
import { HighlightTool } from '@/components/HighlightTool';
import { HighlightableText } from '@/components/HighlightableText';
import { QuestionOption } from '@/components/QuestionOption';
import { QuestionNavigator } from '@/components/QuestionNavigator';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { FilterSidebar } from '@/components/FilterSidebar';
import {
  getAllQuestionsAsync,
  clearQuestionCache,
  filterQuestions,
  saveProgress,
  loadProgress,
  getInitialQuestionState,
  Question,
  QuestionState,
  FilterOption,
  TextHighlight,
} from '@/lib/questionUtils';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Quiz() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const queryClient = useQueryClient();
  
  // State
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [activeFilter, setActiveFilter] = useState<Partial<FilterOption>>({});
  const [questionStates, setQuestionStates] = useState<{ [key: number]: QuestionState }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<string | null>(null);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showHighlightTool, setShowHighlightTool] = useState(false);
  const [isTimerHidden, setIsTimerHidden] = useState(false);

  // Fetch attempt counts for logged-in users
  const { data: attemptCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ['/api/attempts'],
    queryFn: async () => {
      const response = await fetch('/api/attempts', { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 401) return {};
        throw new Error('Failed to fetch attempts');
      }
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });

  // Save attempt mutation
  const saveAttemptMutation = useMutation({
    mutationFn: async (data: { questionId: string; selectedAnswer: string; isCorrect: boolean; timeSpent: number }) => {
      const response = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save attempt');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attempts'] });
    },
  });

  // Load questions and saved progress on mount
  useEffect(() => {
    const loadData = async () => {
      clearQuestionCache();
      const questions = await getAllQuestionsAsync();
      setAllQuestions(questions);
      
      const saved = loadProgress();
      if (saved) {
        setQuestionStates(saved.questionStates);
        setActiveFilter(saved.filter);
        setCurrentIndex(saved.currentIndex);
      }
      setIsLoaded(true);
    };
    loadData();
  }, []);

  // Filtered questions
  const filteredQuestions = useMemo(
    () => filterQuestions(allQuestions, activeFilter),
    [allQuestions, activeFilter]
  );

  const currentQuestion = filteredQuestions[currentIndex];
  const currentState = currentQuestion ? questionStates[currentQuestion.id] || getInitialQuestionState() : null;

  // Save progress on changes
  useEffect(() => {
    if (isLoaded && allQuestions.length > 0) {
      saveProgress(questionStates, currentIndex, activeFilter);
    }
  }, [questionStates, currentIndex, activeFilter, isLoaded, allQuestions.length]);

  // Reset current index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeFilter]);

  // Update question state
  const updateQuestionState = useCallback((questionId: number, updates: Partial<QuestionState>) => {
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || getInitialQuestionState()),
        ...updates,
      },
    }));
  }, []);

  // Handler: Select answer
  const handleSelectAnswer = (letter: string) => {
    if (!currentQuestion || currentState?.checked) return;
    if (currentState?.checkedOptions?.includes(letter)) return;
    updateQuestionState(currentQuestion.id, {
      userAnswer: currentState?.userAnswer === letter ? null : letter,
    });
  };

  // Handler: Check individual option
  const handleCheckOption = (letter: string) => {
    if (!currentQuestion) return;
    const checkedOptions = currentState?.checkedOptions || [];
    if (!checkedOptions.includes(letter)) {
      updateQuestionState(currentQuestion.id, {
        checkedOptions: [...checkedOptions, letter],
      });
    }
  };

  // Handler: Toggle elimination
  const handleToggleElimination = (letter: string) => {
    if (!currentQuestion) return;
    const eliminated = currentState?.eliminatedOptions || [];
    const newEliminated = eliminated.includes(letter)
      ? eliminated.filter(l => l !== letter)
      : [...eliminated, letter];
    updateQuestionState(currentQuestion.id, { eliminatedOptions: newEliminated });
  };

  // Handler: Toggle mark for review
  const handleToggleMark = () => {
    if (!currentQuestion) return;
    updateQuestionState(currentQuestion.id, {
      markedForReview: !currentState?.markedForReview,
    });
  };

  // Handler: Check answer
  const handleCheckAnswer = () => {
    if (!currentQuestion || !currentState?.userAnswer) return;
    
    const isCorrectAnswer = currentState.userAnswer === currentQuestion.correctAnswer;
    updateQuestionState(currentQuestion.id, { checked: true });
    
    // Save attempt for logged-in users
    if (isAuthenticated) {
      saveAttemptMutation.mutate({
        questionId: String(currentQuestion.id),
        selectedAnswer: currentState.userAnswer,
        isCorrect: isCorrectAnswer,
        timeSpent: 0,
      });
    }
  };

  // Handler: Navigate
  const handleNavigate = (direction: 'prev' | 'next' | number) => {
    let targetIndex: number;
    
    if (typeof direction === 'number') {
      targetIndex = direction;
    } else if (direction === 'prev' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < filteredQuestions.length - 1) {
      targetIndex = currentIndex + 1;
    } else {
      return;
    }

    const targetQuestion = filteredQuestions[targetIndex];
    if (targetQuestion) {
      updateQuestionState(targetQuestion.id, { 
        userAnswer: null, 
        checked: false,
        checkedOptions: [],
      });
    }

    setCurrentIndex(targetIndex);
  };

  // Handler: Filter change
  const handleFilterChange = (filter: Partial<FilterOption>) => {
    setActiveFilter(filter);
    setShowFilterSidebar(false);
  };

  // Handler: Add highlight
  const handleAddHighlight = (highlight: TextHighlight) => {
    if (!currentQuestion) return;
    const currentHighlights = currentState?.highlights || [];
    updateQuestionState(currentQuestion.id, {
      highlights: [...currentHighlights, highlight],
    });
  };

  // Handler: Remove highlight
  const handleRemoveHighlight = (index: number) => {
    if (!currentQuestion) return;
    const currentHighlights = currentState?.highlights || [];
    updateQuestionState(currentQuestion.id, {
      highlights: currentHighlights.filter((_, i) => i !== index),
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bluebook-bg">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bluebook-bg">
        <div className="text-center">
          <p className="text-xl font-medium text-foreground mb-4">No questions available</p>
          <Button onClick={() => navigate('/')} data-testid="button-return-home">Return Home</Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bluebook-bg">
        <div className="text-center">
          <p className="text-xl font-medium text-foreground mb-4">No questions found for this filter</p>
          <Button onClick={() => setActiveFilter({})} data-testid="button-clear-filters">Clear Filters</Button>
        </div>
      </div>
    );
  }

  const isCorrect = currentState?.userAnswer === currentQuestion.correctAnswer;

  return (
    <div className="min-h-screen bg-bluebook-bg flex">
      {/* Filter Sidebar */}
      <FilterSidebar
        questions={allQuestions}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        isOpen={showFilterSidebar}
        onClose={() => setShowFilterSidebar(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar - Bluebook Style */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 h-14">
            {/* Left: Back arrow, Home, Filter, Title */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                data-testid="button-back-home"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                data-testid="button-home"
              >
                <Home className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setShowFilterSidebar(!showFilterSidebar)}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                data-testid="button-filter-toggle"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-base font-medium text-gray-900 ml-2">Real DSAT Question Bank</span>
            </div>

            {/* Center: Timer with Hide toggle */}
            <div className="flex items-center gap-2">
              <Timer 
                questionId={currentQuestion.id} 
                isHidden={isTimerHidden}
              />
              <button
                onClick={() => setIsTimerHidden(!isTimerHidden)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                data-testid="button-hide-timer"
              >
                <span className="flex gap-0.5">
                  <span className="w-0.5 h-3 bg-gray-600"></span>
                  <span className="w-0.5 h-3 bg-gray-600"></span>
                </span>
                {isTimerHidden ? 'Show' : 'Hide'}
              </button>
            </div>

            {/* Right: Highlight, Fullscreen */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHighlightTool(!showHighlightTool)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 rounded-md transition-colors",
                  showHighlightTool ? "bg-gray-100" : "hover:bg-gray-100"
                )}
                data-testid="button-highlight-toggle"
              >
                <Pencil className="w-4 h-4 text-gray-600" />
                <span className="text-xs text-gray-600">Highlight</span>
              </button>
              <button
                onClick={toggleFullscreen}
                className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                data-testid="button-fullscreen"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4 text-gray-600" />
                ) : (
                  <Maximize className="w-4 h-4 text-gray-600" />
                )}
                <span className="text-xs text-gray-600">Fullscreen</span>
              </button>
            </div>
          </div>

          {/* Highlight Tool Bar */}
          {showHighlightTool && (
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <HighlightTool
                selectedColor={selectedHighlightColor}
                onColorSelect={setSelectedHighlightColor}
              />
            </div>
          )}
        </header>

        {/* Question Content - Two Panel Layout */}
        <main className="flex-1 flex flex-col lg:flex-row">
          {/* Left Panel - Passage */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-gray-200 bg-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <HighlightableText
                  text={(() => {
                    const text = currentQuestion.questionText;
                    const questionPatterns = [
                      /\n\n?Which choice[^?]+\?$/i,
                      /\n\n?Which [^?]+\?$/i,
                      /\n\n?What [^?]+\?$/i,
                      /\n\n?Based on [^?]+\?$/i,
                      /\n\n?According to [^?]+\?$/i,
                      /\n\n?The [^?]+which of the following[^?]+\?$/i,
                    ];
                    let passageText = text;
                    for (const pattern of questionPatterns) {
                      passageText = passageText.replace(pattern, '');
                    }
                    return passageText.trim();
                  })()}
                  highlights={currentState?.highlights || []}
                  selectedColor={selectedHighlightColor}
                  onAddHighlight={handleAddHighlight}
                  onRemoveHighlight={handleRemoveHighlight}
                  className="quiz-passage text-gray-800 whitespace-pre-wrap leading-relaxed text-base"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Panel - Question and Options */}
          <div className="flex-1 p-6 overflow-y-auto bg-bluebook-panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-gray-900 text-white text-sm font-bold rounded" data-testid="text-question-number">
                      {currentIndex + 1}
                    </span>
                    <button
                      onClick={handleToggleMark}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                        currentState?.markedForReview
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                      data-testid="button-mark-review"
                    >
                      <Bookmark className={cn(
                        "w-4 h-4",
                        currentState?.markedForReview && "fill-amber-500"
                      )} />
                      Mark for Review
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                      data-testid="button-report"
                    >
                      <Flag className="w-4 h-4" />
                      Report
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-full text-xs font-bold" data-testid="text-user-badge">
                      S
                    </span>
                  </div>
                </div>

                {/* Topic Badge */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary" data-testid="badge-section">
                    {currentQuestion.section}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600" data-testid="badge-topic">
                    {currentQuestion.subTopic || currentQuestion.topic}
                  </span>
                </div>

                {/* Question Text */}
                <p className="text-gray-800 mb-6 text-base leading-relaxed whitespace-pre-wrap" data-testid="text-question">
                  {(() => {
                    const text = currentQuestion.questionText;
                    // Check for "Which choice" pattern (common in SAT questions)
                    const whichChoiceMatch = text.match(/Which choice[^?]+\?/i);
                    if (whichChoiceMatch) {
                      return whichChoiceMatch[0];
                    }
                    // Fallback: if there's a double newline, show the last paragraph
                    if (text.includes('\n\n')) {
                      return text.split('\n\n').pop();
                    }
                    return 'Based on the text, select the best answer to the question.';
                  })()}
                </p>

                {/* Options */}
                <div className="space-y-3">
                  {Object.entries(currentQuestion.options).map(([letter, text]) => (
                    <QuestionOption
                      key={letter}
                      letter={letter}
                      text={text}
                      isSelected={currentState?.userAnswer === letter}
                      isEliminated={currentState?.eliminatedOptions?.includes(letter) || false}
                      isChecked={currentState?.checked || false}
                      isOptionChecked={currentState?.checkedOptions?.includes(letter) || false}
                      correctAnswer={currentQuestion.correctAnswer}
                      onSelect={() => handleSelectAnswer(letter)}
                      onEliminate={() => handleToggleElimination(letter)}
                      onCheckOption={() => handleCheckOption(letter)}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Bottom Navigation - Bluebook Style */}
        <footer className="sticky bottom-0 bg-white border-t border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left: Question Count */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowNavigator(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                data-testid="button-question-navigator"
              >
                {currentIndex + 1} of {filteredQuestions.length}
                <ChevronLeft className="w-4 h-4 rotate-[-90deg]" />
              </button>
              {isAuthenticated && currentQuestion && attemptCounts[String(currentQuestion.id)] && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Attempts: {attemptCounts[String(currentQuestion.id)]}
                </span>
              )}
            </div>

            {/* Center: Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExplanation(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-colors"
                data-testid="button-explanation"
              >
                <Lightbulb className="w-4 h-4" />
                Explanation
              </button>
              {!currentState?.checked ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={!currentState?.userAnswer}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    currentState?.userAnswer
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                  data-testid="button-check-answer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Check
                </button>
              ) : (
                <span className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                  isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
                )} data-testid="text-result">
                  {isCorrect ? "Correct!" : "Incorrect"}
                </span>
              )}
            </div>

            {/* Right: Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate('prev')}
                disabled={currentIndex === 0}
                className="gap-1 px-4 border-gray-300"
                data-testid="button-previous"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate('next')}
                disabled={currentIndex === filteredQuestions.length - 1}
                className="gap-1 px-4 border-gray-300"
                data-testid="button-next"
              >
                Next
              </Button>
            </div>
          </div>
          
          {/* SAT Disclaimer */}
          <div className="text-center py-2 text-xs text-gray-400 border-t border-gray-100">
            SAT is a trademark registered by the College Board, which is not affiliated with, and does not endorse, this product.
          </div>
        </footer>
      </div>

      {/* Question Navigator Modal */}
      <QuestionNavigator
        totalQuestions={filteredQuestions.length}
        currentIndex={currentIndex}
        questionStates={questionStates}
        questionIds={filteredQuestions.map(q => q.id)}
        onNavigate={(index) => handleNavigate(index)}
        isOpen={showNavigator}
        onClose={() => setShowNavigator(false)}
      />

      {/* Explanation Panel */}
      <ExplanationPanel
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        explanation={currentQuestion.explanation}
        correctAnswer={currentQuestion.correctAnswer}
      />
    </div>
  );
}
