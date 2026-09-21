import type { SandboxRunResult } from './sandbox-core';
import { subirServidor, type PedidoAoServidor, type RespostaDoServidor, type ServidorVivo, type Troca } from './servidor-core';

/**
 * O protocolo do servidor vivo entre a tela e um worker: a segunda metade
 * do motor 7. A tela manda `servir` uma vez; o worker sobe o programa e
 * responde `servindo` (com o que ele imprimiu, ou o erro). Daí em diante
 * cada `pedir` — um `fetch` da página do aluno, encaminhado pelo iframe —
 * recebe uma `resposta` com o mesmo `id`. `trocas` devolve o que passou
 * pelo servidor, para a tela mostrar; quem encerra é `terminate()`.
 *
 * Os dois workers do sandbox (o comum e o com banco) atendem este protocolo
 * além das execuções de sempre; a diferença entre eles é só o banco.
 */
export type MensagemDeServico =
  | { modo: 'servir'; code: string; banco?: string }
  | { modo: 'pedir'; id: number; pedido: PedidoAoServidor }
  | { modo: 'trocas' };

export type RespostaDeServico =
  | { modo: 'servindo'; logs: string[]; error?: string }
  | { modo: 'resposta'; id: number; resposta: RespostaDoServidor }
  | { modo: 'trocas'; trocas: Troca[] };

export function ehMensagemDeServico(data: unknown): data is MensagemDeServico {
  return !!data && typeof data === 'object' && 'modo' in data;
}

/**
 * Atende uma mensagem de serviço dentro do worker. `servidor` é o estado
 * entre mensagens; o chamador guarda o que esta função devolve.
 */
export async function atenderServico(
  data: MensagemDeServico,
  servidor: ServidorVivo | null,
  rodar: (programa: string) => Promise<SandboxRunResult>,
  responder: (m: RespostaDeServico) => void
): Promise<ServidorVivo | null> {
  if (data.modo === 'servir') {
    const vivo = await subirServidor(data.code, rodar);
    responder({ modo: 'servindo', logs: vivo.logs, ...(vivo.error ? { error: vivo.error } : {}) });
    return vivo;
  }
  if (data.modo === 'pedir') {
    const resposta = servidor
      ? await servidor.pedir(data.pedido)
      : { status: 503, headers: { 'content-type': 'application/json' }, texto: JSON.stringify({ erro: 'o servidor não subiu' }) };
    responder({ modo: 'resposta', id: data.id, resposta });
    return servidor;
  }
  responder({ modo: 'trocas', trocas: servidor ? servidor.trocas() : [] });
  return servidor;
}
