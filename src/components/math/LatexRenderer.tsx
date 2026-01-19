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
    
    // Handle inline LaTeX \(...\) - common in JSON files (MUST be before $...$ parsing)
    processedContent = processedContent.replace(/\\\(([\s\S]*?)\\\)/g, (match, latex) => {
      const trimmed = latex.trim();
      if (!trimmed) return match;
      return renderKatex(trimmed, false);
    });

    // STEP 1: Custom parser for $...$ LaTeX to handle complex cases
    // This manually finds balanced $...$ pairs without crossing sentence boundaries
    // and properly handles currency like $150 vs LaTeX like $x+y$
    const parseInlineLaTeX = (text: string): string => {
      let result = '';
      let i = 0;
      
      while (i < text.length) {
        if (text[i] === '$') {
          // Check if this is currency: $ followed by digits only (not followed by letters)
          const currencyMatch = text.slice(i).match(/^\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)(?![a-zA-Z\\])/);
          if (currencyMatch) {
            result += currencyMatch[0];
            i += currencyMatch[0].length;
            continue;
          }
          
          // Look for closing $ - but don't cross sentence boundaries
          let j = i + 1;
          let foundClose = false;
          let latexContent = '';
          
          while (j < text.length) {
            // Check for sentence boundary (period + space + capital or newline)
            if (text[j] === '.' && j + 2 < text.length) {
              const afterPeriod = text.slice(j + 1, j + 3);
              if (/^\s[A-Z]/.test(afterPeriod)) {
                // Sentence boundary - this $ is likely standalone, not LaTeX delimiter
                break;
              }
            }
            
            // Check for closing $
            if (text[j] === '$') {
              latexContent = text.slice(i + 1, j);
              
              // Validate this looks like LaTeX, not mismatched delimiters
              const hasLongText = /[A-Za-z]{12,}/.test(latexContent);
              const hasQuestion = /\?/.test(latexContent);
              const hasSentence = /\.\s+[A-Z]/.test(latexContent);
              
              if (!hasLongText && !hasQuestion && !hasSentence && latexContent.trim()) {
                // Valid LaTeX block
                result += renderKatex(latexContent, false);
                i = j + 1;
                foundClose = true;
              }
              break;
            }
            j++;
          }
          
          if (!foundClose) {
            // No valid closing $ found - output the $ as-is
            result += '$';
            i++;
          }
        } else {
          result += text[i];
          i++;
        }
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
