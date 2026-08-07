import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingProgressBar } from '@/components/LoadingProgressBar';
import { PracticeSkeleton } from '@/components/LoadingSkeleton';
import { cn } from '@/lib/utils';
import { clearProgress } from '@/lib/questionUtils';
import { loadSatSuiteIndex, SatSuiteTopicInfo } from '@/lib/satSuiteQuestions';
import { Difficulty } from '@/lib/difficultyData';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export default function SatSuite() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<SatSuiteTopicInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDiff, setSelectedDiff] = useState<Difficulty[]>(['easy', 'medium', 'hard']);

  useEffect(() => {
    loadSatSuiteIndex()
      .then(setTopics)
      .finally(() => setIsLoading(false));
  }, []);

  const toggleTopic = (slug: string) =>
    setSelectedTopics(prev => (prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]));

  const toggleDiff = (d: Difficulty) =>
    setSelectedDiff(prev => (prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]));

  const total = useMemo(() => {
    const active = selectedTopics.length ? topics.filter(t => selectedTopics.includes(t.slug)) : topics;
    return active.reduce(
      (sum, t) => sum + selectedDiff.reduce((s, d) => s + (t.counts?.[d] ?? 0), 0),
      0
    );
  }, [topics, selectedTopics, selectedDiff]);

  const start = () => {
    if (total === 0) return;
    clearProgress();
    sessionStorage.setItem(
      'satSuiteConfig',
      JSON.stringify({ slugs: selectedTopics, difficulties: selectedDiff })
    );
    navigate('/sat-suite/quiz');
  };

  return (
    <>
      <LoadingProgressBar isLoading={isLoading} onLoadingComplete={() => setShowContent(true)} />
      {!showContent ? (
        <PracticeSkeleton />
      ) : (
        <div className="min-h-screen bg-background animate-[skeleton-reveal_0.3s_ease-out_forwards]">
          <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="max-w-[1120px] mx-auto px-6 sm:px-8">
              <nav className="flex items-center justify-between h-14">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/practice')}
                  className="gap-1.5 text-muted-foreground hover:text-foreground -ml-3 h-8 px-3 text-[13px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </Button>
                <span className="text-[15px] font-semibold tracking-tight text-foreground">NextPrep</span>
                <div className="w-[72px]" />
              </nav>
            </div>
          </header>

          <main className="pt-14 pb-24">
            <div className="border-b border-border">
              <div className="max-w-[760px] mx-auto px-6 sm:px-8 py-14 sm:py-16">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="inline-block text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground border border-border px-4 py-1.5 mb-6">
                    Official Practice
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-3">
                    SAT Suite Question Bank
                  </h1>
                  <p className="text-[15px] text-muted-foreground leading-relaxed max-w-[52ch]">
                    Choose topics and difficulty levels, then practice with the full Reading and Writing
                    question bank.
                  </p>
                </motion.div>
              </div>
            </div>

            <div className="max-w-[760px] mx-auto px-6 sm:px-8 py-10 space-y-10">
              {/* Difficulty */}
              <section>
                <h2 className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-4">
                  Difficulty
                </h2>
                <div className="flex gap-3">
                  {DIFFICULTIES.map(d => {
                    const active = selectedDiff.includes(d);
                    return (
                      <button
                        key={d}
                        onClick={() => toggleDiff(d)}
                        className={cn(
                          'flex-1 border px-4 py-3 text-sm capitalize transition-colors',
                          active
                            ? 'border-foreground bg-foreground text-background font-medium'
                            : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                        )}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Topics */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground">
                    Topics
                  </h2>
                  {selectedTopics.length > 0 && (
                    <button
                      onClick={() => setSelectedTopics([])}
                      className="text-[12px] text-muted-foreground hover:text-foreground underline underline-offset-4"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
                <div className="border-t border-border">
                  {topics.map((t, i) => {
                    const active = selectedTopics.includes(t.slug);
                    const count = selectedDiff.reduce((s, d) => s + (t.counts?.[d] ?? 0), 0);
                    return (
                      <motion.button
                        key={t.slug}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.025 }}
                        onClick={() => toggleTopic(t.slug)}
                        className={cn(
                          'w-full flex items-center justify-between gap-4 px-4 py-4 border-b border-border text-left transition-colors',
                          active ? 'bg-muted/60' : 'hover:bg-muted/40'
                        )}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span
                            className={cn(
                              'w-4 h-4 border flex items-center justify-center shrink-0',
                              active ? 'bg-foreground border-foreground' : 'border-border'
                            )}
                          >
                            {active && <Check className="w-3 h-3 text-background" />}
                          </span>
                          <span className="text-[15px] text-foreground truncate">{t.topic}</span>
                        </span>
                        <span className="font-mono text-[12px] text-muted-foreground shrink-0">{count}</span>
                      </motion.button>
                    );
                  })}
                </div>
                <p className="mt-3 text-[12px] text-muted-foreground">
                  No topic selected means all topics are included.
                </p>
              </section>
            </div>
          </main>

          <div className="fixed bottom-0 inset-x-0 border-t border-border bg-background/90 backdrop-blur-md">
            <div className="max-w-[760px] mx-auto px-6 sm:px-8 py-4 flex items-center justify-between gap-4">
              <span className="text-[13px] text-muted-foreground">
                <span className="font-mono text-foreground">{total}</span> questions selected
              </span>
              <Button onClick={start} disabled={total === 0} className="gap-2 rounded-none">
                Start Practice
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
