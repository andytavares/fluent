import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface LessonMarkdownProps {
  children: string;
}

export function LessonMarkdown({ children }: LessonMarkdownProps) {
  return (
    <div className="max-w-none
      text-[var(--color-text-secondary)]
      [&_h1]:text-[var(--color-text-primary)] [&_h1]:text-base [&_h1]:font-semibold [&_h1]:mt-0
      [&_h2]:text-[var(--color-text-primary)] [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2
      [&_h3]:text-[var(--color-text-primary)] [&_h3]:text-sm [&_h3]:font-medium [&_h3]:mt-4 [&_h3]:mb-1
      [&_p]:leading-relaxed [&_p]:mb-3
      [&_strong]:text-[var(--color-text-primary)]
      [&_code]:rounded [&_code]:bg-[var(--color-bg-subtle)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono [&_code]:break-words
      [&_pre]:rounded-lg [&_pre]:bg-[var(--color-bg-subtle)] [&_pre]:p-3 [&_pre]:text-xs [&_pre]:overflow-x-auto [&_pre]:my-3
      [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:break-normal [&_pre_code]:whitespace-pre
      [&_ul]:list-disc [&_ul]:my-2 [&_ul]:pl-4 [&_li]:mb-1
      [&_ol]:list-decimal [&_ol]:my-2 [&_ol]:pl-4
      [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:text-xs
      [&_th]:border [&_th]:border-[var(--color-border-subtle)] [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-medium [&_th]:text-[var(--color-text-primary)] [&_th]:bg-[var(--color-bg-subtle)]
      [&_td]:border [&_td]:border-[var(--color-border-subtle)] [&_td]:px-2.5 [&_td]:py-1.5
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
