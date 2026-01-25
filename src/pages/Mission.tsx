import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function Mission() {
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
            Our Mission
          </h1>

          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Acely exists to make high-quality Digital SAT preparation accessible to every student, regardless of background or financial ability.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-6">
              Standardized test preparation often feels overwhelming, expensive, or unnecessarily complex. Acely was created to remove those barriers. Our goal is to provide a focused learning environment where students can practice intentionally, understand their weaknesses, and improve through structured effort.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-6">
              We believe effective preparation does not require flashy features or pressure-driven systems. It requires clarity, organization, and tools that respect how students actually learn.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              Acely is built to support disciplined practice, thoughtful review, and steady progress. By keeping the platform fully free, we aim to ensure that access to quality SAT preparation is based on motivation, not money.
            </p>
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