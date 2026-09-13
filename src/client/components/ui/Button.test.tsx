import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button, buttonClasses } from './Button';

/**
 * O botão é o componente mais usado do produto, e foi justamente por ele ser
 * fraco que 19 botões acabaram escritos à mão. Estes testes fixam o contrato
 * que impede isso de voltar: tamanhos que cabem no dedo, estados tratados num
 * lugar só, e um `<Link>` que consegue ser idêntico a um `<button>`.
 */
describe('tamanhos', () => {
  it('nenhum tamanho fica abaixo de 40px, e o padrão tem 44', () => {
    // O jsdom não mede altura; o contrato aqui é a classe de altura, que o
    // Playwright confere em pixels nos testes de alvo de toque.
    expect(buttonClasses({ size: 'sm' })).toContain('h-10');
    expect(buttonClasses({ size: 'md' })).toContain('h-11');
    expect(buttonClasses({ size: 'lg' })).toContain('h-12');
    expect(buttonClasses()).toContain('h-11');
  });
});

describe('estados', () => {
  it('é type="button" por padrão, para não enviar um form por acidente', () => {
    render(<Button>Ok</Button>);
    expect(screen.getByRole('button', { name: 'Ok' })).toHaveAttribute('type', 'button');
  });

  it('aceita type="submit" quando é isso que se quer', () => {
    render(<Button type="submit">Enviar</Button>);
    expect(screen.getByRole('button', { name: 'Enviar' })).toHaveAttribute('type', 'submit');
  });

  it('carregando desabilita, anuncia aria-busy e mantém o rótulo', () => {
    render(<Button loading>Salvando</Button>);
    const botao = screen.getByRole('button', { name: /Salvando/ });

    expect(botao).toBeDisabled();
    expect(botao).toHaveAttribute('aria-busy', 'true');
    // O rótulo continua: é ele que diz o que está acontecendo.
    expect(botao).toHaveTextContent('Salvando');
  });

  it('carregando não dispara o clique', async () => {
    const user = userEvent.setup();
    const aoClicar = vi.fn();
    render(
      <Button loading onClick={aoClicar}>
        Salvando
      </Button>
    );

    await user.click(screen.getByRole('button', { name: /Salvando/ }));
    expect(aoClicar).not.toHaveBeenCalled();
  });

  it('sem carregar, não anuncia aria-busy', () => {
    render(<Button>Ok</Button>);
    expect(screen.getByRole('button', { name: 'Ok' })).not.toHaveAttribute('aria-busy');
  });

  it('o ícone da esquerda dá lugar ao spinner enquanto carrega', () => {
    const { rerender } = render(<Button icon={<span data-testid="icone" />}>Ok</Button>);
    expect(screen.getByTestId('icone')).toBeInTheDocument();

    rerender(
      <Button loading icon={<span data-testid="icone" />}>
        Ok
      </Button>
    );
    expect(screen.queryByTestId('icone')).not.toBeInTheDocument();
  });
});

describe('variantes', () => {
  it('a primária é a cor da marca', () => {
    // É a troca de preto por teal que tirou o ar de cinza. O E2E do painel
    // conta os elementos com esta classe para garantir uma ação primária só.
    expect(buttonClasses({ variant: 'primary' })).toContain('bg-brand-600');
  });

  it('cada variante tem um estilo próprio', () => {
    const estilos = new Set(
      (['primary', 'secondary', 'outline', 'ghost', 'danger'] as const).map((v) =>
        buttonClasses({ variant: v })
      )
    );
    expect(estilos.size).toBe(5);
  });
});

describe('um link pode ser um botão', () => {
  it('buttonClasses produz exatamente as classes do componente', () => {
    render(
      <Button variant="outline" size="lg" block>
        Ok
      </Button>
    );
    const doComponente = screen.getByRole('button', { name: 'Ok' }).className;
    const daFuncao = buttonClasses({ variant: 'outline', size: 'lg', block: true });

    // Se as duas divergirem, o "Próxima aula" (um Link) deixa de parecer o
    // "Continuar" (um button) que fica ao lado dele no rodapé da aula.
    expect(doComponente).toBe(daFuncao);
  });

  it('className extra é mesclada, sem apagar a base', () => {
    const classes = buttonClasses({ className: 'mt-4' });
    expect(classes).toContain('mt-4');
    expect(classes).toContain('bg-brand-600');
  });

  it('className extra pode sobrescrever uma utilidade conflitante', () => {
    // `w-12` precisa vencer o `px-4` da base sem deixar os dois: é o que o
    // tailwind-merge faz, e é o que permite o botão de ícone do rodapé.
    const classes = buttonClasses({ size: 'lg', className: 'px-0' });
    expect(classes).toContain('px-0');
    expect(classes).not.toContain('px-5');
  });
});
