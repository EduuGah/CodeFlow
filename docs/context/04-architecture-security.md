# Arquitetura, Engenharia e Segurança

## 1. Stack Tecnológica Base
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS (Customizado, sem templates pesados).
- **Backend:** Node.js, Express, TypeScript.
- **Banco de Dados:** PostgreSQL (Cloud SQL via AI Studio) com Drizzle ORM ou Prisma.
- **Autenticação:** Sistema seguro (Hashing, Tokens, ou Firebase Auth se aprovado), RBAC.

## 2. Regras de Arquitetura e Código
- **Organização Profissional:** Pastas separadas por domínio (Components, Features, Layouts, Hooks, Services).
- **Desacoplamento:** O conteúdo didático deve ser separado da lógica da aplicação (estrutura de CMS interno ou banco relacional bem modelado).
- **Qualidade de Código:** Componentes pequenos, DRY (Don't Repeat Yourself), testes unitários e de integração essenciais, tratamento global de erros.

## 3. Execução Segura de Código (Sandbox)
*Criticamente Importante:* Nunca executar código submetido pelo usuário diretamente no backend sem isolamento.
- **Estratégia para MVP (JS/Web):** Utilizar **Web Workers** no frontend (Client-side) interceptando APIs nativas. Isso garante isolamento, reduz custos e garante latência zero para digitação/execução.
- **Linguagens Futuras (Backend/Python/SQL):** Execução via containers isolados, com limites de CPU/Memória, sem rede, com timeouts estritos.

## 4. Segurança da Plataforma
- **Validação:** Não confiar em dados vindos do cliente. Zod/Joi para input.
- **Autorização Robusta:** Usuários só vêem/editam os próprios dados de progresso.
- **Frontend:** Prevenção estrita de XSS. Não usar `dangerouslySetInnerHTML` com inputs de usuário (usar sanitização como `DOMPurify` ao renderizar markdown das aulas).
- **Dados:** Minimização, proteção e logs auditáveis.

## 5. Testes e Observabilidade
- Estratégia de testes em camadas (Unitários para lógica de negócio, Integração para DB, E2E para fluxos de aula).
- **Testes Pedagógicos:** Garantir que exercícios têm testes unitários ocultos validando corretude. Não pode existir exercício com feedback errado.
- **Monitoramento:** Logs de erros do sandbox e do frontend sem expor PII.
