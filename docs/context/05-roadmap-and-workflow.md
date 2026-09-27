# Workflow e Roadmap de Desenvolvimento

## 1. Regras de Forma de Trabalho (Workflow Obrigatório)
NÃO AVANÇAR PARA A PRÓXIMA FASE SEM VALIDAR A ANTERIOR.
Antes de cada fase de implementação, o agente deve:
1. Explicar o objetivo da fase.
2. Explicar o que será desenvolvido.
3. Listar arquivos criados/alterados.
4. Explicar decisões técnicas.
5. Implementar.
6. Testar e Revisar.
7. Explicar como rodar.
8. Informar o que foi concluído e qual é o próximo passo.

## 2. Onde está o roadmap

> Atualizado em 2026-09-27 (P2-17 da auditoria). A lista de dezenove fases
> que ficava aqui era o plano de antes da construção — "Fase 1: Planejamento
> (Atual)" — e já não dizia o que existe nem o que falta. Ela saiu para não
> ser lida como estado.

As fases originais foram construídas, em outra ordem (a imposta pelos
motores de execução), com duas exceções: a de IA — não há tutor com IA, e a
rota foi removida enquanto a integração não existe — e o polimento, que
continua (Fase 9 de `ROADMAP_AUDITORIA.md`). O que falta agora mora em três
lugares, e só neles:

- **`docs/CONTEXTO.md`** — o estado real: o que existe, as decisões que não
  devem ser desfeitas, as armadilhas já pagas, e o que o usuário ainda precisa
  rodar no Supabase. É o primeiro a ler.
- **`ROADMAP_AUDITORIA.md`** — as fases de engenharia, produto e loja depois
  da auditoria de 2026-09-26, com o que foi feito e como (`[x]` e "Feito
  assim") e o que falta, em ordem. `AUDIT_REPORT.md` tem cada achado com
  arquivo, porquê e impacto.
- **`docs/curriculo.md`** — o conteúdo: trilhas, aulas e exercícios previstos.

## 3. Checklist Contínuo
- LER SEMPRE `docs/CONTEXTO.md` e a pasta `/docs/context/` antes de tomar
  grandes decisões.
- Garantir que não inventamos funcionalidades fora do escopo.
- Validar se a UI atende os preceitos do `02-design-ux-guidelines.md`.
- Validar se a engenharia respeita o `04-architecture-security.md`.
- Atualizar o `CONTEXTO.md` (e o roadmap, se for o caso) no mesmo commit que
  muda o que eles descrevem.
- Um teste novo só conta depois de visto falhar: sabotar a regra uma vez.
