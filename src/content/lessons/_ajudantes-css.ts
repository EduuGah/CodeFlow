/**
 * Ajudantes que as asserções dos exercícios de CSS colam no início.
 *
 * As asserções rodam dentro da página do aluno, como texto, então isto é
 * código-fonte em string — sem import. Cada ajudante existe por um motivo
 * medido, e não por conveniência:
 *
 * - `trilhas`: `getComputedStyle` devolve `grid-template-columns` resolvido
 *   em pixels no navegador (`"128px 128px 128px"`) e declarado no jsdom
 *   (`"repeat(3, 1fr)"`). Contar colunas exige expandir o `repeat()` antes.
 * - `regraBase` e `regraEmMedia`: leem a **folha de estilo**, onde o valor é
 *   o que o aluno escreveu nos dois motores. Necessário para tudo que o
 *   navegador resolve e o jsdom não — `rem` em px, `line-height` sem unidade
 *   em px, `ch` em px — e para `@media`, que depende da largura do iframe e
 *   que o jsdom ignora por completo.
 * - `minWidthPx`: o número de um `(min-width: …)`, em px, aceitando em/rem.
 */
export const AJUDANTES_CSS = `
  function trilhas(valor) {
    const expandido = String(valor).replace(/repeat\\((\\d+),\\s*([^)]+)\\)/g, (_, n, x) => Array(Number(n)).fill(x.trim()).join(' '));
    return expandido.trim().split(/\\s+/).filter(Boolean);
  }
  function normalizar(seletor) { return String(seletor || '').replace(/\\s+/g, ' ').trim(); }
  function regraBase(seletor) {
    for (const folha of document.styleSheets) {
      for (const r of folha.cssRules) {
        if (r.selectorText && normalizar(r.selectorText) === seletor) return r.style;
      }
    }
    return null;
  }
  function regraEmMedia(condicao, seletor) {
    for (const folha of document.styleSheets) {
      for (const r of folha.cssRules) {
        if (!r.media) continue;
        if (!condicao(r.media.mediaText.replace(/\\s+/g, ''))) continue;
        for (const interna of r.cssRules) {
          if (interna.selectorText && normalizar(interna.selectorText) === seletor) return interna.style;
        }
      }
    }
    return null;
  }
  function minWidthPx(texto) {
    const m = /min-width:(\\d+(?:\\.\\d+)?)(px|em|rem)/.exec(texto);
    if (!m) return null;
    return m[2] === 'px' ? Number(m[1]) : Number(m[1]) * 16;
  }
  // O valor declarado de uma propriedade numa regra, ou '' se não há.
  function declarado(seletor, propriedade) {
    const r = regraBase(seletor);
    return r ? r.getPropertyValue(propriedade).trim() : '';
  }
`;
