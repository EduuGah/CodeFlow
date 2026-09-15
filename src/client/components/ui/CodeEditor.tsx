import { useEffect, useState } from 'react';
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
    () => {
      estadoGlobal = 'falhou';
    }
  );
  return promessa;
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
    return (
      <textarea
        aria-label="Editor de código"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        style={{ height }}
        className="block w-full resize-none bg-editor p-3.5 font-mono text-sm leading-[22px] text-white/90 outline-none"
      />
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
