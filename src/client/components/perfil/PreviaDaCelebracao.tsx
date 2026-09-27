import type { ReactNode } from 'react';

import { aceitaMovimento, celebrar } from '../../lib/celebrar';
import { celebracao } from '../../lib/celebracoes';
import { P } from '../ui/Ilustracao';
import { Button } from '../ui/Button';

/**
 * A celebração fora da conclusão: a figura parada (loja e inventário) e a
 * prévia que toca de verdade, com o mesmo `celebrar` da aula.
 *
 * A prévia obedece à mesma regra da aula: quem pediu menos movimento não vê
 * nenhuma — e o cartão diz isso em vez de tocar escondido, porque comprar
 * uma celebração que nunca vai tocar seria moeda jogada fora.
 */

/** Os pontos de uma estrela de cinco pontas, para um `<polygon>`. */
function estrela(cx: number, cy: number, r: number): string {
  return Array.from({ length: 10 }, (_, i) => {
    const angulo = ((-90 + i * 36) * Math.PI) / 180;
    const raio = i % 2 === 0 ? r : r * 0.45;
    return `${(cx + raio * Math.cos(angulo)).toFixed(2)},${(cy + raio * Math.sin(angulo)).toFixed(2)}`;
  }).join(' ');
}

/** Um estouro de fogos: raios em volta do centro, e o rastro de quem subiu. */
function Estouro({ cx, cy, r, cor }: { cx: number; cy: number; r: number; cor: string }) {
  return (
    <g stroke={cor} strokeWidth="2" strokeLinecap="round">
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * r * 0.35}
            y1={cy + Math.sin(a) * r * 0.35}
            x2={cx + Math.cos(a) * r}
            y2={cy + Math.sin(a) * r}
          />
        );
      })}
      <circle cx={cx} cy={cy} r="1.6" fill={cor} stroke="none" />
    </g>
  );
}

const DESENHOS: Record<string, ReactNode> = {
  confete: (
    <g>
      {(
        [
          [10, 12, 20, '#2b8078'],
          [24, 6, -30, P.dourado],
          [40, 14, 45, '#2f8f4e'],
          [54, 8, -15, P.laranja],
          [16, 30, 60, P.dourado],
          [32, 24, 10, P.vermelho],
          [48, 32, -40, '#2b8078'],
          [26, 40, 25, '#2f8f4e'],
          [56, 40, 70, P.dourado],
        ] as const
      ).map(([x, y, giro, cor], i) => (
        <rect key={i} x={x - 3} y={y - 1.8} width="6" height="3.6" rx="0.8" fill={cor} transform={`rotate(${giro} ${x} ${y})`} />
      ))}
    </g>
  ),
  estrelas: (
    <g stroke={P.douradoEscuro} strokeWidth="1.2" strokeLinejoin="round">
      <polygon points={estrela(30, 22, 13)} fill={P.dourado} />
      <polygon points={estrela(50, 12, 7)} fill={P.dourado} />
      <polygon points={estrela(12, 34, 6)} fill={P.dourado} />
      <polygon points={estrela(52, 36, 4.5)} fill={P.dourado} />
    </g>
  ),
  bolhas: (
    <g>
      {(
        [
          [28, 26, 12],
          [48, 14, 7],
          [12, 14, 5],
          [50, 36, 4.5],
        ] as const
      ).map(([cx, cy, r], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill="#cfe8fb" stroke="#4f8fc8" strokeWidth="1.5" />
          <ellipse cx={cx - r * 0.35} cy={cy - r * 0.4} rx={r * 0.28} ry={r * 0.18} fill="#ffffff" transform={`rotate(-30 ${cx} ${cy})`} />
        </g>
      ))}
    </g>
  ),
  codigo: (
    <g fontFamily="'JetBrains Mono', monospace" fontWeight="700" textAnchor="middle">
      <text x="14" y="18" fontSize="16" fill={P.teal} transform="rotate(-12 14 18)">
        {'{'}
      </text>
      <text x="50" y="16" fontSize="14" fill={P.laranja} transform="rotate(10 50 16)">
        ;
      </text>
      <text x="32" y="30" fontSize="15" fill={P.roxo}>
        {'</>'}
      </text>
      <text x="16" y="44" fontSize="13" fill={P.azul} transform="rotate(8 16 44)">
        ( )
      </text>
      <text x="52" y="42" fontSize="16" fill={P.teal} transform="rotate(14 52 42)">
        {'}'}
      </text>
    </g>
  ),
  fogos: (
    <g>
      <Estouro cx={32} cy={18} r={13} cor={P.dourado} />
      <Estouro cx={12} cy={30} r={8} cor="#e0508a" />
      <Estouro cx={52} cy={32} r={9} cor="#3aa7d9" />
      <line x1="32" y1="46" x2="32" y2="36" stroke={P.douradoEscuro} strokeWidth="1.5" strokeDasharray="2 2.5" strokeLinecap="round" />
    </g>
  ),
};

export function FiguraDaCelebracao({ id, largura = 64 }: { id: string; largura?: number }) {
  return (
    <svg viewBox="0 0 64 48" width={largura} height={(largura * 48) / 64} fill="none" aria-hidden="true" focusable="false">
      {DESENHOS[celebracao(id).id]}
    </svg>
  );
}

/**
 * O que a prévia mostra depois de tocar (quem abre a prévia toca — o clique é
 * de quem pediu): o botão de tocar de novo, ou por que não tocou.
 */
export function PreviaDaCelebracao({ id }: { id: string }) {
  if (!aceitaMovimento()) {
    return (
      <p className="mt-2 rounded-lg bg-sunken px-3 py-2 text-xs leading-relaxed text-ink-soft">
        Seu sistema pede menos movimento, então nenhuma celebração toca — nem esta, nem a de graça. A conclusão
        continua dizendo "Aula concluída".
      </p>
    );
  }

  return (
    <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
      Tocou agora, na tela inteira.
      <Button size="sm" variant="outline" className="h-8" onClick={() => celebrar('aula', id)}>
        Tocar de novo
      </Button>
    </p>
  );
}
