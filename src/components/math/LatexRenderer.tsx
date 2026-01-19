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
    
    // STEP 0: Convert escaped dollar signs from JSON (\\$) to temporary placeholder
    // This handles cases like "\\$60" in JSON which should display as "$60" (currency)
    processedContent = processedContent.replace(/\\\$/g, '__ESCAPED_DOLLAR__');
    
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

    // Track errors for debugging
    const errors: { latex: string; error?: string }[] = [];
    
    // KaTeX rendering helper with enhanced error logging
    const renderKatex = (latex: string, isDisplayMode: boolean): string => {
      try {
        const rendered = katex.renderToString(latex.trim(), {
          displayMode: isDisplayMode,
          throwOnError: false,
          trust: true,
          strict: false,
        });

        // Check for KaTeX error class in output
        if (rendered.includes('katex-error')) {
          const errorInfo = { latex: latex.trim(), error: 'KaTeX render error (red text)' };
          errors.push(errorInfo);
          console.error(
            '%c[KaTeX ERROR]%c Render failed for:',
            'background: #ff4444; color: white; padding: 2px 6px; border-radius: 3px;',
            'color: inherit;',
            `\n  Input: "${latex.trim()}"`,
            `\n  Full content snippet: "${content.slice(0, 200)}..."`
          );
          // Return with visual error indicator in dev mode
          if (import.meta.env.DEV) {
            return `<span class="katex-debug-error" style="background: #fee2e2; border: 1px solid #fca5a5; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 0.85em;" title="KaTeX error: ${latex.trim().replace(/"/g, '&quot;')}">${rendered}</span>`;
          }
        }

        return rendered;
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        errors.push({ latex: latex.trim(), error: errorMsg });
        console.error(
          '%c[KaTeX EXCEPTION]%c',
          'background: #dc2626; color: white; padding: 2px 6px; border-radius: 3px;',
          'color: inherit;',
          `\n  Input: "${latex.trim()}"`,
          `\n  Error: ${errorMsg}`,
          `\n  Full content: "${content.slice(0, 200)}..."`
        );
        // Return raw text with error styling in dev mode
        if (import.meta.env.DEV) {
          return `<span class="katex-debug-exception" style="background: #fef3c7; border: 1px solid #fcd34d; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 0.85em;" title="Exception: ${errorMsg}">${latex}</span>`;
        }
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
    
    // Handle inline LaTeX \(...\) - common in JSON files (MUST be before $...$ parsing)
    processedContent = processedContent.replace(/\\\(([\s\S]*?)\\\)/g, (match, latex) => {
      const trimmed = latex.trim();
      if (!trimmed) return match;
      return renderKatex(trimmed, false);
    });

    // STEP 1: Custom parser for $...$ inline math vs currency.
    // Data can contain BOTH:
    // - Currency: "$408" (no closing $)
    // - Inline math: "$x+y$" or "$20$" (balanced $...$)
    // We therefore:
    // 1) Prefer rendering balanced $...$ if the content between looks like math.
    // 2) Otherwise treat "$<number>" as currency.
    const parseInlineLaTeX = (text: string): string => {
      let result = '';
      let i = 0;

      const matchCurrencyAt = (idx: number): string | null => {
        // Currency must NOT be followed by a letter, a backslash (LaTeX), or a closing '$' (which would mean $number$ math).
        const m = text
          .slice(idx)
          .match(/^\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)(?![a-zA-Z\\$])/);
        return m ? m[0] : null;
      };

      const looksLikeProse = (s: string): boolean => {
        const trimmed = s.trim();
        if (!trimmed) return true;
        if (/\?/.test(trimmed)) return true;

        // If there's no LaTeX command (\...), but we see real words separated by spaces,
        // it's almost certainly mismatched delimiters (e.g., "$408 for the first hour and $204...").
        if (!trimmed.includes('\\') && /[A-Za-z]{3,}\s+[A-Za-z]{3,}/.test(trimmed)) return true;

        // Very long spans of plain letters usually indicate prose, not math.
        if (!trimmed.includes('\\') && trimmed.length > 80 && /[A-Za-z]/.test(trimmed)) return true;

        return false;
      };

      while (i < text.length) {
        if (text[i] !== '$') {
          result += text[i];
          i++;
          continue;
        }

        // Safety: if "$$" somehow survived earlier processing, treat as literal.
        if (text[i + 1] === '$') {
          result += '$$';
          i += 2;
          continue;
        }

        const nextDollar = text.indexOf('$', i + 1);

        // Prefer balanced $...$ rendering when the content between looks like math.
        if (nextDollar !== -1) {
          const between = text.slice(i + 1, nextDollar);
          if (!looksLikeProse(between)) {
            result += renderKatex(between, false);
            i = nextDollar + 1;
            continue;
          }
        }

        // Not valid inline math; fall back to currency if applicable.
        const currency = matchCurrencyAt(i);
        if (currency) {
          result += currency;
          i += currency.length;
          continue;
        }

        // Unmatched/unknown '$' -> keep it literal.
        result += '$';
        i++;
      }

      return result;
    };
    
    processedContent = parseInlineLaTeX(processedContent);

    // Currency is now handled inline in parseInlineLaTeX
    
    // Restore escaped dollar signs as regular dollar signs (currency)
    processedContent = processedContent.replace(/__ESCAPED_DOLLAR__/g, '$');
    
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

    // Handle HTML tables - add styling classes
    processedContent = processedContent.replace(/<table([^>]*)>/gi, (match, attrs) => {
      // Remove old attributes and add proper styling
      return `<table class="my-4 border-collapse border border-slate-300 w-auto inline-table">`;
    });
    processedContent = processedContent.replace(/<th([^>]*)>/gi, 
      `<th class="border border-slate-300 px-4 py-2 bg-slate-100 font-semibold text-left">`
    );
    processedContent = processedContent.replace(/<td([^>]*)>/gi, 
      `<td class="border border-slate-300 px-4 py-2 text-center">`
    );
    processedContent = processedContent.replace(/<tr([^>]*)>/gi, '<tr>');

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
