import { useEffect, useState } from 'react';

import { getBanco, type TabelaDeExemplo } from '../../../content/bancos';
import type { SqlExercise } from '../../../content/types';
import type { ExerciseState, OnExerciseState } from '../../lib/exercise-state';
import { executarSqlNoNavegador, prepararMotorSql } from '../../lib/sql';
import type { ResultadoSql, Saida } from '../../lib/sql-core';
import { useRecordAttempt } from '../../hooks/useRecordAttempt';
import { useReportarEstado } from '../../hooks/useReportarEstado';
import { Button } from '../ui/Button';
import { Card, SectionLabel } from '../ui/Card';
import { CodeEditor } from '../ui/CodeEditor';
import { IconCheck, IconClose, IconPlay } from '../ui/Icon';
import { MarkdownReader } from '../ui/MarkdownReader';
import { ExerciseAction, ExerciseFeedback } from './ExerciseAction';
import { HintPanel } from './HintPanel';

/**
 * Exercício de SQL como passo da aula.
 *
 * A mesma coluna do exercício de código — enunciado, editor, ação, veredito,
 * evidências, dicas — com duas coisas que só existem aqui:
 *
 * 1. **As tabelas do banco, antes do editor.** Ninguém escreve um SELECT sem
 *    saber o nome das colunas, e mandar o aluno decorar o esquema da aula
 *    anterior é mandar errar. Cada tabela mostra as colunas fechada e os
 *    tipos e descrições aberta.
 * 2. **O resultado é uma tabela, não um console.** Cada SELECT vira uma
 *    tabela na tela, como num cliente de banco de verdade; um INSERT vira
 *    "INSERT — 3 linhas". É olhando as linhas que a pessoa entende por que a
 *    consulta devolveu o que devolveu.
 */

interface SqlExerciseStepProps {
  exercise: SqlExercise;
  lessonId: string;
  onEstado?: OnExerciseState;
}

