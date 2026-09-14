import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
});

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
    expect(area).toHaveStyle({ height: '200px' });
    // Sem corretor: é código, e o celular trocaria `const` por `Const`.
    expect(area).toHaveAttribute('spellcheck', 'false');
    expect(area).toHaveAttribute('autocapitalize', 'off');

    await userEvent.type(area, '!');
    expect(aoMudar).toHaveBeenCalledWith(CODIGO + '!');
    expect(screen.queryByTestId('monaco')).not.toBeInTheDocument();
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
