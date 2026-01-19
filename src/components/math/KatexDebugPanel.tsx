import { useState, useEffect } from 'react';
import { X, Bug, Trash2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface KatexError {
  id: string;
  timestamp: number;
  latex: string;
  error: string;
  contentSnippet: string;
  questionId?: string;
}

// Global error store
class KatexErrorStore {
  private errors: KatexError[] = [];
  private listeners: Set<() => void> = new Set();

  addError(error: Omit<KatexError, 'id' | 'timestamp'>) {
    // Deduplicate by latex content
    const exists = this.errors.some(e => e.latex === error.latex);
    if (exists) return;

    this.errors.push({
      ...error,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    });
    this.notify();
  }

  getErrors(): KatexError[] {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
    this.notify();
  }

  removeError(id: string) {
    this.errors = this.errors.filter(e => e.id !== id);
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const katexErrorStore = new KatexErrorStore();

// Hook to use the error store
export function useKatexErrors() {
  const [errors, setErrors] = useState<KatexError[]>([]);

  useEffect(() => {
    setErrors(katexErrorStore.getErrors());
    const unsubscribe = katexErrorStore.subscribe(() => {
      setErrors(katexErrorStore.getErrors());
    });
    return () => { unsubscribe(); };
  }, []);

  return errors;
}

// Debug Panel Component
export function KatexDebugPanel() {
  const errors = useKatexErrors();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Only show in development
  if (!import.meta.env.DEV) return null;

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (errors.length === 0 && !isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant={errors.length > 0 ? "destructive" : "secondary"}
        size="sm"
        className="shadow-lg"
      >
        <Bug className="w-4 h-4 mr-2" />
        KaTeX Errors
        {errors.length > 0 && (
          <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {errors.length}
          </span>
        )}
      </Button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-[500px] max-h-[60vh] bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-slate-800">KaTeX Debug Panel</h3>
              <span className="text-xs text-slate-500">({errors.length} errors)</span>
            </div>
            <div className="flex items-center gap-2">
              {errors.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => katexErrorStore.clearErrors()}
                  className="text-slate-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Error List */}
          <ScrollArea className="max-h-[50vh]">
            {errors.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bug className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No KaTeX errors detected</p>
                <p className="text-xs mt-1">Errors will appear here as you navigate questions</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {errors.map((error) => (
                  <div key={error.id} className="p-3 hover:bg-slate-50">
                    {/* Error Header */}
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => toggleExpanded(error.id)}
                        className="flex items-center gap-2 text-left flex-1 min-w-0"
                      >
                        {expandedIds.has(error.id) ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-mono text-red-600 truncate">
                            {error.latex}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {error.error}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => copyToClipboard(error.latex, error.id)}
                        >
                          {copiedId === error.id ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => katexErrorStore.removeError(error.id)}
                        >
                          <X className="w-3 h-3 text-slate-400" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedIds.has(error.id) && (
                      <div className="mt-3 pl-6 space-y-2">
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">LaTeX Input:</p>
                          <pre className="text-xs bg-slate-100 p-2 rounded overflow-x-auto font-mono">
                            {error.latex}
                          </pre>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Content Snippet:</p>
                          <pre className="text-xs bg-slate-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                            {error.contentSnippet}
                          </pre>
                        </div>
                        {error.questionId && (
                          <p className="text-xs text-slate-500">
                            Question ID: <span className="font-mono">{error.questionId}</span>
                          </p>
                        )}
                        <p className="text-xs text-slate-400">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

export default KatexDebugPanel;
