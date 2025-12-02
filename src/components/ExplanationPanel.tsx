import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';

interface ExplanationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: string;
  correctAnswer: string;
}

export function ExplanationPanel({
  isOpen,
  onClose,
  explanation,
  correctAnswer,
}: ExplanationPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Explanation</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Correct Answer */}
                <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/30">
                  <p className="text-sm font-medium text-success mb-1">Correct Answer</p>
                  <p className="text-2xl font-bold text-success">{correctAnswer}</p>
                </div>

                {/* Explanation */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    Why this is correct
                  </h4>
                  <p className="text-foreground/80 leading-relaxed">
                    {explanation}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border">
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
