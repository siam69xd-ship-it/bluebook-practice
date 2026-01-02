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
  Undo2,
  Calculator,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HighlightTool } from '@/components/HighlightTool';
import { HighlightableText } from '@/components/HighlightableText';
import { QuestionOption } from '@/components/QuestionOption';
import { QuestionNavigator } from '@/components/QuestionNavigator';
import { PassageRenderer } from '@/components/PassageRenderer';
import {
  getAllQuestionsAsync,
  Question,
  QuestionState,
  TextHighlight,
  getInitialQuestionState,
} from '@/lib/questionUtils';
import { loadAllMathQuestions, MathQuestion } from '@/lib/mathQuestionUtils'; // Import Math loader
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useQueryClient } from '@tanstack/react-query';
import { parseOptionLabel } from '@/lib/mathQuestionUtils';

// Math Layout Components
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import DraggableCalculator from '@/components/math/DraggableCalculator';
import MathReference from '@/components/math/MathReference';
import GridInInput from '@/components/math/GridInInput';
import MathQuestionOption from '@/components/math/MathQuestionOption';
import LatexRenderer from '@/components/math/LatexRenderer';

interface TopicInfo {
  name: string;
  subSection: string;
  count: number;
  selected: boolean;
}

type QuizPhase = 'setup' | 'active' | 'completed';

// Helper to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function calculateQuizTime(questions: Question[], requestedCount: number): number {
  if (questions.length === 0) return 0;
  
  const actualCount = Math.min(requestedCount, questions.length);
  const selectedQuestions = questions.slice(0, actualCount); // Assume already shuffled or just taking first n
  
  let totalTime = 0;
  
  for (const q of selectedQuestions) {
    if (q.section === 'Math') {
      totalTime += 95; // ~1.6 mins for Math
    } else {
      totalTime += 71; // ~1.2 mins for R&W
    }
  }

  return Math.round(totalTime);
}

