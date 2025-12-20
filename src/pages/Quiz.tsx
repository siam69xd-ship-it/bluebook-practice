import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Home,
  Lightbulb,
  Maximize,
  Minimize,
  Flag,
  Pencil,
  Undo2,
  Calculator,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Timer } from '@/components/Timer';
import { HighlightTool } from '@/components/HighlightTool';
import { HighlightableText } from '@/components/HighlightableText';
import { QuestionOption } from '@/components/QuestionOption';
import { QuestionNavigator } from '@/components/QuestionNavigator';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { PassageRenderer } from '@/components/PassageRenderer';
import DesmosCalculator from '@/components/math/DesmosCalculator';
import MathReferenceSheet from '@/components/math/MathReferenceSheet';
import GridInInput from '@/components/math/GridInInput';
import LatexRenderer from '@/components/math/LatexRenderer';
import MathQuestionLayout from '@/components/math/MathQuestionLayout';
import {
  getAllQuestionsAsync,
  filterQuestions,
  saveProgress,
  loadProgress,
  getInitialQuestionState,
  clearQuestionCache,
  Question,
  QuestionState,
  FilterOption,
  TextHighlight,
} from '@/lib/questionUtils';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Difficulty } from '@/lib/difficultyData';

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showHighlightTool, setShowHighlightTool] = useState(false);
  const [isTimerHidden, setIsTimerHidden] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [practiceTopicInfo, setPracticeTopicInfo] = useState<{topic?: string; subTopic?: string} | null>(null);
  const [isEliminationMode, setIsEliminationMode] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [gridInAnswer, setGridInAnswer] = useState('');

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

  // Load questions function (used for initial load and retry)
  const loadQuestions = useCallback(async () => {
    setLoadError(false);
    setIsLoaded(false);
    clearQuestionCache(); // Clear cache to ensure fresh data
    
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptLoad = async (): Promise<void> => {
      const questions = await getAllQuestionsAsync();
      if (questions.length > 0) {
        // Check for practice config from sessionStorage
        const practiceConfigStr = sessionStorage.getItem('practiceConfig');
        let filteredByDifficulty = questions;
        
        if (practiceConfigStr) {
          try {
            const practiceConfig = JSON.parse(practiceConfigStr);
            const { filter, difficulties } = practiceConfig;
            
            // Set practice mode flag and topic info
            setIsPracticeMode(true);
            if (filter) {
              setPracticeTopicInfo({
                topic: filter.topic,
                subTopic: filter.subTopic,
              });
            }
            
            // Apply difficulty filter
            if (difficulties) {
              const activeDifficulties = Object.entries(difficulties)
                .filter(([_, selected]) => selected)
                .map(([diff]) => diff as Difficulty);
              
              if (activeDifficulties.length > 0 && activeDifficulties.length < 3) {
                filteredByDifficulty = questions.filter(q => 
                  q.difficulty && activeDifficulties.includes(q.difficulty)
                );
              }
            }
            
            // Apply topic filter
            if (filter && Object.keys(filter).length > 0) {
              setActiveFilter(filter);
            }
            
            // Clear the practice config after use
            sessionStorage.removeItem('practiceConfig');
          } catch (e) {
            console.error('Error parsing practice config:', e);
          }
        }
        
        setAllQuestions(filteredByDifficulty);
        
        const saved = loadProgress();
        if (saved && !practiceConfigStr) {
          setQuestionStates(saved.questionStates);
          setActiveFilter(saved.filter);
          setCurrentIndex(saved.currentIndex);
        }
        setIsLoaded(true);
      } else if (retryCount < maxRetries) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 500));
        return attemptLoad();
      } else {
        setLoadError(true);
        setIsLoaded(true);
      }
    };
    
    attemptLoad();
  }, []);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Filtered questions
  const filteredQuestions = useMemo(
    () => filterQuestions(allQuestions, activeFilter),
    [allQuestions, activeFilter]
  );

  const currentQuestion = filteredQuestions[currentIndex];
  const currentState = currentQuestion ? questionStates[currentQuestion.id] || getInitialQuestionState() : null;
  const isMathQuestion = currentQuestion?.section === 'Math';
  const isGridInQuestion = isMathQuestion && currentQuestion?.isGridIn;

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

  // Handler: Undo all eliminations for current question
  const handleUndoEliminations = () => {
    if (!currentQuestion) return;
    updateQuestionState(currentQuestion.id, { eliminatedOptions: [] });
  };

  const hasEliminations = (currentState?.eliminatedOptions?.length || 0) > 0;

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

  if (loadError || allQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bluebook-bg">
        <div className="text-center">
          <p className="text-xl font-medium text-foreground mb-2">Failed to load questions</p>
          <p className="text-muted-foreground mb-4">Please check your connection and try again.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={loadQuestions} data-testid="button-retry">Try Again</Button>
            <Button variant="outline" onClick={() => navigate('/')} data-testid="button-return-home">Return Home</Button>
          </div>
        </div>
      </div>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bluebook-bg">
        <div className="text-center">
          <p className="text-xl font-medium text-foreground mb-4">No questions match this filter</p>
          <Button onClick={() => setActiveFilter({})} data-testid="button-clear-filters">Clear Filters</Button>
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

  // Use Math-specific layout for Math questions
  if (isMathQuestion) {
    return (
      <MathQuestionLayout
        questions={filteredQuestions}
        currentIndex={currentIndex}
        questionStates={questionStates}
        onNavigate={handleNavigate}
        onUpdateState={updateQuestionState}
        onCheckAnswer={handleCheckAnswer}
        showNavigator={showNavigator}
        setShowNavigator={setShowNavigator}
        isTimerHidden={isTimerHidden}
        setIsTimerHidden={setIsTimerHidden}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bluebook-bg flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar - Bluebook Style */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 h-14">
            {/* Left: Back arrow, Title with Directions dropdown */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                data-testid="button-back-home"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex flex-col">
                <span className="text-base font-medium text-gray-900">SAT® Suite Question Bank</span>
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                  Directions <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Center: Timer with Hide toggle */}
            <div className="flex items-center gap-2">
              <Timer 
                questionId={currentQuestion.id} 
                isHidden={isTimerHidden}
              />
              <button
                onClick={() => setIsTimerHidden(!isTimerHidden)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors border border-gray-300"
                data-testid="button-hide-timer"
              >
                <span className="flex gap-0.5">
                  <span className="w-0.5 h-3 bg-gray-600"></span>
                  <span className="w-0.5 h-3 bg-gray-600"></span>
                </span>
                {isTimerHidden ? 'Show' : 'Hide'}
              </button>
            </div>

            {/* Right: Calculator (Math), Reference (Math), Highlight (English), Fullscreen */}
            <div className="flex items-center gap-1">
              {/* Calculator - Math only */}
              {isMathQuestion && (
                <button
                  onClick={() => setShowCalculator(!showCalculator)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-3 py-1 rounded-md transition-colors",
                    showCalculator ? "bg-gray-100" : "hover:bg-gray-100"
                  )}
                  data-testid="button-calculator"
                >
                  <Calculator className="w-5 h-5 text-gray-600" />
                  <span className="text-xs text-gray-600">Calculator</span>
                </button>
              )}
              
              {/* Reference - Math only */}
              {isMathQuestion && (
                <button
                  onClick={() => setShowReference(!showReference)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-3 py-1 rounded-md transition-colors",
                    showReference ? "bg-gray-100" : "hover:bg-gray-100"
                  )}
                  data-testid="button-reference"
                >
                  <BookOpen className="w-5 h-5 text-gray-600" />
                  <span className="text-xs text-gray-600">Reference</span>
                </button>
              )}
              
              {/* Highlight - English only */}
              {!isMathQuestion && (
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
              )}
              
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

          {/* Highlight Tool Bar - English only */}
          {showHighlightTool && !isMathQuestion && (
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
                  text={currentQuestion.passage || ''}
                  highlights={currentState?.highlights || []}
                  selectedColor={selectedHighlightColor}
                  onAddHighlight={handleAddHighlight}
                  onRemoveHighlight={handleRemoveHighlight}
                  className="quiz-passage whitespace-pre-wrap"
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
                  <div className="flex items-center gap-3">
                    <button 
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                      data-testid="button-report"
                    >
                      <Flag className="w-4 h-4" />
                      Report
                    </button>
                    {/* Elimination Tool Toggle */}
                    <button
                      onClick={() => setIsEliminationMode(!isEliminationMode)}
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded transition-colors",
                        isEliminationMode 
                          ? "bg-gray-900 text-white" 
                          : "text-gray-500 hover:bg-gray-100"
                      )}
                      title={isEliminationMode ? "Exit elimination mode" : "Enter elimination mode"}
                      data-testid="button-elimination-toggle"
                    >
                      {/* Custom strikethrough S icon */}
                      <span className="relative text-sm font-bold">
                        S
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-full h-[1.5px] bg-current rotate-[-20deg]" />
                        </span>
                      </span>
                    </button>
                    {/* Undo Eliminations - shows when there are eliminations */}
                    {hasEliminations && (
                      <button
                        onClick={handleUndoEliminations}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                        title="Undo all eliminations"
                        data-testid="button-undo-eliminations"
                      >
                        <Undo2 className="w-4 h-4" />
                        Undo
                      </button>
                    )}
                  </div>
                </div>

                {/* Section Badge - Show topic only in Practice mode */}
                {isPracticeMode && practiceTopicInfo && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary" data-testid="badge-section">
                      {currentQuestion.section}
                    </span>
                    {practiceTopicInfo.topic && (
                      <>
                        <span className="text-gray-400">|</span>
                        <span className="text-xs font-medium text-gray-600">
                          {practiceTopicInfo.subTopic || practiceTopicInfo.topic}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Question Text - Use LaTeX for Math */}
                {isMathQuestion && currentQuestion.hasLatex ? (
                  <LatexRenderer 
                    content={currentQuestion.questionPrompt || ''} 
                    className="quiz-question mb-6 text-gray-900"
                  />
                ) : (
                  <PassageRenderer 
                    content={currentQuestion.questionPrompt || 'Based on the text, select the best answer to the question.'}
                    className="quiz-question mb-6"
                  />
                )}

                {/* Grid-In Input for Math questions without options */}
                {isGridInQuestion ? (
                  <GridInInput
                    value={currentState?.userAnswer || ''}
                    onChange={(value) => updateQuestionState(currentQuestion.id, { userAnswer: value })}
                    isChecked={currentState?.checked || false}
                    isCorrect={currentState?.userAnswer === currentQuestion.correctAnswer}
                    correctAnswer={currentQuestion.correctAnswer}
                  />
                ) : (
                  /* Multiple Choice Options */
                  <div className="space-y-3">
                    {Object.entries(currentQuestion.options).map(([letter, text]) => (
                      <QuestionOption
                        key={letter}
                        letter={letter}
                        text={isMathQuestion ? text : text}
                        isSelected={currentState?.userAnswer === letter}
                        isEliminated={currentState?.eliminatedOptions?.includes(letter) || false}
                        isChecked={currentState?.checked || false}
                        isOptionChecked={currentState?.checkedOptions?.includes(letter) || false}
                        correctAnswer={currentQuestion.correctAnswer}
                        onSelect={() => handleSelectAnswer(letter)}
                        onEliminate={() => handleToggleElimination(letter)}
                        onCheckOption={() => handleCheckOption(letter)}
                        showEliminationButtons={isEliminationMode}
                      />
                    ))}
                  </div>
                )}
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

      {/* Math Tools */}
      <DesmosCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
      <MathReferenceSheet isOpen={showReference} onClose={() => setShowReference(false)} />
    </div>
  );
}
