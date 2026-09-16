import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { OrderStepsExercise } from '../../../content/types';
import { embaralhar } from '../../lib/ordenar';
import { OrderSteps } from './OrderSteps';

vi.mock('../../hooks/useRecordAttempt', () => ({ useRecordAttempt: () => () => {} }));

const EXERCICIO: OrderStepsExercise = {
  id: 'ex-teste-ordenar',
  type: 'order-steps',
  prompt: 'Coloque em ordem.',
  concepts: ['decomposicao'],
  difficulty: 'iniciante',
  hints: ['pense no que vem antes'],
  tags: ['teste'],
  steps: [
    { id: 'a', text: 'primeiro', ordem: 1 },
    { id: 'b', text: 'segundo', ordem: 2 },
    { id: 'c', text: 'terceiro', ordem: 3 },
  ],
  explanation: 'A ordem certa é essa.',
};

/** Os textos dos passos, de cima para baixo, como estão na tela. */
function ordemNaTela() {
  return screen
    .getAllByRole('listitem')
    .map((li) => within(li).getByText(/primeiro|segundo|terceiro/).textContent);
}

/** Sobe ou desce o passo com esse texto. */
async function moverPasso(
  user: ReturnType<typeof userEvent.setup>,
  texto: string,
  direcao: 'cima' | 'baixo'
) {
  await user.click(screen.getByRole('button', { name: `Mover "${texto}" para ${direcao}` }));
}

/** Arruma a lista inteira, subindo cada passo até a posição certa. */
async function arrumar(user: ReturnType<typeof userEvent.setup>) {
  const certa = ['primeiro', 'segundo', 'terceiro'];

  for (let alvo = 0; alvo < certa.length; alvo++) {
    // Sobe o passo até o lugar dele, uma casa por vez.
    for (let guarda = 0; guarda < 5; guarda++) {
      const atual = ordemNaTela();
      const onde = atual.indexOf(certa[alvo]);
      if (onde <= alvo) break;
      await moverPasso(user, certa[alvo], 'cima');
    }
  }
}

describe('ordem inicial', () => {
  it('abre embaralhado, e não na resposta', () => {
    render(<OrderSteps exercise={EXERCICIO} lessonId="aula-teste" />);
    expect(ordemNaTela()).not.toEqual(['primeiro', 'segundo', 'terceiro']);
  });

  it('mostra todos os passos, sem perder nenhum', () => {
    render(<OrderSteps exercise={EXERCICIO} lessonId="aula-teste" />);
    expect(ordemNaTela().sort()).toEqual(['primeiro', 'segundo', 'terceiro']);
  });

  it('a ordem inicial é a mesma que a lógica pura calcula', () => {
    render(<OrderSteps exercise={EXERCICIO} lessonId="aula-teste" />);
    expect(ordemNaTela()).toEqual(embaralhar(EXERCICIO.steps, EXERCICIO.id).map((p) => p.text));
  });
});

describe('reordenar', () => {
  it('subir troca com o de cima', async () => {
    const user = userEvent.setup();
    render(<OrderSteps exercise={EXERCICIO} lessonId="aula-teste" />);

    const antes = ordemNaTela();
    await moverPasso(user, antes[1]!, 'cima');

    const depois = ordemNaTela();
    expect(depois[0]).toBe(antes[1]);
    expect(depois[1]).toBe(antes[0]);
  });

  it('o primeiro não pode subir e o último não pode descer', () => {
    render(<OrderSteps exercise={EXERCICIO} lessonId="aula-teste" />);
    const atual = ordemNaTela();

    expect(
      screen.getByRole('button', { name: `Mover "${atual[0]}" para cima` })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: `Mover "${atual[2]}" para baixo` })
    ).toBeDisabled();
  });

  /**
   * Sem isto, quem navega por teclado aperta "descer" e o foco fica na posição
   * antiga — que agora tem outro passo. O segundo toque moveria o item errado.
   */
  it('o foco acompanha o passo que se moveu, não a posição', async () => {
    const user = userEvent.setup();
    render(<OrderSteps exercise={EXERCICIO} lessonId="aula-teste" />);

    const movido = ordemNaTela()[0]!;
    await moverPasso(user, movido, 'baixo');

    expect(screen.getByRole('button', { name: `Mover "${movido}" para baixo` })).toHaveFocus();
  });

  it('cada movimento é anunciado com a posição nova', async () => {
    const user = userEvent.setup();
    render(<OrderSteps exercise={EXERCICIO} lessonId="aula-teste" />);

    const movido = ordemNaTela()[0]!;
    await moverPasso(user, movido, 'baixo');

    expect(screen.getByRole('status')).toHaveTextContent(`${movido}, posição 2 de 3`);
  });
});

