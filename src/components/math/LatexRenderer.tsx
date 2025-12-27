import { useEffect, useRef, memo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  content: string;
  className?: string;
  displayMode?: boolean;
}

function LatexRendererComponent({ content, className = '', displayMode = false }: LatexRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    let processedContent = content;
    
    // Remove option-like text at the end of questions (A) text \nB) text... patterns)
    processedContent = processedContent.replace(/\n[A-D]\)\s+[^\n]+(?=\s*$|\s*\n[A-D]\))/gi, '');
    processedContent = processedContent.replace(/\n[A-D]\)\s+[^\n]+$/gi, '');
    processedContent = processedContent.replace(/\s+[A-D]\)\s+[^\n]+(?:\s+[A-D]\)\s+[^\n]+)+$/gi, '');
    
    // Clean up multiple dots (like "..." or "....") - replace with ellipsis
    processedContent = processedContent.replace(/\.{3,}/g, '…');

    // Fix common data issue: unescaped $ inside \text{...} (e.g., \text{ $/g}).
    // Unescaped $ breaks our $...$ parsing and KaTeX rendering.
    processedContent = processedContent.replace(/\\text\{([^}]*)\}/g, (match, inner) => {
      let out = '';
      for (let i = 0; i < inner.length; i++) {
        const ch = inner[i];
        if (ch === '$' && (i === 0 || inner[i - 1] !== '\\')) {
          out += '\\$';
        } else {
          out += ch;
        }
      }
      return `\\text{${out}}`;
    });

    // KaTeX rendering helper
    const renderKatex = (latex: string, isDisplayMode: boolean): string => {
      try {
        const rendered = katex.renderToString(latex.trim(), {
          displayMode: isDisplayMode,
          throwOnError: false,
          trust: true,
          strict: false,
        });

        if (import.meta.env.DEV && rendered.includes('katex-error')) {
          console.warn('[KaTeX] Render issue:', latex);
        }

        return rendered;
      } catch {
        return latex;
      }
    };

    // Handle display mode LaTeX \[...\] - centered equations  
    processedContent = processedContent.replace(/\\\[([\s\S]*?)\\\]/g, (_, latex) => {
      const rendered = renderKatex(latex, true);
      return `<div class="my-4 flex justify-center">${rendered}</div>`;
    });

    // Handle display mode LaTeX ($$...$$) - centered equations
    processedContent = processedContent.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
      const rendered = renderKatex(latex, true);
      return `<div class="my-4 flex justify-center">${rendered}</div>`;
    });
    
    // Handle inline LaTeX \(...\) - common in JSON files
    processedContent = processedContent.replace(/\\\(([\s\S]*?)\\\)/g, (match, latex) => {
      const trimmed = latex.trim();
      if (!trimmed) return match;
      return renderKatex(trimmed, false);
    });

    // Handle inline LaTeX ($...$) - single dollar signs
    // Note: Some datasets use $...$ for both math and currency. We use a simple
    // context heuristic: if it's just a plain number AND nearby text suggests money,
    // preserve the $ as currency; otherwise, render as math.
    processedContent = processedContent.replace(/\$((?:\\\$|[^$\n])+?)\$/g, (match, latex, offset, full) => {
      const trimmed = String(latex).trim();
      if (!trimmed) return match;

      const isPlainNumber = /^-?[\d,]+(\.\d+)?$/.test(trimmed);
      if (isPlainNumber) {
        const start = Math.max(0, offset - 40);
        const end = Math.min(full.length, offset + match.length + 40);
        const around = full.slice(start, end).toLowerCase();

        const moneyContext = /\b(cost|costs|costing|price|priced|pay|paid|fee|fees|charge|charged|charges|dollar|dollars|usd|worth|spend|spent|buy|bought|sell|sold|rent|salary|wage)\b/.test(around);

        if (moneyContext) {
          // Keep as currency
          return `$${trimmed}`;
        }
      }

      // Render as LaTeX math
      return renderKatex(trimmed, false);
    });
    
    // Handle standalone \frac{num}{den} not wrapped in $
    processedContent = processedContent.replace(/(?<![\\$])\\frac\{([^}]*)\}\{([^}]*)\}/g, (match, num, den) => {
      return renderKatex(`\\frac{${num}}{${den}}`, false);
    });
    
    // Handle standalone \sqrt{content} or \sqrt[n]{content}
    processedContent = processedContent.replace(/(?<![\\$])\\sqrt(?:\[([^\]]*)\])?\{([^}]*)\}/g, (match, index, content) => {
      const latex = index ? `\\sqrt[${index}]{${content}}` : `\\sqrt{${content}}`;
      return renderKatex(latex, false);
    });
    
    // Handle standalone \text{content}
    processedContent = processedContent.replace(/(?<![\\$])\\text\{([^}]*)\}/g, (match, content) => {
      return renderKatex(`\\text{${content}}`, false);
    });
    
    // Handle standalone \overline{content}
    processedContent = processedContent.replace(/(?<![\\$])\\overline\{([^}]*)\}/g, (match, content) => {
      return renderKatex(`\\overline{${content}}`, false);
    });
    
    // Handle standalone \pi, \theta, \cos, \sin, \tan (common trig)
    processedContent = processedContent.replace(/(?<![\\$a-zA-Z])\\(pi|theta|cos|sin|tan|alpha|beta|gamma|delta|epsilon|sigma|omega|infty|pm|times|div|cdot|leq|geq|neq|approx|equiv|implies|Rightarrow|ge|le)(?![a-zA-Z{])/g, (match, symbol) => {
      return renderKatex(`\\${symbol}`, false);
    });

    // Handle line breaks
    processedContent = processedContent
      .replace(/<br\s*\/?>/gi, '<br/>')
      .replace(/\n/g, '<br/>');

    containerRef.current.innerHTML = processedContent;
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ lineHeight: '1.8' }}
    />
  );
}

const LatexRenderer = memo(LatexRendererComponent);

export default LatexRenderer;
