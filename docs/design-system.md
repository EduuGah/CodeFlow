# Design System do CodeFlow

Referência das decisões visuais. Os valores vivem em [`src/client/index.css`](../src/client/index.css);
este documento explica **por que** cada um é o que é, para as próximas telas não
recomeçarem a discussão do zero.

Complementa o `docs/context/02-design-ux-guidelines.md`, que define os princípios.
Aqui está a aplicação concreta deles.

## Princípio que organiza tudo

**Cor carrega significado, não decoração.**

O neutro sustenta a interface inteira. Cada acento existe porque o aluno precisa
distinguir um estado do outro em meio a texto e código — não porque a tela
ficaria bonita com mais cor. Quando uma seção nova pedir "uma cor pra destacar",
a resposta padrão é espaçamento e tipografia.

## Cores

A base **não é branco puro**. `--color-canvas` é uma pedra levemente quente, que
reduz o contraste agressivo do branco em sessões longas de leitura e dá ao
conteúdo um fundo com temperatura.

| Papel | Token | Onde aparece | Por quê |
|---|---|---|---|
| **Superfície** | `canvas`, `surface`, `sunken` | fundo da aplicação, cartões, áreas rebaixadas | Três níveis bastam para hierarquia. O quarto viraria decoração. |
| **Texto** | `ink`, `ink-soft`, `ink-faint` | corpo, secundário, metadado | O tom escuro puxa para o verde-azulado, então casa com a marca em vez de brigar. |
| **Marca** | `brand-*` (teal) | ação primária, foco, item ativo | Ferramentas de programação quase sempre puxam para o azul de SaaS. O teal fica no campo técnico sem ser mais um deles. |
| **Energia** | `energy-*` (âmbar) | sequência, dica, "ainda não é essa" | Deliberadamente **não é vermelho**: errar durante o aprendizado é etapa, não falha. |
| **Sucesso** | `success-*` | teste passou, aula concluída, projeto entregue | Distinto da marca de propósito. Se o verde da ação primária fosse o do acerto, o aluno não saberia se um elemento é botão ou estado. |
| **Erro** | `danger-*` | erro de sintaxe, execução quebrada, login negado | Falha real de código ou sistema, nunca resposta errada de exercício. |
| **Controle** | `control` | borda de campo | Existe separado de `line` por causa do contraste — ver a seção de acessibilidade. |

Editor e terminal têm fundo escuro fixo (`--color-editor`, `--color-terminal`),
independente do resto da interface — código se lê melhor assim, e a mudança de
superfície sinaliza "aqui você executa".

## Tipografia

- **Plus Jakarta Sans** para interface e texto. Humanista geométrica, confortável
  em leitura longa e com algarismos bem diferenciados, o que importa numa
  plataforma cheia de índices, contagens e valores.
- **JetBrains Mono** para código **e para os rótulos estruturais**, via a classe
  `.label-mono`. É ela que dá o sotaque do produto: contadores de etapa, nomes de
  seção e metadados. Nunca texto corrido — a personalidade vem do uso deliberado,
  não de enfeite de terminal na interface.

Nenhuma das duas foi escolhida por moda — o `02-design-ux-guidelines.md` §2 pede
explicitamente para evitar Inter, Geist e Space Grotesk como escolha automática.

## Raios e sombras

Escala contida: `sm` 4px, `md` 8px, `lg` 12px, `xl` 16px. Sem formato de pílula
sem contexto e sem sombra colorida. Profundidade vem de borda e espaçamento;
sombra só onde há sobreposição real.

## Componentes

| Componente | Quando usar |
|---|---|
| `Button` | `primary` para a ação principal da tela — uma por tela. `outline` e `ghost` para secundárias. |
| `Badge` | Rótulo curto de estado ou categoria. **Sempre com texto**: estado indicado só por cor exclui quem não a distingue. |
| `ProgressBar` | Progresso mensurável. Exige `label` porque o valor precisa ser anunciável, não apenas visível. |
| `EmptyState` | Lista vazia. Diz o que está vazio **e** o que muda isso. |
| `ErrorState` | Falha recuperável. Mensagem sem jargão, detalhe técnico escondido atrás de `<details>`. |
| `Skeleton` | Carregamento de área grande, com a forma do conteúdo que vai chegar. Spinner só para ações pontuais. |

| `Icon` | Conjunto próprio em SVG inline. Grade de 24, traço 1.75, geometria simples, metáforas de código. Sem biblioteca externa: um ícone de pacote popular faz o produto parecer qualquer outro. |

Modal, Toast, Tabs e Tooltip **não existem** de propósito: nada os usa hoje. São
criados quando uma tela precisar, não antes.

## Acessibilidade

- Foco visível global via `:focus-visible`, com anel de 2px e deslocamento. Só na
  navegação por teclado, então o clique de mouse não fica poluído.
- Estado nunca depende só de cor: todo `Badge` e todo retorno de exercício trazem
  texto ou ícone junto.
- `prefers-reduced-motion` desliga animações e transições.

### Contraste é testado, não conferido

`src/client/lib/contrast.test.ts` lê os tokens direto deste arquivo de estilo e
reprova qualquer par abaixo do mínimo da WCAG AA. Rodar `npm test` verifica a
paleta.

Ele existe porque contraste quebra em silêncio. Numa migração de cores um
`text-zinc-400` virou `text-ink-faint` sobre uma superfície escura: nada falhou,
o typecheck passou, e o texto ficou ilegível só para quem depende do contraste.

Dois limites, e a distinção entre eles importa:

| O quê | Mínimo |
|---|---|
| Texto | 4,5:1 |
| Texto grande, ícone e contorno que **identifica um controle** | 3:1 |

Divisória entre itens de lista é decoração e não entra na segunda linha — cobrar
3:1 dela produziria uma interface listrada. Por isso `--color-control` existe
separado de `--color-line`: a borda de um campo precisa ser perceptível, a linha
entre dois itens não.

Ao acrescentar uma combinação nova de cores à interface, acrescente também a
linha correspondente no teste. Um par não listado não é verificado.

## O que evitar

Vale relembrar do documento de diretrizes, porque são os erros que mais reaparecem:

- botão que não faz nada — ausência é melhor que clique morto
- card só para agrupar visualmente o que espaçamento já resolveria
- ícone decorativo sem relação com a ação
- estado prometido que não existe ("desbloqueie completando a Lição 3" sem sistema de desbloqueio)