export default function TimedQuiz() {
  const navigate = useNavigate();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [questionStates, setQuestionStates] = useState<{ [key: number]: QuestionState }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<string | null>(null);
  const [showNavigator, setShowNavigator] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showHighlightTool, setShowHighlightTool] = useState(false);
  const [isEliminationMode, setIsEliminationMode] = useState(false);
  
  const [quizPhase, setQuizPhase] = useState<QuizPhase>('setup');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [questionCount, setQuestionCount] = useState(30);
  const [reviewingQuestion, setReviewingQuestion] = useState<number | null>(null);

  // Math Tools
  const [showCalculator, setShowCalculator] = useState(false);
  const [showReference, setShowReference] = useState(false);
  
  const loadQuestions = useCallback(async () => {
    setLoadError(false);
    setIsLoaded(false);
    
    try {
      // 1. Load English Questions
      const englishQuestions = await getAllQuestionsAsync();
      const englishWithSection = englishQuestions.map(q => ({
        ...q,
        section: 'Reading and Writing', // Enforce section
        subSection: q.subSection || 'Reading and Writing'
      }));

      // 2. Load Math Questions
      const mathQuestionsRaw = await loadAllMathQuestions();
      const mathWithSection = mathQuestionsRaw.map((q: any) => ({
        ...q,
        id: `math-${q.id}`, // Ensure unique IDs if needed, or rely on distinct number ranges
        section: 'Math', // CRITICAL: This was missing before
        subSection: 'Math', // Group all math under one subsection for simplicity in selection, or map topics
        questionPrompt: q.question, // Map 'question' to 'questionPrompt' to match English interface
        correctAnswer: q.answer,
        questionText: q.question, // For Review fallback
      }));

      // 3. Merge
      // Note: We cast mathWithSection to Question[] to satisfy TS if the types slightly differ
      const combined = [...englishWithSection, ...mathWithSection as unknown as Question[]];

      if (combined.length > 0) {
        setAllQuestions(combined);
        setIsLoaded(true);
      } else {
        throw new Error("No questions found");
      }
    } catch (e) {
        console.error(e);
        setLoadError(true);
        setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);
  
  // Group questions for the UI selection
  const topicGroups = useMemo(() => {
    const groups: { [section: string]: { [topic: string]: number } } = {};
    
    allQuestions.forEach(q => {
      // Group by SECTION (Reading and Writing vs Math)
      const sectionName = q.section || 'General';
      if (!groups[sectionName]) groups[sectionName] = {};
      
      const topic = q.topic || 'General';
      groups[sectionName][topic] = (groups[sectionName][topic] || 0) + 1;
    });
    return groups;
  }, [allQuestions]);

  const availableQuestions = useMemo(() => {
    if (selectedTopics.size === 0) return allQuestions;
    return allQuestions.filter(q => selectedTopics.has(q.topic));
  }, [allQuestions, selectedTopics]);
  
  const calculatedTime = useMemo(() => {
    return calculateQuizTime(availableQuestions, questionCount);
  }, [availableQuestions, questionCount]);
  
  // --- STRICT SELECTION LOGIC ---
  const toggleTopic = (topic: string, section: string) => {
    setSelectedTopics(prev => {
      const newSet = new Set(prev);
      
      // Determine the section of the *current* selection (if any)
      let currentSelectionSection = '';
      if (prev.size > 0) {
        const firstTopic = Array.from(prev)[0];
        // Find which section this topic belongs to
        const sampleQ = allQuestions.find(q => q.topic === firstTopic);
        currentSelectionSection = sampleQ?.section || '';
      }

      // If user clicks a topic in a DIFFERENT section, clear previous selection
      if (currentSelectionSection && currentSelectionSection !== section) {
        newSet.clear();
      }

      if (newSet.has(topic)) {
        newSet.delete(topic);
      } else {
        newSet.add(topic);
      }
      return newSet;
    });
  };
  
  const selectAllInSection = (section: string) => {
    const topics = Object.keys(topicGroups[section] || {});
    
    setSelectedTopics(prev => {
      const newSet = new Set(prev);
      
      // Check if we need to clear other sections
      let currentSelectionSection = '';
      if (prev.size > 0) {
        const firstTopic = Array.from(prev)[0];
        const sampleQ = allQuestions.find(q => q.topic === firstTopic);
        currentSelectionSection = sampleQ?.section || '';
      }

      if (currentSelectionSection && currentSelectionSection !== section) {
        newSet.clear();
      }

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
    const shuffled = shuffleArray(availableQuestions);
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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [quizPhase]);
  
  const submitQuiz = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setQuizPhase('completed');
  }, []);
  
  const currentQuestion = quizQuestions[currentIndex];
  const currentState = currentQuestion ? questionStates[currentQuestion.id] || getInitialQuestionState() : null;
  const isMathQuestion = currentQuestion?.section === 'Math';
  
  const updateQuestionState = useCallback((questionId: number | string, updates: Partial<QuestionState>) => {
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: { ...(prev[questionId] || getInitialQuestionState()), ...updates },
    }));
  }, []);
  
  const handleSelectAnswer = (letter: string) => {
    if (!currentQuestion || quizPhase !== 'active') return;
    updateQuestionState(currentQuestion.id, {
      userAnswer: currentState?.userAnswer === letter ? null : letter,
    });
  };
  
  const handleGridInChange = (val: string) => {
     if (!currentQuestion || quizPhase !== 'active') return;
     updateQuestionState(currentQuestion.id, { userAnswer: val });
  }

  const handleToggleElimination = (letter: string) => {
    if (!currentQuestion || quizPhase !== 'active') return;
    const eliminated = currentState?.eliminatedOptions || [];
    const newEliminated = eliminated.includes(letter)
      ? eliminated.filter(l => l !== letter)
      : [...eliminated, letter];
    updateQuestionState(currentQuestion.id, { eliminatedOptions: newEliminated });
  };

  const handleUndoEliminations = () => {
    if (!currentQuestion) return;
    updateQuestionState(currentQuestion.id, { eliminatedOptions: [] });
  };
  
  const handleToggleMark = () => {
    if (!currentQuestion || quizPhase !== 'active') return;
    updateQuestionState(currentQuestion.id, {
      markedForReview: !currentState?.markedForReview,
    });
  };
  
  const handleNavigate = (direction: 'prev' | 'next' | number) => {
    let targetIndex: number;
    if (typeof direction === 'number') targetIndex = direction;
    else if (direction === 'prev' && currentIndex > 0) targetIndex = currentIndex - 1;
    else if (direction === 'next' && currentIndex < quizQuestions.length - 1) targetIndex = currentIndex + 1;
    else return;
    setCurrentIndex(targetIndex);
  };
  
  const handleAddHighlight = (highlight: TextHighlight) => {
    if (!currentQuestion) return;
    const currentHighlights = currentState?.highlights || [];
    updateQuestionState(currentQuestion.id, { highlights: [...currentHighlights, highlight] });
  };
  
  const handleRemoveHighlight = (index: number) => {
    if (!currentQuestion) return;
    const currentHighlights = currentState?.highlights || [];
    updateQuestionState(currentQuestion.id, { highlights: currentHighlights.filter((_, i) => i !== index) });
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (!isLoaded) return <div className="h-screen flex items-center justify-center">Loading Questions...</div>;

  if (quizPhase === 'setup') {
    return (
      <div className="min-h-screen bg-bluebook-bg">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-md"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <span className="text-base font-medium">Quiz Setup</span>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">Select Topics</h2>
            <p className="text-sm text-amber-600 mb-4 bg-amber-50 p-3 rounded border border-amber-100">
              Note: You can only select <strong>Math</strong> OR <strong>Reading/Writing</strong> topics for a single quiz.
            </p>
            <div className="space-y-4">
              {Object.entries(topicGroups).map(([section, topics]) => (
                <div key={section} className="border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-slate-800">{section}</h3>
                    <button onClick={() => selectAllInSection(section)} className="text-sm text-primary hover:underline">Select All {section}</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(topics).map(([topic, count]) => (
                      <button
                        key={topic}
                        onClick={() => toggleTopic(topic, section)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm transition-colors border",
                          selectedTopics.has(topic) 
                            ? "bg-primary text-white border-primary" 
                            : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                        )}
                      >
                        {topic} <span className="opacity-60 ml-1">({count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Quiz Settings</h2>
            <div className="flex items-center gap-4 mb-4">
                <span className="w-32 font-medium">No. of Questions:</span>
                <input type="number" min="5" max="100" value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} className="border rounded px-3 py-2 w-24" />
                <span className="text-sm text-gray-500">(Max available: {availableQuestions.length})</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="w-32 font-medium">Est. Time:</span>
                <span className="font-mono font-bold text-lg bg-slate-100 px-3 py-1 rounded">{formatTime(calculatedTime)}</span>
            </div>
           </div>

          <div className="flex justify-center pb-10">
             <Button size="xl" onClick={startQuiz} disabled={availableQuestions.length === 0} className="px-12 h-12 text-lg">Start Quiz</Button>
          </div>
        </main>
      </div>
    );
  }

  // COMPLETED PHASE
  if (quizPhase === 'completed') {
      // Basic completion screen - expand this for full review if needed
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-bluebook-bg">
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold mb-4">Quiz Complete!</h1>
                  <p className="text-gray-600 mb-6">Great job finishing the quiz.</p>
                  <Button onClick={() => navigate('/')} className="w-full">Return Home</Button>
              </div>
          </div>
      )
  }

  // ACTIVE PHASE
  if (!currentQuestion) return null;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white">
      <DraggableCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
      <MathReference isOpen={showReference} onClose={() => setShowReference(false)} />
      
      <QuestionNavigator
        totalQuestions={quizQuestions.length}
        questionIds={quizQuestions.map(q => q.id)}
        questionStates={questionStates}
        currentIndex={currentIndex}
        onNavigate={handleNavigate}
        isOpen={showNavigator}
        onClose={() => setShowNavigator(false)}
      />

      {/* Header */}
      <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
         <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded"><Home className="w-5 h-5 text-gray-600"/></button>
            <span className="font-medium ml-2">Timed Quiz</span>
         </div>
         <div className={cn("text-xl font-mono font-bold px-4 py-1 rounded", timeRemaining < 60 ? "bg-red-50 text-red-600" : "text-gray-900")}>
            {formatTime(timeRemaining)}
         </div>
         <div className="flex items-center gap-2">
            {isMathQuestion ? (
                <>
                 <Button variant="ghost" size="sm" onClick={() => setShowCalculator(!showCalculator)} className={cn(showCalculator && "bg-gray-100")}>
                    <Calculator className="w-4 h-4 mr-2"/> Calculator
                 </Button>
                 <Button variant="ghost" size="sm" onClick={() => setShowReference(!showReference)} className={cn(showReference && "bg-gray-100")}>
                    <BookOpen className="w-4 h-4 mr-2"/> Reference
                 </Button>
                </>
            ) : (
                <Button variant="ghost" size="sm" onClick={() => setShowHighlightTool(!showHighlightTool)} className={cn(showHighlightTool && "bg-gray-100")}>
                    <Pencil className="w-4 h-4 mr-2"/> Highlight
                </Button>
            )}
             <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="w-4 h-4"/> : <Maximize className="w-4 h-4"/>}
             </Button>
         </div>
      </header>

      {/* MAIN CONTENT AREA */}
      {isMathQuestion ? (
        // --- MATH LAYOUT (SPLIT PANE) ---
        <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={50} minSize={30}>
                <ScrollArea className="h-full">
                    <div className="p-8">
                         <div className="flex items-center gap-3 mb-6">
                            <span className="bg-slate-900 text-white w-8 h-8 flex items-center justify-center rounded font-bold text-sm">
                                {currentIndex + 1}
                            </span>
                            <Button variant="ghost" size="sm" onClick={handleToggleMark} className={cn("gap-2", currentState?.markedForReview ? "text-amber-600 bg-amber-50" : "text-slate-500")}>
                                <Bookmark className={cn("w-4 h-4", currentState?.markedForReview && "fill-current")} />
                                {currentState?.markedForReview ? "Marked" : "Mark for Review"}
                            </Button>
                         </div>
                         <div className="font-serif text-lg leading-relaxed text-[#1a1a1a]">
                            <LatexRenderer content={currentQuestion.questionPrompt || currentQuestion.questionText || ""} />
                         </div>
                    </div>
                </ScrollArea>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={50} minSize={30}>
                <ScrollArea className="h-full">
                    <div className="p-8">
                         <div className="space-y-4">
                            {currentQuestion.isGridIn ? (
                                <GridInInput 
                                    value={currentState?.userAnswer || ''}
                                    onChange={handleGridInChange}
                                    isChecked={false} isCorrect={false} correctAnswer=""
                                />
                            ) : (
                                Object.entries(currentQuestion.options || {}).map(([letter, text]) => {
                                    const { label, text: optionText } = parseOptionLabel(text as string);
                                    return (
                                        <MathQuestionOption
                                            key={letter}
                                            label={label || letter}
                                            text={optionText || text as string}
                                            isSelected={currentState?.userAnswer === letter}
                                            isCorrect={false} isIncorrect={false} showResult={false}
                                            onClick={() => handleSelectAnswer(letter)}
                                            isEliminated={currentState?.eliminatedOptions?.includes(letter)}
                                            showEliminationButtons={isEliminationMode}
                                            onEliminate={() => handleToggleElimination(letter)}
                                        />
                                    );
                                })
                            )}
                            
                            <div className="flex justify-end pt-4">
                                <Button variant="ghost" size="sm" onClick={() => setIsEliminationMode(!isEliminationMode)} className={cn("text-xs text-slate-500", isEliminationMode && "bg-slate-100 text-slate-900")}>
                                    {isEliminationMode ? "Exit Elimination Mode" : "Eliminate Options (ABC)"}
                                </Button>
                            </div>
                         </div>
                    </div>
                </ScrollArea>
            </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        // --- READING/WRITING LAYOUT (Standard Split) ---
        <main className="flex-1 flex flex-col lg:flex-row">
            <div className="flex-1 p-6 overflow-y-auto border-r border-gray-200 bg-white">
                 <AnimatePresence mode="wait">
                    <motion.div key={currentQuestion.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <HighlightableText
                            text={currentQuestion.passage || ''}
                            highlights={currentState?.highlights || []}
                            selectedColor={selectedHighlightColor}
                            onAddHighlight={handleAddHighlight}
                            onRemoveHighlight={handleRemoveHighlight}
                            className="quiz-passage text-gray-800 whitespace-pre-wrap leading-relaxed text-base font-serif"
                        />
                    </motion.div>
                 </AnimatePresence>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-bluebook-panel">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="bg-slate-900 text-white w-8 h-8 flex items-center justify-center rounded font-bold text-sm">
                            {currentIndex + 1}
                        </span>
                        <Button variant="ghost" size="sm" onClick={handleToggleMark} className={cn("gap-2", currentState?.markedForReview ? "text-amber-600 bg-amber-50" : "text-slate-500")}>
                            <Bookmark className={cn("w-4 h-4", currentState?.markedForReview && "fill-current")} />
                            {currentState?.markedForReview ? "Marked" : "Mark for Review"}
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsEliminationMode(!isEliminationMode)} className={cn("w-8 h-8 rounded flex items-center justify-center transition-colors", isEliminationMode ? "bg-slate-900 text-white" : "hover:bg-gray-100 text-slate-400")}>
                            <span className="line-through font-serif decoration-2">ABC</span>
                        </button>
                        {(currentState?.eliminatedOptions?.length || 0) > 0 && (
                            <button onClick={handleUndoEliminations} className="text-slate-400 hover:text-slate-600"><Undo2 className="w-5 h-5" /></button>
                        )}
                    </div>
                 </div>
                 
                 <div className="mb-6 font-medium text-gray-900">
                    <PassageRenderer content={currentQuestion.questionPrompt || ''} />
                 </div>
                 
                 <div className="space-y-3">
                    {Object.entries(currentQuestion.options || {}).map(([letter, text]) => (
                        <QuestionOption 
                            key={letter} letter={letter} text={text as string}
                            isSelected={currentState?.userAnswer === letter}
                            isEliminated={currentState?.eliminatedOptions?.includes(letter)}
                            onSelect={() => handleSelectAnswer(letter)}
                            onEliminate={() => handleToggleElimination(letter)}
                            showEliminationButtons={isEliminationMode}
                            correctAnswer="" isChecked={false} isOptionChecked={false} onCheckOption={()=>{}} hideCheckButton
                        />
                    ))}
                 </div>
            </div>
        </main>
      )}

      {/* Footer */}
      <footer className="h-[70px] bg-white border-t border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
         <Button variant="ghost" onClick={() => setShowNavigator(true)} className="text-slate-600 hover:bg-slate-100 font-medium">
            Question {currentIndex + 1} of {quizQuestions.length}
         </Button>
         
         <div className="flex gap-3">
            <Button variant="outline" onClick={() => handleNavigate('prev')} disabled={currentIndex===0} className="px-6">Back</Button>
            {currentIndex === quizQuestions.length - 1 ? (
                <Button onClick={submitQuiz} className="bg-green-600 hover:bg-green-700 px-8">Submit Quiz</Button>
            ) : (
                <Button onClick={() => handleNavigate('next')} className="bg-blue-600 hover:bg-blue-700 px-8">Next</Button>
            )}
         </div>
      </footer>
    </div>
  );
}
