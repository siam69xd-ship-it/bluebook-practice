import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
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
            Terms and Conditions
          </h1>

          <div className="prose prose-slate max-w-none space-y-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              By using Acely, you agree to the following terms.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Free Access</h2>
              <p className="text-muted-foreground leading-relaxed">
                Acely is provided free of charge for educational purposes. No payments or subscriptions are required.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed">
                You may use Acely for personal learning only. Content may not be copied, redistributed, or used commercially without permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Account Responsibility</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you create an account, you are responsible for maintaining its security and accuracy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Educational Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                Acely does not guarantee SAT scores or admission outcomes. The platform is a study aid, not a replacement for individual effort.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Platform Changes</h2>
              <p className="text-muted-foreground leading-relaxed">
                Features may be updated or modified to improve the platform. Acely may suspend access in cases of misuse.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                Terms may be updated at any time. Continued use of the platform constitutes acceptance of updated terms.
              </p>
            </section>
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