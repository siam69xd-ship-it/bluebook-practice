import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  content: string;
  className?: string;
}

export default function LatexRenderer({ content, className = '' }: LatexRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Parse content and replace LaTeX expressions
    const processedContent = content
      .replace(/\$\$(.*?)\$\$/gs, (_, latex) => {
        try {
          return katex.renderToString(latex.trim(), { displayMode: true, throwOnError: false });
        } catch {
          return `$$${latex}$$`;
        }
      })
      .replace(/\$(.*?)\$/g, (_, latex) => {
        try {
          return katex.renderToString(latex.trim(), { displayMode: false, throwOnError: false });
        } catch {
          return `$${latex}$`;
        }
      })
      .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, (_, num, den) => {
        try {
          return katex.renderToString(`\\frac{${num}}{${den}}`, { displayMode: false, throwOnError: false });
        } catch {
          return `${num}/${den}`;
        }
      });

    containerRef.current.innerHTML = processedContent;
  }, [content]);

  return <div ref={containerRef} className={className} />;
}
