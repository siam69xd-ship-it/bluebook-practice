import { useMemo } from 'react';
import { tokenizePassage, type VocabEntry } from '@/lib/vocabulary';
import { VocabWord } from './VocabWord';

interface PassageWithVocabProps {
  passage: string;
  vocabMap: Map<string, VocabEntry>;
  className?: string;
}

/**
 * Renders a passage as plain paragraphs with vocabulary words
 * automatically highlighted and made interactive.
 * Works for any passage text — fully data-driven.
 */
export function PassageWithVocab({ passage, vocabMap, className }: PassageWithVocabProps) {
  const paragraphs = useMemo(() => {
    // Split on blank lines OR single line breaks — either is treated as paragraph.
    const raw = passage.replace(/\r\n/g, '\n');
    const blocks = raw.split(/\n{2,}/g).flatMap((b) => b.split(/\n/g)).map((s) => s.trim()).filter(Boolean);
    return blocks.map((block) => tokenizePassage(block, vocabMap));
  }, [passage, vocabMap]);

  return (
    <div className={className}>
      {paragraphs.map((tokens, pIdx) => (
        <p key={pIdx} className="mb-4 last:mb-0 text-[15px] leading-[1.75] text-foreground/90">
          {tokens.map((t, i) =>
            t.type === 'vocab' ? (
              <VocabWord key={i} word={t.value} entry={t.entry} />
            ) : (
              <span key={i}>{t.value}</span>
            )
          )}
        </p>
      ))}
    </div>
  );
}
