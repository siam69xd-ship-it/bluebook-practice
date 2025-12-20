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
    
    // Clean up multiple dots (like "..." or "....") - replace with ellipsis
    processedContent = processedContent.replace(/\.{3,}/g, '…');
    
    // Pre-process: protect currency amounts from being parsed as LaTeX
    const currencyPlaceholders: string[] = [];
    processedContent = processedContent.replace(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, (match, amount) => {
      currencyPlaceholders.push(`$${amount}`);
      return `%%CURRENCY_${currencyPlaceholders.length - 1}%%`;
    });
    
    // Protect standalone $ followed by numbers (like $50)
    processedContent = processedContent.replace(/\$(\d+(?:\.\d{2})?)\b(?!\$)/g, (match, amount) => {
      currencyPlaceholders.push(`$${amount}`);
      return `%%CURRENCY_${currencyPlaceholders.length - 1}%%`;
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
    
    // Handle inline LaTeX \(...\) format (common in JSON files)
    processedContent = processedContent.replace(/\\\(([^)]+?)\\\)/g, (match, latex) => {
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
    
    // Handle inline LaTeX ($...$)
    processedContent = processedContent.replace(/\$([^$\n]+?)\$/g, (match, latex) => {
      const trimmed = latex.trim();
      // Skip if it looks like currency
      if (/^\d/.test(trimmed)) return match;
      // Skip if empty
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
    
    // Handle standalone \frac, \sqrt, \text commands not wrapped in $ or \(...\)
    const latexCommands = [
      { pattern: /(?<![\\$])\\frac\{([^}]*)\}\{([^}]*)\}/g, handler: (m: string, n: string, d: string) => `\\frac{${n}}{${d}}` },
      { pattern: /(?<![\\$])\\sqrt\{([^}]*)\}/g, handler: (m: string, c: string) => `\\sqrt{${c}}` },
      { pattern: /(?<![\\$])\\text\{([^}]*)\}/g, handler: (m: string, c: string) => `\\text{${c}}` },
    ];
    
    latexCommands.forEach(({ pattern, handler }) => {
      processedContent = processedContent.replace(pattern, (...args) => {
        try {
          const latex = handler(...args as [string, string, string]);
          return katex.renderToString(latex, { displayMode: false, throwOnError: false });
        } catch {
          return args[0];
        }
      });
    });

    // Restore currency placeholders
    currencyPlaceholders.forEach((currency, index) => {
      processedContent = processedContent.replace(`%%CURRENCY_${index}%%`, currency);
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
