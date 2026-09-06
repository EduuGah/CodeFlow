# Visão Geral do Produto: CodeFlow

## 1. Contexto e Público-Alvo
Plataforma web profissional de aprendizado de programação voltada para usuários desde o zero absoluto até níveis avançados. Não é apenas uma página de aulas, mas um **ambiente interativo** focado na evolução real do aluno.

**Públicos:**
- Iniciantes totais.
- Pessoas com teoria, mas sem prática (não conseguem resolver problemas).
- Focados em revisão, portfólio ou linguagens específicas.

## 2. Princípios Fundamentais
- **Aprendizado Ativo:** O aluno deve participar constantemente (Explicação -> Exemplo -> Interação -> Exercício -> Aplicação).
- **Aprendizado Progressivo:** Evolução gradual dos conceitos.
- **Aprendizado por Erros:** O erro faz parte do processo. O sistema deve explicar o *porquê* e o *como corrigir*, nunca apenas "Errado".
- **Aprendizado por Projetos:** Aplicação em projetos reais pequenos e incrementais (ex: Calculadora -> Todo App V1, V2, V3...).
- **Conhecimento != Conclusão:** O sistema diferencia conhecer a sintaxe de saber aplicar. Avalia-se o *domínio* real.

## 3. Escopo do MVP (Minimum Viable Product)
Foco em validar o produto com a fundação e a **Trilha de JavaScript / Web**:
- Cadastro e login (Auth Seguro).
- Dashboard de progresso.
- Trilhas de aprendizado e aulas interativas.
- Exercícios variados (não apenas múltipla escolha).
- **Editor de código com execução segura in-browser (Web Workers).**
- Feedback educativo e sistema de dicas progressivas.
- Perfil do usuário.

## 4. Diferenciais da Plataforma
- **Sistema de Diagnóstico Inicial:** Avalia lógica, previsão de saída e leitura de código, não apenas sintaxe, para alocar o aluno.
- **Mapa de Conhecimento Relacional:** Entende dependências (Variáveis -> Arrays -> Loops) para gerar trilhas dinamicamente.
- **Domínio vs. Conclusão:** Usa métricas de confiança e domínio (Baseado em tempo, erros, repetição).
- **Simulação de Cliente / Bugs Reais:** Exercícios onde o aluno recebe requisitos incompletos ou "bugs de produção" para debugar.
