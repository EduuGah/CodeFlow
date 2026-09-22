import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getProject, listProjects } from '../../content';
import { LANGUAGE_LABELS, type TestCase } from '../../content/types';
import { useAuth } from '../contexts/AuthContext';
import { fetchProgress, markProjectCompleted } from '../lib/progress';
import { executeCode, abrirServidorVivo, type ExecutionResult } from '../lib/sandbox';
import { executarPagina } from '../lib/pagina';
import { SANDBOX_DO_IFRAME } from '../lib/pagina-core';
import { montarCodigoDoServidor } from '../lib/servidor-core';
import { CheckpointList, type CheckpointResult } from '../components/project/CheckpointList';
import { Trocas } from '../components/lesson/ServerExerciseStep';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { celebrar } from '../lib/celebrar';
import { MarkdownReader } from '../components/ui/MarkdownReader';
import { Button } from '../components/ui/Button';
import { Card, SectionLabel } from '../components/ui/Card';
import { CodeEditor } from '../components/ui/CodeEditor';
import { Badge } from '../components/ui/Badge';
import {
  IconCheckCircle,
  IconChecklist,
  IconClose,
  IconLesson,
  IconPlay,
  IconSend,
} from '../components/ui/Icon';

/**
 * Workspace de projeto.
 *
 * O layout anterior era um split-screen de altura fixa — enunciado à esquerda,
 * editor à direita —, o mesmo problema que a aula tinha. No celular sobravam
 * poucos centímetros para cada painel.
 *
 * A solução aqui é diferente da aula, porque o problema é diferente. Num projeto
 * o aluno escreve código consultando o enunciado o tempo todo; empilhar tudo
 * numa coluna obrigaria a rolar de um lado ao outro a cada dúvida. Então no
 * celular são abas, e no desktop as duas colunas voltam, porque lá há espaço
 * para ver enunciado e código ao mesmo tempo.
 *
 * As abas existem só no celular: no desktop os dois painéis ficam sempre
 * visíveis, e o estado da aba é ignorado pelo CSS.
 *
 * As abas seguem o padrão ARIA por inteiro, e não só pelo `role`. Anunciar "aba,
 * 1 de 2" e depois ignorar as setas é pior do que não anunciar nada: o leitor de
 * tela ensina uma interação que a página não tem. Então só a aba ativa entra na
 * ordem de tabulação, e as setas movem entre elas.
 *
 * No desktop os dois painéis continuam com `role="tabpanel"` embora a lista de
 * abas esteja oculta — lá eles são lidos como duas regiões nomeadas, que é o
 * comportamento desejado. Trocar o `role` por largura exigiria repetir o
 * breakpoint em JavaScript, e duas fontes para a mesma medida divergem.
 */

type Aba = 'enunciado' | 'codigo';

