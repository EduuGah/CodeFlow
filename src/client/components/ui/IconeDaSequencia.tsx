import { estagioDaPlanta, iconeDaSequencia } from '../../lib/icones-da-sequencia';
import { IconeBase, IconStreak, type IconProps } from './Icon';

/**
 * O ícone da sequência que a pessoa equipou, no traço dos outros ícones
 * (`Icon.tsx`: 24 × 24, `currentColor`) — a cor continua vindo de onde ele
 * está. A planta muda com os dias: broto, muda (7) e árvore (30).
 */

const Sol = (p: IconProps) => (
  <IconeBase {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </IconeBase>
);

const Cafe = (p: IconProps) => (
  <IconeBase {...p}>
    <path d="M5 10h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" />
    <path d="M16 11.5h1.2a2.4 2.4 0 0 1 0 4.8H16" />
    <path d="M8.5 3.5c-.8 1 .8 1.9 0 3.2M12.5 3.5c-.8 1 .8 1.9 0 3.2" />
  </IconeBase>
);

const Foguete = (p: IconProps) => (
  <IconeBase {...p}>
    <path d="M12 2.8c2.7 2 4.1 5 4.1 8.6v4.6H7.9v-4.6c0-3.6 1.4-6.6 4.1-8.6z" />
    <circle cx="12" cy="9.8" r="1.6" />
    <path d="M7.9 13.2L5.6 15.6v2.6h2.3M16.1 13.2l2.3 2.4v2.6h-2.3" />
    <path d="M10.4 18.8c.3 1.1.9 1.9 1.6 2.3.7-.4 1.3-1.2 1.6-2.3" />
  </IconeBase>
);

const Planta = ({ dias, ...p }: IconProps & { dias: number }) => {
  const estagio = estagioDaPlanta(dias);
  return (
    <IconeBase data-estagio={estagio} {...p}>
      <path d="M7.5 15.5h9l-1.2 5H8.7z" />
      {estagio === 'broto' && (
        <>
          <path d="M12 15.5v-4" />
          <path d="M12 12.2c-2.4 0-3.6-1.4-3.6-3 2.1 0 3.6 1 3.6 3zM12 11.6c2.4 0 3.6-1.4 3.6-3-2.1 0-3.6 1-3.6 3z" />
        </>
      )}
      {estagio === 'muda' && (
        <>
          <path d="M12 15.5V5" />
          <path d="M12 12.5c-2.6 0-3.9-1.5-3.9-3.2 2.3 0 3.9 1.1 3.9 3.2zM12 9.6c2.6 0 3.9-1.5 3.9-3.2-2.3 0-3.9 1.1-3.9 3.2z" />
          <path d="M12 6.5c-1.5 0-2.3-.9-2.3-1.9 1.3 0 2.3.7 2.3 1.9z" />
        </>
      )}
      {estagio === 'arvore' && (
        <>
          <path d="M12 15.5v-4.2M12 13l-1.8-1.6M12 12.4l1.6-1.3" />
          <path d="M7.2 8.6a3 3 0 0 1 3-3.6 3.2 3.2 0 0 1 5.6.6 2.9 2.9 0 0 1 .9 5.6H8.3a2.7 2.7 0 0 1-1.1-2.6z" />
        </>
      )}
    </IconeBase>
  );
};

/** `icone` é o id guardado no perfil (`id` já é o atributo do `<svg>`). */
export function IconeDaSequencia({
  icone: guardado,
  dias,
  ...p
}: IconProps & { icone: string | null | undefined; dias: number }) {
  const icone = iconeDaSequencia(guardado).id;
  // Qual ícone está na tela, para quem testa (e sem texto: o número de dias
  // ao lado é o que se lê).
  const marcado = { ...p, 'data-icone-sequencia': icone };
  switch (icone) {
    case 'sol':
      return <Sol {...marcado} />;
    case 'cafe':
      return <Cafe {...marcado} />;
    case 'foguete':
      return <Foguete {...marcado} />;
    case 'planta':
      return <Planta dias={dias} {...marcado} />;
    default:
      return <IconStreak {...marcado} />;
  }
}
