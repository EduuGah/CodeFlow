/**
 * Gera `src/content/indice.gerado.ts`: o índice do catálogo.
 *
 *   npm run indice
 *
 * O pacote principal carrega o índice — trilhas, o resumo de cada aula e de
 * cada exercício, o resumo de cada projeto — e o corpo de cada aula só quando
 * ela abre, por um `import()` que o índice também lista. Antes, as 154 aulas
 * inteiras iam no pacote que qualquer visita baixava (P2-1b).
 *
 * O arquivo gerado entra no repositório; `indice.test.ts` confere que ele diz
 * o mesmo que o catálogo, e falha pedindo para rodar este script de novo.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { montarIndice } from '../src/content/montar-indice';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTEUDO = join(RAIZ, 'src/content');

const texto = await montarIndice(readFileSync(join(CONTEUDO, 'catalogo.ts'), 'utf8'), (caminho) =>
  import(join(CONTEUDO, caminho) + '.ts')
);
writeFileSync(join(CONTEUDO, 'indice.gerado.ts'), texto);
console.log('src/content/indice.gerado.ts atualizado.');
