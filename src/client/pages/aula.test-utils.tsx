import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

import type { Exercise } from '../../content/types';
import type { LessonStep } from '../lib/lesson-steps';

/**
 * Andar por uma aula nos testes de componente.
 *
 * Desde que "Pular por ora" saiu, um exercício sem resposta verificada não
 * deixa avançar. Os testes que precisam chegar ao passo N respondem cada
 * exercício do caminho **errado, de propósito** — é o que um aluno que não
 * sabe faria — e seguem por "Continuar assim mesmo". Responder errado, e
 * não certo, mantém o que os testes de conclusão querem provar: passar
 * pelos exercícios não é resolvê-los.
 *
 * Os tipos que rodam código dependem do `executeCode` estar dublado no
 * teste; com `testResults` vazio o resultado é "errou" em todos eles.
 */

/** O botão do rodapé que leva ao próximo passo, em qualquer estado. */
export function botaoDeAvanco(): HTMLElement {
  return screen.getByRole('button', { name: /^(Continuar|Continuar assim mesmo|Responda para continuar)$/ });
}

export async function responderErrado(user: UserEvent, exercicio: Exercise): Promise<void> {
  switch (exercicio.type) {
    case 'multiple-choice': {
      const errada = exercicio.correctIndex === 0 ? 1 : 0;
      await user.click(screen.getAllByRole('radio')[errada]);
      await user.click(screen.getByRole('button', { name: 'Verificar resposta' }));
      return;
    }
    case 'predict-output': {
      await user.type(
        screen.getByRole('textbox', { name: /O que você acha que será impresso/ }),
        'previsão errada de propósito'
      );
      await user.click(screen.getByRole('button', { name: /Executar e comparar/ }));
      return;
    }
    case 'fill-blank': {
      for (const campo of screen.getAllByRole('textbox', { name: /^Lacuna \d+ de / })) {
        await user.type(campo, 'x');
      }
      await user.click(screen.getByRole('button', { name: 'Verificar' }));
      return;
    }
    case 'find-bug': {
      const radios = screen.getAllByRole('radio');
      const errada = radios.find((r) => !(r.getAttribute('aria-label') ?? '').startsWith(`Linha ${exercicio.buggyLine}:`));
      await user.click(errada ?? radios[0]);
      await user.click(screen.getByRole('button', { name: /Apontar a linha/ }));
      return;
    }
    case 'code':
    case 'refactor':
    case 'write-test':
    case 'sql':
    case 'server': {
      await user.type(screen.getByRole('textbox', { name: 'Editor de código' }), ' ');
      await user.click(
        screen.getByRole('button', {
          name: /Executar código|Rodar a página|Rodar o componente|Rodar os testes|Rodar meus testes|Executar consulta|Rodar o servidor/,
        })
      );
      return;
    }
    case 'order-steps': {
      await user.click(screen.getByRole('button', { name: /Verificar ordem/ }));
      return;
    }
    default: {
      const tipo: never = exercicio;
      throw new Error(`responderErrado não sabe o tipo ${(tipo as { type: string }).type}`);
    }
  }
}

/** Vai até o passo `indice` (base 0), respondendo errado o que aparecer no caminho. */
export async function irAtePasso(user: UserEvent, passos: LessonStep[], indice: number): Promise<void> {
  for (let i = 0; i < indice; i++) {
    const passo = passos[i];
    if (passo.kind === 'exercise') await responderErrado(user, passo.exercise);
    await user.click(botaoDeAvanco());
  }
}
