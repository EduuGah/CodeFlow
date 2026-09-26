import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { IconArrowLeft } from '../ui/Icon';

/**
 * O cabeçalho de cada seção do perfil: o caminho de volta, a vinheta, o
 * título e uma frase que diz o que a seção é.
 *
 * As seções são páginas, não abas — no celular uma página por assunto é o
 * que cabe no polegar, e o histórico do navegador vira o "voltar". O link
 * de volta vem antes do título, onde o olho procura primeiro.
 */
export function CabecalhoDaSecao({
  titulo,
  descricao,
  vinheta,
  tom = 'brand',
  lado,
  voltar = { para: '/app/perfil', rotulo: 'Perfil' },
}: {
  titulo: string;
  descricao: string;
  vinheta: ReactNode;
  /** A cor da pastilha da vinheta. */
  tom?: 'brand' | 'energy' | 'success';
  /** O que fica à direita: um número, uma ação. */
  lado?: ReactNode;
  /** De onde se veio. O perfil, a não ser que a seção more em outro lugar. */
  voltar?: { para: string; rotulo: string };
}) {
  const pastilha = {
    brand: 'bg-brand-50 text-brand-700',
    energy: 'bg-energy-50 text-energy-700',
    success: 'bg-success-50 text-success-700',
  }[tom];

  return (
    <header className="space-y-3">
      <Link
        to={voltar.para}
        className="inline-flex min-h-6 items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink"
      >
        <IconArrowLeft size={16} />
        {voltar.rotulo}
      </Link>
      <div className="flex items-center gap-4">
        <span className={`animar-pop flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${pastilha}`} aria-hidden>
          {vinheta}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{titulo}</h1>
          <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{descricao}</p>
        </div>
        {lado && <div className="shrink-0">{lado}</div>}
      </div>
    </header>
  );
}
