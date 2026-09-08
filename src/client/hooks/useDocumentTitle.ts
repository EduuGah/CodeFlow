import { useEffect } from 'react';

const PRODUTO = 'CodeFlow';

/**
 * Título da página.
 *
 * Toda tela mostrava "CodeFlow" e nada mais. Isso quebra três coisas de uma vez:
 * abas do navegador ficam indistinguíveis, o histórico não diz onde a pessoa
 * esteve, e o leitor de tela anuncia o mesmo nome a cada navegação — de modo que
 * quem não vê a tela não recebe confirmação de que ela mudou.
 *
 * O nome do produto vem depois do específico: numa aba estreita o navegador corta
 * o fim, e o que precisa sobrar é onde se está.
 */
export function useDocumentTitle(titulo?: string): void {
  useEffect(() => {
    document.title = titulo ? `${titulo} · ${PRODUTO}` : PRODUTO;
  }, [titulo]);
}
