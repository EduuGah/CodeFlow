import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';

interface MarkdownReaderProps {
  content: string;
  className?: string;
}

export function MarkdownReader({ content, className }: MarkdownReaderProps) {
  return (
    <div className={cn(
      // prose-code estiliza `code` inline com fundo claro. Dentro de um <pre>
      // escuro isso deixava o código ilegível, então o seletor abaixo devolve
      // o code dentro do pre ao estilo do bloco.
      "prose prose-zinc prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-a:text-primary-600 prose-code:font-mono prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-pre:bg-zinc-900 prose-pre:text-zinc-100 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit",
      className
    )}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
