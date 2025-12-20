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
    
    // Pre-process: protect currency amounts from being parsed as LaTeX
    // Replace $X,XXX patterns (currency) with a placeholder
    const currencyPlaceholders: string[] = [];
    processedContent = processedContent.replace(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, (match, amount) => {
      currencyPlaceholders.push(`$${amount}`);
      return `%%CURRENCY_${currencyPlaceholders.length - 1}%%`;
    });
    
    // Also protect standalone $ followed by numbers without comma (like $50)
    processedContent = processedContent.replace(/\$(\d+(?:\.\d{2})?)\b(?!\$)/g, (match, amount) => {
      currencyPlaceholders.push(`$${amount}`);
      return `%%CURRENCY_${currencyPlaceholders.length - 1}%%`;
    });

    // Handle display mode LaTeX ($$...$$) - centered equations on their own line
    // These should be rendered as block-level centered equations
    processedContent = processedContent.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
      try {
        const rendered = katex.renderToString(latex.trim(), { 
          displayMode: true, 
          throwOnError: false,
          trust: true,
          strict: false
        });
        // Wrap in centered div with proper spacing
        return `<div class="my-6 text-center text-lg">${rendered}</div>`;
      } catch {
        return `$$${latex}$$`;
      }
    });
    
    // Handle inline LaTeX ($...$) - must have content between $s
    processedContent = processedContent.replace(/\$([^$\n]+?)\$/g, (_, latex) => {
      // Skip if it looks like currency that wasn't caught
      if (/^\d/.test(latex.trim())) return `$${latex}$`;
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

    // Restore currency placeholders
    currencyPlaceholders.forEach((currency, index) => {
      processedContent = processedContent.replace(`%%CURRENCY_${index}%%`, currency);
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
      style={{ lineHeight: '1.8' }}
    />
  );
}

// Memoize to prevent unnecessary re-renders
const LatexRenderer = memo(LatexRendererComponent);

export default LatexRenderer;
