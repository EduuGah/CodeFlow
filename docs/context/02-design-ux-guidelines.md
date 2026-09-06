# Diretrizes de Design, UX e UI (Anti-Slop)

## 1. Princípio Central
O design deve parecer um produto real criado por uma equipe cuidadosa. Deve nascer da função, contexto e usuário, **evitando estéticas genéricas de templates gerados por IA ("AI Slop")**. O layout deve ser consequência do conteúdo.

## 2. Padrões Proibidos (O que EVITAR)
- **Gradientes agressivos:** Sem fundos roxos/azuis ocupando áreas inteiras sem função. Sem textos com gradiente decorativo.
- **Estética "AI SaaS":** Evitar a combinação automática de fundo quase preto + roxo neon + textos brancos + ícones de varinha/estrela.
- **Excesso de Ícones e Cards:** Nem tudo precisa de um ícone ou estar dentro de um card com borda/sombra. Usar espaçamento e tipografia para hierarquia.
- **Bento Grids e Layouts Previsíveis:** Não usar bento grids sem necessidade real de compreensão do conteúdo. Evitar "3 cards lado a lado" com textos genéricos.
- **Bordas arredondadas e sombras exageradas:** Sem botões em formato de pílula sem contexto, sem sombras coloridas ou neon.
- **Glassmorphism inútil:** Sem blurs e transparências que não servem à usabilidade.
- **Tipografia "Startup Cliche":** Evitar escolhas automáticas de Inter, Geist, Space Grotesk só por moda. Escolher pares tipográficos com intenção (Geométricas, Humanistas, Serifa para contraste).
- **Copywriting Genérico:** Evitar "Transforme sua produtividade". Usar textos específicos e diretos.
- **Elementos Fictícios:** Sem depoimentos falsos, números inflados ou logos inventados.

## 3. Diretrizes de UX e Interação
- **Hierarquia Visual Real:** O usuário deve saber imediatamente: 1. Onde está, 2. Ação principal, 3. Informações secundárias.
- **Estados Obrigatórios:** Implementar Loading, Empty States (vazio), Erros, Sucesso, Sem Resultados, Offline. A interface nunca deve parecer quebrada.
- **Feedback de Ação:** Toda ação (Salvar, Rodar código, Excluir) precisa de feedback claro do andamento.
- **Formulários Acessíveis:** Labels claros, mensagens de erro pontuais, identificação de campos obrigatórios, navegação por teclado e foco visível.
- **Skeleton Loaders:** Usar skeletons estruturais em vez de spinners genéricos para grandes áreas.
- **Responsividade Verdadeira:** Repensar a navegação e o editor de código para Mobile/Tablet, não apenas reduzir tamanho.
- **Acessibilidade (a11y):** Contraste AA no mínimo, foco de teclado, não depender apenas da cor para indicar erros.

## 4. Animações
Devem ter um propósito claro (feedback, mudança de estado, orientação). Evitar todos os elementos pulando ou deslizando na tela sem motivo.
