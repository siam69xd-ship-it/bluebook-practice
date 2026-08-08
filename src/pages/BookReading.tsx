import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingProgressBar } from '@/components/LoadingProgressBar';
import { PracticeSkeleton } from '@/components/LoadingSkeleton';
import { BOOK_LEVELS, countQuestions, loadBookLevel, type Book } from '@/lib/books';

export default function BookReading() {
  const navigate = useNavigate();
  const { level } = useParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(!!level);
  const [showContent, setShowContent] = useState(!level);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!level) {
      setBooks([]);
      setIsLoading(false);
      setShowContent(true);
      return;
    }
    setIsLoading(true);
    loadBookLevel(level)
      .then((d) => setBooks(d.books))
      .finally(() => setIsLoading(false));
  }, [level]);

  const levelMeta = BOOK_LEVELS.find((l) => l.id === level?.toLowerCase());

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
                  onClick={() => navigate(level ? '/book-reading' : '/')}
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
              <div className="max-w-[760px] mx-auto px-6 sm:px-8 py-14 sm:py-18">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="inline-block text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground border border-border px-4 py-1.5 mb-6">
                    Book Reading Practice
                  </span>
                  <h1 className="text-[26px] sm:text-[34px] font-semibold tracking-[-0.03em] text-foreground leading-[1.15] mb-3">
                    {levelMeta ? `${levelMeta.label} — ${levelMeta.name}` : 'Read Graded Books. Answer Real Questions.'}
                  </h1>
                  <p className="text-[15px] text-muted-foreground leading-[1.6] max-w-[520px]">
                    {levelMeta
                      ? 'Choose a book. Some books are split into chapters, others read as a single story.'
                      : 'Full books and short stories organised by CEFR level, each followed by comprehension questions with detailed explanations.'}
                  </p>
                </motion.div>
              </div>
            </div>

            <div className="max-w-[760px] mx-auto px-6 sm:px-8 py-12 sm:py-16">
              {!level ? (
                <>
                  <div className="flex items-center gap-4 mb-5">
                    <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em] whitespace-nowrap">
                      Levels
                    </h2>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="border border-border bg-background overflow-hidden">
                    {BOOK_LEVELS.map((l, i) => (
                      <motion.button
                        key={l.id}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.025 }}
                        disabled={!l.available}
                        onClick={() => l.available && navigate(`/book-reading/${l.id}`)}
                        className="w-full flex items-center justify-between py-5 px-6 border-b border-border/40 last:border-b-0 hover:bg-muted/40 transition-colors group text-left disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-5 min-w-0">
                          <span className="font-mono text-[15px] font-semibold text-foreground w-8">{l.label}</span>
                          <div className="min-w-0">
                            <div className="text-[13px] font-medium text-foreground">{l.name}</div>
                            {!l.available && (
                              <div className="text-[11px] text-muted-foreground/70 mt-0.5 uppercase tracking-wider">
                                Coming soon
                              </div>
                            )}
                          </div>
                        </div>
                        {l.available ? (
                          <ArrowRight className="w-3.5 h-3.5 text-transparent group-hover:text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 shrink-0" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-5">
                    <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em] whitespace-nowrap">
                      {books.length} Books
                    </h2>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="border border-border bg-background overflow-hidden">
                    {books.map((b) => {
                      const isOpen = expanded === b.id;
                      const single = !b.hasChapters;
                      return (
                        <div key={b.id} className="border-b border-border/40 last:border-b-0">
                          <button
                            onClick={() =>
                              single
                                ? navigate(`/book-reading/${level}/${b.id}/${b.chapters[0].id}`)
                                : setExpanded(isOpen ? null : b.id)
                            }
                            className="w-full flex items-center justify-between py-4 px-6 hover:bg-muted/40 transition-colors group text-left"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <BookOpen className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-[13px] font-medium text-foreground">{b.title}</div>
                                <div className="text-[11px] text-muted-foreground/70 mt-0.5 font-mono tabular-nums uppercase tracking-wider">
                                  {b.hasChapters ? `${b.chapters.length} Chapters · ` : ''}
                                  {countQuestions(b)} Questions
                                </div>
                              </div>
                            </div>
                            {single ? (
                              <ArrowRight className="w-3.5 h-3.5 text-transparent group-hover:text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 shrink-0" />
                            ) : (
                              <ChevronDown
                                className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              />
                            )}
                          </button>
                          <AnimatePresence initial={false}>
                            {isOpen && !single && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden bg-muted/20"
                              >
                                {b.chapters.map((c) => (
                                  <button
                                    key={c.id}
                                    onClick={() => navigate(`/book-reading/${level}/${b.id}/${c.id}`)}
                                    className="w-full flex items-center justify-between py-3 pl-14 pr-6 border-t border-border/30 hover:bg-muted/50 transition-colors group text-left"
                                  >
                                    <span className="text-[13px] text-foreground/85">{c.title}</span>
                                    <span className="text-[11px] font-mono tabular-nums text-muted-foreground/70">
                                      {c.questions.length} Q
                                    </span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                    {books.length === 0 && (
                      <div className="p-8 text-center text-[13px] text-muted-foreground">
                        No books available for this level yet.
                      </div>
                    )}
                  </div>
                </>
              )}
              <div className="h-20" />
            </div>
          </main>
        </div>
      )}
    </>
  );
}
