import React from 'react';

import { IconArrowLeft, IconCloseCircle } from './ui/Icon';

/**
 * A última linha antes da tela branca.
 *
 * Um erro em qualquer render dentro da árvore desmontava a aplicação inteira e
 * deixava o `#root` vazio. Foi o que aconteceu ao passar de uma aula para a
 * seguinte: um índice fora da faixa quebrou o render, o React desmontou tudo, e
 * o aluno ficou olhando para o branco sem nenhuma pista nem caminho de volta —
 * só recarregando a página.
 *
 * A causa daquele caso está corrigida. Isto é para o próximo: um erro passa a
 * custar uma tela explicativa com saída, não a sessão de estudo.
 *
 * Precisa ser classe: só componentes de classe têm `componentDidCatch`.
 */
interface Estado {
  erro: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, Estado> {
  state: Estado = { erro: null };

  static getDerivedStateFromError(erro: Error): Estado {
    return { erro };
  }

  componentDidCatch(erro: Error, info: React.ErrorInfo) {
    console.error('Erro não tratado na interface:', erro, info.componentStack);
  }

  render() {
    if (!this.state.erro) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <div className="w-full max-w-md rounded-xl border border-line bg-surface p-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 text-danger-500">
            <IconCloseCircle size={26} />
          </span>

          <h1 className="text-lg font-extrabold text-ink">Alguma coisa quebrou aqui</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            O erro é nosso, não seu — e seu progresso salvo continua salvo. Volte para o início e
            siga de onde estava.
          </p>

          {/* A mensagem técnica fica disponível, não empurrada: quem for relatar
              o problema precisa dela, e quem só quer voltar a estudar não. */}
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-ink-faint">Detalhes técnicos</summary>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-sunken p-3 text-xs">
              <code className="font-mono text-ink-soft">{this.state.erro.message}</code>
            </pre>
          </details>

          {/* `href` em vez de `Link`: a árvore do roteador é justamente o que
              acabou de falhar, então a recuperação confiável é recarregar. */}
          <a
            href="/app"
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink font-bold text-white transition-colors hover:bg-brand-900"
          >
            <IconArrowLeft size={18} />
            Voltar ao início
          </a>
        </div>
      </div>
    );
  }
}
