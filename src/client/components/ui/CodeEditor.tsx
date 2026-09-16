import { useEffect, useId, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';

import type { LanguageId } from '../../../content/types';

/**
 * O editor de código — o único.
 *
 * Quatro telas montavam o Monaco por conta própria, cada uma com a mesma
 * lista de dezessete opções copiada. Este componente é o lugar dessas opções
 * e de duas decisões que nenhuma delas tomava:
 *
 * 1. **O Monaco é carregado sob demanda, do próprio domínio.** O módulo
 *    `lib/monaco` é pesado e entra por `import()` só quando o primeiro editor
 *    monta. Até lá, o código aparece num `<pre>` com a mesma cara — o aluno
 *    lê o enunciado e o esqueleto sem esperar o editor chegar.
 *
 * 2. **Se o Monaco não vier, o aluno ainda escreve.** Falha de rede na
 *    primeira visita, navegador antigo demais, extensão que bloqueia workers:
 *    em vez de um retângulo vazio, entra um `<textarea>` monoespaçado. Sem
 *    cores nem autocompletar, mas o exercício segue resolvível.
 */
export interface CodeEditorProps {
  value: string;
  onChange: (valor: string) => void;
  language: LanguageId;
  /** Altura em CSS. `100%` exige um pai com altura de verdade — `min-height`
      não conta, e o Monaco fica em 5×5 pixels. */
  height: string;
}

type Carregamento = 'pendente' | 'pronto' | 'falhou';

// Compartilhado entre todas as instâncias: o segundo editor da página não
// espera nem tenta de novo.
let estadoGlobal: Carregamento = 'pendente';
let promessa: Promise<void> | null = null;

function prepararMonaco(): Promise<void> {
  promessa ??= import('../../lib/monaco').then(
    () => {
      estadoGlobal = 'pronto';
    },
    (erro: unknown) => {
      // O motivo fica no console: um chunk que não veio (rede, ou um deploy
      // novo que trocou os nomes dos arquivos) é a causa mais comum, e sem
      // isto a contingência parecia o comportamento normal do editor.
      console.error('[CodeFlow] O editor de código não carregou; entra o textarea.', erro);
      estadoGlobal = 'falhou';
    }
  );
  return promessa;
}

/** Dois espaços: é o que o Monaco insere, e o que o código das aulas usa. */
const RECUO = '  ';

/**
 * Tab no textarea de contingência insere recuo, como num editor de código.
 *
 * O padrão do navegador — Tab sai do campo — surpreende quem está escrevendo
 * código: no meio de um `if`, o Tab ia parar no botão de executar. Aqui Tab
 * recua, Shift+Tab desfaz o recuo do início da linha, e **Esc solta o foco**
 * para o Tab seguinte navegar como sempre. É o mesmo acordo que o Monaco faz.
 *
 * Devolve o valor novo e a posição do cursor, ou `null` quando a tecla não é
 * para tratar.
 */
export function tratarTeclaNoTextarea(
  tecla: { key: string; shiftKey: boolean },
  valor: string,
  inicio: number,
  fim: number
): { valor: string; cursor: number } | null {
  if (tecla.key !== 'Tab') return null;

  if (!tecla.shiftKey) {
    return { valor: valor.slice(0, inicio) + RECUO + valor.slice(fim), cursor: inicio + RECUO.length };
  }

  // Shift+Tab: tira até dois espaços do início da linha do cursor.
  const inicioDaLinha = valor.lastIndexOf('\n', inicio - 1) + 1;
  const linha = valor.slice(inicioDaLinha);
  const espacos = Math.min(RECUO.length, linha.length - linha.replace(/^ +/, '').length);
  if (espacos === 0) return { valor, cursor: inicio };
  return {
    valor: valor.slice(0, inicioDaLinha) + valor.slice(inicioDaLinha + espacos),
    cursor: Math.max(inicioDaLinha, inicio - espacos),
  };
}

const OPCOES = {
  minimap: { enabled: false },
  fontSize: 14,
  fontFamily: "'JetBrains Mono', monospace",
  lineHeight: 22,
  padding: { top: 14, bottom: 14 },
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  lineNumbersMinChars: 3,
  // Sem isto o Monaco mede o contêiner uma única vez, ao montar. Como o passo
  // entra em cena junto com o layout, ele media cedo demais e ficava travado
  // em 5×5 pixels — editor invisível no celular.
  automaticLayout: true,
  // No celular a rolagem da página precisa funcionar por cima do editor,
  // senão o aluno fica preso dentro dele.
  scrollbar: { alwaysConsumeMouseWheel: false },
} as const;

/**
 * O Monaco não tem linguagem "react": TSX é a linguagem `typescript` num
 * arquivo `.tsx`. O `path` é o que faz o analisador aceitar `<div>`; sem
 * ele, todo JSX seria sublinhado como erro de sintaxe.
 */
function linguagemDoMonaco(language: LanguageId): { language: string; path?: string } {
  if (language === 'react') return { language: 'typescript', path: 'inmemory://codeflow/exercicio.tsx' };
  return { language };
}

export function CodeEditor({ value, onChange, language, height }: CodeEditorProps) {
  const [estado, setEstado] = useState<Carregamento>(estadoGlobal);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const idDaAjuda = useId();
  // O cursor a restaurar depois que o valor novo passar pelo pai e voltar.
  const cursorPendente = useRef<number | null>(null);

  useEffect(() => {
    if (cursorPendente.current === null || !areaRef.current) return;
    areaRef.current.setSelectionRange(cursorPendente.current, cursorPendente.current);
    cursorPendente.current = null;
  }, [value]);

  // Em aula de React, as declarações do React (e do DOM do iframe) entram no
  // serviço do editor enquanto o editor existir — e saem depois, para uma
  // aula de TypeScript puro não ganhar um `document` que o sandbox não tem.
  useEffect(() => {
    if (language !== 'react' || estado !== 'pronto') return;
    let desligar: (() => void) | null = null;
    let ativo = true;
    void import('../../lib/typescript').then((m) => {
      if (ativo) desligar = m.ativarReact();
    });
    return () => {
      ativo = false;
      desligar?.();
    };
  }, [language, estado]);

  useEffect(() => {
    if (estado !== 'pendente') return;
    let ativo = true;
    void prepararMonaco().then(() => {
      if (ativo) setEstado(estadoGlobal);
    });
    return () => {
      ativo = false;
    };
  }, [estado]);

  if (estado === 'falhou') {
    // A altura pedida é a do conjunto — `100%` precisa continuar valendo
    // contra o pai, como no Monaco; a dica cabe dentro dela.
    return (
      <div style={{ height }} className="flex flex-col">
        <textarea
          ref={areaRef}
          aria-label="Editor de código"
          aria-describedby={idDaAjuda}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.currentTarget.blur();
              return;
            }
            const area = e.currentTarget;
            const resultado = tratarTeclaNoTextarea(e, area.value, area.selectionStart, area.selectionEnd);
            if (!resultado) return;
            e.preventDefault();
            cursorPendente.current = resultado.cursor;
            onChange(resultado.valor);
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="block min-h-0 w-full flex-1 resize-none bg-editor p-3.5 font-mono text-sm leading-[22px] text-white/90 outline-none"
        />
        <p id={idDaAjuda} className="mt-1.5 shrink-0 text-xs text-ink-faint">
          Tab insere dois espaços · Esc solta o foco para navegar com Tab
        </p>
      </div>
    );
  }

  if (estado === 'pendente') {
    return <Esqueleto value={value} height={height} />;
  }

  const monaco = linguagemDoMonaco(language);

  return (
    <Editor
      height={height}
      language={monaco.language}
      path={monaco.path}
      theme="codeflow"
      value={value}
      onChange={(valor) => onChange(valor ?? '')}
      loading={<Esqueleto value={value} height={height} />}
      options={OPCOES}
    />
  );
}

/**
 * O que aparece enquanto o Monaco não chegou: o próprio código, na mesma
 * fonte, no mesmo fundo, com números de linha na mesma coluna. Quando o
 * editor monta, a troca é quase invisível — e até lá o aluno já está lendo.
 */
function Esqueleto({ value, height }: { value: string; height: string }) {
  const linhas = value.split('\n');

  return (
    <div
      aria-busy="true"
      aria-label="Carregando o editor de código"
      style={{ height }}
      className="overflow-hidden bg-editor py-3.5 font-mono text-sm leading-[22px]"
    >
      {linhas.map((linha, i) => (
        <div key={i} className="flex">
          {/* 3 caracteres de largura mínima, como `lineNumbersMinChars`. */}
          <span className="w-[42px] shrink-0 select-none pr-2 text-right text-white/35">
            {i + 1}
          </span>
          <span className="whitespace-pre pl-2 text-white/70">{linha}</span>
        </div>
      ))}
    </div>
  );
}
