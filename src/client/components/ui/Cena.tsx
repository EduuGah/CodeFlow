import { P } from './Ilustracao';

/**
 * A cena da página pública: um editor em miniatura onde o código é digitado
 * linha a linha, roda, e a correção aparece — o produto inteiro num quadro.
 *
 * É desenhada, não é captura de tela: uma captura envelhece a cada mudança
 * de interface e pesa 200 KB; isto pesa 3 KB e segue a paleta das vinhetas.
 * As linhas são barras coloridas como as de um editor com destaque de
 * sintaxe, e o movimento é o de digitar (`animar-digitar`, com atrasos
 * escalonados) seguido do veredito que pipoca (`animar-pop`). Toca uma
 * vez, ao carregar; quem pediu menos movimento vê o quadro final.
 */
const LINHAS: Array<Array<[number, number, string]>> = [
  // [x, largura, cor] — cada linha, em unidades da grade de 360 × 220.
  [
    [52, 34, P.roxo],
    [90, 44, P.azulClaro],
    [138, 10, P.creme],
    [152, 58, P.dourado],
  ],
  [
    [64, 26, P.roxo],
    [94, 32, P.creme],
    [130, 12, P.creme],
    [146, 40, P.azulClaro],
  ],
  [
    [64, 46, P.azulClaro],
    [114, 14, P.creme],
    [132, 52, P.dourado],
  ],
  [[52, 12, P.creme]],
];

export function CenaEditor({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 220"
      className={`h-auto w-full ${className}`}
      aria-hidden="true"
      focusable="false"
      role="img"
    >
      {/* A janela do editor. */}
      <rect x="8" y="10" width="344" height="200" rx="12" fill="#1b2220" />
      <rect x="8" y="10" width="344" height="30" rx="12" fill="#2c3733" />
      <rect x="8" y="26" width="344" height="14" fill="#2c3733" />
      <circle cx="26" cy="25" r="4.5" fill={P.vermelho} />
      <circle cx="40" cy="25" r="4.5" fill={P.dourado} />
      <circle cx="54" cy="25" r="4.5" fill={P.verde} />
      <rect x="120" y="19" width="120" height="12" rx="6" fill="#1b2220" />
      <rect x="130" y="23" width="60" height="4" rx="2" fill="#6f7d78" />

      {/* Numeração e as linhas digitadas, uma depois da outra. */}
      {LINHAS.map((linha, i) => (
        <g key={i}>
          <text x="30" y={62 + i * 22} fill="#6f7d78" fontSize="11" fontFamily="ui-monospace, monospace">
            {i + 1}
          </text>
          {linha.map(([x, w, cor], j) => (
            <rect
              key={j}
              x={x}
              y={53 + i * 22}
              width={w}
              height="10"
              rx="5"
              fill={cor}
              className="animar-digitar"
              style={{ animationDelay: `${0.25 + i * 0.45 + j * 0.12}s`, transformBox: 'fill-box' }}
            />
          ))}
        </g>
      ))}
      {/* O cursor, no fim da última linha. */}
      <rect x="66" y="118" width="2.5" height="12" fill={P.creme} className="animar-piscar" />

      {/* O painel do veredito: os testes que passaram, com a explicação. */}
      <g className="animar-pop" style={{ animationDelay: '2.4s', transformBox: 'fill-box', transformOrigin: 'center' }}>
        <rect x="24" y="148" width="312" height="48" rx="10" fill="#12291a" />
        <circle cx="48" cy="172" r="12" fill={P.verde} />
        <path d="M41 172l5 5 9-10" stroke={P.creme} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="70" y="162" width="96" height="8" rx="4" fill="#8fd9a6" />
        <rect x="70" y="176" width="190" height="6" rx="3" fill="#8fd9a6" opacity={0.55} />
        <rect x="290" y="163" width="30" height="18" rx="9" fill={P.verde} />
        <text x="305" y="176" fill={P.creme} fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="ui-monospace, monospace">
          3/3
        </text>
      </g>
    </svg>
  );
}
