import { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { getHighlightClass } from './HighlightTool';
import { TextHighlight } from '@/lib/questionUtils';

interface HighlightableTextProps {
  text: string;
  highlights: TextHighlight[];
  selectedColor: string | null;
  onAddHighlight: (highlight: TextHighlight) => void;
  onRemoveHighlight: (index: number) => void;
  className?: string;
}

export function HighlightableText({
  text,
  highlights,
  selectedColor,
  onAddHighlight,
  onRemoveHighlight,
  className,
}: HighlightableTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    if (!selectedColor) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const container = containerRef.current;
    if (!container) return;

    // Check if selection is within our container
    if (!container.contains(range.commonAncestorContainer)) return;

    // Calculate text position
    const preSelectionRange = document.createRange();
    preSelectionRange.selectNodeContents(container);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + range.toString().length;

    if (start !== end) {
      onAddHighlight({ start, end, color: selectedColor });
      selection.removeAllRanges();
    }
  }, [selectedColor, onAddHighlight]);

  // Build segments from highlights
  const renderHighlightedText = () => {
    if (highlights.length === 0) {
      return <span>{text}</span>;
    }

    // Sort highlights by start position
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);
    const segments: { text: string; color?: string; highlightIndex?: number }[] = [];
    let currentPos = 0;

    sortedHighlights.forEach((highlight, idx) => {
      // Add non-highlighted text before this highlight
      if (highlight.start > currentPos) {
        segments.push({ text: text.slice(currentPos, highlight.start) });
      }

      // Add highlighted text
      segments.push({
        text: text.slice(highlight.start, highlight.end),
        color: highlight.color,
        highlightIndex: idx,
      });

      currentPos = highlight.end;
    });

    // Add remaining text after last highlight
    if (currentPos < text.length) {
      segments.push({ text: text.slice(currentPos) });
    }

    return segments.map((segment, idx) => {
      if (segment.color) {
        return (
          <span
            key={idx}
            className={cn(
              getHighlightClass(segment.color),
              'cursor-pointer rounded px-0.5 transition-all hover:opacity-80'
            )}
            onClick={() => {
              if (segment.highlightIndex !== undefined) {
                onRemoveHighlight(segment.highlightIndex);
              }
            }}
            title="Click to remove highlight"
          >
            {segment.text}
          </span>
        );
      }
      return <span key={idx}>{segment.text}</span>;
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      className={cn(
        'select-text',
        selectedColor && 'cursor-text',
        className
      )}
    >
      {renderHighlightedText()}
    </div>
  );
}
