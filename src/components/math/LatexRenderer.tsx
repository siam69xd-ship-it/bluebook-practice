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
    
    // 1. CLEANUP: Remove option-like text at the end (A) text...)
    processedContent = processedContent.replace(/\n[A-D]\)\s+[^\n]+(?=\s*$|\s*\n[A-D]\))/gi, '');
    processedContent = processedContent.replace(/\n[A-D]\)\s+[^\n]+$/gi, '');
    processedContent = processedContent.replace(/\s+[A-D]\)\s+[^\n]+(?:\s+[A-D]\)\s+[^\n]+)+$/gi, '');
    
    // 2. CLEANUP: Fix multiple dots
    processedContent = processedContent.replace(/\.{3,}/g, '…');

    // 3. CLEANUP: Fix unescaped $ inside \text{...}
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
        return katex.renderToString(latex.trim(), {
          displayMode: isDisplayMode,
          throwOnError: false,
          trust: true,
          strict: false,
          output: 'html',
        });
      } catch (e) {
        return latex;
      }
    };

    // 4. BLOCK MATH: \[...\] and $$...$$
    processedContent = processedContent.replace(/\\\[([\s\S]*?)\\\]/g, (_, latex) => {
      return `<div class="my-4 flex justify-center">${renderKatex(latex, true)}</div>`;
    });
    processedContent = processedContent.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
      return `<div class="my-4 flex justify-center">${renderKatex(latex, true)}</div>`;
    });
    
    // 5. INLINE MATH: \(...\) (Always render as math)
    processedContent = processedContent.replace(/\\\(([\s\S]*?)\\\)/g, (match, latex) => {
      const trimmed = latex.trim();
      if (!trimmed) return match;
      return renderKatex(trimmed, false);
    });

    // 6. INLINE MATH: $...$ (SMART DETECTION)
    // This fixes the "words mashed together" issue in money problems
    processedContent = processedContent.replace(/\$((?:\\\$|[^$\n])+?)\$/g, (match, latex) => {
      const trimmed = String(latex).trim();
      if (!trimmed) return match;

      // A) If it contains LaTeX commands (backslash), it is DEFINITELY MATH
      if (trimmed.includes('\\')) return renderKatex(trimmed, false);

      // B) If it contains math operators (=, <, >, +, ^), it is DEFINITELY MATH
      // Exception: standard punctuation like "." or "," or "-" (could be hyphen)
      if (/[=<>+\^]/.test(trimmed)) return renderKatex(trimmed, false);

      // C) If it contains multiple English words separated by spaces, it is TEXT (Currency)
      // e.g. "950 for the first" -> has words "for", "the" -> treat as text
      if (/[a-zA-Z]{2,}\s+[a-zA-Z]{2,}/.test(trimmed)) {
        return match; // Return original string with $ signs intact (renders as text)
      }

      // D) If it is a plain number, check context (Currency vs Math)
      const isPlainNumber = /^-?[\d,]+(\.\d+)?$/.test(trimmed);
      if (isPlainNumber) {
        // Look at surrounding text in the original content to guess context?
        // Actually, we can just assume plain numbers in $...$ are Math 
        // UNLESS we are in a currency context.
        // But simply rendering a number as math "50" looks fine.
        // The issue is mostly the $ sign disappearing.
        // Let's rely on the user's data: if it was $50$, KaTeX renders "50". 
        // If the user wanted "$50", they should have typed "\$50".
        // However, to be safe for mixed datasets:
        return renderKatex(trimmed, false); 
      }

      // E) Default: Render as math (likely variables like "x" or "2x")
      return renderKatex(trimmed, false);
    });
    
    // 7. STANDALONE COMMANDS (Keep your existing helpers)
    processedContent = processedContent.replace(/(?<![\\$])\\frac\{([^}]*)\}\{([^}]*)\}/g, (match, num, den) => {
      return renderKatex(`\\frac{${num}}{${den}}`, false);
    });
    processedContent = processedContent.replace(/(?<![\\$])\\sqrt(?:\[([^\]]*)\])?\{([^}]*)\}/g, (match, index, content) => {
      const latex = index ? `\\sqrt[${index}]{${content}}` : `\\sqrt{${content}}`;
      return renderKatex(latex, false);
    });
    
    // 8. HTML TABLES
    processedContent = processedContent.replace(/<table([^>]*)>/gi, 
      `<table class="my-4 border-collapse border border-slate-300 w-auto inline-table">`
    );
    processedContent = processedContent.replace(/<th([^>]*)>/gi, 
      `<th class="border border-slate-300 px-4 py-2 bg-slate-100 font-semibold text-left">`
    );
    processedContent = processedContent.replace(/<td([^>]*)>/gi, 
      `<td class="border border-slate-300 px-4 py-2 text-center">`
    );

    // 9. LINE BREAKS
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
