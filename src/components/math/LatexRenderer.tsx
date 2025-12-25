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
    
    // IMPORTANT: First, protect actual currency amounts by temporarily replacing them
    // Match patterns like $15, $1,000, $15.99, \$20 (escaped dollar) that are ACTUAL currency
    // These will be restored after LaTeX processing
    const currencyPlaceholders: string[] = [];
    
    // Match \$number (escaped dollar - common in LaTeX context for currency)
    processedContent = processedContent.replace(/\\\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, (match, amount) => {
      const placeholder = `__CURRENCY_${currencyPlaceholders.length}__`;
      currencyPlaceholders.push(`$${amount}`);
      return placeholder;
    });

    // Handle display mode LaTeX \[...\] - centered equations  
    processedContent = processedContent.replace(/\\\[([\s\S]*?)\\\]/g, (_, latex) => {
      try {
        const rendered = katex.renderToString(latex.trim(), { 
          displayMode: true, 
          throwOnError: false,
          trust: true,
          strict: false
        });
        return `<div class="my-4 flex justify-center">${rendered}</div>`;
      } catch {
        return `\\[${latex}\\]`;
      }
    });

    // Handle display mode LaTeX ($$...$$) - centered equations
    processedContent = processedContent.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
      try {
        const rendered = katex.renderToString(latex.trim(), { 
          displayMode: true, 
          throwOnError: false,
          trust: true,
          strict: false
        });
        return `<div class="my-4 flex justify-center">${rendered}</div>`;
      } catch {
        return `$$${latex}$$`;
      }
    });
    
    // Handle inline LaTeX \(...\) - common in JSON files
    processedContent = processedContent.replace(/\\\(([\s\S]*?)\\\)/g, (match, latex) => {
      const trimmed = latex.trim();
      if (!trimmed) return match;
      try {
        return katex.renderToString(trimmed, { 
          displayMode: false, 
          throwOnError: false,
          trust: true,
          strict: false
        });
      } catch {
        return match;
      }
    });

    // Handle inline LaTeX ($...$) - single dollar signs
    // Key: Only treat as LaTeX if content has math-like characters (letters, operators, backslashes)
    processedContent = processedContent.replace(/\$([^$\n]+?)\$/g, (match, latex) => {
      const trimmed = latex.trim();
      // Skip if empty
      if (!trimmed) return match;
      // Skip if it's just a number (pure currency amount like $15)
      if (/^[\d,]+(\.\d{2})?$/.test(trimmed)) {
        // This is currency - keep dollar sign
        return `$${trimmed}`;
      }
      // This is LaTeX - render it
      try {
        return katex.renderToString(trimmed, { 
          displayMode: false, 
          throwOnError: false,
          trust: true,
          strict: false
        });
      } catch {
        return match;
      }
    });
    
    // Restore currency placeholders
    currencyPlaceholders.forEach((currency, idx) => {
      processedContent = processedContent.replace(`__CURRENCY_${idx}__`, currency);
    });
    
    // Handle standalone \frac, \sqrt, \text, \cdot, \pm, \implies commands not wrapped in $
    const standalonePatterns = [
      // \frac{num}{den}
      { 
        pattern: /(?<![\\$])\\frac\{([^}]*)\}\{([^}]*)\}/g, 
        handler: (m: string, n: string, d: string) => `\\frac{${n}}{${d}}` 
      },
      // \sqrt{content} or \sqrt[n]{content}
      { 
        pattern: /(?<![\\$])\\sqrt(?:\[([^\]]*)\])?\{([^}]*)\}/g, 
        handler: (m: string, index: string | undefined, content: string) => 
          index ? `\\sqrt[${index}]{${content}}` : `\\sqrt{${content}}` 
      },
      // \text{content}
      { 
        pattern: /(?<![\\$])\\text\{([^}]*)\}/g, 
        handler: (m: string, c: string) => `\\text{${c}}` 
      },
    ];
    
    standalonePatterns.forEach(({ pattern, handler }) => {
      processedContent = processedContent.replace(pattern, (...args) => {
        try {
          const latex = handler(args[0], args[1], args[2]);
          return katex.renderToString(latex, { 
            displayMode: false, 
            throwOnError: false,
            trust: true,
            strict: false
          });
        } catch {
          return args[0];
        }
      });
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
