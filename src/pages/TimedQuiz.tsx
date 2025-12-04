import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Home,
  Maximize,
  Minimize,
  Flag,
  Pencil,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HighlightTool } from '@/components/HighlightTool';
import { HighlightableText } from '@/components/HighlightableText';
import { QuestionOption } from '@/components/QuestionOption';
import { QuestionNavigator } from '@/components/QuestionNavigator';
import {
  getAllQuestionsAsync,
  clearQuestionCache,
  Question,
  QuestionState,
  TextHighlight,
  getInitialQuestionState,
} from '@/lib/questionUtils';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useQueryClient } from '@tanstack/react-query';

interface TopicInfo {
  name: string;
  subSection: string;
  count: number;
  selected: boolean;
}

interface QuizConfig {
  topics: TopicInfo[];
  questionCount: number;
  timeInSeconds: number;
}

type QuizPhase = 'setup' | 'active' | 'completed';

function shuffleWithoutConsecutiveSameTopic(questions: Question[]): Question[] {
  if (questions.length <= 1) return questions;
  
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  for (let attempts = 0; attempts < 100; attempts++) {
    let hasConsecutive = false;
    for (let i = 0; i < shuffled.length - 1; i++) {
      if (shuffled[i].topic === shuffled[i + 1].topic) {
        hasConsecutive = true;
        for (let j = i + 2; j < shuffled.length; j++) {
          if (shuffled[j].topic !== shuffled[i].topic) {
            [shuffled[i + 1], shuffled[j]] = [shuffled[j], shuffled[i + 1]];
            break;
          }
        }
      }
    }
    if (!hasConsecutive) break;
  }
  
  return shuffled;
}

function calculateQuizTime(questions: Question[], requestedCount: number): number {
  if (questions.length === 0) return 0;
  
  const actualCount = Math.min(requestedCount, questions.length);
  
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const selectedQuestions = shuffled.slice(0, actualCount);
  
  const secQuestions = selectedQuestions.filter(q => q.subSection === 'Standard English Conventions');
  const secRatio = secQuestions.length / selectedQuestions.length;
  
  let timePerQuestion = 60;
  if (secRatio > 0.5) {
    timePerQuestion = Math.max(45, 60 - (secRatio - 0.5) * 30);
  }
  
  return Math.round(actualCount * timePerQuestion);
}

