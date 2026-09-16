import React from 'react';

import { cn } from '../../lib/utils';
import { IconSpinner } from './Icon';

/**
 * O botão — o único.
 *
 * Antes existiam três: este componente, o `ExerciseAction` dos exercícios, e
 * dezenove botões escritos à mão com as mesmas classes copiadas. Cada um
 * envelhecia sozinho. O `sm` daqui tinha 32px e o `md` 40px, abaixo do mínimo
 * para toque, e foi por isso que os exercícios pararam de usá-lo.
 *
 * A referência é o padrão das bibliotecas de componentes que funcionam: uma
 * matriz pequena de variantes e tamanhos, todos os estados tratados no mesmo
 * lugar — hover, ativo, foco, desabilitado, carregando —, e os estilos
 * exportados como função para um `<Link>` poder ser um botão sem precisar de
 * um componente polimórfico.
 *
 * ## Tamanhos
 *
 * Todos cabem no dedo. `md` é o padrão e tem 44px; `lg` é para a ação
 * principal de uma tela; `sm` tem 40px e existe só para controles secundários
 * densos, onde 44 pesaria — nunca para a ação que o aluno precisa acertar.
 *
 * ## Variantes
 *
 * `primary` é a cor da marca. Foi a troca de preto por teal que tirou o ar de
 * cinza da interface: a ação primária é a coisa mais olhada de qualquer tela.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex select-none items-center justify-center gap-2 rounded-lg font-bold transition-colors ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ' +
  'motion-reduce:active:translate-y-0';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-hover',
  secondary: 'bg-sunken text-ink hover:bg-line',
  outline: 'border border-line bg-surface text-ink hover:border-line-strong hover:bg-canvas',
  ghost: 'text-ink-soft hover:bg-sunken hover:text-ink',
  // danger-700, e não 500: branco sobre o 500 dá 4.50:1, o limite exato do AA
  // — passa por um centésimo, e qualquer ajuste no tom quebraria.
  danger: 'bg-danger-700 text-white hover:bg-danger-500',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-10 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

/**
 * As classes de um botão, para elementos que não são `<button>`.
 *
 * Um `<Link>` que leva à próxima aula precisa parecer o botão primário sem
 * ser um — trocar a tag quebraria a navegação por teclado e o histórico. Esta
 * função é o que mantém as duas coisas idênticas sem um componente
 * polimórfico nem uma dependência a mais.
 */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
} = {}): string {
  return cn(base, variants[variant], sizes[size], block && 'w-full', className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Ocupa a largura toda. É o normal para a ação principal no celular. */
  block?: boolean;
  /**
   * Em andamento. Desabilita, anuncia `aria-busy`, e troca o ícone pelo
   * spinner — sem tirar o rótulo, que é o que diz o que está acontecendo.
   */
  loading?: boolean;
  /** Ícone antes do rótulo. */
  icon?: React.ReactNode;
  /** Ícone depois do rótulo — uma seta de "avançar", em geral. */
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      block = false,
      loading = false,
      icon,
      iconRight,
      className,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        // `button` por padrão, e não `submit`: um botão solto dentro de um form
        // que envia o form ao ser clicado é uma surpresa que ninguém pediu.
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={buttonClasses({ variant, size, block, className })}
        {...props}
      >
        {loading ? (
          <IconSpinner size={size === 'lg' ? 18 : 16} className="animate-spin" />
        ) : (
          icon
        )}
        {children}
        {iconRight}
      </button>
    );
  }
);
Button.displayName = 'Button';
