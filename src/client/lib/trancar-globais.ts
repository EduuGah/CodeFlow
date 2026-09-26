/**
 * Tranca as APIs de rede e de persistência do escopo de um worker, antes de o
 * código do aluno rodar.
 *
 * Não é a barreira de segurança — o navegador já isola o worker da página e
 * da sessão. É a barreira pedagógica e de privacidade: um exercício não faz
 * requisição para fora nem grava nada a partir do editor.
 *
 * A primeira versão (uma cópia em cada worker) redefinia só a propriedade do
 * próprio `self`. Mas `fetch`, `indexedDB` e `caches` moram no **protótipo**
 * (`WorkerGlobalScope.prototype`), e o que ela fazia era só escondê-los:
 * `Object.getPrototypeOf(self).fetch.call(self, url)` continuava saindo para
 * a rede. Aqui a cadeia inteira é trancada.
 *
 * Puro de propósito — recebe o escopo —, para o teste exercitar a cadeia de
 * protótipos no Node sem precisar de um worker.
 */
export const GLOBAIS_TRANCADAS = [
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'EventSource',
  'importScripts',
  'indexedDB',
  'caches',
  'Notification',
  'Worker',
  'SharedWorker',
  'BroadcastChannel',
] as const;

export function trancarGlobais(escopo: object, nomes: readonly string[] = GLOBAIS_TRANCADAS): void {
  const cadeia: object[] = [];
  for (let alvo: object | null = escopo; alvo && alvo !== Object.prototype; alvo = Object.getPrototypeOf(alvo)) {
    cadeia.push(alvo);
  }

  for (const nome of nomes) {
    for (const alvo of cadeia) {
      // No próprio escopo, sempre (esconde o que vier de baixo); nos
      // protótipos, só onde a propriedade de fato mora.
      if (alvo !== escopo && !Object.prototype.hasOwnProperty.call(alvo, nome)) continue;
      try {
        Object.defineProperty(alvo, nome, { value: undefined, configurable: false, writable: false });
      } catch {
        // Uma propriedade não configurável não se redefine; as outras seguem.
      }
    }
  }
}
