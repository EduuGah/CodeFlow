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
      "prose prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-a:text-brand-700 prose-code:font-mono prose-code:bg-sunken prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-pre:bg-editor prose-pre:text-white/90 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit",
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Uma tabela de quatro colunas não cabe em 375px, e o `prose` não
          // a faz rolar: ela estourava a largura da página inteira no celular
          // — apareceu na primeira aula de SQL, que é toda tabelas. Como os
          // blocos de código, ela ganha rolagem própria em vez de quebrar.
          table: ({ node: _node, ...props }) => (
            <div className="overflow-x-auto">
              <table {...props} />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
