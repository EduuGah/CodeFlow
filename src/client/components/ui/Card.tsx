import React from 'react';

import { cn } from '../../lib/utils';

/**
 * A superfície que se apoia sobre o fundo.
 *
 * Existia como 25 cópias de `rounded-xl border border-line bg-surface p-4
 * sm:p-5` espalhadas pelas telas. Copiar funciona até o dia em que se decide
 * mudar o raio, ou o preenchimento no celular — e aí são 25 lugares, e dois
 * deles ficam para trás.
 *
 * Os tons carregam significado, não decoração: `success` é acerto, `caution` é
 * erro de resposta (âmbar, porque errar é etapa do aprendizado), `danger` é
 * falha de código ou de sistema, `brand` é destaque de orientação. Um card sem
 * motivo para ter cor é `default`.
 */
export type CardTone = 'default' | 'brand' | 'success' | 'caution' | 'danger' | 'sunken';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const tones: Record<CardTone, string> = {
  default: 'border-line bg-surface',
  brand: 'border-brand-200 bg-brand-50',
  success: 'border-success-200 bg-success-50',
  caution: 'border-energy-200 bg-energy-50',
  danger: 'border-danger-200 bg-danger-50',
  sunken: 'border-line bg-sunken',
};

const paddings: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
};

/**
 * As classes de um card, para elementos que não podem ser o componente.
 *
 * Um `<Link>` que é um card inteiro clicável — o projeto na lista de trilhas,
 * a revisão pendente no painel — precisa parecer os outros cards e continuar
 * sendo um link. Mesma razão do `buttonClasses`.
 */
export function cardClasses({
  tone = 'default',
  padding = 'md',
  className,
}: {
  tone?: CardTone;
  padding?: CardPadding;
  className?: string;
} = {}): string {
  return cn('rounded-xl border', tones[tone], paddings[padding], className);
}

// `HTMLElement`, e não `HTMLDivElement`: o card troca de tag, e os manipuladores
// de evento precisam servir para qualquer uma delas.
export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  tone?: CardTone;
  padding?: CardPadding;
  /** `section`, `article`, `li`, `ul`… A tag certa é semântica, não estilo. */
  as?: 'div' | 'section' | 'article' | 'li' | 'ul' | 'aside';
}

// Sem `forwardRef` de propósito: nada precisa de um ref para um card, e a
// tipagem de ref num componente que troca de tag custa mais do que rende.
export function Card({ tone = 'default', padding = 'md', as: Tag = 'div', className, ...props }: CardProps) {
  return <Tag className={cardClasses({ tone, padding, className })} {...props} />;
}

/**
 * O rótulo monoespaçado que abre uma seção.
 *
 * É o sotaque tipográfico do produto: a personalidade "programação" vem do uso
 * deliberado da monoespaçada em rótulos e contadores, e não de enfeite de
 * terminal. Vive em um componente para o tom — marca ou apagado — ser uma
 * decisão, e não uma classe lembrada de cabeça a cada uso.
 *
 * `h2` por padrão porque abre uma seção; passe `as="p"` quando for só um
 * rótulo de metadado, para não inventar um nível de título no documento.
 */
export function SectionLabel({
  tone = 'faint',
  as: Tag = 'h2',
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  tone?: 'faint' | 'brand';
  as?: 'h2' | 'h3' | 'p' | 'span';
}) {
  return (
    <Tag
      className={cn('label-mono', tone === 'brand' ? 'text-brand-700' : 'text-ink-faint', className)}
      {...props}
    />
  );
}
