import type { ErroDeCompilacao } from '../../lib/typescript-core';

/**
 * A lista de erros com que o compilador recusou o programa.
 *
 * Cada erro tem três partes, na ordem em que o aluno precisa delas: a linha
 * (para achar o lugar), a mensagem original em inglês (a que ele vai
 * encontrar em qualquer editor do mundo — a aula de erros do compilador
 * ensina a lê-la) e, quando a plataforma a conhece, a explicação em
 * português. A tradução acompanha o original em vez de substituí-lo de
 * propósito: esconder a mensagem real deixaria o aluno despreparado para o
 * primeiro projeto fora daqui.
 */
export function ErrosDoCompilador({ erros }: { erros: ErroDeCompilacao[] }) {
  return (
    <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm leading-relaxed text-danger-700">
      <p className="font-medium">
        {erros.length === 1
          ? 'O compilador recusou o programa: 1 erro de tipo. Nada rodou.'
          : `O compilador recusou o programa: ${erros.length} erros de tipo. Nada rodou.`}
      </p>
      <ul className="mt-3 space-y-3">
        {erros.map((erro, i) => (
          <li key={i} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
            <span className="label-mono shrink-0 whitespace-nowrap text-danger-700/70">
              Linha {erro.linha}
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[13px] leading-relaxed break-words">{erro.mensagem}</p>
              {erro.explicacao && <p className="mt-1">{erro.explicacao}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
