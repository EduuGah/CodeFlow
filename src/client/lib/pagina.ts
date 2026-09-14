import {
  interpretarMensagem,
  montarDocumento,
  PRAZO_DA_PAGINA_MS,
  SANDBOX_DO_IFRAME,
} from './pagina-core';
import type { ExecutionResult } from './sandbox';
import type { SandboxTest } from './sandbox-core';

/**
 * Executa a página do aluno num `<iframe sandbox>` e resolve com o resultado.
 *
 * O iframe é do componente, não desta função: ele fica na tela como a
 * pré-visualização da página, e é isso que o aluno quer ver. A função só
 * escreve o documento nele, espera a mensagem de volta e cuida do prazo.
 *
 * Origem opaca (`SANDBOX_DO_IFRAME`) significa que o `postMessage` do iframe
 * precisa de `'*'` como destino, e que aqui a mensagem é aceita só quando
 * `event.source` é a janela desse iframe — qualquer outra é ignorada.
 *
 * O prazo cobre carregar, rodar os scripts e responder. Um laço sem fim num
 * `<script>` congela a página do aluno; o iframe é reescrito com um documento
 * vazio para interrompê-lo. Nos navegadores que isolam iframes com sandbox em
 * processo próprio (o Chrome faz isso) a aula continua respondendo enquanto
 * isso; nos que não isolam, é o prazo que salva a aba.
 */
export function executarPagina(
  iframe: HTMLIFrameElement,
  codigoDoAluno: string,
  tests: SandboxTest[]
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    let encerrado = false;

    const terminar = (resultado: ExecutionResult) => {
      if (encerrado) return;
      encerrado = true;
      clearTimeout(prazo);
      window.removeEventListener('message', aoReceber);
      resolve(resultado);
    };

    const aoReceber = (evento: MessageEvent) => {
      if (evento.source !== iframe.contentWindow) return;
      const mensagem = interpretarMensagem(evento.data);
      if (!mensagem) return;

      terminar({
        output: mensagem.logs.join('\n'),
        logs: mensagem.logs,
        testResults: mensagem.testResults,
        error: mensagem.error,
      });
    };

    const prazo = setTimeout(() => {
      // Interrompe o que estiver rodando lá dentro.
      iframe.srcdoc = '';
      terminar({
        output: '',
        logs: [],
        testResults: [],
        timedOut: true,
        error: `A página não respondeu em ${
          PRAZO_DA_PAGINA_MS / 1000
        } segundos. Pode ser um laço que nunca termina num <script> — ou uma tag <script> que ficou sem fechar, o que engole o resto da página.`,
      });
    }, PRAZO_DA_PAGINA_MS);

    window.addEventListener('message', aoReceber);

    // O atributo precisa estar no lugar ANTES do documento: mudar `sandbox`
    // depois só vale para a próxima navegação.
    iframe.setAttribute('sandbox', SANDBOX_DO_IFRAME);
    iframe.srcdoc = montarDocumento(codigoDoAluno, tests);
  });
}
