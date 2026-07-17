import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import type { VocabEntry } from '@/lib/vocabulary';

interface VocabWordProps {
  word: string;
  entry: VocabEntry;
}

/**
 * Renders a highlighted vocabulary word with:
 * - Hover tooltip (desktop) showing the definition.
 * - Click popover (all devices) with full details from the JSON entry.
 */
export function VocabWord({ word, entry }: VocabWordProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const trigger = (
    <PopoverTrigger asChild>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="font-semibold text-foreground bg-foreground/[0.06] hover:bg-foreground/[0.11] border-b border-foreground/40 hover:border-foreground rounded-[2px] px-[2px] -mx-[1px] transition-colors cursor-pointer"
      >
        {word}
      </button>
    </PopoverTrigger>
  );

  const content = (
    <PopoverContent
      side="top"
      align="center"
      className="w-[300px] sm:w-[340px] p-0 border border-border shadow-lg bg-background rounded-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 space-y-3">
        <div>
          <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
            Vocabulary
          </div>
          <div className="text-[18px] font-semibold tracking-tight text-foreground">
            {entry.word}
          </div>
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

        {entry.set && (
          <div className="pt-2 border-t border-border">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {entry.set}
            </span>
          </div>
        )}
      </div>
    </PopoverContent>
  );

  // Mobile: click-only via Popover.
  if (isMobile) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        {trigger}
        {content}
      </Popover>
    );
  }

  // Desktop: hover tooltip + click popover.
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        {!open && entry.definition && (
          <TooltipContent side="top" className="max-w-[260px] text-[12px] leading-snug">
            <span className="font-semibold">{entry.word}:</span> {entry.definition}
          </TooltipContent>
        )}
      </Tooltip>
      {content}
    </Popover>
  );
}
