import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { todasAsAulas, todosOsProjetos } from './catalogo';
import { AULAS, CORPO_DA_AULA, CORPO_DO_PROJETO, EXERCICIOS, PROJETOS } from './indice.gerado';
import { montarIndice } from './montar-indice';

/**
 * O índice é gerado (`npm run indice`) e entra no repositório. Se alguém muda
 * uma aula e não o regera, o pacote principal passa a mostrar título, duração
 * ou exercícios velhos — e ninguém nota. Estes testes notam.
 */

const DIR = join(__dirname);
const importar = (caminho: string) => {
  const [pasta, arquivo] = caminho.split('/');
  // Duas formas fixas, e não `./${caminho}`: o Vite só resolve import com
  // variável quando a pasta é literal.
  return pasta === 'lessons' ? import(`./lessons/${arquivo}.ts`) : import(`./projects/${arquivo}.ts`);
};

describe('o índice do catálogo', () => {
  it('é o que o gerador escreveria agora — senão, rode `npm run indice`', async () => {
    const esperado = await montarIndice(readFileSync(join(DIR, 'catalogo.ts'), 'utf8'), importar);
    const noArquivo = readFileSync(join(DIR, 'indice.gerado.ts'), 'utf8');
    // Sem `toBe` no texto inteiro: a diferença de 170 kB não caberia na tela.
    expect(noArquivo === esperado, 'indice.gerado.ts está velho: rode `npm run indice`').toBe(true);
  });

  it('tem toda aula e todo projeto do catálogo, e só eles', () => {
    // A ordem é a dos imports, não a do array do catálogo — e não importa: as
    // telas buscam por id e seguem a ordem das trilhas.
    const ids = (lista: readonly { id: string }[]) => lista.map((i) => i.id).sort();
    expect(ids(AULAS)).toEqual(ids(todasAsAulas()));
    expect(ids(PROJETOS)).toEqual(ids(todosOsProjetos()));
  });

  it('o resumo é a aula sem o corpo, e os exercícios são os dela, na ordem', () => {
    for (const aula of todasAsAulas()) {
      const { blocks, ...resumo } = aula;
      expect(AULAS.find((a) => a.id === aula.id)).toEqual(resumo);
      const exercicios = blocks.flatMap((b) => (b.kind === 'exercise' ? [b.exercise] : []));
      expect(EXERCICIOS.filter((e) => e.lessonId === aula.id).map((e) => e.id)).toEqual(exercicios.map((e) => e.id));
    }
  });

  it('cada carregador traz o corpo da aula ou do projeto certo', async () => {
    for (const aula of todasAsAulas()) expect(await CORPO_DA_AULA[aula.id](), aula.id).toBe(aula);
    for (const projeto of todosOsProjetos()) expect(await CORPO_DO_PROJETO[projeto.id](), projeto.id).toBe(projeto);
  });
});
