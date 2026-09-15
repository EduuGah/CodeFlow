// Pelo caminho, e não pelo nome do pacote: o `exports` do react-dom não lista
// a pasta `umd`, e o Vite recusa `react-dom/umd/...` por isso.
import reactDom from '../../../node_modules/react-dom/umd/react-dom.production.min.js?raw';
import react from '../../../node_modules/react/umd/react.production.min.js?raw';

import type { BibliotecasDoReact } from './react-core';

/**
 * O React e o ReactDOM como texto, para embutir no documento do iframe.
 *
 * A CSP do motor de página não deixa o iframe carregar script de lugar
 * nenhum — nem do próprio domínio —, então as bibliotecas vão dentro do
 * `srcdoc`. São os mesmos pacotes que o aplicativo usa, na versão que está
 * no `package.json`; os builds UMD existem até o React 18 (o 19 os tirou),
 * e um teste confere que a versão embutida é a do projeto.
 *
 * Este módulo só entra por `import()`: um exercício de JavaScript ou de
 * página nunca baixa os 140 kB.
 */
export const BIBLIOTECAS_DO_REACT: BibliotecasDoReact = { react, reactDom };
