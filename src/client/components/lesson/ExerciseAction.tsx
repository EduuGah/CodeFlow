import React from 'react';

import { Button } from '../ui/Button';
import { IconCheckCircle, IconCloseCircle } from '../ui/Icon';
import type { ExerciseState } from '../../lib/exercise-state';

/**
 * A ação principal de um exercício, igual nos quatro tipos.
 *
 * Antes cada tipo tinha a sua: os de código usavam um botão de 52px de altura,
 * e a múltipla escolha e o prever-saída usavam `size="sm"`, que dá 32px. A ação
 * mais importante da tela era o menor alvo dela — abaixo dos 44px que a WCAG
 * pede para toque, e visualmente menor que o "Continuar" do rodapé, que não faz
 * nada de mais.
 */
export function ExerciseAction({
  carregando = false,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { carregando?: boolean }) {
  // Uma casca sobre o Button, e não um botão próprio: o nome continua dizendo
  // "a ação do exercício", mas os estilos vêm de um lugar só.
  return (
    <Button size="lg" block loading={carregando} className={className} {...props}>
      {children}
    </Button>
  );
}

/**
 * O retorno depois de verificar, igual nos quatro tipos.
 *
 * A pergunta que o aluno faz aqui é sempre a mesma — "eu acertei?" — e antes
 * cada tipo respondia de um jeito: dois tinham cabeçalho colorido com frase
 * própria, o de lacuna só mostrava a lista de testes e o de código não dizia
 * nada. Quem resolvia um exercício de código ficava olhando cinco linhas verdes
 * tentando deduzir se aquilo era sucesso.
 *
 * Erro de resposta usa âmbar, não vermelho: errar é etapa do aprendizado, e o
 * vermelho fica reservado a falha de código ou de sistema.
 *
 * `role="status"` faz o leitor de tela anunciar o retorno sem roubar o foco de
 * quem ainda está navegando pelo teclado.
 */
export function ExerciseFeedback({
  estado,
  titulo,
  children,
  refDoBloco,
  anunciar = true,
}: {
  estado: Extract<ExerciseState, 'acertou' | 'errou'>;
  titulo?: string;
  children?: React.ReactNode;
  refDoBloco?: React.Ref<HTMLDivElement>;
  /**
   * Falso quando o bloco já vive dentro de uma região viva.
   *
   * Nos exercícios que rodam testes, a região precisa envolver **também** a
   * lista de resultados: é nela que está a informação útil — "esperava 12, veio
   * 7" — e um `role="status"` só no veredito faria o leitor de tela anunciar
   * "dois testes falharam" e mais nada. Duas regiões aninhadas anunciariam o
   * título duas vezes.
   */
  anunciar?: boolean;
}) {
  const acertou = estado === 'acertou';

  return (
    <div
      ref={refDoBloco}
      role={anunciar ? 'status' : undefined}
      tabIndex={-1}
      className={`animar-pousar rounded-lg border p-4 focus-visible:outline-none ${
        acertou ? 'border-success-200 bg-success-50' : 'border-energy-200 bg-energy-50'
      }`}
    >
      <p
        className={`flex items-center gap-2 font-bold ${
          acertou ? 'text-success-700' : 'text-energy-700'
        }`}
      >
        {/* O certo pipoca; o errado só pousa. O movimento é a recompensa,
            e recompensa é para o acerto. */}
        {acertou ? (
          <IconCheckCircle size={18} className="animar-pop" />
        ) : (
          <IconCloseCircle size={18} />
        )}
        {titulo ?? (acertou ? 'Resposta correta' : 'Ainda não está certo')}
      </p>

      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}
