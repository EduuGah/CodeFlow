import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { recordAttempt, type AttemptInput } from '../lib/progress';

/**
 * Registra tentativas sem interromper o aluno.
 *
 * Deliberadamente não devolve estado de carregamento nem de erro: quem chama
 * não deve esperar a gravação, e uma falha de telemetria não pode virar
 * mensagem na tela no meio de um exercício.
 *
 * Existe como hook para os componentes de exercício não precisarem receber a
 * função por props através de toda a árvore de blocos da aula.
 */
export function useRecordAttempt() {
  const { user } = useAuth();

  return useCallback(
    (attempt: AttemptInput) => {
      // Visitante sem sessão pode responder; só não gera histórico.
      if (!user) return;

      void recordAttempt(user.id, attempt);
    },
    [user]
  );
}
