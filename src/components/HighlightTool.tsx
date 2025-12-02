import { cn } from '@/lib/utils';

interface HighlightToolProps {
  selectedColor: string | null;
  onColorSelect: (color: string | null) => void;
}

const HIGHLIGHT_COLORS = [
  { name: 'yellow', class: 'bg-highlight-yellow', hoverClass: 'hover:ring-highlight-yellow' },
  { name: 'green', class: 'bg-highlight-green', hoverClass: 'hover:ring-highlight-green' },
  { name: 'pink', class: 'bg-highlight-pink', hoverClass: 'hover:ring-highlight-pink' },
  { name: 'blue', class: 'bg-highlight-blue', hoverClass: 'hover:ring-highlight-blue' },
];

export function HighlightTool({ selectedColor, onColorSelect }: HighlightToolProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground mr-1">Highlight:</span>
      {HIGHLIGHT_COLORS.map((color) => (
        <button
          key={color.name}
          onClick={() => onColorSelect(selectedColor === color.name ? null : color.name)}
          className={cn(
            'w-6 h-6 rounded-full transition-all duration-200',
            color.class,
            selectedColor === color.name
              ? 'ring-2 ring-offset-2 ring-foreground scale-110'
              : 'hover:scale-110 hover:ring-2 hover:ring-offset-2',
            color.hoverClass
          )}
          title={`Highlight ${color.name}`}
        />
      ))}
      {selectedColor && (
        <button
          onClick={() => onColorSelect(null)}
          className="text-xs text-muted-foreground hover:text-foreground ml-2 underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}

export function getHighlightClass(color: string): string {
  switch (color) {
    case 'yellow':
      return 'bg-highlight-yellow/60';
    case 'green':
      return 'bg-highlight-green/60';
    case 'pink':
      return 'bg-highlight-pink/60';
    case 'blue':
      return 'bg-highlight-blue/60';
    default:
      return '';
  }
}