describe('arrastar', () => {
  /**
   * O jsdom não tem layout: cada passo ganha uma caixa de 60px, empilhada na
   * ordem em que está na tela. É o suficiente para o cálculo "acima do meio
   * de quem?" ser exercitado de verdade.
   */
  function empilhar() {
    const itens = screen.getAllByRole('listitem');
    itens.forEach((li, i) => {
      vi.spyOn(li, 'getBoundingClientRect').mockImplementation(
        () => ({ top: i * 60, height: 60, bottom: i * 60 + 60, left: 0, right: 300, width: 300, x: 0, y: i * 60, toJSON: () => ({}) })
      );
    });
  }

  const pegaDe = (li: HTMLElement) => li.querySelector('.cursor-grab') as HTMLElement;

  /**
   * O jsdom não tem PointerEvent, e o `fireEvent.pointerMove` cai num Event
   * sem `clientY`. Um MouseEvent com o nome do evento de ponteiro carrega a
   * coordenada, e é ela que o arrasto lê.
   */
  const ponteiro = (tipo: 'pointerdown' | 'pointermove' | 'pointerup', el: HTMLElement, clientY: number) =>
    fireEvent(el, new MouseEvent(tipo, { bubbles: true, clientY }));

  it('soltar a pega abaixo do meio de outro passo leva o passo para lá', () => {
    render(<OrderSteps exercise={EXERCICIO} lessonId="aula-teste" />);
    empilhar();

    const antes = ordemNaTela();
    const primeiro = screen.getAllByRole('listitem')[0];
    const pega = pegaDe(primeiro);

    ponteiro('pointerdown', pega, 30);
    // Passou do meio do terceiro (y = 150): vai para o fim.
    ponteiro('pointermove', pega, 170);
    ponteiro('pointerup', pega, 170);

    expect(ordemNaTela()).toEqual([antes[1], antes[2], antes[0]]);
    expect(screen.getByRole('status')).toHaveTextContent(`${antes[0]}, posição 3 de 3`);
  });

  it('a lista reorganiza enquanto arrasta, e voltar desfaz', () => {
    render(<OrderSteps exercise={EXERCICIO} lessonId="aula-teste" />);
    empilhar();

    const antes = ordemNaTela();
    const pega = pegaDe(screen.getAllByRole('listitem')[2]);

    ponteiro('pointerdown', pega, 150);
    // Acima do meio do primeiro (y = 30): o último vai para o topo.
    ponteiro('pointermove', pega, 10);
    expect(ordemNaTela()).toEqual([antes[2], antes[0], antes[1]]);

    // A pega continua sendo a do mesmo passo (a linha mudou de lugar).
    empilhar();
    const pegaAgora = pegaDe(screen.getAllByRole('listitem')[0]);
    ponteiro('pointermove', pegaAgora, 170);
    ponteiro('pointerup', pegaAgora, 170);
    expect(ordemNaTela()).toEqual(antes);
  });

  it('arrastar depois de errar descarta o retorno anterior', async () => {
    const user = userEvent.setup();
    render(<OrderSteps exercise={EXERCICIO} lessonId="aula-teste" />);
    await user.click(screen.getByRole('button', { name: /Verificar ordem/ }));
    expect(screen.getByText(/A ordem quebra/)).toBeInTheDocument();

    empilhar();
    const pega = pegaDe(screen.getAllByRole('listitem')[0]);
    ponteiro('pointerdown', pega, 30);
    ponteiro('pointermove', pega, 100);
    ponteiro('pointerup', pega, 100);

    expect(screen.queryByText(/A ordem quebra/)).not.toBeInTheDocument();
  });
});

