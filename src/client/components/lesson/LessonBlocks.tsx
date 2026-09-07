import type { LessonBlock } from '../../../content/types';
import { MarkdownReader } from '../ui/MarkdownReader';

/**
 * Renderiza os blocos de leitura de uma aula. Cada `kind` tem sua apresentação,
 * então uma aula nova só precisa declarar os blocos que quer — sem tocar aqui.
 */
export function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case 'prose':
            return <MarkdownReader key={index} content={block.markdown} />;

          case 'example':
            return (
              <figure key={index} className="space-y-2">
                <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm leading-relaxed">
                  <code className="font-mono text-zinc-100">{block.code}</code>
                </pre>
                {block.caption && (
                  <figcaption className="text-xs leading-relaxed text-zinc-500">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          case 'summary':
            return (
              <aside
                key={index}
                className="rounded-lg border-l-2 border-zinc-300 bg-zinc-50 py-3 pl-4 pr-3"
              >
                <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Em resumo
                </h2>
                <MarkdownReader content={block.markdown} className="prose-p:my-0" />
              </aside>
            );

          // Exercícios têm interface própria (editor, testes, dicas) e são
          // renderizados pela página, não aqui.
          case 'exercise':
            return null;
        }
      })}
    </div>
  );
}
