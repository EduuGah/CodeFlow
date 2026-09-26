/**
 * Um trecho de Markdown numa linha: `código` vira código, **ênfase** perde os
 * asteriscos, e o resto é texto.
 *
 * O caderno lista dezenas de enunciados; o leitor de Markdown inteiro
 * (`MarkdownReader`) mora no pedaço da aula, baixado sob demanda, e trazê-lo
 * para a lista o colocaria no pacote que todo mundo baixa.
 */
export function TextoEmLinha({ texto }: { texto: string }) {
  const partes = texto.replace(/\*\*([^*]+)\*\*/g, '$1').split(/(`[^`]+`)/);
  return (
    <>
      {partes.map((parte, i) =>
        parte.startsWith('`') && parte.endsWith('`') && parte.length > 1 ? (
          <code key={i} className="rounded bg-sunken px-1 py-0.5 font-mono text-[0.9em] text-ink">
            {parte.slice(1, -1)}
          </code>
        ) : (
          parte
        )
      )}
    </>
  );
}

/** O primeiro parágrafo de um enunciado, sem bloco de código. */
export function primeiroParagrafo(markdown: string): string {
  const antesDoCodigo = markdown.split('```')[0];
  return antesDoCodigo.split(/\n\s*\n/)[0].replace(/\s+/g, ' ').trim();
}
