import { useEffect, useRef, memo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  content: string;
  className?: string;
}

function LatexRendererComponent({ content, className = '' }: LatexRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    // Process content and replace LaTeX expressions
    let processedContent = content;
    
    // Handle display mode LaTeX ($$...$$)
    processedContent = processedContent.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
      try {
        return katex.renderToString(latex.trim(), { 
          displayMode: true, 
          throwOnError: false,
          trust: true,
          strict: false
        });
      } catch {
        return `$$${latex}$$`;
      }
    });
    
    // Handle inline LaTeX ($...$)
    processedContent = processedContent.replace(/\$([^$\n]+?)\$/g, (_, latex) => {
      try {
        return katex.renderToString(latex.trim(), { 
          displayMode: false, 
          throwOnError: false,
          trust: true,
          strict: false
        });
      } catch {
        return `$${latex}$`;
      }
    });
    
    // Handle standalone \frac commands not wrapped in $
    processedContent = processedContent.replace(/(?<!\$)\\frac\{([^}]*)\}\{([^}]*)\}(?!\$)/g, (_, num, den) => {
      try {
        return katex.renderToString(`\\frac{${num}}{${den}}`, { 
          displayMode: false, 
          throwOnError: false 
        });
      } catch {
        return `${num}/${den}`;
      }
    });

    // Handle HTML entities and line breaks
    processedContent = processedContent
      .replace(/<br\s*\/?>/gi, '<br/>')
      .replace(/\n/g, '<br/>');

    containerRef.current.innerHTML = processedContent;
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ lineHeight: '1.6' }}
    />
  );
}

// Memoize to prevent unnecessary re-renders
const LatexRenderer = memo(LatexRendererComponent);

export default LatexRenderer;
