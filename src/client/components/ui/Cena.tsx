import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import { P } from './Ilustracao';

/**
 * Cenas: quadros desenhados de 360 × 220 em que alguma coisa acontece.
 *
 * A primeira foi a da página pública — um editor onde o código é digitado,
 * roda, e a correção aparece: o produto inteiro num quadro. O dono do
 * projeto gostou muito ("programar é praticar") e pediu mais nesse estilo.
 * São desenhadas, não capturadas: uma captura envelhece a cada mudança de
 * interface e pesa 200 KB; isto pesa 3 KB, segue a paleta das vinhetas e
 * escurece com o tema onde faz sentido.
 *
 * Cada cena conta uma coisa só, em três ou quatro tempos, com as animações
 * do `index.css` (`animar-digitar`, `animar-pop`, `animar-tracar`…) e
 * atrasos escalonados. Toca uma vez, quando entra na tela — o invólucro
 * `Cena` observa a visibilidade e libera as animações; antes disso a cena
 * fica no primeiro quadro. Quem pediu menos movimento vê o quadro final.
 *
 * Regras, para as próximas nascerem coerentes:
 * - texto de verdade só onde um número ou uma palavra fazem a cena ser lida
 *   ("3/3", "esperava 12, veio 7"); o resto é barra colorida
 * - a janela escura é a do editor; a clara, a da interface
 * - nada em loop além do cursor
 */

/** O invólucro: libera as animações quando a cena aparece na tela. */
export function Cena({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver !== 'function') {
      setVisivel(true);
      return;
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisivel(true);
          observador.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <div ref={ref} className={`cena ${className}`} data-visivel={visivel || undefined}>
      {children}
    </div>
  );
}

const EDITOR = { fundo: '#1b2220', barra: '#2c3733', apagado: '#6f7d78', painel: '#12291a', verde: '#8fd9a6' };
const TELA = { fundo: 'var(--color-surface)', linha: 'var(--color-line)', texto: 'var(--color-ink-faint)', sunken: 'var(--color-sunken)' };
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

