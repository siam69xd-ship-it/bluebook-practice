import { cn } from '@/lib/utils';

interface PassageRendererProps {
  content: string;
  className?: string;
}

// Check if content contains HTML tags that need rendering
function containsHtml(text: string): boolean {
  return /<(table|u|b|i|em|strong|br|p|div|span|thead|tbody|tr|td|th|img)[^>]*>/i.test(text);
}

export function PassageRenderer({ content, className }: PassageRendererProps) {
  if (!content) return null;

  // Fix broken image paths: /images/diagrams/graphs/ -> /images/diagrams/diagram/graphs/
  const fixedContent = content.replace(
    /src='\/images\/diagrams\/(?!diagram\/)/g,
    "src='/images/diagrams/diagram/"
  ).replace(
    /src="\/images\/diagrams\/(?!diagram\/)/g,
    'src="/images/diagrams/diagram/'
  );

  const hasHtml = containsHtml(fixedContent);

  if (hasHtml) {
    return (
      <div
        className={cn(
          "passage-html",
          // Table styling
          "[&_table]:w-auto [&_table]:border-collapse [&_table]:my-4 [&_table]:inline-table",
          "[&_table]:border-2 [&_table]:border-black",
          "[&_th]:border [&_th]:border-black [&_th]:px-4 [&_th]:py-2 [&_th]:bg-black [&_th]:text-white [&_th]:text-center [&_th]:font-semibold",
          "[&_td]:border [&_td]:border-black [&_td]:px-4 [&_td]:py-2 [&_td]:text-center [&_td]:bg-white [&_td]:text-black",
          "[&_thead]:bg-black",
          "[&_tr]:border-b [&_tr]:border-black",
          // Image styling - clean white background, no filters
          "[&_img]:bg-white [&_img]:p-2 [&_img]:max-w-full [&_img]:h-auto [&_img]:mx-auto [&_img]:block [&_img]:contrast-[1.3] [&_img]:brightness-[1.05]",
          // Text formatting
          "[&_u]:underline [&_u]:decoration-2 [&_u]:underline-offset-2",
          "[&_b]:font-bold [&_strong]:font-bold",
          "[&_i]:italic [&_em]:italic",
          "[&_br]:block [&_br]:content-[''] [&_br]:mt-2",
          className
        )}
        dangerouslySetInnerHTML={{ __html: fixedContent }}
      />
    );
  }

  return (
    <div className={cn("whitespace-pre-wrap", className)}>
      {content}
    </div>
  );
}
