import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { prefetchRoute } from '@/lib/routePrefetch';

const HERO_PHRASES = [
  'Practice Smarter',
  'Master SAT Questions',
  'Improve Your Score',
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background grid */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Floating geometric decorations */}
      <div className="absolute top-20 right-20 w-px h-32 bg-border/40 hidden lg:block" />
      <div className="absolute top-32 right-20 w-16 h-px bg-border/40 hidden lg:block" />
      <div className="absolute bottom-40 left-16 w-24 h-px bg-border/30 hidden lg:block" />
      <div className="absolute bottom-40 left-16 w-px h-24 bg-border/30 hidden lg:block" />
      <div className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-border/50 hidden lg:block" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              NextPrep
            </span>
            <div />
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section - vertically centered */}
        <section className="min-h-[calc(100vh-65px)] flex items-center justify-center">
          <div className="max-w-[1200px] mx-auto px-6 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-center max-w-2xl mx-auto"
            >
              {/* Animated headline */}
              <div className="h-[72px] sm:h-[84px] lg:h-[96px] flex items-center justify-center mb-6 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={phraseIndex}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.1]"
                  >
                    {HERO_PHRASES[phraseIndex]}
                  </motion.h1>
                </AnimatePresence>
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-lg text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed"
              >
                A focused SAT question bank designed for efficient practice.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="flex flex-col items-center gap-4"
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/practice')}
                  onMouseEnter={handlePracticeHover}
                  onFocus={handlePracticeHover}
                  className="bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.03] active:scale-[0.98] h-12 px-10 text-sm font-medium rounded-lg transition-all duration-200"
                >
                  Start for Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-sm text-muted-foreground">
                  No signup required
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Minimal footer */}
      <footer className="absolute bottom-0 w-full border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 NextPrep. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              NextPrep is not affiliated with College Board or the SAT.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
