import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Target, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { prefetchRoute } from '@/lib/routePrefetch';

const HERO_PHRASES = [
  'Practice Smarter',
  'Master SAT Questions',
  'Improve Your Score',
];

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Curated Question Bank',
    description: 'Hundreds of SAT-style questions organized by topic, difficulty, and skill area.',
  },
  {
    icon: Target,
    title: 'Targeted Practice',
    description: 'Focus on specific subjects and skills where you need the most improvement.',
  },
  {
    icon: BarChart3,
    title: 'Track Progress',
    description: 'Monitor your performance over time and identify patterns in your learning.',
  },
];

export default function Index() {
  const navigate = useNavigate();
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % HERO_PHRASES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePracticeHover = useCallback(() => {
    prefetchRoute('/practice');
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1120px] mx-auto px-6 sm:px-8">
          <nav className="flex items-center justify-between h-14">
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              NextPrep
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/practice')}
              onMouseEnter={handlePracticeHover}
              onFocus={handlePracticeHover}
              className="text-[13px] text-muted-foreground hover:text-foreground h-8 px-3"
            >
              Practice
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-14 min-h-[100vh] flex items-center justify-center relative">
          {/* Subtle grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.35]"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }}
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background via-transparent to-background" />

          <div className="relative z-10 max-w-[1120px] mx-auto px-6 sm:px-8 w-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center max-w-[640px] mx-auto"
            >
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="mb-6"
              >
                <span className="inline-block text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground border border-border px-4 py-1.5">
                  SAT Preparation
                </span>
              </motion.div>

              {/* Animated headline */}
              <div className="h-[52px] sm:h-[72px] lg:h-[84px] flex items-center justify-center mb-5 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={phraseIndex}
                    initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="text-[28px] sm:text-[44px] lg:text-[52px] font-semibold tracking-[-0.03em] text-foreground leading-[1.1]"
                  >
                    {HERO_PHRASES[phraseIndex]}
                  </motion.h1>
                </AnimatePresence>
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                className="text-[15px] sm:text-[17px] text-muted-foreground max-w-[440px] mx-auto mb-10 leading-[1.6]"
              >
                A focused, distraction-free question bank built for efficient SAT preparation.
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.15 }}
                className="flex flex-col items-center gap-3"
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/practice')}
                  onMouseEnter={handlePracticeHover}
                  onFocus={handlePracticeHover}
                  className="bg-foreground text-background hover:bg-foreground/90 h-11 px-8 text-[13px] font-medium tracking-wide rounded-none transition-all duration-200 hover:shadow-[0_4px_20px_hsl(var(--foreground)/0.15)] active:scale-[0.98]"
                >
                  Start Practicing
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
                <span className="text-[12px] text-muted-foreground/70">
                  No account required
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 sm:py-32 border-t border-border relative">
          <div className="max-w-[1120px] mx-auto px-6 sm:px-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4 }}
              className="text-center mb-16 sm:mb-20"
            >
              <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-4 block">
                Why NextPrep
              </span>
              <h2 className="text-[22px] sm:text-[28px] font-semibold tracking-[-0.02em] text-foreground">
                Everything you need to prepare
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  className="bg-background p-8 sm:p-10 group"
                >
                  <div className="w-9 h-9 flex items-center justify-center border border-border mb-5 group-hover:border-foreground/20 transition-colors duration-300">
                    <feature.icon className="w-4 h-4 text-foreground/70" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[15px] font-semibold text-foreground mb-2 tracking-[-0.01em]">
                    {feature.title}
                  </h3>
                  <p className="text-[13px] text-muted-foreground leading-[1.6]">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 sm:py-32 border-t border-border">
          <div className="max-w-[1120px] mx-auto px-6 sm:px-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <h2 className="text-[22px] sm:text-[28px] font-semibold tracking-[-0.02em] text-foreground mb-4">
                Ready to start?
              </h2>
              <p className="text-[15px] text-muted-foreground mb-8 max-w-[380px] mx-auto leading-[1.6]">
                Jump straight into practice — no sign-up, no distractions.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/practice')}
                onMouseEnter={handlePracticeHover}
                className="bg-foreground text-background hover:bg-foreground/90 h-11 px-8 text-[13px] font-medium tracking-wide rounded-none transition-all duration-200 hover:shadow-[0_4px_20px_hsl(var(--foreground)/0.15)] active:scale-[0.98]"
              >
                Begin Practice
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-[1120px] mx-auto px-6 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground/60 tracking-wide">
              &copy; 2026 NextPrep
            </span>
            <span className="text-[11px] text-muted-foreground/60 tracking-wide">
              Not affiliated with College Board or the SAT.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
