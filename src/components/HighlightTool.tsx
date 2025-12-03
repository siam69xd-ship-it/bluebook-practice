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
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-600">
        {selectedColor ? 'Select text to highlight' : 'Choose a color:'}
      </span>
      <div className="flex items-center gap-2">
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color.name}
            onClick={() => onColorSelect(selectedColor === color.name ? null : color.name)}
            className={cn(
              'w-7 h-7 rounded-full transition-all duration-200',
              color.class,
              selectedColor === color.name
                ? 'ring-2 ring-offset-2 ring-gray-800 scale-110'
                : 'hover:scale-110 hover:ring-2 hover:ring-offset-2',
              color.hoverClass
            )}
            title={`Highlight ${color.name}`}
            data-testid={`button-highlight-${color.name}`}
          />
        ))}
      </div>
      {selectedColor && (
        <button
          onClick={() => onColorSelect(null)}
          className="text-sm text-gray-500 hover:text-gray-700 underline ml-2"
          data-testid="button-highlight-clear"
        >
          Cancel
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