export default function TimedQuiz() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const queryClient = useQueryClient();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [questionStates, setQuestionStates] = useState<{ [key: number]: QuestionState }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<string | null>(null);
  const [showNavigator, setShowNavigator] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showHighlightTool, setShowHighlightTool] = useState(false);
  
  const [quizPhase, setQuizPhase] = useState<QuizPhase>('setup');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [questionCount, setQuestionCount] = useState(30);
  const [reviewingQuestion, setReviewingQuestion] = useState<number | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      clearQuestionCache();
      const questions = await getAllQuestionsAsync();
      setAllQuestions(questions);
      setIsLoaded(true);
    };
    loadData();
  }, []);
  
  const topicGroups = useMemo(() => {
    const groups: { [subSection: string]: { [topic: string]: number } } = {};
    allQuestions.forEach(q => {
      if (!groups[q.subSection]) groups[q.subSection] = {};
      const topic = q.subTopic || q.topic;
      groups[q.subSection][topic] = (groups[q.subSection][topic] || 0) + 1;
    });
    return groups;
  }, [allQuestions]);
  
  const availableQuestions = useMemo(() => {
    if (selectedTopics.size === 0) return allQuestions;
    return allQuestions.filter(q => {
      const topic = q.subTopic || q.topic;
      return selectedTopics.has(topic);
    });
  }, [allQuestions, selectedTopics]);
  
  const calculatedTime = useMemo(() => {
    return calculateQuizTime(availableQuestions, questionCount);
  }, [availableQuestions, questionCount]);
  
  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topic)) {
        newSet.delete(topic);
      } else {
        newSet.add(topic);
      }
      return newSet;
    });
  };
  
  const selectAllInSubSection = (subSection: string) => {
    const topics = Object.keys(topicGroups[subSection] || {});
    setSelectedTopics(prev => {
      const newSet = new Set(prev);
      const allSelected = topics.every(t => newSet.has(t));
      if (allSelected) {
        topics.forEach(t => newSet.delete(t));
      } else {
        topics.forEach(t => newSet.add(t));
      }
      return newSet;
    });
  };
  
  const startQuiz = () => {
    if (availableQuestions.length === 0) return;
    
    const actualCount = Math.min(questionCount, availableQuestions.length);
    const shuffled = shuffleWithoutConsecutiveSameTopic(availableQuestions);
    const selected = shuffled.slice(0, actualCount);
    
    setQuizQuestions(selected);
    setTimeRemaining(calculatedTime);
    setCurrentIndex(0);
    setQuestionStates({});
    setQuizPhase('active');
  };
  
  useEffect(() => {
    if (quizPhase !== 'active') return;
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizPhase]);
  
  const submitQuiz = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setQuizPhase('completed');
  }, []);
  
  const currentQuestion = quizQuestions[currentIndex];
  const currentState = currentQuestion ? questionStates[currentQuestion.id] || getInitialQuestionState() : null;
  
  const updateQuestionState = useCallback((questionId: number, updates: Partial<QuestionState>) => {
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || getInitialQuestionState()),
        ...updates,
      },
    }));
  }, []);
  
  const handleSelectAnswer = (letter: string) => {
    if (!currentQuestion || quizPhase !== 'active') return;
    updateQuestionState(currentQuestion.id, {
      userAnswer: currentState?.userAnswer === letter ? null : letter,
    });
  };
  
  const handleToggleElimination = (letter: string) => {
    if (!currentQuestion || quizPhase !== 'active') return;
    const eliminated = currentState?.eliminatedOptions || [];
    const newEliminated = eliminated.includes(letter)
      ? eliminated.filter(l => l !== letter)
      : [...eliminated, letter];
    updateQuestionState(currentQuestion.id, { eliminatedOptions: newEliminated });
  };
  
  const handleToggleMark = () => {
    if (!currentQuestion || quizPhase !== 'active') return;
    updateQuestionState(currentQuestion.id, {
      markedForReview: !currentState?.markedForReview,
    });
  };
  
  const handleNavigate = (direction: 'prev' | 'next' | number) => {
    let targetIndex: number;
    
    if (typeof direction === 'number') {
      targetIndex = direction;
    } else if (direction === 'prev' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < quizQuestions.length - 1) {
      targetIndex = currentIndex + 1;
    } else {
      return;
    }
    
    setCurrentIndex(targetIndex);
  };
  
  const handleAddHighlight = (highlight: TextHighlight) => {
    if (!currentQuestion) return;
    const currentHighlights = currentState?.highlights || [];
    updateQuestionState(currentQuestion.id, {
      highlights: [...currentHighlights, highlight],
    });
  };
  
  const handleRemoveHighlight = (index: number) => {
    if (!currentQuestion) return;
    const currentHighlights = currentState?.highlights || [];
    updateQuestionState(currentQuestion.id, {
      highlights: currentHighlights.filter((_, i) => i !== index),
    });
  };
  
  const quizResults = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    
    quizQuestions.forEach(q => {
      const state = questionStates[q.id];
      if (!state?.userAnswer) {
        unanswered++;
      } else if (state.userAnswer === q.correctAnswer) {
        correct++;
      } else {
        incorrect++;
      }
    });
    
    return { correct, incorrect, unanswered, total: quizQuestions.length };
  }, [quizQuestions, questionStates]);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
  
  if (quizPhase === 'setup') {
    return (
      <div className="min-h-screen bg-bluebook-bg">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-base font-medium text-gray-900">Quiz Setup</span>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Select Topics</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Choose one or more topics. Leave all unchecked to include all questions.
            </p>
            
            <div className="space-y-4">
              {Object.entries(topicGroups).map(([subSection, topics]) => (
                <div key={subSection} className="border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{subSection}</h3>
                    <button
                      onClick={() => selectAllInSubSection(subSection)}
                      className="text-sm text-primary hover:underline"
                    >
                      {Object.keys(topics).every(t => selectedTopics.has(t)) ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(topics).map(([topic, count]) => (
                      <button
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm transition-colors",
                          selectedTopics.has(topic)
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        {topic} ({count})
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Number of Questions</h2>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="200"
                value={Math.min(questionCount, availableQuestions.length)}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Math.min(200, Math.max(5, Number(e.target.value))))}
                  className="w-20 px-3 py-2 border rounded-lg text-center"
                />
                <span className="text-sm text-muted-foreground">
                  / {availableQuestions.length} available
                </span>
              </div>
            </div>
            {questionCount > availableQuestions.length && (
              <p className="text-sm text-amber-600 mt-2">
                Only {availableQuestions.length} questions available. Quiz will use all available questions.
              </p>
            )}
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Quiz Time</h2>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-mono font-bold text-primary">
                {formatTime(calculatedTime)}
              </div>
              <div className="text-sm text-muted-foreground">
                <p>~{Math.round(calculatedTime / 60)} minutes for {Math.min(questionCount, availableQuestions.length)} questions</p>
                <p className="text-xs mt-1">Time adjusts based on question types</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button
              size="xl"
              onClick={startQuiz}
              disabled={availableQuestions.length === 0}
              className="px-12"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Quiz
            </Button>
          </div>
          
          {availableQuestions.length === 0 && (
            <p className="text-center text-red-500 mt-4">
              No questions available for selected topics. Please select different topics.
            </p>
          )}
        </main>
      </div>
    );
  }
  
  if (quizPhase === 'completed') {
    const reviewQuestion = reviewingQuestion !== null ? quizQuestions[reviewingQuestion] : null;
    const reviewState = reviewQuestion ? questionStates[reviewQuestion.id] : null;
    
    if (reviewQuestion) {
      return (
        <div className="min-h-screen bg-bluebook-bg flex flex-col">
          <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-4 h-14">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReviewingQuestion(null)}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-base font-medium text-gray-900">
                  Question {reviewingQuestion + 1} Review
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReviewingQuestion(Math.max(0, reviewingQuestion - 1))}
                  disabled={reviewingQuestion === 0}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  {reviewingQuestion + 1} / {quizQuestions.length}
                </span>
                <button
                  onClick={() => setReviewingQuestion(Math.min(quizQuestions.length - 1, reviewingQuestion + 1))}
                  disabled={reviewingQuestion === quizQuestions.length - 1}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>
          
          <main className="flex-1 flex flex-col lg:flex-row">
            <div className="flex-1 p-6 overflow-y-auto border-r border-gray-200 bg-white">
              <HighlightableText
                text={(() => {
                  const text = reviewQuestion.questionText;
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
                highlights={[]}
                selectedColor={null}
                onAddHighlight={() => {}}
                onRemoveHighlight={() => {}}
                className="quiz-passage text-gray-800 whitespace-pre-wrap leading-relaxed text-base"
              />
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-bluebook-panel">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-gray-900 text-white text-sm font-bold rounded">
                    {reviewingQuestion + 1}
                  </span>
                  {reviewState?.userAnswer === reviewQuestion.correctAnswer ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Correct
                    </span>
                  ) : reviewState?.userAnswer ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Incorrect
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Not Answered
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {reviewQuestion.section}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {reviewQuestion.subTopic || reviewQuestion.topic}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-800 mb-6 text-base leading-relaxed whitespace-pre-wrap">
                {(() => {
                  const text = reviewQuestion.questionText;
                  const whichChoiceMatch = text.match(/Which choice[^?]+\?/i);
                  if (whichChoiceMatch) return whichChoiceMatch[0];
                  if (text.includes('\n\n')) return text.split('\n\n').pop();
                  return 'Based on the text, select the best answer to the question.';
                })()}
              </p>
              
              <div className="space-y-3 mb-6">
                {Object.entries(reviewQuestion.options).map(([letter, text]) => {
                  const isSelected = reviewState?.userAnswer === letter;
                  const isCorrect = letter === reviewQuestion.correctAnswer;
                  return (
                    <div
                      key={letter}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border transition-colors",
                        isCorrect && "bg-green-50 border-green-300",
                        isSelected && !isCorrect && "bg-red-50 border-red-300",
                        !isCorrect && !isSelected && "bg-white border-gray-200"
                      )}
                    >
                      <span className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                        isCorrect && "bg-green-500 text-white",
                        isSelected && !isCorrect && "bg-red-500 text-white",
                        !isCorrect && !isSelected && "bg-gray-100 text-gray-600"
                      )}>
                        {letter}
                      </span>
                      <span className="flex-1">{text}</span>
                      {isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Explanation</h4>
                <p className="text-blue-800 whitespace-pre-wrap">{reviewQuestion.explanation}</p>
              </div>
            </div>
          </main>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-bluebook-bg">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Home className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-base font-medium text-gray-900">Quiz Results</span>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6 text-center">
            <h1 className="text-3xl font-bold mb-6">Quiz Complete!</h1>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-green-50 rounded-xl">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-4xl font-bold text-green-600">{quizResults.correct}</p>
                <p className="text-sm text-green-700">Correct</p>
              </div>
              <div className="p-6 bg-red-50 rounded-xl">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                <p className="text-4xl font-bold text-red-600">{quizResults.incorrect}</p>
                <p className="text-sm text-red-700">Incorrect</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-4xl font-bold text-gray-600">{quizResults.unanswered}</p>
                <p className="text-sm text-gray-700">Not Answered</p>
              </div>
            </div>
            
            <div className="mb-8">
              <p className="text-2xl font-semibold">
                Score: {Math.round((quizResults.correct / quizResults.total) * 100)}%
              </p>
              <p className="text-muted-foreground">
                {quizResults.correct} out of {quizResults.total} questions
              </p>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => {
                setQuizPhase('setup');
                setQuizQuestions([]);
                setQuestionStates({});
              }}>
                New Quiz
              </Button>
              <Button onClick={() => navigate('/')}>
                Return Home
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Review Questions</h2>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {quizQuestions.map((q, idx) => {
                const state = questionStates[q.id];
                const isCorrect = state?.userAnswer === q.correctAnswer;
                const isAnswered = !!state?.userAnswer;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setReviewingQuestion(idx)}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors",
                      isAnswered && isCorrect && "bg-green-100 text-green-700 hover:bg-green-200",
                      isAnswered && !isCorrect && "bg-red-100 text-red-700 hover:bg-red-200",
                      !isAnswered && "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bluebook-bg">
        <div className="text-center">
          <p className="text-xl font-medium text-foreground mb-4">No questions available</p>
          <Button onClick={() => setQuizPhase('setup')}>Back to Setup</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bluebook-bg flex flex-col">
      <QuestionNavigator
        totalQuestions={quizQuestions.length}
        questionIds={quizQuestions.map(q => q.id)}
        questionStates={questionStates}
        currentIndex={currentIndex}
        onNavigate={(index) => handleNavigate(index)}
        isOpen={showNavigator}
        onClose={() => setShowNavigator(false)}
      />
      
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Home className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-base font-medium text-gray-900 ml-2">Timed Quiz</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={cn(
              "text-2xl font-mono font-bold px-4 py-1 rounded-lg",
              timeRemaining <= 60 && "text-red-600 bg-red-50",
              timeRemaining > 60 && timeRemaining <= 300 && "text-amber-600 bg-amber-50",
              timeRemaining > 300 && "text-gray-900"
            )}>
              {formatTime(timeRemaining)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHighlightTool(!showHighlightTool)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-md transition-colors",
                showHighlightTool ? "bg-gray-100" : "hover:bg-gray-100"
              )}
            >
              <Pencil className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600">Highlight</span>
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
        </div>

        {showHighlightTool && (
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
            <HighlightTool
              selectedColor={selectedHighlightColor}
              onColorSelect={setSelectedHighlightColor}
            />
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
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

        <div className="flex-1 p-6 overflow-y-auto bg-bluebook-panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-gray-900 text-white text-sm font-bold rounded">
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
                  >
                    <Bookmark className={cn(
                      "w-4 h-4",
                      currentState?.markedForReview && "fill-amber-500"
                    )} />
                    Mark for Review
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {currentQuestion.section}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {currentQuestion.subTopic || currentQuestion.topic}
                </span>
              </div>

              <p className="text-gray-800 mb-6 text-base leading-relaxed whitespace-pre-wrap">
                {(() => {
                  const text = currentQuestion.questionText;
                  const whichChoiceMatch = text.match(/Which choice[^?]+\?/i);
                  if (whichChoiceMatch) {
                    return whichChoiceMatch[0];
                  }
                  if (text.includes('\n\n')) {
                    return text.split('\n\n').pop();
                  }
                  return 'Based on the text, select the best answer to the question.';
                })()}
              </p>

              <div className="space-y-3">
                {Object.entries(currentQuestion.options).map(([letter, text]) => (
                  <QuestionOption
                    key={letter}
                    letter={letter}
                    text={text}
                    isSelected={currentState?.userAnswer === letter}
                    isEliminated={currentState?.eliminatedOptions?.includes(letter) || false}
                    isChecked={false}
                    isOptionChecked={false}
                    correctAnswer={currentQuestion.correctAnswer}
                    onSelect={() => handleSelectAnswer(letter)}
                    onEliminate={() => handleToggleElimination(letter)}
                    onCheckOption={() => {}}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="sticky bottom-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowNavigator(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {currentIndex + 1} of {quizQuestions.length}
              <ChevronLeft className="w-4 h-4 rotate-[-90deg]" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="default"
              size="lg"
              onClick={submitQuiz}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Quiz
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleNavigate('prev')}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            <Button
              onClick={() => handleNavigate('next')}
              disabled={currentIndex === quizQuestions.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
