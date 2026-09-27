import type { TemaDoEditor } from '../../lib/temas-do-editor';

/**
 * O tema do editor fora do editor: a miniatura da loja e do inventário, e a
 * prévia com um trecho de código de verdade.
 *
 * Nenhum dos dois carrega o Monaco — a loja não pode custar o editor inteiro
 * para mostrar cinco cores. O trecho vem já separado em tokens, com os mesmos
 * papéis que `monaco.ts` pinta (`palavraChave`, `textoLiteral`…): o que a
 * prévia mostra é o que o editor vai mostrar.
 */

type Papel = keyof TemaDoEditor['cores'] | 'texto';
type Linha = Array<[string, Papel]>;

// Até 23 caracteres por linha: cabe no cartão da loja sem rolar de lado. O
// tipo é `Date` porque é o que o Monaco pinta como tipo — identificador com
// maiúscula.
const TRECHO: Linha[] = [
  [['// pontos da semana', 'comentario']],
  [['const', 'palavraChave'], [' pts = [', 'texto'], ['3', 'numero'], [', ', 'texto'], ['5', 'numero'], [', ', 'texto'], ['8', 'numero'], ['];', 'texto']],
  [['const', 'palavraChave'], [' dia = ', 'texto'], ['new', 'palavraChave'], [' ', 'texto'], ['Date', 'tipo'], ['();', 'texto']],
  [['if', 'palavraChave'], [' (pts.length > ', 'texto'], ['2', 'numero'], [') {', 'texto']],
  [['  alert(', 'texto'], ['"boa semana!"', 'textoLiteral'], [');', 'texto']],
  [['}', 'texto']],
];

const corDe = (tema: TemaDoEditor, papel: Papel) => (papel === 'texto' ? tema.texto : tema.cores[papel]);

/** As linhas da miniatura: o recuo e os traços, com o papel de cada um. */
const TRACOS: Array<{ recuo: number; partes: Array<[number, Papel]> }> = [
  { recuo: 0, partes: [[30, 'comentario']] },
  { recuo: 0, partes: [[12, 'palavraChave'], [16, 'texto'], [6, 'numero']] },
  { recuo: 0, partes: [[16, 'palavraChave'], [10, 'texto'], [12, 'tipo']] },
  { recuo: 7, partes: [[12, 'palavraChave'], [22, 'textoLiteral']] },
  { recuo: 0, partes: [[4, 'texto']] },
];

/** A janela de código em miniatura: as linhas viram traços, nas cores do tema. */
export function MiniaturaDoEditor({ tema, largura = 88 }: { tema: TemaDoEditor; largura?: number }) {
  return (
    <svg
      viewBox="0 0 96 60"
      width={largura}
      height={(largura * 60) / 96}
      aria-hidden
      className="block rounded-lg ring-1 ring-black/10"
    >
      <rect width="96" height="60" rx="8" fill={tema.fundo} />
      {TRACOS.map(({ recuo, partes }, i) => {
        const y = 9 + i * 9.5;
        let x = 16 + recuo;
        return (
          <g key={i}>
            <rect x="6" y={y} width="4" height="3.5" rx="1" fill={tema.numeros} />
            {partes.map(([largo, papel], j) => {
              const traco = <rect key={j} x={x} y={y} width={largo} height="3.5" rx="1.5" fill={corDe(tema, papel)} />;
              x += largo + 3;
              return traco;
            })}
          </g>
        );
      })}
    </svg>
  );
}

/** Um trecho curto de código, com números de linha, nas cores do tema. */
export function PreviaDoEditor({ tema }: { tema: TemaDoEditor }) {
  return (
    <figure className="mt-2 overflow-hidden rounded-lg ring-1 ring-black/10">
      <pre
        className="overflow-x-auto py-3 font-mono text-xs leading-5"
        style={{ background: tema.fundo, color: tema.texto }}
      >
        {TRECHO.map((linha, i) => (
          <div key={i} className="flex">
            <span className="w-7 shrink-0 select-none pr-2 text-right" style={{ color: tema.numeros }} aria-hidden>
              {i + 1}
            </span>
            <code className="whitespace-pre pl-1 pr-3">
              {linha.map(([texto, papel], j) => (
                <span
                  key={j}
                  style={{ color: corDe(tema, papel), fontStyle: papel === 'comentario' ? 'italic' : undefined }}
                >
                  {texto}
                </span>
              ))}
            </code>
          </div>
        ))}
      </pre>
      <figcaption className="sr-only">O tema {tema.title} num trecho de código.</figcaption>
    </figure>
  );
}