describe('verificação', () => {
  it('a ordem certa é aceita', async () => {
    const user = userEvent.setup();
    render(<OrderSteps exercise={EXERCICIO} lessonId="aula-teste" />);

    await arrumar(user);
    expect(ordemNaTela()).toEqual(['primeiro', 'segundo', 'terceiro']);

    await user.click(screen.getByRole('button', { name: /Verificar ordem/ }));
    expect(screen.getByText('Sequência correta')).toBeInTheDocument();
  });

  it('a ordem errada aponta onde a sequência quebra', async () => {
    const user = userEvent.setup();
    render(<OrderSteps exercise={EXERCICIO} lessonId="aula-teste" />);

    await user.click(screen.getByRole('button', { name: /Verificar ordem/ }));
    expect(screen.getByText(/A ordem quebra no passo \d/)).toBeInTheDocument();
  });

  it('mexer depois de verificar descarta o retorno anterior', async () => {
    const user = userEvent.setup();
    render(<OrderSteps exercise={EXERCICIO} lessonId="aula-teste" />);

    await user.click(screen.getByRole('button', { name: /Verificar ordem/ }));
    expect(screen.getByText(/A ordem quebra/)).toBeInTheDocument();

    await moverPasso(user, ordemNaTela()[0]!, 'baixo');
    // Manter "está errado" na tela enquanto a sequência já é outra seria mentira.
    expect(screen.queryByText(/A ordem quebra/)).not.toBeInTheDocument();
  });

  it('depois de acertar, os controles travam', async () => {
    const user = userEvent.setup();
    render(<OrderSteps exercise={EXERCICIO} lessonId="aula-teste" />);

    await arrumar(user);
    await user.click(screen.getByRole('button', { name: /Verificar ordem/ }));

    for (const botao of screen.getAllByRole('button', { name: /^Mover/ })) {
      expect(botao).toBeDisabled();
    }
    expect(screen.queryByRole('button', { name: /Verificar ordem/ })).not.toBeInTheDocument();
  });

  it('a explicação só aparece depois de acertar', async () => {
    const user = userEvent.setup();
    render(<OrderSteps exercise={EXERCICIO} lessonId="aula-teste" />);

    expect(screen.queryByText(EXERCICIO.explanation)).not.toBeInTheDocument();

    await arrumar(user);
    await user.click(screen.getByRole('button', { name: /Verificar ordem/ }));

    expect(screen.getByText(EXERCICIO.explanation)).toBeInTheDocument();
  });
});

describe('estado reportado à aula', () => {
  it('vai de inicial a acertou, passando por respondendo', async () => {
    const user = userEvent.setup();
    const vistos: string[] = [];

    render(
      <OrderSteps
        exercise={EXERCICIO}
        lessonId="aula-teste"
        onEstado={(e) => vistos.push(e)}
      />
    );

    expect(vistos).toEqual(['inicial']);

    await moverPasso(user, ordemNaTela()[1]!, 'cima');
    expect(vistos).toContain('respondendo');

    await arrumar(user);
    await user.click(screen.getByRole('button', { name: /Verificar ordem/ }));
    expect(vistos[vistos.length - 1]).toBe('acertou');
  });

  it('errar reporta errou, e não acertou', async () => {
    const user = userEvent.setup();
    const vistos: string[] = [];

    render(
      <OrderSteps exercise={EXERCICIO} lessonId="aula-teste" onEstado={(e) => vistos.push(e)} />
    );

    await user.click(screen.getByRole('button', { name: /Verificar ordem/ }));

    expect(vistos[vistos.length - 1]).toBe('errou');
    expect(vistos).not.toContain('acertou');
  });
});

describe('código dentro do passo', () => {
  const COM_CODIGO: OrderStepsExercise = {
    ...EXERCICIO,
    id: 'ex-com-codigo',
    steps: [
      { id: 'a', text: 'o nome `dobro` passa a existir', ordem: 1 },
      { id: 'b', text: '`dobro(4)` é chamado', ordem: 2 },
      { id: 'c', text: 'o corpo roda', ordem: 3 },
    ],
  };

  it('o trecho entre crases vira <code>, e a crase não aparece', () => {
    render(<OrderSteps exercise={COM_CODIGO} lessonId="aula-teste" />);

    const codigo = screen.getByText('dobro(4)');
    expect(codigo.tagName).toBe('CODE');
    expect(document.body.textContent).not.toContain('`');
  });

  it('o rótulo do botão de mover não carrega as crases', () => {
    render(<OrderSteps exercise={COM_CODIGO} lessonId="aula-teste" />);

    // É o que o leitor de tela anuncia — e o que o E2E procura.
    expect(
      screen.getByRole('button', { name: 'Mover "dobro(4) é chamado" para cima' })
    ).toBeInTheDocument();
  });
});
