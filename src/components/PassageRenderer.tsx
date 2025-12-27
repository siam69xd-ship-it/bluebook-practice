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
          // Table styling
          "[&_table]:w-auto [&_table]:border-collapse [&_table]:my-4 [&_table]:inline-table",
          "[&_table]:border [&_table]:border-slate-300",
          "[&_th]:border [&_th]:border-slate-300 [&_th]:px-4 [&_th]:py-2 [&_th]:bg-slate-100 [&_th]:text-left [&_th]:font-semibold",
          "[&_td]:border [&_td]:border-slate-300 [&_td]:px-4 [&_td]:py-2 [&_td]:text-center",
          "[&_thead]:bg-slate-50",
          "[&_tr]:border-b [&_tr]:border-slate-200",
          // Text formatting
          "[&_u]:underline [&_u]:decoration-2 [&_u]:underline-offset-2",
          "[&_b]:font-bold [&_strong]:font-bold",
          "[&_i]:italic [&_em]:italic",
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
