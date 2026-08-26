import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingProgressBar } from '@/components/LoadingProgressBar';
import { QuizSkeleton } from '@/components/LoadingSkeleton';
import { cn } from '@/lib/utils';
import { loadRepetitiveTemplates, type RepetitiveTemplate } from '@/lib/repetitiveQuestions';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

export default function RepetitiveQuestionsQuiz() {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const [all, setAll] = useState<RepetitiveTemplate[]>([]);
  const [template, setTemplate] = useState<RepetitiveTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);

  useEffect(() => {
    loadRepetitiveTemplates()
      .then((templates) => {
        setAll(templates);
        const found = templates.find((t) => String(t.id) === String(templateId)) || null;
        setTemplate(found);
        setCurrentIndex(0);
        if (found) {
          setAnswers(new Array(found.versions.length).fill(null));
          setChecked(new Array(found.versions.length).fill(false));
        }
      })
      .finally(() => setIsLoading(false));
  }, [templateId]);

  const v = template?.versions[currentIndex];
  const total = template?.versions.length ?? 0;
  const currentAnswer = answers[currentIndex];
  const isChecked = checked[currentIndex] ?? false;
  const correctLetter = v?.answer?.toUpperCase();

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
    if (!template) return;
    if (i < 0 || i >= template.versions.length) return;
    setCurrentIndex(i);
  };

  const score = useMemo(() => {
    if (!template) return 0;
    return answers.reduce(
      (acc, a, i) =>
        acc + (checked[i] && a && a.toUpperCase() === template.versions[i].answer.toUpperCase() ? 1 : 0),
      0
    );
  }, [answers, checked, template]);

  const currentTemplateIndex = all.findIndex((t) => String(t.id) === String(templateId));
  const nextTemplate = currentTemplateIndex >= 0 ? all[currentTemplateIndex + 1] : null;

  return (
    <>
      <LoadingProgressBar isLoading={isLoading} onLoadingComplete={() => setShowContent(true)} />
      {!showContent || !template || !v ? (
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
                  onClick={() => navigate('/repetitive-questions')}
                  className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2 h-8 px-3 text-[13px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">All Templates</span>
                </Button>
                <div className="flex-1 mx-4 min-w-0 text-center">
                  <div className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    Template {template.id}
                  </div>
                  <div className="text-[13px] font-semibold text-foreground truncate">{template.title}</div>
                </div>
                <div className="text-[12px] font-mono tabular-nums text-muted-foreground">
                  V{v.version} · {currentIndex + 1}/{total}
                </div>
              </nav>
            </div>
          </header>

          {/* Body */}
          <main className="flex-1 max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2">
            {/* Passage */}
            <section className="border-b lg:border-b-0 lg:border-r border-border p-6 sm:p-10 lg:overflow-y-auto lg:max-h-[calc(100vh-56px-72px)]">
              <div className="max-w-[560px] mx-auto">
                <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-3">
                  Passage · Version {v.version}
                </div>
                <h2 className="text-[20px] sm:text-[22px] font-semibold tracking-tight text-foreground mb-6">
                  {template.title}
                </h2>
                <motion.p
                  key={`p-${currentIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="font-serif text-[16px] leading-[1.85] text-foreground whitespace-pre-line"
                >
                  {v.passage}
                </motion.p>
                {v.topic && (
                  <div className="mt-8 text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70">
                    Topic: {v.topic}
                  </div>
                )}
              </div>
            </section>

            {/* Question */}
            <section className="p-6 sm:p-10 lg:overflow-y-auto lg:max-h-[calc(100vh-56px-72px)]">
              <div className="max-w-[560px] mx-auto">
                <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-3">
                  Question
                </div>
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[15px] leading-[1.75] text-foreground mb-6">
                    {v.prompt || 'Which choice most logically completes the text?'}
                  </p>

                  <div className="space-y-3">
                    {v.options.map((opt, i) => {
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
                            'w-full flex items-start gap-4 text-left px-5 py-4 border rounded-xl transition-colors bg-background',
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

                  {!isChecked ? (
                    <div className="mt-6">
                      <Button onClick={checkAnswer} disabled={currentAnswer == null} className="w-full sm:w-auto">
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
                          {correctLetter}. {v.options[LETTERS.indexOf(correctLetter as any)]}
                        </span>
                      </div>
                      {v.changes && (
                        <p className="text-[13px] text-foreground/75 leading-relaxed mt-2">
                          <span className="uppercase tracking-[0.1em] text-[10px] text-muted-foreground mr-1">
                            Version notes:
                          </span>
                          {v.changes}
                        </p>
                      )}
                    </motion.div>
                  )}
                </motion.div>

                {/* Version pills */}
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-3">
                    Versions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {template.versions.map((ver, i) => (
                      <button
                        key={ver.version}
                        onClick={() => goto(i)}
                        className={cn(
                          'h-8 min-w-8 px-2 border text-[12px] font-mono tabular-nums transition-colors',
                          i === currentIndex
                            ? 'border-foreground bg-foreground text-background'
                            : checked[i]
                              ? 'border-foreground/40 text-foreground'
                              : 'border-border text-muted-foreground hover:border-foreground/40'
                        )}
                      >
                        V{ver.version}
                      </button>
                    ))}
                  </div>
                </div>
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

              <div className="text-[12px] font-mono tabular-nums text-muted-foreground">
                Score {score}/{total}
              </div>

              {currentIndex < total - 1 ? (
                <Button size="sm" onClick={() => goto(currentIndex + 1)} className="gap-1.5">
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : nextTemplate ? (
                <Button
                  size="sm"
                  onClick={() => navigate(`/repetitive-questions/${nextTemplate.id}`)}
                  className="gap-1.5"
                >
                  <span className="hidden sm:inline">Next Template</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button size="sm" onClick={() => navigate('/repetitive-questions')}>
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
