import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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
  plugins: [react(), tailwindcss(), semSourcemapNosGigantes()],
  optimizeDeps: {
    // O `sql.js` só é importado pelo worker do motor de SQL, e o otimizador
    // do Vite só o descobre na primeira execução de uma consulta — aí
    // reempacota e **recarrega a página inteira**, no meio do exercício.
    // Declarado aqui, ele entra no pacote de dependências logo na partida.
    include: ['sql.js'],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  }
})
