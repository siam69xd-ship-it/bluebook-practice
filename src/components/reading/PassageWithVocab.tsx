import { memo, useMemo, useRef, useState, useCallback, useEffect } from 'react';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { tokenizePassage, type VocabEntry } from '@/lib/vocabulary';

interface PassageWithVocabProps {
  passage: string;
  vocabMap: Map<string, VocabEntry>;
  className?: string;
}

/**
 * High-performance passage renderer with vocabulary highlighting.
 *
 * Perf strategy:
 * 1. Tokenize once per passage via useMemo (single-pass regex, O(n)).
 * 2. Render vocab matches as plain memoized <span>s — no per-word
 *    Popover/Tooltip state machines. Thousands of highlights cost
 *    only DOM nodes, not React state.
 * 3. Native `title` provides instant, zero-cost hover definitions.
 * 4. A single shared Popover is anchored to the clicked span using
 *    a fixed-position virtual anchor, so we mount one Radix subtree
 *    regardless of match count.
 */
export function PassageWithVocab({ passage, vocabMap, className }: PassageWithVocabProps) {
  const paragraphs = useMemo(() => {
    const raw = passage.replace(/\r\n/g, '\n');
    const blocks = raw
      .split(/\n{2,}/g)
      .flatMap((b) => b.split(/\n/g))
      .map((s) => s.trim())
      .filter(Boolean);
    return blocks.map((block, idx) => ({ id: idx, tokens: tokenizePassage(block, vocabMap) }));
  }, [passage, vocabMap]);

  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<VocabEntry | null>(null);

  const positionAnchor = useCallback((el: HTMLElement) => {
    const a = anchorRef.current;
    if (!a) return;
    const r = el.getBoundingClientRect();
    a.style.left = `${r.left}px`;
    a.style.top = `${r.top}px`;
    a.style.width = `${r.width}px`;
    a.style.height = `${r.height}px`;
  }, []);

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest('[data-vocab]') as HTMLElement | null;
      if (!el) return;
      const key = el.dataset.vocab;
      if (!key) return;
      const entry = vocabMap.get(key);
      if (!entry) return;
      e.preventDefault();
      positionAnchor(el);
      setActive(entry);
    },
    [vocabMap, positionAnchor]
  );

  // Keep popover anchored during scroll/resize while open.
  useEffect(() => {
    if (!active) return;
    const handler = () => {
      const el = containerRef.current?.querySelector<HTMLElement>(
        `[data-vocab="${CSS.escape(active.word.toLowerCase())}"]`
      );
      if (el) positionAnchor(el);
    };
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [active, positionAnchor]);

  return (
    <div ref={containerRef} className={className} onClick={onClick}>
      {paragraphs.map((p) => (
        <Paragraph key={p.id} tokens={p.tokens} />
      ))}

      <Popover open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <PopoverAnchor asChild>
          <div
            ref={anchorRef}
            aria-hidden
            style={{ position: 'fixed', left: 0, top: 0, width: 0, height: 0, pointerEvents: 'none' }}
          />
        </PopoverAnchor>
        {active && (
          <PopoverContent
            side="top"
            align="center"
            className="w-[300px] sm:w-[340px] p-0 border border-border shadow-lg bg-background rounded-none"
          >
            <VocabCard entry={active} />
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}

/**
 * Memoized paragraph — re-renders only if its token list changes.
 * Since tokens are stable per passage, this is essentially render-once.
 */
const Paragraph = memo(function Paragraph({ tokens }: { tokens: ReturnType<typeof tokenizePassage> }) {
  return (
    <p className="mb-4 last:mb-0 text-[15px] leading-[1.75] text-foreground/90">
      {tokens.map((t, i) => {
        if (t.type === 'text') return t.value;
        const title = t.entry.definition
          ? `${t.entry.word}: ${t.entry.definition}`
          : t.entry.word;
        return (
          <span
            key={i}
            data-vocab={t.key}
            title={title}
            className="font-semibold text-foreground bg-foreground/[0.06] hover:bg-foreground/[0.11] border-b border-foreground/40 hover:border-foreground rounded-[2px] px-[2px] -mx-[1px] cursor-pointer transition-colors"
          >
            {t.value}
          </span>
        );
      })}
    </p>
  );
});

function VocabCard({ entry }: { entry: VocabEntry }) {
  return (
    <div className="p-4 space-y-3">
      <div>
        <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
          Vocabulary
        </div>
        <div className="text-[18px] font-semibold tracking-tight text-foreground">{entry.word}</div>
      </div>

      {entry.definition && (
        <div>
          <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
            Definition
          </div>
          <p className="text-[13px] text-foreground/85 leading-relaxed">{entry.definition}</p>
        </div>
      )}

      {entry.example && (
        <div>
          <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
            Example
          </div>
          <p className="text-[13px] italic text-foreground/75 leading-relaxed">"{entry.example}"</p>
        </div>
      )}

      {(entry.synonym || entry.antonym) && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          {entry.synonym && (
            <div>
              <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
                Synonym
              </div>
              <p className="text-[13px] text-foreground/85">{entry.synonym}</p>
            </div>
          )}
          {entry.antonym && (
            <div>
              <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
                Antonym
              </div>
              <p className="text-[13px] text-foreground/85">{entry.antonym}</p>
            </div>
          )}
        </div>
      )}

      {entry.set && (
        <div className="pt-2 border-t border-border">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {entry.set}
          </span>
        </div>
      )}
    </div>
  );
}
