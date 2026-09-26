import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

/**
 * Sem sourcemap para os arquivos gigantes do serviço de TypeScript do Monaco.
 *
 * `typescriptServices.js` tem 9 MB e `lib.js` tem 3 MB. Em desenvolvimento o
 * Vite embute em cada módulo um sourcemap com o conteúdo inteiro em base64,
 * e esses dois viravam 47 MB e 16 MB por requisição. O worker do sandbox —
 * 10 kB — ficava 20 segundos na fila atrás deles, e o aluno lia que o código
 * dele tinha demorado demais. Ninguém depura o compilador do TypeScript a
 * partir daqui; o mapa é descartado. Só em `serve`: o build não passa por
 * isto.
 */
function semSourcemapNosGigantes(): Plugin {
  return {
    name: 'codeflow:sem-sourcemap-nos-gigantes',
    apply: 'serve',
    transform(code, id) {
      // O Vite normaliza os ids para barra normal, inclusive no Windows.
      if (/monaco-editor\/.*\/typescript\/lib\//.test(id)) {
        return { code, map: { mappings: '' } }
      }
      return null
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    semSourcemapNosGigantes(),
    // O Pyodide não é importado por caminho estático (o `?url` do sql.js não
    // serve aqui): ele mesmo busca os próprios arquivos — o WebAssembly, a
    // biblioteca padrão zipada, o manifesto de pacotes — a partir de um
    // `indexURL` em tempo de execução. Copiados para `pyodide/` na raiz do
    // site, servidos do próprio domínio como tudo mais (nada de CDN), tanto
    // em `dev` (a cópia entra no meio do servidor do Vite) quanto no build.
    viteStaticCopy({
      targets: [
        {
          src: [
            'node_modules/pyodide/pyodide.asm.wasm',
            'node_modules/pyodide/pyodide.asm.mjs',
            'node_modules/pyodide/python_stdlib.zip',
            'node_modules/pyodide/pyodide-lock.json',
          ],
          dest: 'pyodide',
        },
      ],
    }),
  ],
  optimizeDeps: {
    // O `sql.js` só é importado pelo worker do motor de SQL, e o `pyodide` só
    // pelo do motor de Python — o otimizador do Vite só os descobre na
    // primeira execução de um exercício, aí reempacota e **recarrega a
    // página inteira**, no meio do exercício. Declarados aqui, entram no
    // pacote de dependências logo na partida.
    include: ['sql.js', 'pyodide'],
  },
  build: {
    rollupOptions: {
      treeshake: {
        // `content/schema.ts` só declara os espelhos Zod do conteúdo — montar
        // um schema não tem efeito nenhum. Sem isto o Rollup não pode supor
        // isso das chamadas `z.object(...)` no topo, e o Zod inteiro ia no
        // pacote principal mesmo com a validação desligada em produção
        // (`content/index.ts`). O gerador de exercício do admin, que usa os
        // schemas de verdade, continua levando o Zod no chunk dele.
        moduleSideEffects: (id) => !id.endsWith('/src/content/schema.ts'),
      },
    },
  },
  worker: {
    // O `pyodide.mjs` importa dinamicamente as próprias peças (o núcleo de
    // FFI, por exemplo) — código dividido em pedaços, que o formato padrão
    // do worker no build (IIFE) não sabe carregar. `'es'` faz o worker do
    // Python (e o do SQL, que não precisava mas aceita igual) compilar como
    // módulo ES, que suporta isso nativamente.
    format: 'es',
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  }
})
