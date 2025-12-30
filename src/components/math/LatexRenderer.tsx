import { useEffect, useRef, memo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';

interface LatexRendererProps {
  content: string;
  className?: string;
  displayMode?: boolean;
}

function LatexRendererComponent({ content, className = '', displayMode = false }: LatexRendererProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    let processedContent = content;
    
    // Remove option-like text at the end of questions (common in some datasets)
    processedContent = processedContent.replace(/\n[A-D]\)\s+[^\n]+(?=\s*$|\s*\n[A-D]\))/gi, '');
    processedContent = processedContent.replace(/\n[A-D]\)\s+[^\n]+$/gi, '');
    processedContent = processedContent.replace(/\s+[A-D]\)\s+[^\n]+(?:\s+[A-D]\)\s+[^\n]+)+$/gi, '');
    
    // Clean up multiple dots
    processedContent = processedContent.replace(/\.{3,}/g, '…');

    // KaTeX rendering helper
    const renderKatex = (latex: string, isDisplayMode: boolean): string => {
      try {
        return katex.renderToString(latex.trim(), {
          displayMode: isDisplayMode,
          throwOnError: false,
          trust: true,
          strict: false,
          output: 'html',
        });
      } catch (e) {
        console.warn('KaTeX error:', e);
        return latex;
      }
    };

    // 1. Handle Display Mode \[ ... \]
    processedContent = processedContent.replace(/\\\[([\s\S]*?)\\\]/g, (_, latex) => {
      return `<div class="my-4 flex justify-center">${renderKatex(latex, true)}</div>`;
    });

    // 2. Handle Display Mode $$ ... $$
    processedContent = processedContent.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
      return `<div class="my-4 flex justify-center">${renderKatex(latex, true)}</div>`;
    });
    
    // 3. Handle Inline \( ... \) - Common in your Quadratics dataset
    processedContent = processedContent.replace(/\\\(([\s\S]*?)\\\)/g, (match, latex) => {
      const trimmed = latex.trim();
      if (!trimmed) return match;
      return renderKatex(trimmed, false);
    });

    // 4. Handle Inline $ ... $ - Common in your Linear Equations dataset
    // Regex updated to be more robust for single-line inline math
    processedContent = processedContent.replace(/\$((?:\\\$|[^$])+?)\$/g, (match, latex, offset, full) => {
      const trimmed = String(latex).trim();
      if (!trimmed) return match;

      // Currency heuristic: Preserve $ if it looks like money
      const isPlainNumber = /^-?[\d,]+(\.\d+)?$/.test(trimmed);
      if (isPlainNumber) {
        const start = Math.max(0, offset - 40);
        const end = Math.min(full.length, offset + match.length + 40);
        const around = full.slice(start, end).toLowerCase();
        
        // Check for currency-related words nearby
        const moneyContext = /\b(cost|costs|costing|price|priced|pay|paid|fee|fees|charge|charged|charges|dollar|dollars|usd|worth|spend|spent|buy|bought|sell|sold|rent|salary|wage)\b/.test(around);

        if (moneyContext) {
          return `$${trimmed}`;
        }
      }

      return renderKatex(trimmed, false);
    });
    
    // NOTE: Removed "standalone" replacements (e.g., direct \frac without delimiters)
    // as they were breaking nested LaTeX structures found in Algebra questions.
    // The datasets provided (Linear Equations, Quadratics) correctly use \(..\) or $..$ wrappers.

    // Handle HTML tables - add styling classes
    processedContent = processedContent.replace(/<table([^>]*)>/gi, 
      `<table class="my-4 border-collapse border border-slate-300 w-auto inline-table">`
    );
    processedContent = processedContent.replace(/<th([^>]*)>/gi, 
      `<th class="border border-slate-300 px-4 py-2 bg-slate-100 font-semibold text-left">`
    );
    processedContent = processedContent.replace(/<td([^>]*)>/gi, 
      `<td class="border border-slate-300 px-4 py-2 text-center">`
    );

    // Handle line breaks (converting newlines to breaks for display)
    processedContent = processedContent.replace(/\n/g, '<br/>');

    containerRef.current.innerHTML = processedContent;
  }, [content]);

  return (
    <span 
      ref={containerRef} 
      className={cn("latex-container leading-relaxed", className)}
      style={{ 
        display: displayMode ? 'block' : 'inline',
        wordBreak: 'break-word'
      }}
    />
  );
}

const LatexRenderer = memo(LatexRendererComponent);

export default LatexRenderer;
