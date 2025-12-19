import { cn } from '@/lib/utils';

interface PassageRendererProps {
  content: string;
  className?: string;
}

// Check if content contains HTML tags that need rendering
function containsHtml(text: string): boolean {
  return /<(table|u|b|i|em|strong|br|p|div|span|thead|tbody|tr|td|th)[^>]*>/i.test(text);
}

export function PassageRenderer({ content, className }: PassageRendererProps) {
  if (!content) return null;

  const hasHtml = containsHtml(content);

  if (hasHtml) {
    return (
      <div
        className={cn(
          "passage-html",
          "[&_table]:w-full [&_table]:border-collapse [&_table]:my-4",
          "[&_table]:border [&_table]:border-border",
          "[&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-muted [&_th]:text-left [&_th]:font-semibold",
          "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2",
          "[&_thead]:bg-muted/50",
          "[&_u]:underline [&_u]:decoration-2 [&_u]:underline-offset-2",
          "[&_br]:block [&_br]:content-[''] [&_br]:mt-2",
          className
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className={cn("whitespace-pre-wrap", className)}>
      {content}
    </div>
  );
}
