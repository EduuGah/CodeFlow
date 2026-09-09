import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { listConcepts } from '../../../content';
import { DIFFICULTY_LABELS } from '../../../content/types';
import { executeCode } from '../../lib/sandbox';
import {
  emptyDraft,
  toTypeScript,
  validateDraft,
  type ExerciseDraft,
} from '../../lib/exercise-authoring';
import {
  IconArrowLeft,
  IconCheck,
  IconClose,
  IconPlay,
  IconSpinner,
} from '../../components/ui/Icon';
import { Badge } from '../../components/ui/Badge';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

/**
 * Autoria de exercício de código.
 *
 * Tira da mão a escrita do módulo TypeScript sem tirar as garantias dele. O
 * conteúdo continua sendo código versionado e revisado em pull request — o que
 * muda é que o autor preenche campos, vê a validação do schema real enquanto
 * escreve, e roda as duas checagens do CI antes de commitar:
 *
 * 1. a solução de referência passa em todos os testes
 * 2. o código inicial NÃO passa, senão o exercício se resolve sozinho
 *
 * Descobrir isso aqui custa segundos. Descobrir depois do merge custa um ciclo
 * inteiro de revisão.
 */

interface Checagem {
  solucaoPassa: boolean;
  inicialFalha: boolean;
  falhasDaSolucao: string[];
  erro?: string;
}

const campo =
  'w-full rounded-lg border border-control bg-surface px-3 py-2.5 text-sm text-ink transition-colors placeholder:text-ink-faint focus:border-brand-500';
const campoMono = `${campo} font-mono`;

