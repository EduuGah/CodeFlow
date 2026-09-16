import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { tratarTeclaNoTextarea } from './CodeEditor';

/**
 * O que o aluno vê antes de o Monaco chegar, e o que vê se ele não chegar.
 *
 * O Monaco em si não roda no jsdom (precisa de layout, canvas, workers), e
 * também não é o que está sob teste: o `@monaco-editor/react` é dublado, e o
 * módulo pesado `lib/monaco` é substituído, em cada teste, por uma promessa
 * que o teste controla — resolve para simular a chegada, rejeita para simular
 * a falha, nunca resolve para simular a espera.
 */
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, language }: { value: string; language: string }) => (
    <div data-testid="monaco" data-language={language}>
      {value}
    </div>
  ),
}));

const CODIGO = 'function soma(a, b) {\n  return a + b;\n}';

// O estado de carregamento é global ao módulo, de propósito: o segundo editor
// não espera de novo. Para cada teste começar do zero, o módulo é reimportado
// — e o dublê do `lib/monaco` é registrado com `doMock`, que não é içado e por
// isso vale só para a importação que vem depois dele.
async function editorCom(monaco: () => Promise<object>) {
  vi.resetModules();
  vi.doMock('../../lib/monaco', monaco);
  return (await import('./CodeEditor')).CodeEditor;
}

const nuncaChega = () => new Promise<object>(() => {});
const chega = () => Promise.resolve({ monaco: {} });
const falha = () => Promise.reject(new Error('rede bloqueou o chunk'));

