import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingProgressBar } from '@/components/LoadingProgressBar';
import { QuizSkeleton } from '@/components/LoadingSkeleton';
import { PassageWithVocab } from '@/components/reading/PassageWithVocab';
import { cn } from '@/lib/utils';
import {
  loadReadingSets,
  loadVocabMap,
  type ReadingSet,
  type VocabEntry,
} from '@/lib/vocabulary';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

export default function ReadingPracticeQuiz() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [set, setSet] = useState<ReadingSet | null>(null);
  const [vocabMap, setVocabMap] = useState<Map<string, VocabEntry> | null>(null);
  const [allSets, setAllSets] = useState<ReadingSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  // answers[qIndex] = letter picked ("A"..) or null
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);

  useEffect(() => {
    Promise.all([loadReadingSets(), loadVocabMap()])
      .then(([sets, map]) => {
        setAllSets(sets);
        const found = sets.find((s) => String(s.id) === String(setId)) || null;
        setSet(found);
        setVocabMap(map);
        if (found) {
          setAnswers(new Array(found.questions.length).fill(null));
          setChecked(new Array(found.questions.length).fill(false));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [setId]);

  const q = set?.questions[currentIndex];
  const total = set?.questions.length ?? 0;

  const currentAnswer = answers[currentIndex];
  const isChecked = checked[currentIndex] ?? false;
  const correctLetter = q?.correct_answer?.toUpperCase();

  const setAnswer = (letter: string) => {
    if (isChecked) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = letter;
      return next;
    });
  };

  const checkAnswer = () => {
    if (currentAnswer == null) return;
    setChecked((prev) => {
      const next = [...prev];
      next[currentIndex] = true;
      return next;
    });
  };

  const goto = (i: number) => {
    if (!set) return;
    if (i < 0 || i >= set.questions.length) return;
    setCurrentIndex(i);
  };

  const score = useMemo(() => {
    if (!set) return 0;
    return answers.reduce(
      (acc, a, i) =>
        acc + (checked[i] && a && a.toUpperCase() === set.questions[i].correct_answer.toUpperCase() ? 1 : 0),
      0
    );
  }, [answers, checked, set]);

  const currentSetIndex = allSets.findIndex((s) => String(s.id) === String(setId));
  const nextSet = currentSetIndex >= 0 ? allSets[currentSetIndex + 1] : null;

  return (
    <>
      <LoadingProgressBar isLoading={isLoading} onLoadingComplete={() => setShowContent(true)} />
      {!showContent || !set || !q || !vocabMap ? (
        <QuizSkeleton />
      ) : (
        <div className="min-h-screen bg-background flex flex-col animate-[skeleton-reveal_0.3s_ease-out_forwards]">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
              <nav className="flex items-center justify-between h-14">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/reading-practice')}
                  className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2 h-8 px-3 text-[13px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">All Sets</span>
                </Button>
                <div className="flex-1 mx-4 min-w-0 text-center">
                  <div className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    Reading Practice
                  </div>
                  <div className="text-[13px] font-semibold text-foreground truncate">{set.title}</div>
                </div>
                <div className="text-[12px] font-mono tabular-nums text-muted-foreground">
                  {currentIndex + 1} / {total}
                </div>
              </nav>
            </div>
          </header>

          {/* Body */}
          <main className="flex-1 max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0">
            {/* Passage */}
            <section className="border-b lg:border-b-0 lg:border-r border-border p-6 sm:p-10 lg:overflow-y-auto lg:max-h-[calc(100vh-56px-72px)]">
              <div className="max-w-[560px] mx-auto">
                <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-3">
                  Passage
                </div>
                <h2 className="text-[20px] sm:text-[22px] font-semibold tracking-tight text-foreground mb-6">
                  {set.title}
                </h2>
                <PassageWithVocab passage={set.passage} vocabMap={vocabMap} />
                <p className="mt-8 text-[11px] text-muted-foreground/70 italic">
                  Tip: {typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
                    ? 'Hover a highlighted word for a quick definition, or click it for full details.'
                    : 'Tap a highlighted word to see its definition.'}
                </p>
              </div>
            </section>

            {/* Question */}
            <section className="p-6 sm:p-10 lg:overflow-y-auto lg:max-h-[calc(100vh-56px-72px)]">
              <div className="max-w-[560px] mx-auto">
                <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-3">
                  Question {currentIndex + 1}
                </div>
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[15px] leading-[1.75] text-foreground mb-6">{q.question}</p>

                  <div className="space-y-3">
                    {q.options.map((opt, i) => {
                      const letter = LETTERS[i];
                      const isSelected = currentAnswer === letter;
                      const isCorrect = letter === correctLetter;
                      const showResult = isChecked;
                      return (
                        <button
                          key={i}
                          onClick={() => setAnswer(letter)}
                          disabled={isChecked}
                          className={cn(
                            'w-full flex items-start gap-4 text-left px-5 py-4 border rounded-xl transition-colors',
                            'bg-background',
                            !showResult && !isSelected && 'border-border hover:border-foreground/40',
                            !showResult && isSelected && 'border-foreground bg-foreground/[0.03]',
                            showResult && isCorrect && 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
                            showResult && isSelected && !isCorrect && 'border-red-600 bg-red-50 dark:bg-red-950/30',
                            showResult && !isCorrect && !isSelected && 'border-border opacity-60'
                          )}
                        >
                          <span
                            className={cn(
                              'flex items-center justify-center w-7 h-7 rounded-full border text-[12px] font-semibold shrink-0 mt-0.5',
                              !showResult && isSelected
                                ? 'border-foreground bg-foreground text-background'
                                : 'border-border text-foreground/70',
                              showResult && isCorrect && 'border-emerald-600 bg-emerald-600 text-white',
                              showResult && isSelected && !isCorrect && 'border-red-600 bg-red-600 text-white'
                            )}
                          >
                            {letter}
                          </span>
                          <span className="flex-1 text-[14px] leading-[1.6] text-foreground/90">{opt}</span>
                          {showResult && isCorrect && <Check className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />}
                          {showResult && isSelected && !isCorrect && (
                            <X className="w-4 h-4 text-red-600 mt-1 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Check / Explanation */}
                  {!isChecked ? (
                    <div className="mt-6">
                      <Button
                        onClick={checkAnswer}
                        disabled={currentAnswer == null}
                        className="w-full sm:w-auto"
                      >
                        Check Answer
                      </Button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 border border-border p-4 bg-muted/30"
                    >
                      <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
                        {currentAnswer?.toUpperCase() === correctLetter ? 'Correct' : 'Incorrect'}
                      </div>
                      <div className="text-[13px] text-foreground/90">
                        Correct answer:{' '}
                        <span className="font-semibold">
                          {correctLetter}. {q.options[LETTERS.indexOf(correctLetter as any)]}
                        </span>
                      </div>
                      {q.explanation && (
                        <p className="text-[13px] text-foreground/75 leading-relaxed mt-2">{q.explanation}</p>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </section>
          </main>

          {/* Footer nav */}
          <footer className="sticky bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-md">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-[72px] flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goto(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="flex items-center gap-3 text-[12px] font-mono tabular-nums text-muted-foreground">
                <span>
                  Score {score}/{total}
                </span>
              </div>

              {currentIndex < total - 1 ? (
                <Button size="sm" onClick={() => goto(currentIndex + 1)} className="gap-1.5">
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : nextSet ? (
                <Button size="sm" onClick={() => navigate(`/reading-practice/${nextSet.id}`)} className="gap-1.5">
                  Next Set
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button size="sm" onClick={() => navigate('/reading-practice')} className="gap-1.5">
                  Finish
                </Button>
              )}
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
