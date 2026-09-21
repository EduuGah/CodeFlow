import type { ComponentType, CSSProperties } from 'react';

import { Barra, Cena, CenaPagina, EDITOR, JanelaClara, JanelaEscura, MONO, Pop, Quadro, TELA } from './Cena';
import { P } from './Ilustracao';

/**
 * Uma cena de abertura por trilha: o que a trilha ensina, num quadro.
 *
 * A faixa da trilha tinha a cor e o emblema; faltava a promessa. Cada cena
 * mostra a ideia central do assunto acontecendo — a variável guardando um
 * valor, o pedido indo e voltando, o erro apontado antes de rodar — na
 * mesma gramática das outras cenas (`Cena.tsx`). É interface, não aula: a
 * aula explica; isto só dá vontade de abrir.
 */

/** Variáveis: o valor entra na caixa com etiqueta, e o programa lê dela. */
function CenaVariaveis() {
  const caixas: Array<[string, string, string]> = [
    ['total', '5', P.dourado],
    ['nome', '"Ana"', P.azulClaro],
    ['ativo', 'true', P.roxo],
  ];
  return (
    <Cena>
      <Quadro>
        <JanelaEscura x={8} y={10} w={344} h={92} />
        <text x="30" y="60" fill={EDITOR.apagado} fontSize="11" fontFamily={MONO}>
          1
        </text>
        <text x="30" y="82" fill={EDITOR.apagado} fontSize="11" fontFamily={MONO}>
          2
        </text>
        <Barra x={52} y={51} w={28} h={10} cor={P.roxo} atraso={0.2} />
        <Barra x={86} y={51} w={40} h={10} cor={P.azulClaro} atraso={0.35} />
        <Barra x={132} y={51} w={10} h={10} cor={P.creme} atraso={0.5} />
        <Barra x={148} y={51} w={44} h={10} cor={P.dourado} atraso={0.6} />
        <Barra x={52} y={73} w={70} h={10} cor={P.creme} atraso={1.0} />
        <Barra x={128} y={73} w={40} h={10} cor={P.azulClaro} atraso={1.15} />

        {/* As caixas da memória, cada uma com a etiqueta e o valor. */}
        {caixas.map(([nome, valor, cor], i) => (
          <g key={nome}>
            <rect x={24 + i * 112} y="120" width="100" height="72" rx="10" fill={TELA.fundo} stroke={TELA.linha} strokeWidth="1.5" />
            <rect x={24 + i * 112} y="120" width="100" height="22" rx="10" fill={cor} />
            <rect x={24 + i * 112} y="132" width="100" height="10" fill={cor} />
            <text x={74 + i * 112} y="135" fill={P.escuro} fontSize="10" fontWeight="700" textAnchor="middle" fontFamily={MONO}>
              {nome}
            </text>
            <Pop atraso={0.8 + i * 0.5}>
              <text x={74 + i * 112} y="176" fill="var(--color-ink)" fontSize="18" fontWeight="800" textAnchor="middle" fontFamily={MONO}>
                {valor}
              </text>
            </Pop>
          </g>
        ))}
        {/* A linha 2 lê a caixa: uma seta da caixa para o código. */}
        <Pop atraso={2.4}>
          <path d="M74 118V96" stroke={P.dourado} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 4" fill="none" />
          <path d="M70 100l4-5 4 5" stroke={P.dourado} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Pop>
      </Quadro>
    </Cena>
  );
}

