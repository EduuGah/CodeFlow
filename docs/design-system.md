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

| Papel | Onde aparece | Por quê |
|---|---|---|
| **Neutro** (zinc) | superfícies, texto, ação primária | Botão principal é `zinc-900`, não azul. Isso libera a cor para comunicar estado, e o botão se destaca por contraste em vez de saturação. |
| **Sucesso** (emerald) | teste passou, aula concluída, projeto entregue | O único "verde" do produto. |
| **Atenção** (amber) | dica revelada, "ainda não é essa" | Deliberadamente **não é vermelho**: errar durante o aprendizado é etapa, não falha. Pintar de vermelho uma tentativa honesta desmotiva. |
| **Erro** (red) | erro de sintaxe, execução quebrada, login negado | Reservado a falha real do sistema ou do código, nunca a uma resposta errada de exercício. |
| **Tutor** (indigo) | apenas a interface do Tutor IA | Único acento não semântico. Existe para o aluno distinguir à primeira vista o que é a plataforma do que é a IA falando. |

Editor e terminal têm fundo escuro fixo (`--color-editor`, `--color-terminal`),
independente do resto da interface — código se lê melhor assim, e a mudança de
superfície sinaliza "aqui você executa".

## Tipografia

- **Plus Jakarta Sans** para interface e texto. Humanista geométrica, confortável
  em leitura longa e com algarismos bem diferenciados, o que importa numa
  plataforma cheia de índices, contagens e valores.
- **JetBrains Mono** para código, com ligaduras desligadas: `=>` e `!==` devem se
  parecer com o que o aluno digita, não com um glifo único.

Nenhuma das duas foi escolhida por moda — o `02-design-ux-guidelines.md` §2 pede
explicitamente para evitar Inter, Geist e Space Grotesk como escolha automática.

## Raios e sombras

Escala contida: `sm` 4px, `md` 6px, `lg` 8px, `xl` 12px. Sem formato de pílula
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

Modal, Toast, Tabs e Tooltip **não existem** de propósito: nada os usa hoje. São
criados quando uma tela precisar, não antes.

## Acessibilidade

- Foco visível global via `:focus-visible`, com anel de 2px e deslocamento. Só na
  navegação por teclado, então o clique de mouse não fica poluído.
- Estado nunca depende só de cor: todo `Badge` e todo retorno de exercício trazem
  texto ou ícone junto.
- `prefers-reduced-motion` desliga animações e transições.
- Contraste mínimo AA para texto sobre as superfícies definidas aqui.

## O que evitar

Vale relembrar do documento de diretrizes, porque são os erros que mais reaparecem:

- botão que não faz nada — ausência é melhor que clique morto
- card só para agrupar visualmente o que espaçamento já resolveria
- ícone decorativo sem relação com a ação
- estado prometido que não existe ("desbloqueie completando a Lição 3" sem sistema de desbloqueio)
