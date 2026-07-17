import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingProgressBar } from '@/components/LoadingProgressBar';
import { PracticeSkeleton } from '@/components/LoadingSkeleton';
import { loadReadingSets, loadVocabulary, type ReadingSet } from '@/lib/vocabulary';

export default function ReadingPractice() {
  const navigate = useNavigate();
  const [sets, setSets] = useState<ReadingSet[]>([]);
  const [vocabCount, setVocabCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    Promise.all([loadReadingSets(), loadVocabulary()])
      .then(([s, v]) => {
        setSets(s);
        setVocabCount(v.length);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

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
                  onClick={() => navigate('/')}
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

          <main className="pt-14">
            <div className="border-b border-border">
              <div className="max-w-[760px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="inline-block text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground border border-border px-4 py-1.5 mb-6">
                    Reading Practice
                  </span>
                  <h1 className="text-[26px] sm:text-[34px] font-semibold tracking-[-0.03em] text-foreground leading-[1.15] mb-3">
                    Read. Learn. Master Vocabulary.
                  </h1>
                  <p className="text-[15px] text-muted-foreground leading-[1.6] max-w-[520px]">
                    Practice reading with authentic passages. Every word from your vocabulary list is
                    highlighted — hover or tap to reveal its meaning.
                  </p>
                  <div className="mt-6 flex items-center gap-6 text-[12px] text-muted-foreground">
                    <span className="font-mono tabular-nums">
                      {sets.length} <span className="uppercase tracking-wider">Passages</span>
                    </span>
                    <span className="font-mono tabular-nums">
                      {vocabCount} <span className="uppercase tracking-wider">Vocab Words</span>
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="max-w-[760px] mx-auto px-6 sm:px-8 py-12 sm:py-16">
              <div className="flex items-center gap-4 mb-5">
                <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em] whitespace-nowrap">
                  All Sets
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="border border-border bg-background overflow-hidden">
                {sets.map((s, i) => (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.015, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => navigate(`/reading-practice/${s.id}`)}
                    className="w-full flex items-center justify-between py-4 px-6 border-b border-border/40 last:border-b-0 hover:bg-muted/40 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <BookOpen className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-foreground truncate group-hover:text-foreground">
                          {s.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground/70 mt-0.5 font-mono tabular-nums uppercase tracking-wider">
                          {s.questions.length} Questions
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-transparent group-hover:text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 shrink-0" />
                  </motion.button>
                ))}
                {sets.length === 0 && (
                  <div className="p-8 text-center text-[13px] text-muted-foreground">
                    No reading sets available.
                  </div>
                )}
              </div>

              <div className="h-20" />
            </div>
          </main>
        </div>
      )}
    </>
  );
}
