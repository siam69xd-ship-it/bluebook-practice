import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingProgressBar } from '@/components/LoadingProgressBar';
import { PracticeSkeleton } from '@/components/LoadingSkeleton';
import { loadRepetitiveTemplates, totalVersions, type RepetitiveTemplate } from '@/lib/repetitiveQuestions';

export default function RepetitiveQuestions() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<RepetitiveTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadRepetitiveTemplates()
      .then(setTemplates)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.versions.some((v) => v.topic.toLowerCase().includes(q))
    );
  }, [templates, query]);

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

          <main className="pt-14">
            <div className="border-b border-border">
              <div className="max-w-[860px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="inline-block text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground border border-border px-4 py-1.5 mb-6">
                    Most Repetitive Questions
                  </span>
                  <h1 className="text-[26px] sm:text-[34px] font-semibold tracking-[-0.03em] text-foreground leading-[1.15] mb-3">
                    Repeated DSAT Question Templates
                  </h1>
                  <p className="text-[15px] text-muted-foreground leading-[1.6] max-w-[520px]">
                    {templates.length} templates and {totalVersions(templates)} versions. Pick a template and work
                    through every version in sequence.
                  </p>

                  <div className="mt-8 flex items-center gap-2 border border-border px-4 h-11 max-w-[420px]">
                    <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search templates or topics"
                      className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/70 outline-none"
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="max-w-[860px] mx-auto px-6 sm:px-8 py-12 sm:py-16">
              <div className="flex items-center gap-4 mb-5">
                <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em] whitespace-nowrap">
                  Templates
                </h2>
                <div className="h-px flex-1 bg-border" />
                <span className="text-[12px] font-mono tabular-nums text-muted-foreground/60">
                  {filtered.length}
                </span>
              </div>

              <div className="border border-border bg-background">
                {filtered.map((t, i) => {
                  const topics = Array.from(new Set(t.versions.map((v) => v.topic).filter(Boolean)));
                  return (
                    <motion.button
                      key={t.id}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(i, 20) * 0.02, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => navigate(`/repetitive-questions/${t.id}`)}
                      className="w-full text-left px-5 sm:px-6 py-4 border-b border-border/60 last:border-b-0 hover:bg-muted/40 transition-colors group flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-3">
                          <span className="text-[11px] font-mono tabular-nums text-muted-foreground/60">
                            {String(t.id).padStart(2, '0')}
                          </span>
                          <span className="text-[14px] font-medium text-foreground/90 group-hover:text-foreground">
                            {t.title}
                          </span>
                        </div>
                        {topics.length > 0 && (
                          <p className="mt-1.5 pl-[30px] text-[11px] uppercase tracking-[0.08em] text-muted-foreground/70 truncate">
                            {topics.join(' · ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0 pt-0.5">
                        <span className="text-[12px] font-mono tabular-nums text-muted-foreground/60">
                          {t.versions.length} {t.versions.length === 1 ? 'version' : 'versions'}
                        </span>
                        <ArrowRight className="w-3 h-3 text-transparent group-hover:text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5" />
                      </div>
                    </motion.button>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="px-6 py-10 text-center text-[13px] text-muted-foreground">
                    No templates match that search.
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
