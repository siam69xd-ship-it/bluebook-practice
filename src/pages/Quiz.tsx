import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Grid3X3,
  Menu,
  Home,
  Check,
  Lightbulb,
  Maximize,
  Minimize,
  LogOut,
  User,
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
import { useAuth } from '@/contexts/AuthContext';
import { useFullscreen } from '@/hooks/useFullscreen';

export default function Quiz() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  
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

  // Load questions and saved progress on mount
  useEffect(() => {
    const loadData = async () => {
      clearQuestionCache(); // Clear cache to load fresh data
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
    // Don't allow selection if this option was already individually checked
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
    updateQuestionState(currentQuestion.id, { checked: true });
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
      return; // No valid navigation
    }

    // Reset the target question's answer state (fresh/unattempted on every visit)
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-xl font-medium text-foreground mb-4">No questions available</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-xl font-medium text-foreground mb-4">No questions found for this filter</p>
          <Button onClick={() => setActiveFilter({})}>Clear Filters</Button>
        </div>
      </div>
    );
  }

  const isCorrect = currentState?.userAnswer === currentQuestion.correctAnswer;

  return (
    <div className="min-h-screen bg-background flex">
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
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="iconSm"
                onClick={() => setShowFilterSidebar(true)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <button
                onClick={() => setShowFilterSidebar(!showFilterSidebar)}
                className="hidden lg:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Menu className="w-4 h-4" />
                Filters
              </button>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="hidden sm:flex"
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Timer questionId={currentQuestion.id} />
            </div>

            <div className="flex items-center gap-2">
              {/* Fullscreen Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </Button>

              {/* Mark for Review */}
              <Button
                variant={currentState?.markedForReview ? 'default' : 'outline'}
                size="sm"
                onClick={handleToggleMark}
                className={cn(
                  currentState?.markedForReview && 'bg-accent text-accent-foreground'
                )}
              >
                <Flag className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {currentState?.markedForReview ? 'Marked' : 'Mark'}
                </span>
              </Button>

              {/* Navigator */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNavigator(true)}
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Navigate</span>
              </Button>

              {/* User/Auth */}
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth')}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              )}
            </div>
          </div>

          {/* Highlight Tool Bar */}
          <div className="px-4 py-2 border-t border-border bg-muted/30">
            <HighlightTool
              selectedColor={selectedHighlightColor}
              onColorSelect={setSelectedHighlightColor}
            />
          </div>
        </header>

        {/* Question Content */}
        <main className="flex-1 flex flex-col lg:flex-row">
          {/* Passage/Question Area */}
          <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* Left Panel - Question Text / Passage */}
            <div className="flex-1 p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Topic Badge */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {currentQuestion.section}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {currentQuestion.subTopic || currentQuestion.topic}
                    </span>
                  </div>

                  {/* Question Number */}
                  <p className="text-sm text-muted-foreground mb-4">
                    Question {currentIndex + 1} of {filteredQuestions.length}
                  </p>

                  {/* Question Text */}
                  <HighlightableText
                    text={currentQuestion.questionText}
                    highlights={currentState?.highlights || []}
                    selectedColor={selectedHighlightColor}
                    onAddHighlight={handleAddHighlight}
                    onRemoveHighlight={handleRemoveHighlight}
                    className="quiz-passage text-foreground whitespace-pre-wrap"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Panel - Options */}
            <div className="flex-1 p-6 overflow-y-auto bg-muted/10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="space-y-3"
                >
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                    Select your answer
                  </h3>

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

                  {/* Check/Explanation Buttons */}
                  <div className="flex gap-3 pt-6">
                    {!currentState?.checked ? (
                      <Button
                        variant="check"
                        size="lg"
                        onClick={handleCheckAnswer}
                        disabled={!currentState?.userAnswer}
                        className="flex-1"
                      >
                        <Check className="w-5 h-5" />
                        Check Answer
                      </Button>
                    ) : (
                      <Button
                        variant={isCorrect ? 'success' : 'destructive'}
                        size="lg"
                        onClick={() => setShowExplanation(true)}
                        className="flex-1"
                      >
                        <Lightbulb className="w-5 h-5" />
                        {isCorrect ? 'Correct!' : 'Incorrect'} — View Explanation
                      </Button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <footer className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="nav"
              onClick={() => handleNavigate('prev')}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{currentIndex + 1}</span>
                {' / '}
                {filteredQuestions.length}
              </span>
            </div>

            <Button
              variant="nav"
              onClick={() => handleNavigate('next')}
              disabled={currentIndex === filteredQuestions.length - 1}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
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
