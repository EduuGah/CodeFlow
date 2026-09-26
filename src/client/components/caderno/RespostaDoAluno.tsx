import type { Exercise } from '../../../content/types';
import type { RespostaEnviada } from '../../lib/resposta';
import { TextoEmLinha } from './TextoEmLinha';

function Bloco({ children }: { children: string }) {
  return (
    <pre className="max-h-56 overflow-auto rounded-lg border border-line bg-sunken p-3 font-mono text-xs leading-relaxed text-ink">
      <code>{children}</code>
    </pre>
  );
}

/**
 * O que a pessoa enviou, no formato do exercício: o texto da alternativa e dos
 * passos, a linha de código apontada — não índices e ids, que ela nunca viu.
 */
export function RespostaDoAluno({ resposta, exercise }: { resposta: RespostaEnviada; exercise: Exercise }) {
  switch (resposta.tipo) {
    case 'alternativa': {
      const texto = exercise.type === 'multiple-choice' ? exercise.options[resposta.indice] : undefined;
      return (
        <p className="text-sm leading-relaxed text-ink">
          {texto === undefined ? `Alternativa ${resposta.indice + 1}` : <TextoEmLinha texto={texto} />}
        </p>
      );
    }
    case 'previsao':
      return <Bloco>{resposta.texto || '(em branco)'}</Bloco>;
    case 'lacunas':
      return (
        <ol className="space-y-1 text-sm text-ink">
          {resposta.valores.map((valor, i) => (
            <li key={i}>
              <span className="text-ink-soft">Lacuna {i + 1}: </span>
              {valor.trim() === '' ? (
                <span className="text-ink-faint">(vazia)</span>
              ) : (
                <code className="rounded bg-sunken px-1 py-0.5 font-mono text-[0.9em]">{valor}</code>
              )}
            </li>
          ))}
        </ol>
      );
    case 'linha': {
      const codigo = exercise.type === 'find-bug' ? exercise.code.split('\n')[resposta.linha - 1]?.trim() : undefined;
      return (
        <p className="text-sm leading-relaxed text-ink">
          Linha {resposta.linha}
          {codigo && (
            <>
              : <code className="rounded bg-sunken px-1 py-0.5 font-mono text-[0.9em]">{codigo}</code>
            </>
          )}
        </p>
      );
    }
    case 'ordem': {
      const passos = new Map(exercise.type === 'order-steps' ? exercise.steps.map((p) => [p.id, p.text]) : []);
      return (
        <ol className="list-decimal space-y-1 pl-5 text-sm text-ink">
          {resposta.ids.map((id) => (
            <li key={id}>
              <TextoEmLinha texto={passos.get(id) ?? id} />
            </li>
          ))}
        </ol>
      );
    }
    case 'codigo':
      return <Bloco>{resposta.codigo}</Bloco>;
  }
}