/** Lógica: o problema grande vira três passos, e cada passo fecha. */
function CenaLogica() {
  return (
    <Cena>
      <Quadro>
        <JanelaClara x={8} y={10} w={344} h={200} />
        {/* O problema, inteiro. */}
        <rect x="90" y="50" width="180" height="30" rx="8" fill="var(--color-ink)" />
        <rect x="108" y="61" width="144" height="8" rx="4" fill={TELA.fundo} opacity={0.85} />
        {/* As linhas que descem para os passos. */}
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M180 80V96H${70 + i * 110}V112`}
            fill="none"
            stroke={TELA.linha}
            strokeWidth="2.5"
            pathLength={1}
            className="animar-tracar"
            style={{ animationDelay: `${0.4 + i * 0.2}s` } as CSSProperties}
          />
        ))}
        {/* Os três passos. */}
        {[0, 1, 2].map((i) => (
          <Pop key={i} atraso={0.9 + i * 0.35}>
            <rect x={24 + i * 110} y="112" width="92" height="56" rx="8" fill={TELA.sunken} />
            <text x={38 + i * 110} y="132" fill="var(--color-brand-700)" fontSize="11" fontWeight="800" fontFamily={MONO}>
              {i + 1}
            </text>
            <rect x={50 + i * 110} y="125" width="52" height="7" rx="3.5" fill="var(--color-ink)" />
            <rect x={38 + i * 110} y="142" width="64" height="6" rx="3" fill={TELA.texto} />
            <rect x={38 + i * 110} y="153" width="44" height="6" rx="3" fill={TELA.linha} />
          </Pop>
        ))}
        {/* E cada passo resolvido. */}
        {[0, 1, 2].map((i) => (
          <Pop key={i} atraso={2.2 + i * 0.4}>
            <circle cx={104 + i * 110} cy="122" r="8" fill={P.verde} />
            <path d={`M100 122l3 3 5-6`} transform={`translate(${i * 110} 0)`} stroke={P.creme} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Pop>
        ))}
        <rect x="24" y="186" width="120" height="7" rx="3.5" fill={TELA.linha} />
      </Quadro>
    </Cena>
  );
}

/** Web: o pedido sai do navegador, chega ao servidor, e a resposta volta. */
function CenaWeb() {
  const ida = { '--de-x': '0px', '--para-x': '100px', animationDelay: '0.4s', animationDuration: '1s' } as CSSProperties;
  const volta = { '--de-x': '0px', '--para-x': '-150px', animationDelay: '2.1s', animationDuration: '1s' } as CSSProperties;
  return (
    <Cena>
      <Quadro>
        {/* O navegador. */}
        <JanelaClara x={8} y={40} w={140} h={150} />
        <Pop atraso={3.3}>
          <rect x="24" y="84" width="80" height="10" rx="5" fill="var(--color-ink)" />
          <rect x="24" y="102" width="108" height="7" rx="3.5" fill={TELA.texto} />
          <rect x="24" y="115" width="96" height="7" rx="3.5" fill={TELA.linha} />
          <rect x="24" y="128" width="104" height="7" rx="3.5" fill={TELA.linha} />
          <rect x="24" y="150" width="56" height="20" rx="7" fill="var(--color-brand-600)" />
        </Pop>

        {/* O servidor: uma torre com os discos. */}
        <rect x="262" y="52" width="90" height="126" rx="10" fill={EDITOR.fundo} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="276" y={66 + i * 36} width="62" height="24" rx="5" fill={EDITOR.barra} />
            <circle cx="288" cy={78 + i * 36} r="3.5" fill={i === 1 ? P.verde : EDITOR.apagado} />
            <rect x="298" y={75 + i * 36} width="30" height="6" rx="3" fill={EDITOR.apagado} />
          </g>
        ))}

        {/* O fio. */}
        <path d="M150 116H260" stroke={TELA.linha} strokeWidth="3" strokeDasharray="4 6" strokeLinecap="round" />

        {/* O pedido vai, e some ao chegar; o servidor acende. */}
        <g className="animar-virar-frente" style={{ animationDelay: '1.5s' } as CSSProperties}>
          <g className="animar-andar" style={ida}>
            <rect x="150" y="96" width="70" height="20" rx="10" fill="var(--color-brand-600)" />
            <text x="185" y="110" fill={P.creme} fontSize="10" fontWeight="700" textAnchor="middle" fontFamily={MONO}>
              GET /aulas
            </text>
          </g>
        </g>
        <Pop atraso={1.6}>
          <circle cx="288" cy="114" r="5" fill={P.verde} />
        </Pop>
        {/* A resposta só existe depois do pedido; volta, e some ao chegar. */}
        <g className="animar-virar-verso" style={{ animationDelay: '1.9s' } as CSSProperties}>
          <g className="animar-virar-frente" style={{ animationDelay: '3.2s' } as CSSProperties}>
            <g className="animar-andar" style={volta}>
              <rect x="190" y="122" width="70" height="20" rx="10" fill={P.verde} />
              <text x="225" y="136" fill={P.creme} fontSize="10" fontWeight="700" textAnchor="middle" fontFamily={MONO}>
                200 OK
              </text>
            </g>
          </g>
        </g>
      </Quadro>
    </Cena>
  );
}

/** TypeScript: o erro aparece sublinhado antes de rodar, e some ao corrigir. */
function CenaTipos() {
  return (
    <Cena>
      <Quadro>
        <JanelaEscura x={8} y={10} w={344} h={200} />
        {[0, 1, 2].map((i) => (
          <text key={i} x="30" y={62 + i * 22} fill={EDITOR.apagado} fontSize="11" fontFamily={MONO}>
            {i + 1}
          </text>
        ))}
        <Barra x={52} y={53} w={56} h={10} cor={P.roxo} atraso={0.2} />
        <Barra x={114} y={53} w={50} h={10} cor={P.azulClaro} atraso={0.35} />
        <Barra x={170} y={53} w={18} h={10} cor={P.creme} atraso={0.45} />
        <text x="196" y="62" fill={P.teal} fontSize="11" fontWeight="700" fontFamily={MONO} className="animar-digitar" style={{ animationDelay: '0.55s', transformBox: 'fill-box' } as CSSProperties}>
          : number
        </text>
        <Barra x={52} y={75} w={90} h={10} cor={P.creme} atraso={0.9} />
        <Barra x={148} y={75} w={12} h={10} cor={P.creme} atraso={1.0} />
        {/* O valor errado: uma string onde se esperava número. */}
        <g className="animar-virar-frente" style={{ animationDelay: '3.6s' } as CSSProperties}>
          <Barra x={166} y={75} w={40} h={10} cor={P.dourado} atraso={1.1} />
          <Pop atraso={1.6}>
            <path d="M166 89q5-4 10 0t10 0 10 0 10 0" fill="none" stroke={P.vermelho} strokeWidth="2" strokeLinecap="round" />
          </Pop>
        </g>
        {/* O aviso, antes de rodar. */}
        <g className="animar-virar-frente" style={{ animationDelay: '3.6s' } as CSSProperties}>
          <Pop atraso={2.0}>
            <rect x="24" y="118" width="312" height="42" rx="8" fill="#33191a" />
            <circle cx="42" cy="139" r="7" fill={P.vermelho} />
            <path d="M39 136l6 6M45 136l-6 6" stroke={P.creme} strokeWidth="2" strokeLinecap="round" />
            <text x="58" y="136" fill="#f2a496" fontSize="10" fontFamily={MONO}>
              esperava number, veio string
            </text>
            <text x="58" y="151" fill="#f2a496" fontSize="10" fontFamily={MONO} opacity={0.75}>
              linha 2 — antes de rodar
            </text>
          </Pop>
        </g>
        {/* Corrigido: o valor certo, e nada a apontar. */}
        <g className="animar-virar-verso" style={{ animationDelay: '3.9s' } as CSSProperties}>
          <rect x="166" y="75" width="24" height="10" rx="5" fill={P.azulClaro} />
        </g>
        <Pop atraso={4.3}>
          <rect x="24" y="118" width="312" height="30" rx="8" fill={EDITOR.painel} />
          <circle cx="42" cy="133" r="7" fill={P.verde} />
          <path d="M38 133l3 3 5-6" stroke={P.creme} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="58" y="137" fill={EDITOR.verde} fontSize="10" fontFamily={MONO}>
            sem erros de tipo
          </text>
        </Pop>
      </Quadro>
    </Cena>
  );
}

/** React: o estado muda, a tela muda junto. */
function CenaComponente() {
  return (
    <Cena>
      <Quadro>
        <JanelaEscura x={8} y={10} w={176} h={200} />
        {[0, 1, 2, 3].map((i) => (
          <text key={i} x="26" y={62 + i * 22} fill={EDITOR.apagado} fontSize="11" fontFamily={MONO}>
            {i + 1}
          </text>
        ))}
        <Barra x={44} y={53} w={30} h={10} cor={P.roxo} atraso={0.2} />
        <Barra x={80} y={53} w={70} h={10} cor={P.azulClaro} atraso={0.35} />
        <text x="44" y="84" fill={P.creme} fontSize="10" fontFamily={MONO} className="animar-digitar" style={{ animationDelay: '0.7s', transformBox: 'fill-box' } as CSSProperties}>
          const [n, setN]
        </text>
        <Barra x={56} y={97} w={60} h={10} cor={P.laranja} atraso={1.0} />
        <Barra x={122} y={97} w={40} h={10} cor={P.creme} atraso={1.15} />
        <Barra x={56} y={119} w={90} h={10} cor={P.laranja} atraso={1.4} />

        {/* A tela: o contador e o botão. */}
        <JanelaClara x={192} y={10} w={160} h={200} />
        <rect x="210" y="52" width="60" height="7" rx="3.5" fill={TELA.texto} />
        {['0', '1', '2'].map((n, i) => (
          <g key={n} className={i < 2 ? 'animar-virar-frente' : undefined} style={{ animationDelay: `${2.2 + i * 0.9}s` } as CSSProperties}>
            <g className={i > 0 ? 'animar-virar-verso' : undefined} style={{ animationDelay: `${1.4 + i * 0.9}s` } as CSSProperties}>
              <text x="272" y="118" fill="var(--color-ink)" fontSize="44" fontWeight="800" textAnchor="middle" fontFamily={MONO}>
                {n}
              </text>
            </g>
          </g>
        ))}
        <rect x="222" y="146" width="100" height="30" rx="9" fill="var(--color-brand-600)" />
        <text x="272" y="166" fill={P.creme} fontSize="13" fontWeight="800" textAnchor="middle" fontFamily={MONO}>
          +1
        </text>
        {/* O toque no botão, duas vezes. */}
        {[2.0, 2.9].map((atraso) => (
          <g key={atraso} className="animar-pop" style={{ animationDelay: `${atraso}s`, transformBox: 'fill-box', transformOrigin: 'center' } as CSSProperties}>
            <circle cx="300" cy="170" r="10" fill={P.dourado} opacity={0.75} />
          </g>
        ))}
      </Quadro>
    </Cena>
  );
}

/** SQL: a consulta é escrita e a tabela responde, linha a linha. */
function CenaConsulta() {
  const linhas: Array<[string, string, string]> = [
    ['Ana', 'JS', '9,5'],
    ['Bia', 'SQL', '8,0'],
    ['Caio', 'React', '7,5'],
  ];
  return (
    <Cena>
      <Quadro>
        <JanelaEscura x={8} y={10} w={344} h={76} />
        <text x="24" y="60" fill={P.roxo} fontSize="11" fontWeight="700" fontFamily={MONO} className="animar-digitar" style={{ animationDelay: '0.2s', transformBox: 'fill-box' } as CSSProperties}>
          SELECT
        </text>
        <Barra x={74} y={52} w={70} h={10} cor={P.azulClaro} atraso={0.45} />
        <text x="152" y="60" fill={P.roxo} fontSize="11" fontWeight="700" fontFamily={MONO} className="animar-digitar" style={{ animationDelay: '0.7s', transformBox: 'fill-box' } as CSSProperties}>
          FROM
        </text>
        <Barra x={188} y={52} w={44} h={10} cor={P.dourado} atraso={0.9} />
        <text x="240" y="60" fill={P.roxo} fontSize="11" fontWeight="700" fontFamily={MONO} className="animar-digitar" style={{ animationDelay: '1.1s', transformBox: 'fill-box' } as CSSProperties}>
          WHERE
        </text>
        <Barra x={286} y={52} w={50} h={10} cor={P.creme} atraso={1.3} />

        {/* A tabela que responde. */}
        <rect x="8" y="98" width="344" height="112" rx="10" fill={TELA.fundo} stroke={TELA.linha} strokeWidth="1.5" />
        <rect x="9" y="99" width="342" height="24" rx="9" fill={TELA.sunken} />
        <rect x="9" y="112" width="342" height="11" fill={TELA.sunken} />
        {['nome', 'trilha', 'nota'].map((c, i) => (
          <text key={c} x={28 + i * 110} y="116" fill={TELA.texto} fontSize="10" fontWeight="700" fontFamily={MONO}>
            {c}
          </text>
        ))}
        {linhas.map((linha, i) => (
          <Pop key={i} atraso={1.9 + i * 0.35}>
            <path d={`M9 ${150 + i * 26}H351`} stroke={TELA.linha} strokeWidth="1" />
            {linha.map((v, j) => (
              <text key={j} x={28 + j * 110} y={142 + i * 26} fill="var(--color-ink)" fontSize="11" fontFamily={MONO}>
                {v}
              </text>
            ))}
          </Pop>
        ))}
        <Pop atraso={3.1}>
          <rect x="280" y="102" width="62" height="18" rx="9" fill={P.verde} />
          <text x="311" y="114.5" fill={P.creme} fontSize="10" fontWeight="700" textAnchor="middle" fontFamily={MONO}>
            3 linhas
          </text>
        </Pop>
      </Quadro>
    </Cena>
  );
}

/** Node: o servidor lê a rota, monta a resposta, e o pedido volta com o JSON. */
function CenaApi() {
  return (
    <Cena>
      <Quadro>
        <JanelaEscura x={8} y={10} w={344} h={120} />
        {[0, 1, 2].map((i) => (
          <text key={i} x="26" y={58 + i * 22} fill={EDITOR.apagado} fontSize="11" fontFamily={MONO}>
            {i + 1}
          </text>
        ))}
        <text x="44" y="58" fill={P.creme} fontSize="11" fontFamily={MONO} className="animar-digitar" style={{ animationDelay: '0.2s', transformBox: 'fill-box' } as CSSProperties}>
          app.get(<tspan fill={P.dourado}>'/aulas'</tspan>, (req, res) =&gt; {'{'}
        </text>
        <Barra x={60} y={71} w={40} h={10} cor={P.roxo} atraso={0.7} />
        <Barra x={106} y={71} w={110} h={10} cor={P.azulClaro} atraso={0.85} />
        <text x="60" y="102" fill={P.creme} fontSize="11" fontFamily={MONO} className="animar-digitar" style={{ animationDelay: '1.1s', transformBox: 'fill-box' } as CSSProperties}>
          res.<tspan fill={P.azulClaro}>json</tspan>(aulas)
        </text>

        {/* O pedido, o servidor, a resposta. */}
        <Pop atraso={1.8}>
          <rect x="8" y="146" width="124" height="26" rx="13" fill="var(--color-brand-600)" />
          <text x="70" y="163" fill={P.creme} fontSize="11" fontWeight="700" textAnchor="middle" fontFamily={MONO}>
            GET /aulas
          </text>
        </Pop>
        <path d="M136 159h44" stroke={TELA.linha} strokeWidth="3" strokeDasharray="4 5" strokeLinecap="round" />
        <Pop atraso={2.3}>
          <circle cx="205" cy="159" r="18" fill={EDITOR.fundo} />
          <rect x="197" y="150" width="16" height="4" rx="1.5" fill={EDITOR.apagado} />
          <rect x="197" y="157" width="16" height="4" rx="1.5" fill={EDITOR.apagado} />
          <rect x="197" y="164" width="16" height="4" rx="1.5" fill={P.verde} />
        </Pop>
        <path d="M228 159h44" stroke={TELA.linha} strokeWidth="3" strokeDasharray="4 5" strokeLinecap="round" />
        <Pop atraso={2.9}>
          <rect x="276" y="140" width="76" height="40" rx="10" fill={P.verde} />
          <text x="314" y="157" fill={P.creme} fontSize="11" fontWeight="800" textAnchor="middle" fontFamily={MONO}>
            200
          </text>
          <text x="314" y="172" fill={P.creme} fontSize="10" textAnchor="middle" fontFamily={MONO}>
            [{'{'}…{'}'}, {'{'}…{'}'}]
          </text>
        </Pop>
        <rect x="8" y="192" width="180" height="7" rx="3.5" fill={TELA.linha} />
      </Quadro>
    </Cena>
  );
}

/** Engenharia: o arquivo que faz tudo vira pastas — e cada coisa acha o seu lugar. */
function CenaEngenharia() {
  const pastas: Array<[string, string, string]> = [
    ['rotas/', 'pedidos.js', P.azul],
    ['servicos/', 'pedidos.js', P.verdeEscuro],
    ['dados/', 'pedidos.js', P.roxo],
  ];
  return (
    <Cena>
      <Quadro>
        {/* O arquivo comprido, com tudo dentro. */}
        <JanelaEscura x={8} y={10} w={126} h={200} />
        <text x="26" y="52" fill={P.creme} fontSize="10" fontFamily={MONO}>
          app.js
        </text>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <Barra
            key={i}
            x={26}
            y={62 + i * 13}
            w={i % 4 === 0 ? 70 : i % 3 === 0 ? 40 : 90}
            h={6}
            cor={i % 4 === 0 ? P.azulClaro : i % 3 === 0 ? P.dourado : EDITOR.apagado}
            atraso={0.1 + i * 0.06}
          />
        ))}
        {/* A seta: separar. */}
        <path
          d="M146 110h40"
          fill="none"
          stroke={TELA.linha}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="4 5"
          pathLength={1}
          className="animar-tracar"
          style={{ animationDelay: '1s' } as CSSProperties}
        />
        {/* As pastas, cada uma com o seu arquivo. */}
        <JanelaClara x={196} y={10} w={156} h={200} />
        <text x="212" y="52" fill={TELA.texto} fontSize="9" fontWeight="700" fontFamily={MONO}>
          servidor.js
        </text>
        {pastas.map(([pasta, arquivo, cor], i) => (
          <Pop key={pasta} atraso={1.4 + i * 0.4}>
            <path d={`M212 ${66 + i * 44}h10l2 3h14v9a2 2 0 0 1-2 2h-22a2 2 0 0 1-2-2z`} fill={cor} />
            <text x="244" y={77 + i * 44} fill="var(--color-ink)" fontSize="10" fontWeight="700" fontFamily={MONO}>
              {pasta}
            </text>
            <rect x="228" y={86 + i * 44} width="10" height="12" rx="2" fill={TELA.sunken} stroke={TELA.linha} strokeWidth="1" />
            <text x="244" y={96 + i * 44} fill={TELA.texto} fontSize="9" fontFamily={MONO}>
              {arquivo}
            </text>
          </Pop>
        ))}
        <rect x="212" y="192" width="90" height="6" rx="3" fill={TELA.linha} />
      </Quadro>
    </Cena>
  );
}

/** Projeto final: a página pede, a API decide, o banco responde — e a lista aparece. */
function CenaAplicacao() {
  return (
    <Cena>
      <Quadro>
        {/* A página, com a lista que vai encher. */}
        <JanelaClara x={8} y={22} w={132} h={176} />
        <text x="24" y="66" fill="var(--color-ink)" fontSize="10" fontWeight="800">
          Minhas tarefas
        </text>
        {[0, 1, 2].map((i) => (
          <Pop key={i} atraso={3.2 + i * 0.3}>
            <rect x="24" y={78 + i * 24} width="10" height="10" rx="3" fill={i === 2 ? P.verde : TELA.linha} />
            <rect x="40" y={80 + i * 24} width={i === 1 ? 70 : 84} height="6" rx="3" fill="var(--color-ink)" opacity={0.8} />
          </Pop>
        ))}
        <rect x="24" y="160" width="100" height="18" rx="9" fill="var(--color-brand-600)" />
        <rect x="40" y="167" width="68" height="4" rx="2" fill={P.creme} />

        {/* A API no meio. */}
        <Pop atraso={1.2}>
          <rect x="164" y="88" width="64" height="44" rx="12" fill={EDITOR.fundo} />
          <text x="196" y="106" fill={P.creme} fontSize="9" fontWeight="700" textAnchor="middle" fontFamily={MONO}>
            GET
          </text>
          <text x="196" y="121" fill={P.azulClaro} fontSize="9" textAnchor="middle" fontFamily={MONO}>
            /tarefas
          </text>
        </Pop>

        {/* O banco à direita. */}
        <Pop atraso={2}>
          <ellipse cx="308" cy="82" rx="30" ry="10" fill={P.roxo} />
          <path d="M278 82v46c0 5.5 13.4 10 30 10s30-4.5 30-10V82c0 5.5-13.4 10-30 10s-30-4.5-30-10z" fill={P.roxo} opacity={0.85} />
          <text x="308" y="118" fill={P.creme} fontSize="9" fontWeight="700" textAnchor="middle" fontFamily={MONO}>
            tarefas
          </text>
        </Pop>

        {/* O pedido vai, a resposta volta. */}
        {[
          ['M142 104h20', 0.6],
          ['M230 104h46', 1.6],
          ['M276 116h-46', 2.4],
          ['M162 116h-20', 2.9],
        ].map(([d, atraso], i) => (
          <path
            key={i}
            d={d as string}
            fill="none"
            stroke={i < 2 ? 'var(--color-brand-600)' : P.verde}
            strokeWidth="3"
            strokeLinecap="round"
            pathLength={1}
            className="animar-tracar"
            style={{ animationDelay: `${atraso}s` } as CSSProperties}
          />
        ))}
      </Quadro>
    </Cena>
  );
}

/** Testes: o assert é escrito, e os vereditos aparecem um a um — dois certos, um pego. */
function CenaTestes() {
  const linhas: Array<[boolean, number]> = [
    [true, 1.6],
    [true, 2.0],
    [false, 2.4],
  ];
  return (
    <Cena>
      <Quadro>
        <JanelaEscura x={8} y={10} w={344} h={90} />
        <text x="26" y="52" fill={EDITOR.apagado} fontSize="11" fontFamily={MONO}>
          1
        </text>
        <text
          x="44"
          y="52"
          fill={P.creme}
          fontSize="11"
          fontFamily={MONO}
          className="animar-digitar"
          style={{ animationDelay: '0.2s', transformBox: 'fill-box' } as CSSProperties}
        >
          assert(<tspan fill={P.azulClaro}>somar([2, 3])</tspan> === <tspan fill={P.dourado}>5</tspan>);
        </text>
        <text x="26" y="76" fill={EDITOR.apagado} fontSize="11" fontFamily={MONO}>
          2
        </text>
        <Barra x={44} y={69} w={150} h={10} cor={P.verdeEscuro} atraso={1.2} />

        <JanelaClara x={8} y={112} w={344} h={98} />
        <text x="26" y="136" fill={TELA.texto} fontSize="9" fontWeight="700" fontFamily={MONO}>
          VEREDITO
        </text>
        {linhas.map(([ok, atraso], i) => (
          <Pop key={i} atraso={atraso}>
            <circle cx="30" cy={156 + i * 22} r="8" fill={ok ? P.verde : P.vermelho} />
            {ok ? (
              <path
                d={`M26 ${156 + i * 22}l3 3 5-6`}
                stroke={P.creme}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ) : (
              <path
                d={`M27 ${153 + i * 22}l6 6M33 ${153 + i * 22}l-6 6`}
                stroke={P.creme}
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            )}
            <rect x="46" y={150 + i * 22} width={ok ? 130 : 90} height="7" rx="3.5" fill={TELA.linha} />
          </Pop>
        ))}
      </Quadro>
    </Cena>
  );
}

const CENAS: Record<string, ComponentType> = {
  'track-js-fundamentos': CenaVariaveis,
  'track-logica': CenaLogica,
  'track-web': CenaWeb,
  'track-pagina': CenaPagina,
  'track-typescript': CenaTipos,
  'track-react': CenaComponente,
  'track-sql': CenaConsulta,
  'track-node': CenaApi,
  'track-engenharia': CenaEngenharia,
  'track-projeto': CenaAplicacao,
  'track-testes': CenaTestes,
};

/** A cena de abertura da trilha, ou nada — uma trilha nova sem cena não quebra. */
export function cenaDaTrilha(trackId: string): ComponentType | undefined {
  return CENAS[trackId];
}
