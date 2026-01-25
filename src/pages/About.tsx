import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-xl font-semibold tracking-tight text-foreground">
              Acely
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/practice" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Practice
              </Link>
              <Link to="/math" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Math
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-6 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-8">
            About Acely
          </h1>

          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Acely is a fully free Digital SAT practice platform designed for students who want serious, structured preparation.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-6">
              The platform is built around the real skills tested on the Digital SAT. Questions are organized by subject, domain, and concept so students can practice with purpose rather than guesswork. Performance insights help identify strengths and weaknesses without unnecessary distraction.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-6">
              Acely focuses on clean design and calm usability. The interface is intentionally minimal so students can concentrate on reading, thinking, and solving problems. Every feature serves a clear academic purpose.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-6">
              Acely is not a replacement for hard work or consistency. It is a tool meant to support students who are willing to practice thoughtfully and reflect on their progress.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-10">
              The platform is developed independently and remains free to ensure equal access for students worldwide.
            </p>

            <div className="border-t border-border pt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">Transparency Statement</h2>
              <p className="text-muted-foreground leading-relaxed">
                Acely does not sell user data, display advertisements, or prioritize engagement over learning. Decisions about features and design are guided by educational value and student focus.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Acely. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}