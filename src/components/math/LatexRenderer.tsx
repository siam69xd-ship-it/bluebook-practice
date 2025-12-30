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
    
    // 1. CLEANUP: Remove option-like text at the end (A) text... patterns)
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
      return `<div class="my-4 flex justify-center overflow-x-auto">${renderKatex(latex, true)}</div>`;
    });
    processedContent = processedContent.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
      return `<div class="my-4 flex justify-center overflow-x-auto">${renderKatex(latex, true)}</div>`;
    });
    
    // 5. INLINE MATH: \(...\) (Always render as math)
    processedContent = processedContent.replace(/\\\(([\s\S]*?)\\\)/g, (match, latex) => {
      return renderKatex(latex, false);
    });

    // 6. INLINE MATH: $...$ (SMART DETECTION)
    processedContent = processedContent.replace(/\$((?:\\\$|[^$\n])+?)\$/g, (match, latex) => {
      const trimmed = String(latex).trim();
      if (!trimmed) return match;

      // RULE A: If it contains LaTeX commands (backslash), it IS math.
      // e.g. $\frac{1}{2}$
      if (trimmed.includes('\\')) return renderKatex(trimmed, false);

      // RULE B: If it contains math operators (=, <, >, +, ^), it IS math.
      // e.g. $x + y$, $x < 5$
      if (/[=<>+\^]/.test(trimmed)) return renderKatex(trimmed, false);

      // RULE C: If it contains English words separated by spaces, it is TEXT (Currency).
      // e.g. "$950 for the first..." -> "950 for the first" has words.
      // Regex looks for: [letters] space [letters]
      if (/[a-zA-Z]{2,}\s+[a-zA-Z]{2,}/.test(trimmed)) {
        return match; // Return original string (renders as text)
      }

      // RULE D: If it's a plain number (e.g. $50 or $2,000.00), render as Math.
      // This ensures formatted numbers look nice, but typically plain numbers
      // in LaTeX font look very similar to text font.
      // We process it to ensure any stray variable like "x" is rendered correctly.
      return renderKatex(trimmed, false);
    });
    
    // 7. STANDALONE COMMANDS (Backward compatibility for bad datasets)
    processedContent = processedContent.replace(/(?<![\\$])\\frac\{([^}]*)\}\{([^}]*)\}/g, (match, num, den) => {
      return renderKatex(`\\frac{${num}}{${den}}`, false);
    });
    processedContent = processedContent.replace(/(?<![\\$])\\sqrt(?:\[([^\]]*)\])?\{([^}]*)\}/g, (match, index, content) => {
      const latex = index ? `\\sqrt[${index}]{${content}}` : `\\sqrt{${content}}`;
      return renderKatex(latex, false);
    });
    
    // 8. HTML TABLES
    processedContent = processedContent.replace(/<table([^>]*)>/gi, 
      `<div class="overflow-x-auto my-4"><table class="w-full border-collapse border border-slate-300 text-sm">`
    );
    processedContent = processedContent.replace(/<\/table>/gi, `</table></div>`);
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
