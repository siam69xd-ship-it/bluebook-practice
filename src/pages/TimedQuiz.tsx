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
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useFullscreen } from '@/hooks/useFullscreen';
import { parseOptionLabel } from '@/lib/mathQuestionUtils';

// Components
import MathQuestionLayout from '@/components/math/MathQuestionLayout';

interface TopicInfo {
  name: string;
  subSection: string;
  count: number;
  selected: boolean;
}

type QuizPhase = 'setup' | 'active' | 'completed';

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
  const selectedQuestions = questions.slice(0, actualCount);
  
  let totalTime = 0;
  for (const q of selectedQuestions) {
    if (q.section === 'Math') {
      totalTime += 95; // ~1 min 35 sec for Math
    } else {
      totalTime += 71; // ~1 min 11 sec for R&W
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
  const [isTimerHidden, setIsTimerHidden] = useState(false);
  
  const [quizPhase, setQuizPhase] = useState<QuizPhase>('setup');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [questionCount, setQuestionCount] = useState(20);

  // Load Questions from unified loader
  const loadQuestions = useCallback(async () => {
    setLoadError(false);
    setIsLoaded(false);
    
    try {
      const allLoadedQuestions = await getAllQuestionsAsync();

      if (allLoadedQuestions.length > 0) {
        setAllQuestions(allLoadedQuestions);
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
  
  const topicGroups = useMemo(() => {
    const groups: { [section: string]: { [topic: string]: number } } = {};
    allQuestions.forEach(q => {
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
  
  // Strict Selection Logic
  const toggleTopic = (topic: string, section: string) => {
    setSelectedTopics(prev => {
      const newSet = new Set(prev);
      
      // Check section of currently selected topics
      let currentSection = '';
      if (prev.size > 0) {
        const firstTopic = Array.from(prev)[0];
        const sampleQ = allQuestions.find(q => q.topic === firstTopic);
        currentSection = sampleQ?.section || '';
      }

      // If switching sections, clear previous
      if (currentSection && currentSection !== section) {
        newSet.clear();
      }

      if (newSet.has(topic)) newSet.delete(topic);
      else newSet.add(topic);
      
      return newSet;
    });
  };
  
  const selectAllInSection = (section: string) => {
    const topics = Object.keys(topicGroups[section] || {});
    setSelectedTopics(prev => {
      const newSet = new Set(prev);
      let currentSection = '';
      if (prev.size > 0) {
        const firstTopic = Array.from(prev)[0];
        const sampleQ = allQuestions.find(q => q.topic === firstTopic);
        currentSection = sampleQ?.section || '';
      }

      if (currentSection && currentSection !== section) {
        newSet.clear();
      }

      const allSelected = topics.every(t => newSet.has(t));
      if (allSelected) topics.forEach(t => newSet.delete(t));
      else topics.forEach(t => newSet.add(t));
      
      return newSet;
    });
  };
  
  const startQuiz = () => {
    if (availableQuestions.length === 0) return;
    const shuffled = shuffleArray(availableQuestions);
    const selected = shuffled.slice(0, Math.min(questionCount, availableQuestions.length));
    setQuizQuestions(selected);
    setTimeRemaining(calculatedTime);
    setCurrentIndex(0);
    setQuestionStates({});
    setQuizPhase('active');
  };
  
  useEffect(() => {
    if (quizPhase !== 'active') return;
    timerRef.current = setInterval(() => {
      setTimeRemaining(p => {
        if (p <= 1) { submitQuiz(); return 0; }
        return p - 1;
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

  const handleNavigate = (direction: 'prev' | 'next' | number) => {
    let targetIndex: number;
    if (typeof direction === 'number') targetIndex = direction;
    else if (direction === 'prev' && currentIndex > 0) targetIndex = currentIndex - 1;
    else if (direction === 'next' && currentIndex < quizQuestions.length - 1) targetIndex = currentIndex + 1;
    else return;
    setCurrentIndex(targetIndex);
  };

  const handleSelectAnswer = (letter: string) => {
    if (!currentQuestion || quizPhase !== 'active') return;
    updateQuestionState(currentQuestion.id, {
      userAnswer: currentState?.userAnswer === letter ? null : letter,
    });
  };

  const handleToggleElimination = (letter: string) => {
    if (!currentQuestion) return;
    const eliminated = currentState?.eliminatedOptions || [];
    const newEliminated = eliminated.includes(letter) ? eliminated.filter(l => l !== letter) : [...eliminated, letter];
    updateQuestionState(currentQuestion.id, { eliminatedOptions: newEliminated });
  };

  // Render Loading
  if (!isLoaded) return <div className="h-screen flex items-center justify-center text-slate-500">Loading Questions...</div>;

  // Render Setup
  if (quizPhase === 'setup') {
    return (
      <div className="min-h-screen bg-bluebook-bg">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center px-4 h-14">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-md mr-2"><ArrowLeft className="w-5 h-5" /></button>
            <span className="text-base font-medium">Quiz Setup</span>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Select Topics</h2>
            <div className="text-sm bg-amber-50 text-amber-800 p-3 rounded mb-4 border border-amber-100">
               Select <strong>Math</strong> OR <strong>Reading/Writing</strong>. Selections are exclusive to one section.
            </div>
            <div className="space-y-6">
              {Object.entries(topicGroups).map(([section, topics]) => (
                <div key={section} className="border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900">{section}</h3>
                    <button onClick={() => selectAllInSection(section)} className="text-sm text-primary hover:underline">Select All</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(topics).map(([topic, count]) => (
                      <button
                        key={topic}
                        onClick={() => toggleTopic(topic, section)}
                        className={cn("px-3 py-1.5 rounded-full text-sm border transition-colors", 
                          selectedTopics.has(topic) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200")}
                      >
                        {topic} <span className="opacity-60">({count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 flex items-center gap-6">
             <div>
                <label className="block text-sm font-medium mb-1">Question Count</label>
                <input type="number" min="1" max="100" value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} className="border rounded px-3 py-2 w-24" />
             </div>
             <div>
                <label className="block text-sm font-medium mb-1">Est. Time</label>
                <div className="font-mono text-lg bg-slate-100 px-3 py-2 rounded">{Math.floor(calculatedTime/60)}m {calculatedTime%60}s</div>
             </div>
          </div>

          <div className="flex justify-center">
             <Button size="lg" onClick={startQuiz} disabled={availableQuestions.length === 0} className="px-12">Start Quiz</Button>
          </div>
        </main>
      </div>
    );
  }

  // Render Completed
  if (quizPhase === 'completed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bluebook-bg">
         <div className="bg-white p-8 rounded-xl shadow text-center max-w-md w-full">
            <h1 className="text-2xl font-bold mb-4">Quiz Complete</h1>
            <p className="mb-6 text-slate-600">You have finished the practice session.</p>
            <Button onClick={() => navigate('/')} className="w-full">Return Home</Button>
         </div>
      </div>
    );
  }

  // Active Quiz View
  if (!currentQuestion) return null;

  // === MATH LAYOUT ===
  if (isMathQuestion) {
    return (
      <MathQuestionLayout
        questions={quizQuestions}
        currentIndex={currentIndex}
        questionStates={questionStates}
        onNavigate={handleNavigate}
        onUpdateState={updateQuestionState}
        onCheckAnswer={() => {}} // Check logic handled inside if needed, or implement here
        showNavigator={showNavigator}
        setShowNavigator={setShowNavigator}
        isTimerHidden={isTimerHidden}
        setIsTimerHidden={setIsTimerHidden}
      />
    );
  }

  // === ENGLISH (R&W) LAYOUT ===
  // Standard split pane for English
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white">
      <QuestionNavigator
        totalQuestions={quizQuestions.length}
        questionIds={quizQuestions.map(q => q.id)}
        questionStates={questionStates}
        currentIndex={currentIndex}
        onNavigate={handleNavigate}
        isOpen={showNavigator}
        onClose={() => setShowNavigator(false)}
      />

      <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
           <span className="font-medium">Reading and Writing</span>
        </div>
        <div className="font-mono font-bold">{Math.floor(timeRemaining/60).toString().padStart(2,'0')}:{(timeRemaining%60).toString().padStart(2,'0')}</div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="sm" onClick={() => setShowHighlightTool(!showHighlightTool)} className={cn(showHighlightTool && "bg-slate-100")}>
             <Pencil className="w-4 h-4 mr-2" /> Highlight
           </Button>
           <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
             {isFullscreen ? <Minimize className="w-4 h-4"/> : <Maximize className="w-4 h-4"/>}
           </Button>
        </div>
      </header>

      {/* English Split Pane */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
         {/* Passage Left */}
         <div className="flex-1 p-8 overflow-y-auto border-r border-gray-200">
             <HighlightableText 
                text={currentQuestion.passage || ""} 
                highlights={currentState?.highlights || []} 
                selectedColor={selectedHighlightColor} 
                onAddHighlight={(h) => updateQuestionState(currentQuestion.id, { highlights: [...(currentState?.highlights||[]), h]})}
                onRemoveHighlight={(i) => updateQuestionState(currentQuestion.id, { highlights: (currentState?.highlights||[]).filter((_, idx) => idx !== i)})}
                className="font-serif text-lg leading-relaxed"
             />
         </div>
         {/* Question Right */}
         <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
             <div className="flex items-center justify-between mb-4">
                 <span className="bg-slate-900 text-white w-8 h-8 flex items-center justify-center rounded font-bold">{currentIndex+1}</span>
                 <Button variant="ghost" size="sm" onClick={() => updateQuestionState(currentQuestion.id, { markedForReview: !currentState?.markedForReview })}>
                    <Bookmark className={cn("w-4 h-4 mr-2", currentState?.markedForReview && "fill-current")} /> Mark for Review
                 </Button>
             </div>
             
             <PassageRenderer content={currentQuestion.questionPrompt || ""} className="mb-6 font-medium" />
             
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
             
             <div className="mt-6 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setIsEliminationMode(!isEliminationMode)} className={cn("text-xs", isEliminationMode && "bg-slate-200")}>
                   {isEliminationMode ? "Exit Elimination" : "Eliminate Choices"}
                </Button>
             </div>
         </div>
      </main>

      <footer className="h-[70px] bg-white border-t border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
         <Button variant="ghost" onClick={() => setShowNavigator(true)} className="font-medium">
            Question {currentIndex + 1} of {quizQuestions.length}
         </Button>
         <div className="flex gap-3">
            <Button variant="outline" onClick={() => handleNavigate('prev')} disabled={currentIndex===0}>Back</Button>
            <Button onClick={currentIndex === quizQuestions.length - 1 ? submitQuiz : () => handleNavigate('next')} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
               {currentIndex === quizQuestions.length - 1 ? "Submit" : "Next"}
            </Button>
         </div>
      </footer>
    </div>
  );
}
