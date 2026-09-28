import { Carregando, Skeleton } from './Skeleton';
import { ErrorState } from './States';

/**
 * Os dois estados de uma tela cujo conteúdo vem sob demanda (a aula, o
 * projeto, o exercício do caderno — `hooks/useConteudo.ts`).
 *
 * O esqueleto tem a forma do que vem: um título e parágrafos. Dura o tempo de
 * baixar um arquivo de poucos kB, então é discreto; o que precisa ficar claro
 * é a falha, que diz o que fazer.
 */
export function ConteudoCarregando({ o }: { o: string }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Carregando o={o}>
        <Skeleton className="h-7 w-2/3" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </Carregando>
    </div>
  );
}

export function ConteudoNaoCarregou({ o, onTentar }: { o: string; onTentar: () => void }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <ErrorState
        title={`${o[0].toUpperCase()}${o.slice(1)} não carregou`}
        message="O arquivo não chegou — a conexão caiu, ou o aplicativo acabou de ser atualizado. Tente de novo; se continuar, recarregue a página."
        onRetry={onTentar}
      />
    </div>
  );
}
