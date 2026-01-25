import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';

export default function Contact() {
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
            Contact Acely
          </h1>

          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              We welcome questions, feedback, and suggestions from students, educators, and users of the Acely platform.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-10">
              If you need help using the platform, want to report an issue, or would like to share ideas for improvement, please reach out to us.
            </p>

            <div className="border border-border rounded-lg p-6 mb-10">
              <h2 className="text-lg font-semibold text-foreground mb-4">How to Contact Us</h2>
              
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <a 
                  href="mailto:support@acely.org" 
                  className="text-foreground hover:underline"
                >
                  support@acely.org
                </a>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Response Time: We aim to respond within 24 to 48 hours.
              </p>
            </div>

            <h2 className="text-lg font-semibold text-foreground mb-4">What You Can Contact Us About</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-10">
              <li>Technical issues or bugs</li>
              <li>Questions about SAT practice features</li>
              <li>Feedback on content or design</li>
              <li>General inquiries about Acely</li>
            </ul>

            <p className="text-sm text-muted-foreground italic">
              Please note that Acely cannot provide personalized admission counseling or score predictions.
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