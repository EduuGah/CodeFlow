import { NavLink, Outlet } from 'react-router-dom';
import type { ComponentType } from 'react';

import {
  IconHome,
  IconLogo,
  IconPractice,
  IconProfile,
  IconTrack,
  type IconProps,
} from '../ui/Icon';
import { StudentDataProvider } from '../../contexts/StudentDataContext';

/**
 * Estrutura de navegação do aplicativo.
 *
 * Duas formas, uma decisão. No celular a barra fica embaixo, na zona do polegar:
 * cerca de metade das pessoas navega só com o polegar, e o terço inferior da
 * tela é a área confortável. No desktop vira lateral, onde há espaço horizontal
 * sobrando e a barra inferior seria estranha.
 *
 * São quatro destinos, não sete. A barra inferior comporta de três a cinco itens
 * antes de virar uma fileira de ícones indistinguíveis — então projetos moram
 * dentro de Trilhas, e progresso dentro do Perfil, onde o aluno já vai procurar.
 *
 * Todo item aponta para uma tela que existe. Um destino vazio seria o mesmo
 * problema do botão que não faz nada.
 *
 * A ordem no DOM não é a mesma nas duas formas, e isso é intencional. No celular
 * a barra vem **depois** do conteúdo, então quem usa teclado chega ao conteúdo de
 * primeira. No desktop a lateral vem antes, por causa do layout — daí o link de
 * pulo, que evita repassar quatro itens de menu em cada tela.
 */

interface Destino {
  to: string;
  label: string;
  Icone: ComponentType<IconProps>;
}

const DESTINOS: Destino[] = [
  { to: '/app', label: 'Início', Icone: IconHome },
  { to: '/app/trilhas', label: 'Trilhas', Icone: IconTrack },
  { to: '/app/praticar', label: 'Praticar', Icone: IconPractice },
  { to: '/app/perfil', label: 'Perfil', Icone: IconProfile },
];

/** `end` só no início: as demais abas têm rotas filhas que devem manter o item ativo. */
const ehInicio = (to: string) => to === '/app';

function ItemLateral({ to, label, Icone }: Destino) {
  return (
    <NavLink
      to={to}
      end={ehInicio(to)}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-ink-soft hover:bg-sunken hover:text-ink'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icone size={22} strokeWidth={isActive ? 2 : 1.75} />
          {label}
        </>
      )}
    </NavLink>
  );
}

function ItemInferior({ to, label, Icone }: Destino) {
  return (
    <NavLink
      to={to}
      end={ehInicio(to)}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center gap-1 py-2 transition-colors ${
          isActive ? 'text-brand-700' : 'text-ink-faint'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* A pastilha marca o item ativo por forma, e não só por cor. */}
          <span
            className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
              isActive ? 'bg-brand-50' : ''
            }`}
          >
            <Icone size={22} strokeWidth={isActive ? 2 : 1.75} />
          </span>
          <span className="text-[11px] font-semibold">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export function AppShell() {
  return (
    <StudentDataProvider>
      <div className="min-h-screen bg-canvas">
        {/* Invisível até receber foco: só quem navega por teclado precisa dele, e
            para essa pessoa ele precisa aparecer de verdade. */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
        >
          Pular para o conteúdo
        </a>

        {/* Lateral: só a partir de md, onde há espaço horizontal sobrando. */}
        <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-surface p-4 md:flex">
          <div className="mb-6 flex items-center gap-2.5 px-2 pt-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <IconLogo size={20} />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-ink">CodeFlow</span>
          </div>

          <nav className="flex flex-col gap-1" aria-label="Navegação principal">
            {DESTINOS.map((d) => (
              <ItemLateral key={d.to} {...d} />
            ))}
          </nav>
        </aside>

        {/* pb-24 no mobile reserva a altura da barra inferior, para o conteúdo
            final não ficar escondido atrás dela. */}
        <div className="md:pl-60">
          <main
            id="conteudo"
            tabIndex={-1}
            className="mx-auto w-full max-w-3xl px-4 pb-24 pt-4 focus-visible:outline-none sm:px-6 md:pb-10 md:pt-8"
          >
            <Outlet />
          </main>
        </div>

        <nav
          aria-label="Navegação principal"
          className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          {DESTINOS.map((d) => (
            <ItemInferior key={d.to} {...d} />
          ))}
        </nav>
      </div>
    </StudentDataProvider>
  );
}