function Quadro({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 360 220" className={`h-auto w-full ${className}`} aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

/** Um bloco que se digita: `animar-digitar` com o atraso pedido. */
function Barra({
  x,
  y,
  w,
  h = 10,
  cor,
  atraso,
  rx,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  cor: string;
  atraso: number;
  rx?: number;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={rx ?? h / 2}
      fill={cor}
      className="animar-digitar"
      style={{ animationDelay: `${atraso}s`, transformBox: 'fill-box' } as CSSProperties}
    />
  );
}

/** Algo que pipoca: `animar-pop` com o atraso pedido, a partir do centro. */
function Pop({ atraso, children }: { atraso: number; children: ReactNode }) {
  return (
    <g
      className="animar-pop"
      style={{ animationDelay: `${atraso}s`, transformBox: 'fill-box', transformOrigin: 'center' } as CSSProperties}
    >
      {children}
    </g>
  );
}

/** A janela escura do editor, com os três pontos. */
function JanelaEscura({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="12" fill={EDITOR.fundo} />
      <rect x={x} y={y} width={w} height="30" rx="12" fill={EDITOR.barra} />
      <rect x={x} y={y + 16} width={w} height="14" fill={EDITOR.barra} />
      <circle cx={x + 18} cy={y + 15} r="4.5" fill={P.vermelho} />
      <circle cx={x + 32} cy={y + 15} r="4.5" fill={P.dourado} />
      <circle cx={x + 46} cy={y + 15} r="4.5" fill={P.verde} />
    </g>
  );
}

/** A janela clara da interface. */
function JanelaClara({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="12" fill={TELA.fundo} stroke={TELA.linha} strokeWidth="1.5" />
      <rect x={x + 1} y={y + 1} width={w - 2} height="28" rx="11" fill={TELA.sunken} />
      <rect x={x + 1} y={y + 16} width={w - 2} height="13" fill={TELA.sunken} />
      <rect x={x + 16} y={y + 10} width="60" height="8" rx="4" fill={TELA.linha} />
    </g>
  );
}

/* ------------------------------------------------------------------ */

/**
 * O editor: código digitado, roda, e o veredito aparece. É a cena da
 * página pública — o produto inteiro num quadro.
 */
export function CenaEditor({ className = '' }: { className?: string }) {
  const linhas: Array<Array<[number, number, string]>> = [
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
  return (
    <Cena className={className}>
      <Quadro>
        <JanelaEscura x={8} y={10} w={344} h={200} />
        <rect x="120" y="19" width="120" height="12" rx="6" fill={EDITOR.fundo} />
        <rect x="130" y="23" width="60" height="4" rx="2" fill={EDITOR.apagado} />

        {linhas.map((linha, i) => (
          <g key={i}>
            <text x="30" y={62 + i * 22} fill={EDITOR.apagado} fontSize="11" fontFamily={MONO}>
              {i + 1}
            </text>
            {linha.map(([x, w, cor], j) => (
              <Barra key={j} x={x} y={53 + i * 22} w={w} cor={cor} atraso={0.25 + i * 0.45 + j * 0.12} />
            ))}
          </g>
        ))}
        <rect x="66" y="118" width="2.5" height="12" fill={P.creme} className="animar-piscar" />

        <Pop atraso={2.4}>
          <rect x="24" y="148" width="312" height="48" rx="10" fill={EDITOR.painel} />
          <circle cx="48" cy="172" r="12" fill={P.verde} />
          <path d="M41 172l5 5 9-10" stroke={P.creme} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="70" y="162" width="96" height="8" rx="4" fill={EDITOR.verde} />
          <rect x="70" y="176" width="190" height="6" rx="3" fill={EDITOR.verde} opacity={0.55} />
          <rect x="290" y="163" width="30" height="18" rx="9" fill={P.verde} />
          <text x="305" y="176" fill={P.creme} fontSize="11" fontWeight="700" textAnchor="middle" fontFamily={MONO}>
            3/3
          </text>
        </Pop>
      </Quadro>
    </Cena>
  );
}

/**
 * Aulas curtas: os passos de uma aula enchendo em cima, o conteúdo que cabe
 * numa sentada, e o "Continuar" no fim.
 */
export function CenaAulas({ className = '' }: { className?: string }) {
  const passos = 10;
  return (
    <Cena className={className}>
      <Quadro>
        {/* Os passos, um a um. */}
        {Array.from({ length: passos }, (_, i) => (
          <rect key={`f${i}`} x={24 + i * 32} y="14" width="28" height="6" rx="3" fill={TELA.linha} />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <Barra key={`p${i}`} x={24 + i * 32} y={14} w={28} h={6} cor="var(--color-brand-600)" atraso={0.2 + i * 0.25} />
        ))}
        <text x="336" y="21" fill={TELA.texto} fontSize="10" textAnchor="end" fontFamily={MONO}>
          4/{passos} · 18 min
        </text>

        <rect x="24" y="34" width="312" height="172" rx="12" fill={TELA.fundo} stroke={TELA.linha} strokeWidth="1.5" />
        <Barra x={44} y={54} w={70} h={7} cor="var(--color-brand-700)" atraso={1.2} />
        <Barra x={44} y={72} w={260} h={9} cor={TELA.texto} atraso={1.45} />
        <Barra x={44} y={88} w={220} h={9} cor={TELA.linha} atraso={1.6} />
        <Barra x={44} y={104} w={244} h={9} cor={TELA.linha} atraso={1.75} />

        <Pop atraso={2.1}>
          <rect x="44" y="124" width="272" height="40" rx="8" fill={EDITOR.fundo} />
          <rect x="58" y="135" width="40" height="7" rx="3.5" fill={P.roxo} />
          <rect x="104" y="135" width="70" height="7" rx="3.5" fill={P.azulClaro} />
          <rect x="58" y="149" width="90" height="7" rx="3.5" fill={P.dourado} />
        </Pop>

        <Pop atraso={2.6}>
          <rect x="216" y="174" width="100" height="22" rx="8" fill="var(--color-brand-600)" />
          <rect x="232" y="182" width="52" height="6" rx="3" fill={P.creme} />
          <path d="M296 182l4 3-4 3" stroke={P.creme} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Pop>
      </Quadro>
    </Cena>
  );
}

/**
 * O código vira página: cada linha digitada à esquerda faz aparecer um
 * pedaço da página à direita. É a trilha "A Página" num quadro.
 */
export function CenaPagina({ className = '' }: { className?: string }) {
  return (
    <Cena className={className}>
      <Quadro>
        <JanelaEscura x={8} y={10} w={168} h={200} />
        {/* <header>, <h1>, <p>, <button> — como barras. */}
        <Barra x={24} y={52} w={22} h={8} cor={P.laranja} atraso={0.2} />
        <Barra x={50} y={52} w={60} h={8} cor={P.azulClaro} atraso={0.35} />
        <Barra x={36} y={72} w={22} h={8} cor={P.laranja} atraso={0.9} />
        <Barra x={62} y={72} w={80} h={8} cor={P.creme} atraso={1.05} />
        <Barra x={36} y={92} w={16} h={8} cor={P.laranja} atraso={1.6} />
        <Barra x={56} y={92} w={100} h={8} cor={P.creme} atraso={1.75} />
        <Barra x={36} y={112} w={100} h={8} cor={P.creme} atraso={1.9} />
        <Barra x={36} y={132} w={34} h={8} cor={P.laranja} atraso={2.4} />
        <Barra x={74} y={132} w={50} h={8} cor={P.dourado} atraso={2.55} />
        <Barra x={24} y={152} w={30} h={8} cor={P.laranja} atraso={2.9} />
        <rect x="58" y="150" width="2.5" height="12" fill={P.creme} className="animar-piscar" />

        <JanelaClara x={184} y={10} w={168} h={200} />
        <Pop atraso={0.6}>
          <rect x="185" y="40" width="166" height="26" fill="var(--color-brand-600)" />
          <rect x="198" y="49" width="40" height="8" rx="4" fill={P.creme} />
          <rect x="300" y="50" width="16" height="6" rx="3" fill={P.creme} opacity={0.7} />
          <rect x="320" y="50" width="16" height="6" rx="3" fill={P.creme} opacity={0.7} />
        </Pop>
        <Pop atraso={1.3}>
          <rect x="200" y="82" width="110" height="12" rx="6" fill="var(--color-ink)" />
        </Pop>
        <Pop atraso={2.1}>
          <rect x="200" y="104" width="134" height="7" rx="3.5" fill={TELA.texto} />
          <rect x="200" y="117" width="120" height="7" rx="3.5" fill={TELA.linha} />
          <rect x="200" y="130" width="126" height="7" rx="3.5" fill={TELA.linha} />
        </Pop>
        <Pop atraso={2.8}>
          <rect x="200" y="152" width="84" height="24" rx="8" fill={P.laranja} />
          <rect x="216" y="161" width="52" height="6" rx="3" fill={P.creme} />
        </Pop>
      </Quadro>
    </Cena>
  );
}

/**
 * A correção que explica: um teste passa, outro falha dizendo o que
 * esperava e o que veio, e a explicação aparece — o porquê, não só o "não".
 */
export function CenaCorrecao({ className = '' }: { className?: string }) {
  return (
    <Cena className={className}>
      <Quadro>
        <JanelaEscura x={8} y={10} w={344} h={200} />
        {/* A linha do erro, marcada. */}
        <Pop atraso={1.9}>
          <rect x="12" y="70" width="336" height="18" rx="4" fill={P.vermelho} opacity={0.22} />
        </Pop>
        {[0, 1, 2].map((i) => (
          <text key={i} x="30" y={62 + i * 22} fill={EDITOR.apagado} fontSize="11" fontFamily={MONO}>
            {i + 1}
          </text>
        ))}
        <Barra x={52} y={53} w={60} h={10} cor={P.roxo} atraso={0.2} />
        <Barra x={118} y={53} w={70} h={10} cor={P.azulClaro} atraso={0.35} />
        <Barra x={64} y={75} w={50} h={10} cor={P.roxo} atraso={0.6} />
        <Barra x={120} y={75} w={26} h={10} cor={P.creme} atraso={0.75} />
        <Barra x={152} y={75} w={12} h={10} cor={P.dourado} atraso={0.85} />
        <Barra x={170} y={75} w={40} h={10} cor={P.creme} atraso={0.95} />
        <Barra x={52} y={97} w={12} h={10} cor={P.creme} atraso={1.2} />

        {/* Os testes: um verde, um vermelho com a evidência. */}
        <Pop atraso={1.5}>
          <rect x="24" y="118" width="312" height="24" rx="8" fill={EDITOR.painel} />
          <circle cx="40" cy="130" r="7" fill={P.verde} />
          <path d="M36 130l3 3 5-6" stroke={P.creme} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="56" y="134" fill={EDITOR.verde} fontSize="11" fontFamily={MONO}>
            soma(3, 4) devolve 7
          </text>
        </Pop>
        <Pop atraso={1.9}>
          <rect x="24" y="148" width="312" height="24" rx="8" fill="#33191a" />
          <circle cx="40" cy="160" r="7" fill={P.vermelho} />
          <path d="M37 157l6 6M43 157l-6 6" stroke={P.creme} strokeWidth="2" strokeLinecap="round" />
          <text x="56" y="164" fill="#f2a496" fontSize="11" fontFamily={MONO}>
            soma(3, -4): esperava -1, veio 7
          </text>
        </Pop>

        {/* O porquê. */}
        <g className="animar-pousar" style={{ animationDelay: '2.5s' } as CSSProperties}>
          <rect x="24" y="178" width="312" height="24" rx="8" fill="var(--color-brand-600)" />
          <circle cx="40" cy="190" r="6" fill={P.creme} />
          <text x="40" y="193.5" fill="var(--color-brand-600)" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily={MONO}>
            ?
          </text>
          <rect x="56" y="186" width="150" height="8" rx="4" fill={P.creme} />
          <rect x="212" y="186" width="90" height="8" rx="4" fill={P.creme} opacity={0.6} />
        </g>
      </Quadro>
    </Cena>
  );
}

/**
 * A revisão espaçada: o cartão vira, a pessoa diz se lembrou, e o cartão
 * marca a data em que volta.
 */
export function CenaCartoes({ className = '' }: { className?: string }) {
  return (
    <Cena className={className}>
      <Quadro>
        {/* A pilha atrás. */}
        <rect x="70" y="30" width="220" height="130" rx="12" fill={TELA.sunken} transform="rotate(-4 180 95)" />
        <rect x="70" y="30" width="220" height="130" rx="12" fill={TELA.linha} transform="rotate(3 180 95)" opacity={0.7} />

        {/* A frente: a pergunta. Some virando. */}
        <g className="animar-virar-frente" style={{ animationDelay: '1.4s' } as CSSProperties}>
          <rect x="70" y="30" width="220" height="130" rx="12" fill={TELA.fundo} stroke={TELA.linha} strokeWidth="1.5" />
          <rect x="92" y="50" width="52" height="7" rx="3.5" fill="var(--color-brand-700)" />
          <rect x="92" y="72" width="170" height="10" rx="5" fill="var(--color-ink)" />
          <rect x="92" y="90" width="130" height="10" rx="5" fill="var(--color-ink)" />
          <rect x="92" y="128" width="90" height="7" rx="3.5" fill={TELA.texto} />
        </g>
        {/* O verso: a resposta. Aparece virando. */}
        <g className="animar-virar-verso" style={{ animationDelay: '1.75s' } as CSSProperties}>
          <rect x="70" y="30" width="220" height="130" rx="12" fill="var(--color-brand-50)" stroke="var(--color-brand-200)" strokeWidth="1.5" />
          <rect x="92" y="50" width="52" height="7" rx="3.5" fill="var(--color-brand-700)" />
          <rect x="92" y="72" width="176" height="9" rx="4.5" fill="var(--color-ink)" />
          <rect x="92" y="88" width="150" height="9" rx="4.5" fill="var(--color-ink-soft)" />
          <rect x="92" y="104" width="164" height="9" rx="4.5" fill="var(--color-ink-soft)" />
        </g>

        {/* Errei / Lembrei — e o "lembrei" é o escolhido. */}
        <Pop atraso={2.3}>
          <rect x="70" y="174" width="104" height="30" rx="8" fill={TELA.fundo} stroke={TELA.linha} strokeWidth="1.5" />
          <rect x="102" y="186" width="40" height="7" rx="3.5" fill={TELA.texto} />
        </Pop>
        <Pop atraso={2.5}>
          <rect x="186" y="174" width="104" height="30" rx="8" fill={P.verde} />
          <path d="M206 189l4 4 8-9" stroke={P.creme} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="226" y="186" width="44" height="7" rx="3.5" fill={P.creme} />
        </Pop>
        {/* A data de volta. */}
        <Pop atraso={3.1}>
          <rect x="298" y="30" width="54" height="22" rx="11" fill={P.dourado} />
          <text x="325" y="45" fill={P.escuro} fontSize="10" fontWeight="700" textAnchor="middle" fontFamily={MONO}>
            +7 dias
          </text>
        </Pop>
      </Quadro>
    </Cena>
  );
}

/**
 * O percurso: três etapas num caminho que se traça, e o ponto da pessoa
 * andando da primeira para a segunda.
 */
export function CenaPercurso({ className = '' }: { className?: string }) {
  const marcos: Array<[number, number, string]> = [
    [60, 160, 'var(--color-brand-600)'],
    [180, 80, '#557a2f'],
    [300, 140, '#3178c6'],
  ];
  return (
    <Cena className={className}>
      <Quadro>
        <path
          d="M60 160C100 160 120 80 180 80S240 140 300 140"
          fill="none"
          stroke={TELA.linha}
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* O trecho andado: só até a etapa 2, onde a pessoa está. */}
        <path
          d="M60 160C100 160 120 80 180 80"
          fill="none"
          stroke="var(--color-brand-600)"
          strokeWidth="6"
          strokeLinecap="round"
          pathLength={1}
          className="animar-tracar"
          style={{ animationDelay: '0.3s' } as CSSProperties}
        />
        {marcos.map(([x, y, cor], i) => (
          <Pop key={i} atraso={0.2 + i * 0.5}>
            <circle cx={x} cy={y} r="20" fill={i === 0 ? cor : TELA.fundo} stroke={cor} strokeWidth="3" />
            <text
              x={x}
              y={y + 5}
              fill={i === 0 ? P.creme : cor}
              fontSize="14"
              fontWeight="800"
              textAnchor="middle"
              fontFamily={MONO}
            >
              {i + 1}
            </text>
            <rect x={x - 30} y={y + 30} width="60" height="7" rx="3.5" fill={TELA.texto} />
          </Pop>
        ))}
        {/* O ponto da pessoa anda da etapa 1 para a 2. */}
        <g
          className="animar-andar"
          style={
            {
              '--de-x': '0px',
              '--de-y': '0px',
              '--para-x': '120px',
              '--para-y': '-80px',
              animationDelay: '1.6s',
            } as CSSProperties
          }
        >
          <circle cx="60" cy="126" r="11" fill={P.dourado} />
          <circle cx="60" cy="122" r="4" fill={P.escuro} />
          <path d="M53 132c2-4 12-4 14 0" stroke={P.escuro} strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      </Quadro>
    </Cena>
  );
}

/**
 * O projeto: requisitos de um lado, código do outro, e cada critério de
 * aceitação fecha conforme o código cresce — até o "entregue".
 */
export function CenaProjeto({ className = '' }: { className?: string }) {
  const criterios = [0.9, 1.9, 2.9];
  return (
    <Cena className={className}>
      <Quadro>
        <JanelaClara x={8} y={10} w={150} h={200} />
        <rect x="24" y="52" width="70" height="7" rx="3.5" fill="var(--color-brand-700)" />
        {criterios.map((atraso, i) => (
          <g key={i}>
            <circle cx="32" cy={80 + i * 34} r="8" fill="none" stroke={TELA.linha} strokeWidth="2" />
            <rect x="48" y={76 + i * 34} width="94" height="8" rx="4" fill={TELA.texto} />
            <rect x="48" y={88 + i * 34} width="70" height="6" rx="3" fill={TELA.linha} />
            <Pop atraso={atraso}>
              <circle cx="32" cy={80 + i * 34} r="9" fill={P.verde} />
              <path
                d={`M28 ${80 + i * 34}l3 3 5-6`}
                stroke={P.creme}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Pop>
          </g>
        ))}
        <Pop atraso={3.4}>
          <rect x="24" y="180" width="118" height="20" rx="10" fill={P.verde} />
          <text x="83" y="194" fill={P.creme} fontSize="10" fontWeight="700" textAnchor="middle" fontFamily={MONO}>
            entregue
          </text>
        </Pop>

        <JanelaEscura x={166} y={10} w={186} h={200} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <text key={i} x="184" y={62 + i * 22} fill={EDITOR.apagado} fontSize="11" fontFamily={MONO}>
            {i + 1}
          </text>
        ))}
        <Barra x={200} y={53} w={40} h={10} cor={P.roxo} atraso={0.2} />
        <Barra x={246} y={53} w={70} h={10} cor={P.azulClaro} atraso={0.35} />
        <Barra x={212} y={75} w={90} h={10} cor={P.creme} atraso={0.6} />
        <Barra x={212} y={97} w={60} h={10} cor={P.dourado} atraso={1.2} />
        <Barra x={278} y={97} w={40} h={10} cor={P.creme} atraso={1.35} />
        <Barra x={212} y={119} w={100} h={10} cor={P.azulClaro} atraso={1.6} />
        <Barra x={212} y={141} w={50} h={10} cor={P.roxo} atraso={2.2} />
        <Barra x={268} y={141} w={60} h={10} cor={P.creme} atraso={2.4} />
        <Barra x={212} y={163} w={80} h={10} cor={P.dourado} atraso={2.7} />
        <Barra x={200} y={185} w={12} h={10} cor={P.creme} atraso={3.0} />
      </Quadro>
    </Cena>
  );
}
