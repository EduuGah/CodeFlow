import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Card, SectionLabel } from './Card';

/**
 * O card é a superfície de tudo; a razão de ele existir é a mesma do botão:
 * 25 cópias das mesmas classes envelhecendo separadas. Os testes fixam o que
 * dá para fixar no jsdom — a tag ser semântica, o tom ser uma decisão, e a
 * `className` extra vencer sem apagar a base.
 */
describe('Card', () => {
  it('é uma div por padrão, e vira a tag semântica que se pedir', () => {
    const { container, rerender } = render(<Card>x</Card>);
    expect(container.firstElementChild?.tagName).toBe('DIV');

    rerender(<Card as="section">x</Card>);
    expect(container.firstElementChild?.tagName).toBe('SECTION');

    rerender(<Card as="li">x</Card>);
    expect(container.firstElementChild?.tagName).toBe('LI');
  });

  it('cada tom tem borda e fundo próprios', () => {
    const classes = (['default', 'brand', 'success', 'caution', 'danger', 'sunken'] as const).map(
      (tone) => {
        const { container, unmount } = render(<Card tone={tone}>x</Card>);
        const c = container.firstElementChild!.className;
        unmount();
        return c;
      }
    );
    expect(new Set(classes).size).toBe(6);
    // Todos são cards: mesmo raio e mesma borda, só a cor muda.
    for (const c of classes) {
      expect(c).toContain('rounded-xl');
      expect(c).toContain('border');
    }
  });

  it('o preenchimento padrão cresce no sm, e "none" não põe nenhum', () => {
    const { container, rerender } = render(<Card>x</Card>);
    expect(container.firstElementChild!.className).toContain('p-4');
    expect(container.firstElementChild!.className).toContain('sm:p-5');

    rerender(<Card padding="none">x</Card>);
    expect(container.firstElementChild!.className).not.toMatch(/\bp-\d/);
  });

  it('className extra vence a base sem deixar as duas', () => {
    // Um card sem raio (para colar num editor, por exemplo) precisa conseguir
    // trocar o `rounded-xl` — e não terminar com `rounded-xl rounded-none`.
    const { container } = render(<Card className="rounded-none">x</Card>);
    const c = container.firstElementChild!.className;
    expect(c).toContain('rounded-none');
    expect(c).not.toContain('rounded-xl');
  });

  it('repassa atributos para a tag, seja ela qual for', () => {
    render(
      <Card as="section" aria-labelledby="t" data-testid="card">
        x
      </Card>
    );
    expect(screen.getByTestId('card')).toHaveAttribute('aria-labelledby', 't');
  });
});

describe('SectionLabel', () => {
  it('é um h2 por padrão, porque abre uma seção', () => {
    render(<SectionLabel>Exercício</SectionLabel>);
    expect(screen.getByRole('heading', { level: 2, name: 'Exercício' })).toBeInTheDocument();
  });

  it('as="p" não inventa um título no documento', () => {
    render(<SectionLabel as="p">Sua previsão</SectionLabel>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('Sua previsão').tagName).toBe('P');
  });

  it('usa a monoespaçada, que é o sotaque do produto', () => {
    render(<SectionLabel>x</SectionLabel>);
    expect(screen.getByRole('heading').className).toContain('label-mono');
  });

  it('o tom é apagado por padrão e marca quando pedido', () => {
    const { rerender } = render(<SectionLabel>x</SectionLabel>);
    expect(screen.getByRole('heading').className).toContain('text-ink-faint');

    rerender(<SectionLabel tone="brand">x</SectionLabel>);
    expect(screen.getByRole('heading').className).toContain('text-brand-700');
    expect(screen.getByRole('heading').className).not.toContain('text-ink-faint');
  });
});