export function SqlExerciseStep({ exercise, lessonId, onEstado }: SqlExerciseStepProps) {
  const [code, setCode] = useState(exercise.initialCode);
  const [rodando, setRodando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoSql | null>(null);
  const [dicasAbertas, setDicasAbertas] = useState(0);
  const [verSolucao, setVerSolucao] = useState(false);
  /** O SQL exato que gerou o resultado na tela — ver `CodeExerciseStep`. */
  const [codigoVerificado, setCodigoVerificado] = useState<string | null>(null);

  const registrar = useRecordAttempt();
  const banco = getBanco(exercise.database);

  useEffect(() => {
    setCode(exercise.initialCode);
    setResultado(null);
    setCodigoVerificado(null);
    setDicasAbertas(0);
    setVerSolucao(false);
  }, [exercise.id, exercise.initialCode]);

  // O SQLite compila enquanto a pessoa lê o enunciado.
  useEffect(() => {
    void prepararMotorSql();
  }, []);

  const passouTudo =
    resultado !== null &&
    resultado.testResults.length > 0 &&
    resultado.testResults.every((t) => t.passed);

  const desatualizado = resultado !== null && code !== codigoVerificado;

  const estado: ExerciseState = rodando
    ? 'verificando'
    : resultado === null
      ? code.trim() === exercise.initialCode.trim()
        ? 'inicial'
        : 'respondendo'
      : desatualizado
        ? 'respondendo'
        : passouTudo
          ? 'acertou'
          : 'errou';

  useReportarEstado(estado, onEstado);

  const executar = async () => {
    setRodando(true);
    setResultado(null);

    const enviado = code;
    const execucao = await executarSqlNoNavegador({
      setup: `${banco?.sql ?? ''}\n${exercise.setup ?? ''}`,
      code: enviado,
      solution: exercise.solution,
      tests: exercise.tests,
    });
    setResultado(execucao);
    setCodigoVerificado(enviado);
    setRodando(false);

    const acertou =
      execucao.testResults.length > 0 && execucao.testResults.every((t) => t.passed);

    if (enviado !== codigoVerificado) {
      registrar({
        exerciseId: exercise.id,
        lessonId,
        concepts: exercise.concepts,
        correct: acertou,
        hintsUsed: dicasAbertas,
      });
    }
  };

  const falhas = resultado?.testResults.filter((t) => !t.passed) ?? [];
  const visiveis = resultado?.testResults ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <SectionLabel tone="brand" className="mb-2">
          Sua tarefa
        </SectionLabel>
        <MarkdownReader content={exercise.prompt} />
      </Card>

      {banco && (
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-2">
            <SectionLabel as="p">Tabelas do banco</SectionLabel>
            <span className="truncate text-xs text-ink-faint">{banco.title}</span>
          </div>
          <ul className="divide-y divide-line">
            {banco.tabelas.map((tabela) => (
              <li key={tabela.nome}>
                <TabelaDoEsquema tabela={tabela} />
              </li>
            ))}
          </ul>
          {/* O que o exercício acrescenta ao banco antes do aluno — uma tabela
              a mais, dados de exemplo — precisa estar à vista: ninguém consulta
              uma tabela que não sabe que existe. */}
          {exercise.setup && (
            <details className="border-t border-line">
              <summary className="cursor-pointer px-4 py-2.5 text-sm text-ink-soft hover:bg-sunken">
                Este exercício acrescenta ao banco…
              </summary>
              <pre className="overflow-x-auto border-t border-line bg-editor p-4 text-xs leading-relaxed">
                <code className="font-mono text-white/90">{exercise.setup.trim()}</code>
              </pre>
            </details>
          )}
        </Card>
      )}

      <div
        className={`overflow-hidden rounded-xl border transition-colors ${
          estado === 'acertou' ? 'border-success-200' : 'border-line'
        }`}
      >
        <CodeEditor height="220px" language="sql" value={code} onChange={setCode} />
      </div>

      <ExerciseAction onClick={executar} disabled={rodando} carregando={rodando}>
        {!rodando && <IconPlay size={18} />}
        {rodando ? 'Executando…' : resultado === null ? 'Executar consulta' : 'Executar de novo'}
      </ExerciseAction>

      {desatualizado && (
        <p className="rounded-lg border border-line bg-sunken px-4 py-3 text-sm leading-relaxed text-ink-soft">
          O SQL mudou depois desta execução. Rode de novo para conferir a versão atual.
        </p>
      )}

      {resultado && (
        <div role="status" className="space-y-3">
          {!desatualizado && visiveis.length > 0 && (
            <ExerciseFeedback
              anunciar={false}
              estado={passouTudo ? 'acertou' : 'errou'}
              titulo={
                passouTudo
                  ? 'As linhas são as esperadas'
                  : `${falhas.length} de ${visiveis.length} ${
                      visiveis.length === 1 ? 'verificação falhou' : 'verificações falharam'
                    }`
              }
            >
              <p className="text-sm leading-relaxed text-ink-soft">
                {passouTudo
                  ? 'Sua consulta devolve exatamente o que o exercício pede — o SQL pode ser diferente do de referência, e não faz diferença.'
                  : 'Cada linha abaixo diz o que era esperado. Compare com a tabela que a sua consulta devolveu.'}
              </p>
            </ExerciseFeedback>
          )}

          {resultado.timedOut ? (
            <p className="rounded-lg border border-energy-200 bg-energy-50 p-4 text-sm leading-relaxed text-energy-700">
              {resultado.error}
            </p>
          ) : (
            resultado.error && (
              <p className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm leading-relaxed text-danger-700">
                {resultado.error}
              </p>
            )
          )}

          {resultado.saidas.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-line bg-surface">
              <p className="label-mono border-b border-line px-4 py-2 text-ink-faint">Resultado</p>
              <div className="space-y-3 p-3">
                {resultado.saidas.map((saida, i) => (
                  <SaidaDoComando key={i} saida={saida} />
                ))}
              </div>
            </div>
          )}

          {visiveis.length > 0 && (
            <ul className="space-y-2">
              {visiveis.map((teste, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2.5 rounded-lg border p-3 text-sm leading-relaxed ${
                    teste.passed
                      ? 'border-success-200 bg-success-50 text-success-700'
                      : 'border-energy-200 bg-energy-50 text-energy-700'
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    {teste.passed ? <IconCheck size={15} /> : <IconClose size={15} />}
                  </span>
                  {teste.message}
                </li>
              ))}
            </ul>
          )}

          {passouTudo && !desatualizado && (
            <div className="rounded-lg border border-line bg-surface p-4">
              {verSolucao ? (
                <>
                  <p className="label-mono mb-2 text-ink-faint">Uma solução de referência</p>
                  <pre className="overflow-x-auto rounded-lg bg-editor p-4 text-sm leading-relaxed">
                    <code className="font-mono text-white/90">{exercise.solution}</code>
                  </pre>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Não é a única resposta certa — o que se verifica são as linhas devolvidas.
                    Serve para comparar caminhos.
                  </p>
                </>
              ) : (
                <Button
                  variant="ghost"
                  block
                  onClick={() => setVerSolucao(true)}
                  className="text-brand-700 hover:bg-brand-50 hover:text-brand-700"
                >
                  Comparar com uma solução de referência
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {!passouTudo && (
        <HintPanel key={exercise.id} hints={exercise.hints} onRevealedChange={setDicasAbertas} />
      )}
    </div>
  );
}

/**
 * Uma tabela do esquema: fechada, o nome e as colunas numa linha; aberta, os
 * tipos e o que cada coluna guarda. `<details>` nativo, que já vem acessível
 * e funciona por teclado.
 */
function TabelaDoEsquema({ tabela }: { tabela: TabelaDeExemplo }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2.5 text-sm hover:bg-sunken">
        <span className="font-mono font-semibold text-ink">{tabela.nome}</span>
        <span className="font-mono text-xs text-ink-faint">{tabela.colunas.map((c) => c.nome).join(' · ')}</span>
      </summary>
      <div className="border-t border-line bg-sunken px-4 py-3">
        <MarkdownReader content={tabela.descricao} className="mb-2 prose-p:my-0" />
        <dl className="grid grid-cols-[auto_auto_1fr] gap-x-4 gap-y-1 text-sm">
          {tabela.colunas.map((coluna) => (
            <div key={coluna.nome} className="contents">
              <dt className="font-mono text-ink">{coluna.nome}</dt>
              <dd className="font-mono text-xs uppercase text-ink-faint">{coluna.tipo}</dd>
              <dd className="text-ink-soft">{coluna.descricao ?? ''}</dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  );
}

/** O teto de linhas mostradas por tabela: o resto fica atrás de "mostrar tudo". */
const LINHAS_VISIVEIS = 30;

function SaidaDoComando({ saida }: { saida: Saida }) {
  const [tudo, setTudo] = useState(false);

  if (saida.tipo === 'comando') {
    return (
      <p className="font-mono text-sm text-ink-soft">
        <span className="font-semibold text-ink">{saida.comando}</span>
        {saida.linhas !== null && (
          <>
            {' — '}
            {saida.linhas === 1 ? '1 linha' : `${saida.linhas} linhas`}
          </>
        )}
      </p>
    );
  }

  const linhas = tudo ? saida.values : saida.values.slice(0, LINHAS_VISIVEIS);
  const escondidas = saida.values.length - linhas.length;

  return (
    <div>
      {saida.values.length === 0 ? (
        <p className="mb-1 text-xs text-ink-faint">Nenhuma linha — mas a consulta rodou. As colunas são estas:</p>
      ) : (
        <p className="mb-1 text-xs text-ink-faint">
          {saida.values.length === 1 ? '1 linha' : `${saida.values.length} linhas`}
          {saida.truncada && ' (mostrando as primeiras)'}
        </p>
      )}
      <div className="overflow-x-auto rounded-md border border-line">
        <table className="w-full border-collapse text-left font-mono text-sm">
          <thead>
            <tr className="bg-sunken">
              {saida.columns.map((coluna, i) => (
                <th key={i} scope="col" className="whitespace-nowrap border-b border-line px-3 py-1.5 font-semibold text-ink">
                  {coluna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha, i) => (
              <tr key={i} className="odd:bg-surface even:bg-canvas">
                {linha.map((valor, j) => (
                  <td
                    key={j}
                    className={`whitespace-nowrap border-b border-line px-3 py-1.5 ${
                      typeof valor === 'number' ? 'text-right tabular-nums' : ''
                    } ${valor === null ? 'italic text-ink-faint' : 'text-ink-soft'}`}
                  >
                    {valor === null ? 'NULL' : String(valor)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {escondidas > 0 && (
        <Button variant="ghost" size="sm" className="mt-1" onClick={() => setTudo(true)}>
          Mostrar as outras {escondidas} linhas
        </Button>
      )}
    </div>
  );
}