export function ProjectWorkspace() {
  const { id } = useParams();
  const { user } = useAuth();

  const project = (id ? getProject(id) : undefined) ?? listProjects()[0];

  useDocumentTitle(project.title);

  const [aba, setAba] = useState<Aba>('enunciado');
  const [code, setCode] = useState(project.initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const [checkResults, setCheckResults] = useState<Map<string, CheckpointResult>>(new Map());
  const [isVerifying, setIsVerifying] = useState(false);

  const ehPagina = project.runtime === 'iframe';
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [paginaRenderizada, setPaginaRenderizada] = useState(false);

  const verificado = checkResults.size > 0;
  const fechados = project.checkpoints.filter((c) => checkResults.get(c.id)?.passed).length;
  const todosFechados = verificado && fechados === project.checkpoints.length;

  useEffect(() => {
    let ativo = true;

    async function conferirStatus() {
      if (!user) return;

      const progresso = await fetchProgress(user.id);
      if (ativo && progresso.completedProjects.includes(project.id)) setIsCompleted(true);
    }

    conferirStatus();
    return () => {
      ativo = false;
    };
  }, [user, project.id]);

  /**
   * Motor 7: o servidor do projeto sobe num worker antes da página e fica de
   * pé enquanto ela roda — cada `fetch` dela vai a ele. Sobe do zero a cada
   * chamada, para nenhum checkpoint herdar dados que outro criou.
   */
  const executarPaginaComServidor = async (
    iframe: HTMLIFrameElement,
    enviado: string,
    tests: TestCase[]
  ): Promise<ExecutionResult> => {
    const declarado = project.servidor;
    if (!declarado) return executarPagina(iframe, enviado, tests);

    const servidor = await abrirServidorVivo(
      montarCodigoDoServidor(declarado.code, { env: declarado.env, arquivos: declarado.arquivos }),
      declarado.banco !== undefined ? { banco: declarado.banco } : {}
    );
    try {
      if (servidor.error) {
        return {
          output: servidor.logs.join('\n'),
          logs: servidor.logs,
          testResults: [],
          error: `O servidor por trás da página não subiu: ${servidor.error}`,
        };
      }
      const execucao = await executarPagina(iframe, enviado, tests, { servidor });
      const trocas = await servidor.trocas();
      return trocas.length > 0 ? { ...execucao, trocas } : execucao;
    } finally {
      servidor.fechar();
    }
  };

  const executar = async () => {
    setIsRunning(true);
    setResult(null);

    // Execução livre: mostra o console (ou a página) sem julgar critério.
    const execucao =
      ehPagina && iframeRef.current
        ? await executarPaginaComServidor(iframeRef.current, code, [])
        : await executeCode(code);
    if (ehPagina) setPaginaRenderizada(true);
    setResult(execucao);
    setIsRunning(false);
  };

  /**
   * Roda os testes de cada checkpoint contra o código atual.
   *
   * Um worker por checkpoint (ou, numa página, um servidor e uma renderização
   * novos): assim um laço infinito num critério não impede os outros de serem
   * avaliados, e o aluno vê o quadro completo.
   */
  const verificar = async () => {
    setIsVerifying(true);
    setResult(null);

    const resultados = new Map<string, CheckpointResult>();

    for (const checkpoint of project.checkpoints) {
      const execucao =
        ehPagina && iframeRef.current
          ? await executarPaginaComServidor(iframeRef.current, code, checkpoint.tests)
          : await executeCode(code, checkpoint.tests);
      if (ehPagina) setPaginaRenderizada(true);

      const falhas = execucao.error
        ? [execucao.error]
        : execucao.testResults.filter((t) => !t.passed).map((t) => t.message);

      resultados.set(checkpoint.id, { failures: falhas, passed: falhas.length === 0 });
    }

    setCheckResults(resultados);
    setIsVerifying(false);
  };

  const submeter = async () => {
    if (isCompleted) return;

    celebrar('projeto');

    setIsCompleted(true);

    if (user) {
      try {
        await markProjectCompleted(user.id, project.id);
      } catch (erro) {
        console.error('Falha ao salvar conclusão do projeto:', erro);
      }
    }
  };

  const abas: Array<{ id: Aba; label: string; Icone: typeof IconLesson }> = [
    { id: 'enunciado', label: 'Enunciado', Icone: IconLesson },
    { id: 'codigo', label: 'Código', Icone: IconPlay },
  ];

  const arquivosDoServidor: Array<[string, string]> = project.servidor
    ? [
        ...(project.servidor.banco !== undefined
          ? ([['banco.sql', project.servidor.banco]] as Array<[string, string]>)
          : []),
        ['servidor.js', project.servidor.code],
        ...Object.entries(project.servidor.arquivos ?? {}),
      ]
    : [];

  const abaRefs = useRef(new Map<Aba, HTMLButtonElement>());

  /** Setas trocam de aba e levam o foco junto, como manda o padrão. */
  const navegarAbas = (evento: KeyboardEvent) => {
    const passo = evento.key === 'ArrowRight' ? 1 : evento.key === 'ArrowLeft' ? -1 : 0;
    if (passo === 0) return;

    evento.preventDefault();
    const atual = abas.findIndex((a) => a.id === aba);
    const proxima = abas[(atual + passo + abas.length) % abas.length].id;

    setAba(proxima);
    abaRefs.current.get(proxima)?.focus();
  };

  return (
    <div className="rolagem-com-barras flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            to="/app/trilhas"
            aria-label="Sair do projeto"
            className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-sunken hover:text-ink"
          >
            <IconClose size={20} />
          </Link>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{project.title}</p>
            <p className="label-mono text-ink-faint">
              Projeto · {LANGUAGE_LABELS[project.language]}
            </p>
          </div>

          {isCompleted && (
            <Badge tone="success" icon={<IconCheckCircle size={13} />}>
              Entregue
            </Badge>
          )}
        </div>

        {/* Abas só no celular: no desktop os dois painéis ficam lado a lado. */}
        <div
          className="flex border-t border-line md:hidden"
          role="tablist"
          aria-label="Painéis do projeto"
          onKeyDown={navegarAbas}
        >
          {abas.map(({ id: abaId, label, Icone }) => (
            <button
              key={abaId}
              ref={(el) => {
                if (el) abaRefs.current.set(abaId, el);
              }}
              id={`aba-${abaId}`}
              type="button"
              role="tab"
              aria-selected={aba === abaId}
              aria-controls={`painel-${abaId}`}
              // Uma parada de Tab para o conjunto, não uma por aba: dentro do
              // grupo quem navega é a seta.
              tabIndex={aba === abaId ? 0 : -1}
              onClick={() => setAba(abaId)}
              className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
                aba === abaId
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-ink-faint'
              }`}
            >
              <Icone size={17} />
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Enunciado e critérios */}
        <section
          id="painel-enunciado"
          role="tabpanel"
          aria-labelledby="aba-enunciado"
          className={`flex-1 overflow-y-auto border-line px-4 py-5 md:block md:w-5/12 md:shrink-0 md:border-r ${
            aba === 'enunciado' ? 'block' : 'hidden'
          }`}
        >
          <MarkdownReader content={project.brief} />

          <Card className="mt-8">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <SectionLabel>Critérios de aceitação</SectionLabel>
              {verificado && (
                <span className="label-mono text-ink-faint">
                  {fechados} de {project.checkpoints.length}
                </span>
              )}
            </div>

            <CheckpointList
              checkpoints={project.checkpoints}
              results={checkResults}
              verifying={isVerifying}
            />

            {!verificado && !isVerifying && (
              <p className="mt-4 text-xs leading-relaxed text-ink-faint">
                Verifique quantas vezes quiser. Cada critério mostra o que ainda falta.
              </p>
            )}
          </Card>
        </section>

        {/* Editor e console */}
        <section
          id="painel-codigo"
          role="tabpanel"
          aria-labelledby="aba-codigo"
          className={`flex flex-1 flex-col md:flex ${aba === 'codigo' ? 'flex' : 'hidden'}`}
        >
          {/* O servidor por trás da página, à vista: o fetch do código do
              aluno chega aqui — o mesmo painel do exercício de código com
              servidor, só que fixo acima do editor em vez de dentro da aula. */}
          {arquivosDoServidor.length > 0 && (
            <Card padding="none" className="mx-4 mt-4 overflow-hidden">
              <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-2">
                <SectionLabel as="p">O servidor por trás da página</SectionLabel>
                <span className="text-xs text-ink-faint">o fetch da sua página chega aqui</span>
              </div>
              {arquivosDoServidor.map(([nome, fonte]) => (
                <details key={nome} className="border-b border-line last:border-b-0">
                  <summary className="cursor-pointer px-4 py-2.5 font-mono text-sm text-ink hover:bg-sunken">
                    {nome}
                  </summary>
                  <pre className="overflow-x-auto border-t border-line bg-editor p-4 text-xs leading-relaxed">
                    <code className="font-mono text-white/90">{fonte.trim()}</code>
                  </pre>
                </details>
              ))}
            </Card>
          )}

          {/* No celular a altura é fixa, de propósito. O `height="100%"` do
              Monaco resolve contra a altura do pai, e `min-height` não conta
              como altura: com `min-h-[320px]` e altura automática, o editor
              media 5×5 pixels — invisível — depois de abrir a aba Código. No
              desktop a coluna é limitada pela linha do layout e o flex basta. */}
          <div className="h-[360px] md:h-auto md:min-h-0 md:flex-1">
            <CodeEditor
              height="100%"
              language={project.language}
              value={code}
              onChange={setCode}
            />
          </div>

          {ehPagina && (
            <Card padding="none" className="mx-4 mt-4 overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4 py-2">
                <SectionLabel as="p">Página</SectionLabel>
                {paginaRenderizada && (
                  <span className="text-xs text-ink-faint">como o navegador mostra</span>
                )}
              </div>
              {/* O iframe existe desde o início — o motor escreve nele — mas
                  fica coberto por um aviso até a primeira execução, para o
                  retângulo branco vazio não parecer um erro. */}
              <div className="relative h-[280px] bg-white">
                <iframe
                  ref={iframeRef}
                  title="Pré-visualização da página"
                  sandbox={SANDBOX_DO_IFRAME}
                  className="h-full w-full border-0"
                />
                {!paginaRenderizada && (
                  <div className="absolute inset-0 flex items-center justify-center bg-canvas px-6 text-center text-sm text-ink-faint">
                    A página aparece aqui quando você rodar ou verificar o código.
                  </div>
                )}
              </div>
            </Card>
          )}

          <div className="h-48 shrink-0 overflow-y-auto border-t border-line bg-terminal p-4">
            <p className="label-mono mb-2 text-white/40">Console</p>

            {!result && !isRunning && (
              <p className="text-sm text-white/40">
                Rode o código para ver a saída aqui.
              </p>
            )}

            {isRunning && <p className="text-sm text-white/60">Executando…</p>}

            {result && (
              <div className="space-y-2 font-mono text-sm">
                {result.logs.length === 0 && !result.error && (
                  <p className="text-white/40">Nenhuma saída no console.</p>
                )}

                {result.logs.map((linha, i) => (
                  <p key={i} className="whitespace-pre-wrap text-white/90">
                    {linha}
                  </p>
                ))}

                {result.error && (
                  <p
                    className={`whitespace-pre-wrap ${
                      result.timedOut ? 'text-energy-200' : 'text-danger-200'
                    }`}
                  >
                    {result.error}
                  </p>
                )}
              </div>
            )}
          </div>

          {result?.trocas && result.trocas.length > 0 && (
            <div className="mx-4 mb-4">
              <Trocas trocas={result.trocas} />
            </div>
          )}
        </section>
      </div>

      {/* Ações fixas embaixo: no celular precisam estar no polegar, e no desktop
          ficam ancoradas em vez de perdidas no fim de uma coluna que rola. */}
      <footer className="sticky bottom-0 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center gap-2 px-4 py-3">
          <Button
            variant="outline"
            size="lg"
            onClick={executar}
            disabled={isVerifying}
            loading={isRunning}
            icon={<IconPlay size={18} />}
          >
            <span className="hidden sm:inline">Rodar</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={verificar}
            disabled={isRunning}
            loading={isVerifying}
            icon={<IconChecklist size={18} />}
          >
            {isVerifying ? 'Verificando…' : 'Verificar critérios'}
          </Button>

          <Button
            size="lg"
            onClick={submeter}
            // Entregar sem os critérios fechados tornaria o selo "Entregue" uma
            // afirmação sem lastro — era exatamente o que acontecia antes.
            disabled={isCompleted || !todosFechados}
            title={
              isCompleted
                ? 'Projeto já entregue'
                : todosFechados
                  ? 'Todos os critérios foram atendidos'
                  : 'Feche todos os critérios antes de entregar'
            }
            icon={<IconSend size={18} />}
          >
            <span className="hidden sm:inline">{isCompleted ? 'Entregue' : 'Entregar'}</span>
          </Button>
        </div>
      </footer>
    </div>
  );
}
