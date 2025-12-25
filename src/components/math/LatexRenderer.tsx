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
    
    // Pre-process: convert currency amounts from $X to "X dollars" 
    // Match $15, $8, $1,000, $15.99 etc. BUT NOT if followed by LaTeX content
    // Use a more precise regex that excludes LaTeX-like patterns
    processedContent = processedContent.replace(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?![a-zA-Z\\{^_])/g, (match, amount) => {
      return `${amount} dollars `;
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
    processedContent = processedContent.replace(/\\\(([^)]*?)\\\)/g, (match, latex) => {
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
    // More robust regex: match $...$ where content contains LaTeX-like characters
    processedContent = processedContent.replace(/\$([^$\n]+?)\$/g, (match, latex) => {
      const trimmed = latex.trim();
      // Skip if it looks like a pure number (currency that wasn't caught earlier)
      if (/^\d+([.,]\d+)?$/.test(trimmed)) return match;
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