export function AdminNewExercise() {
  useDocumentTitle('Novo exercício');
  const [draft, setDraft] = useState<ExerciseDraft>(emptyDraft);
  const [checagem, setChecagem] = useState<Checagem | null>(null);
  const [testando, setTestando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const problemas = useMemo(() => validateDraft(draft), [draft]);
  const valido = problemas.length === 0;

  const atualizar = (mudanca: Partial<ExerciseDraft>) => {
    setDraft((d) => ({ ...d, ...mudanca }));
    setChecagem(null);
    setCopiado(false);
  };

  const testar = async () => {
    setTestando(true);

    const testes = draft.tests.filter((t) => t.description.trim() !== '');

    const comSolucao = await executeCode(`${draft.initialCode}\n${draft.solution}`, testes);
    const semNada = await executeCode(draft.initialCode, testes);

    setChecagem({
      solucaoPassa:
        !comSolucao.error &&
        comSolucao.testResults.length > 0 &&
        comSolucao.testResults.every((t) => t.passed),
      inicialFalha:
        semNada.testResults.length === 0 || !semNada.testResults.every((t) => t.passed),
      falhasDaSolucao: comSolucao.testResults.filter((t) => !t.passed).map((t) => t.message),
      erro: comSolucao.error,
    });

    setTestando(false);
  };

  const pronto = valido && checagem?.solucaoPassa && checagem?.inicialFalha;

  const copiar = async () => {
    await navigator.clipboard.writeText(toTypeScript(draft));
    setCopiado(true);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-8">
        <Link
          to="/admin"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          <IconArrowLeft size={16} />
          Voltar à administração
        </Link>

        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Novo exercício</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Preencha, teste no sandbox real e copie o bloco para o arquivo da aula. O conteúdo
          continua passando por revisão no pull request.
        </p>
      </header>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label-mono mb-1.5 block text-ink-faint">Identificador</span>
            <input
              className={campoMono}
              value={draft.id}
              onChange={(e) => atualizar({ id: e.target.value })}
              placeholder="ex-js-4-somar"
            />
          </label>

          <label className="block">
            <span className="label-mono mb-1.5 block text-ink-faint">Dificuldade</span>
            <select
              className={campo}
              value={draft.difficulty}
              onChange={(e) => atualizar({ difficulty: e.target.value as ExerciseDraft['difficulty'] })}
            >
              {/* Do mesmo mapa que a tela do aluno usa: uma dificuldade nova
                  aparece aqui sem ninguém precisar lembrar deste arquivo. */}
              {Object.entries(DIFFICULTY_LABELS).map(([id, rotulo]) => (
                <option key={id} value={id}>
                  {rotulo}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset>
          <legend className="label-mono mb-1.5 text-ink-faint">Conceitos exercitados</legend>
          <div className="flex flex-wrap gap-2">
            {listConcepts().map((c) => {
              const marcado = draft.concepts.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    marcado
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-line text-ink-soft hover:border-control'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={marcado}
                    onChange={() =>
                      atualizar({
                        concepts: marcado
                          ? draft.concepts.filter((id) => id !== c.id)
                          : [...draft.concepts, c.id],
                      })
                    }
                  />
                  {c.title}
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="label-mono mb-1.5 block text-ink-faint">Enunciado (Markdown)</span>
          <textarea
            className={campo}
            rows={3}
            value={draft.prompt}
            onChange={(e) => atualizar({ prompt: e.target.value })}
            placeholder="Crie a função `somarAte(n)` que retorna…"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label-mono mb-1.5 block text-ink-faint">Código inicial</span>
            <textarea
              className={campoMono}
              rows={6}
              spellCheck={false}
              value={draft.initialCode}
              onChange={(e) => atualizar({ initialCode: e.target.value })}
            />
          </label>

          <label className="block">
            <span className="label-mono mb-1.5 block text-ink-faint">Solução de referência</span>
            <textarea
              className={campoMono}
              rows={6}
              spellCheck={false}
              value={draft.solution}
              onChange={(e) => atualizar({ solution: e.target.value })}
            />
          </label>
        </div>

        <fieldset>
          <legend className="label-mono mb-1.5 text-ink-faint">
            Dicas, da mais geral à mais específica
          </legend>
          <div className="space-y-2">
            {draft.hints.map((dica, i) => (
              <input
                key={i}
                className={campo}
                value={dica}
                placeholder={`Dica ${i + 1}`}
                onChange={(e) =>
                  atualizar({
                    hints: draft.hints.map((h, j) => (j === i ? e.target.value : h)),
                  })
                }
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => atualizar({ hints: [...draft.hints, ''] })}
            className="mt-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            + Outra dica
          </button>
        </fieldset>

        <fieldset>
          <legend className="label-mono mb-1.5 text-ink-faint">Testes</legend>
          <div className="space-y-3">
            {draft.tests.map((teste, i) => (
              <div key={i} className="rounded-xl border border-line bg-surface p-3">
                <input
                  className={`${campo} mb-2`}
                  value={teste.description}
                  placeholder="O que o aluno lê quando este teste passa"
                  onChange={(e) =>
                    atualizar({
                      tests: draft.tests.map((t, j) =>
                        j === i ? { ...t, description: e.target.value } : t
                      ),
                    })
                  }
                />
                <textarea
                  className={campoMono}
                  rows={2}
                  spellCheck={false}
                  value={teste.assertion}
                  placeholder={`if (soma(2,3) !== 5) throw new Error("Esperado 5.");`}
                  onChange={(e) =>
                    atualizar({
                      tests: draft.tests.map((t, j) =>
                        j === i ? { ...t, assertion: e.target.value } : t
                      ),
                    })
                  }
                />
                <label className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    checked={teste.hidden}
                    onChange={(e) =>
                      atualizar({
                        tests: draft.tests.map((t, j) =>
                          j === i ? { ...t, hidden: e.target.checked } : t
                        ),
                      })
                    }
                  />
                  Oculto — não aparece no enunciado
                </label>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              atualizar({
                tests: [...draft.tests, { description: '', assertion: '', hidden: false }],
              })
            }
            className="mt-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            + Outro teste
          </button>
        </fieldset>
      </div>

      {/* Validação do schema real, ao vivo. */}
      <section className="mt-8">
        <h2 className="label-mono mb-2 text-ink-faint">Validação</h2>

        {valido ? (
          <p className="flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 p-3 text-sm text-success-700">
            <IconCheck size={16} />O exercício atende ao schema do conteúdo.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {problemas.map((p, i) => (
              <li
                key={i}
                className="rounded-lg border border-energy-200 bg-energy-50 p-3 text-sm text-energy-700"
              >
                <span className="font-mono font-semibold">{p.path || 'exercício'}</span> —{' '}
                {p.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* As duas checagens que o CI faz, antes do commit. */}
      <section className="mt-6">
        <h2 className="label-mono mb-2 text-ink-faint">Checagem no sandbox</h2>

        <button
          type="button"
          onClick={testar}
          disabled={testando || !valido}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {testando ? <IconSpinner size={18} className="animate-spin" /> : <IconPlay size={18} />}
          {testando ? 'Executando…' : 'Rodar as checagens do CI'}
        </button>

        {checagem && (
          <ul className="mt-3 space-y-2">
            <li
              className={`flex items-start gap-2 rounded-lg border p-3 text-sm leading-relaxed ${
                checagem.solucaoPassa
                  ? 'border-success-200 bg-success-50 text-success-700'
                  : 'border-danger-200 bg-danger-50 text-danger-700'
              }`}
            >
              {checagem.solucaoPassa ? <IconCheck size={16} /> : <IconClose size={16} />}
              <span>
                A solução de referência passa em todos os testes.
                {!checagem.solucaoPassa && checagem.erro && (
                  <span className="mt-1 block font-mono text-xs">{checagem.erro}</span>
                )}
                {checagem.falhasDaSolucao.map((f, i) => (
                  <span key={i} className="mt-1 block text-xs">
                    {f}
                  </span>
                ))}
              </span>
            </li>

            <li
              className={`flex items-start gap-2 rounded-lg border p-3 text-sm leading-relaxed ${
                checagem.inicialFalha
                  ? 'border-success-200 bg-success-50 text-success-700'
                  : 'border-danger-200 bg-danger-50 text-danger-700'
              }`}
            >
              {checagem.inicialFalha ? <IconCheck size={16} /> : <IconClose size={16} />}
              <span>
                O código inicial <strong>não</strong> passa.
                {!checagem.inicialFalha && ' O exercício se resolve sozinho, sem o aluno escrever nada.'}
              </span>
            </li>
          </ul>
        )}
      </section>

      <section className="mt-6 border-t border-line pt-6">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="label-mono text-ink-faint">Bloco para o arquivo da aula</h2>
          {pronto ? (
            <Badge tone="success">Pronto para commitar</Badge>
          ) : (
            <Badge tone="caution">Rode as checagens antes</Badge>
          )}
        </div>

        <pre className="max-h-80 overflow-auto rounded-xl bg-ink p-4 text-xs leading-relaxed">
          <code className="font-mono text-white/90">{toTypeScript(draft)}</code>
        </pre>

        <button
          type="button"
          onClick={copiar}
          className="mt-3 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-sunken"
        >
          {copiado ? 'Copiado' : 'Copiar bloco'}
        </button>

        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          Cole dentro de <span className="font-mono">blocks</span> no arquivo da aula em{' '}
          <span className="font-mono">src/content/lessons/</span>. O conteúdo segue versionado e
          revisado — o CI vai repetir estas mesmas checagens.
        </p>
      </section>
    </div>
  );
}