beforeEach(() => {
  vi.resetModules();
  // A falha é registrada no console de propósito; o teste não precisa vê-la.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

/** O editor como as telas o usam: controlado, o valor vai ao pai e volta. */
function Controlado({
  CodeEditor,
  inicial,
}: {
  CodeEditor: Awaited<ReturnType<typeof editorCom>>;
  inicial: string;
}) {
  const [valor, setValor] = useState(inicial);
  return (
    <>
      <CodeEditor value={valor} onChange={setValor} language="javascript" height="200px" />
      <button type="button">Executar</button>
    </>
  );
}

describe('antes de o Monaco chegar', () => {
  it('mostra o código com números de linha, na mesma superfície', async () => {
    const CodeEditor = await editorCom(nuncaChega);
    render(<CodeEditor value={CODIGO} onChange={() => {}} language="javascript" height="200px" />);

    const esqueleto = screen.getByLabelText('Carregando o editor de código');
    expect(esqueleto).toHaveAttribute('aria-busy', 'true');
    expect(esqueleto).toHaveStyle({ height: '200px' });

    // As três linhas, numeradas: o aluno lê o esqueleto enquanto espera.
    expect(esqueleto).toHaveTextContent('1');
    expect(esqueleto).toHaveTextContent('3');
    expect(esqueleto).toHaveTextContent('return a + b;');
    expect(screen.queryByTestId('monaco')).not.toBeInTheDocument();
  });

  it('troca pelo editor quando o chunk chega', async () => {
    const CodeEditor = await editorCom(chega);
    render(<CodeEditor value={CODIGO} onChange={() => {}} language="typescript" height="200px" />);

    const monaco = await screen.findByTestId('monaco');
    expect(monaco).toHaveAttribute('data-language', 'typescript');
    expect(monaco).toHaveTextContent('return a + b;');
    expect(screen.queryByLabelText('Carregando o editor de código')).not.toBeInTheDocument();
  });
});

describe('se o Monaco não vier', () => {
  it('entra um textarea, e o aluno continua escrevendo', async () => {
    const CodeEditor = await editorCom(falha);
    const aoMudar = vi.fn();
    render(<CodeEditor value={CODIGO} onChange={aoMudar} language="javascript" height="200px" />);

    const area = await screen.findByRole('textbox', { name: 'Editor de código' });
    expect(area).toHaveValue(CODIGO);
    // A altura pedida é a do conjunto textarea + dica, como o Monaco a trata.
    expect(area.parentElement).toHaveStyle({ height: '200px' });
    // Sem corretor: é código, e o celular trocaria `const` por `Const`.
    expect(area).toHaveAttribute('spellcheck', 'false');
    expect(area).toHaveAttribute('autocapitalize', 'off');

    await userEvent.type(area, '!');
    expect(aoMudar).toHaveBeenCalledWith(CODIGO + '!');
    expect(screen.queryByTestId('monaco')).not.toBeInTheDocument();
  });

  it('Tab insere dois espaços no cursor e não vai para o botão', async () => {
    const CodeEditor = await editorCom(falha);
    render(<Controlado CodeEditor={CodeEditor} inicial={'if (x) {\n\n}'} />);

    const area = await screen.findByRole<HTMLTextAreaElement>('textbox', { name: 'Editor de código' });
    const usuario = userEvent.setup();
    await usuario.click(area);
    // O cursor na linha vazia, dentro do `if`: o lugar do recuo.
    area.setSelectionRange(9, 9);

    await usuario.keyboard('{Tab}');
    expect(area).toHaveValue('if (x) {\n  \n}');
    expect(area).toHaveFocus();
    // O cursor ficou depois do recuo, pronto para o próximo caractere —
    // mesmo com o valor tendo passado pelo pai e voltado.
    expect(area.selectionStart).toBe(11);
    expect(area.selectionEnd).toBe(11);
    expect(screen.getByRole('button', { name: 'Executar' })).not.toHaveFocus();

    // Shift+Tab desfaz o recuo da linha.
    await usuario.keyboard('{Shift>}{Tab}{/Shift}');
    expect(area).toHaveValue('if (x) {\n\n}');
    expect(area.selectionStart).toBe(9);
    expect(area).toHaveFocus();
  });

  it('Tab com seleção substitui o trecho pelo recuo', async () => {
    const CodeEditor = await editorCom(falha);
    render(<Controlado CodeEditor={CodeEditor} inicial="abcdef" />);

    const area = await screen.findByRole<HTMLTextAreaElement>('textbox', { name: 'Editor de código' });
    const usuario = userEvent.setup();
    await usuario.click(area);
    area.setSelectionRange(2, 4);

    await usuario.keyboard('{Tab}');
    expect(area).toHaveValue('ab  ef');
    expect(area.selectionStart).toBe(4);
  });

  // O "Tab seguinte navega" fica para o Playwright (editor-proprio.spec.ts):
  // o jsdom não guarda o ponto de partida da navegação por foco depois do
  // blur, e o Tab daqui voltaria ao primeiro campo da página.
  it('Esc solta o foco sem mexer no código', async () => {
    const CodeEditor = await editorCom(falha);
    render(<Controlado CodeEditor={CodeEditor} inicial="x" />);

    const area = await screen.findByRole('textbox', { name: 'Editor de código' });
    // A dica está ligada ao campo: o leitor de tela anuncia o acordo.
    expect(area).toHaveAccessibleDescription(/Tab insere dois espaços/);

    const usuario = userEvent.setup();
    await usuario.click(area);
    expect(area).toHaveFocus();

    await usuario.keyboard('{Escape}');
    expect(area).not.toHaveFocus();
    expect(area).toHaveValue('x');
  });

  it('o segundo editor da página não espera nem tenta de novo', async () => {
    const CodeEditor = await editorCom(falha);
    const { unmount } = render(
      <CodeEditor value="a" onChange={() => {}} language="javascript" height="100px" />
    );
    await screen.findByRole('textbox', { name: 'Editor de código' });
    unmount();

    // Mesmo módulo, editor novo: já nasce no textarea, sem passar pelo esqueleto.
    render(<CodeEditor value="b" onChange={() => {}} language="javascript" height="100px" />);
    expect(screen.getByRole('textbox', { name: 'Editor de código' })).toHaveValue('b');
    expect(screen.queryByLabelText('Carregando o editor de código')).not.toBeInTheDocument();
  });
});

describe('tratarTeclaNoTextarea', () => {
  const tab = { key: 'Tab', shiftKey: false };
  const shiftTab = { key: 'Tab', shiftKey: true };

  it('ignora qualquer tecla que não seja Tab', () => {
    expect(tratarTeclaNoTextarea({ key: 'Enter', shiftKey: false }, 'a', 1, 1)).toBeNull();
    expect(tratarTeclaNoTextarea({ key: 'a', shiftKey: true }, 'a', 1, 1)).toBeNull();
  });

  it('Tab insere o recuo onde o cursor está', () => {
    expect(tratarTeclaNoTextarea(tab, 'ab', 1, 1)).toEqual({ valor: 'a  b', cursor: 3 });
    expect(tratarTeclaNoTextarea(tab, '', 0, 0)).toEqual({ valor: '  ', cursor: 2 });
  });

  it('Shift+Tab tira até dois espaços do início da linha, e nada se não houver', () => {
    expect(tratarTeclaNoTextarea(shiftTab, 'a\n    b', 6, 6)).toEqual({ valor: 'a\n  b', cursor: 4 });
    // Um espaço só: tira esse um.
    expect(tratarTeclaNoTextarea(shiftTab, ' b', 2, 2)).toEqual({ valor: 'b', cursor: 1 });
    // Cursor antes dos espaços da linha: não anda para trás do início dela.
    expect(tratarTeclaNoTextarea(shiftTab, 'a\n  b', 2, 2)).toEqual({ valor: 'a\nb', cursor: 2 });
    // Sem recuo: nada muda, e o valor volta igual.
    expect(tratarTeclaNoTextarea(shiftTab, 'ab', 1, 1)).toEqual({ valor: 'ab', cursor: 1 });
  });
});
