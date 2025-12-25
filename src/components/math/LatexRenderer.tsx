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
    
    // KaTeX rendering helper
    const renderKatex = (latex: string, isDisplayMode: boolean): string => {
      try {
        return katex.renderToString(latex.trim(), { 
          displayMode: isDisplayMode, 
          throwOnError: false,
          trust: true,
          strict: false
        });
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
    // Key: Only treat as LaTeX if content has math-like characters
    processedContent = processedContent.replace(/\$([^$\n]+?)\$/g, (match, latex) => {
      const trimmed = latex.trim();
      // Skip if empty
      if (!trimmed) return match;
      // Skip if it's just a number (pure currency amount like $15, $1,000)
      if (/^[\d,]+(\.\d{2})?$/.test(trimmed)) {
        // This is currency - keep dollar sign
        return `$${trimmed}`;
      }
      // This is LaTeX - render it
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
