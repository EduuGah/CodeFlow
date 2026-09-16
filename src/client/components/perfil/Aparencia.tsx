import { useState } from 'react';

import { useStudentData } from '../../contexts/StudentDataContext';
import { useTema } from '../../contexts/TemaContext';
import { itemDaLoja, temItem } from '../../lib/economia';
import type { Acento, Tema } from '../../lib/perfil';
import { ACENTOS, TEMAS } from '../../lib/tema';
import { Card } from '../ui/Card';
import { IconCheck, IconLock } from '../ui/Icon';

/**
 * Aparência: modo e cor de destaque.
 *
 * A escolha aplica na hora (o contexto do tema pinta a página) e é gravada
 * no perfil em seguida, para valer nos outros aparelhos. Se a gravação
 * falhar, a tela continua com a escolha — é a preferência da pessoa, e o
 * aviso diz que ela ficou só neste aparelho.
 *
 * As cores extras abrem por nível ou pela loja; a fechada mostra o cadeado e
 * o que a abre, em vez de sumir da lista.
 */
export function Aparencia() {
  const { tema, acento, mudarTema, mudarAcento } = useTema();
  const { level, purchases, salvarPerfil } = useStudentData();
  const [aviso, setAviso] = useState<string | null>(null);

  const gravar = async (mudancas: Partial<{ theme: Tema; accent: Acento }>) => {
    const { error } = await salvarPerfil(mudancas);
    setAviso(error ? 'A escolha vale neste aparelho, mas não foi salva na sua conta.' : null);
  };

  const escolherTema = (novo: Tema) => {
    mudarTema(novo);
    void gravar({ theme: novo });
  };

  const escolherAcento = (novo: Acento) => {
    mudarAcento(novo);
    void gravar({ accent: novo });
  };

  return (
    <Card as="section" aria-labelledby="titulo-aparencia" className="space-y-5">
      <h2 id="titulo-aparencia" className="font-bold text-ink">
        Aparência
      </h2>

      <fieldset>
        <legend className="label-mono mb-2 text-ink-faint">Modo</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {TEMAS.map((t) => {
            const ativo = tema === t.id;
            return (
              <label
                key={t.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  ativo ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-line-strong'
                }`}
              >
                <input
                  type="radio"
                  name="tema"
                  value={t.id}
                  aria-label={t.title}
                  checked={ativo}
                  onChange={() => escolherTema(t.id)}
                  className="mt-1 accent-brand-600"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{t.title}</span>
                  <span className="block text-xs leading-relaxed text-ink-soft">{t.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label-mono mb-2 text-ink-faint">Cor de destaque</legend>
        <ul className="grid gap-2 sm:grid-cols-2" aria-label="Cores de destaque">
          {ACENTOS.map((a) => {
            const item = a.item ? itemDaLoja(a.item) : undefined;
            const aberto = !item || temItem(item, level.level, purchases);
            const ativo = acento === a.id;
            return (
              <li key={a.id}>
                <button
                  type="button"
                  disabled={!aberto}
                  aria-pressed={ativo}
                  onClick={() => escolherAcento(a.id)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    ativo ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-line-strong'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ background: a.amostra }}
                    aria-hidden
                  >
                    {ativo ? <IconCheck size={15} strokeWidth={3} /> : !aberto ? <IconLock size={14} /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">{a.title}</span>
                    <span className="block text-xs leading-relaxed text-ink-soft">
                      {aberto
                        ? a.description
                        : `Abre no nível ${item?.nivelQueLibera} ou por ${item?.price} moedas na loja.`}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      {aviso && (
        <p role="status" className="text-xs leading-relaxed text-energy-700">
          {aviso}
        </p>
      )}
    </Card>
  );
}
