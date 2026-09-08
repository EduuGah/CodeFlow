import { useEffect, type RefObject } from 'react';

/**
 * Recupera o foco quando o elemento que o tinha deixa de existir.
 *
 * Acontece em vários pontos da aula: o aluno acerta a múltipla escolha e o botão
 * "Verificar resposta" sai da tela; revela a última dica e o botão "Próxima
 * dica" sai. Em todos os casos o navegador devolve o foco para o `<body>`, e a
 * tabulação seguinte recomeça do topo do documento — quem navega por teclado
 * perde o lugar e volta a atravessar o cabeçalho inteiro.
 *
 * O resgate só age quando o foco de fato se perdeu. Se ele estiver em qualquer
 * outro elemento, foi a pessoa que o levou para lá, e mover seria pior do que
 * não fazer nada.
 */
export function useFocusRescue(alvo: RefObject<HTMLElement | null>, ativo: boolean): void {
  useEffect(() => {
    if (!ativo) return;

    const doc = alvo.current?.ownerDocument;
    if (!doc) return;

    // `null` aparece em alguns navegadores no intervalo entre desmontar o
    // elemento focado e o foco assentar no corpo do documento.
    const focoAtual = doc.activeElement;
    if (focoAtual !== null && focoAtual !== doc.body) return;

    alvo.current?.focus();
  }, [ativo, alvo]);
}
