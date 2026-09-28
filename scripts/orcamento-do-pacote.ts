/**
 * O orçamento do pacote principal: o JavaScript que qualquer visita baixa
 * antes da primeira tela, comprimido.
 *
 *   npm run build && npm run orcamento
 *
 * Mede o que o `dist/index.html` manda baixar — o script de entrada e os
 * `modulepreload` — e reprova se passar do limite. Roda no CI depois do build.
 *
 * O limite não é a meta do P2-1b (400 kB): é o número de hoje com uma folga
 * pequena. Um orçamento largo só reprova quando várias regressões já se
 * somaram, e aí ninguém sabe qual desfazer; justo, reprova a que acabou de
 * entrar — o Zod no pacote principal (~55 kB), o leitor de Markdown fora da
 * rota da aula, uma tela do aluno importando `content/catalogo`. Subir o
 * limite é uma linha, de propósito, com o motivo no commit.
 *
 * Comprimido como o Vite relata no build (gzip, nível padrão), para o número
 * daqui bater com o que se lê na saída do `vite build`.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const LIMITE_KB = 320;

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const kB = (bytes: number) => (bytes / 1000).toFixed(1);

function falhar(mensagem: string): never {
  // No GitHub Actions a anotação é legível sem entrar na conta; o log não.
  console.error(process.env.GITHUB_ACTIONS ? `::error::${mensagem}` : mensagem);
  process.exit(1);
}

let html: string;
try {
  html = readFileSync(join(DIST, 'index.html'), 'utf8');
} catch {
  falhar('dist/index.html não existe: rode `npm run build` antes do orçamento.');
}

const arquivos = [
  ...html.matchAll(/<script type="module"[^>]*\ssrc="\/([^"]+\.js)"/g),
  ...html.matchAll(/<link rel="modulepreload"[^>]*\shref="\/([^"]+\.js)"/g),
].map((m) => m[1]);

// Sem isto, um `index.html` num formato que a expressão não reconhece mediria
// zero e passaria.
if (arquivos.length === 0) falhar('Nenhum script de entrada no dist/index.html: o orçamento não mediu nada.');

let total = 0;
for (const arquivo of arquivos) {
  const conteudo = readFileSync(join(DIST, arquivo));
  const comprimido = gzipSync(conteudo).length;
  total += comprimido;
  console.log(`${arquivo.padEnd(40)} ${kB(conteudo.length).padStart(9)} kB  ${kB(comprimido).padStart(7)} kB comprimido`);
}

console.log(`\nPacote principal: ${kB(total)} kB comprimido, limite ${LIMITE_KB} kB.`);

if (total > LIMITE_KB * 1000) {
  falhar(
    `O pacote principal tem ${kB(total)} kB comprimido e o limite é ${LIMITE_KB} kB. ` +
      'Veja o que entrou nele (uma tela do aluno importando content/catalogo? uma biblioteca nova fora de uma rota sob demanda?) ' +
      'antes de subir o limite em scripts/orcamento-do-pacote.ts.'
  );
}
