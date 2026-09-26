import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useStudentData } from '../../contexts/StudentDataContext';
import { useTema } from '../../contexts/TemaContext';
import { itemDaLoja, temItem } from '../../lib/economia';
import type { Acento, Tema } from '../../lib/perfil';
import { ACENTOS, TEMAS } from '../../lib/tema';
import { Card, SectionLabel } from '../ui/Card';
import { IconArrowRight, IconCheck, IconDevice, IconLock, IconMoon, IconSun } from '../ui/Icon';
import { VinhetaJanela } from '../ui/Ilustracao';

/**
 * Aparência: modo e cor de destaque.
 *
 * Cada opção é uma janela em miniatura pintada como a interface vai ficar —
 * a pessoa escolhe olhando, não lendo "azul-profundo". A escolha aplica na
 * hora (o contexto do tema pinta a página) e é gravada no perfil em seguida,
 * para valer nos outros aparelhos. Se a gravação falhar, a tela continua com
 * a escolha — é a preferência da pessoa, e o aviso diz que ficou só aqui.
 *
 * As cores extras abrem por nível ou pela loja; a fechada mostra o cadeado e
 * o que a abre, em vez de sumir da lista.
 */
const ICONE_DO_MODO = { sistema: IconDevice, claro: IconSun, escuro: IconMoon } as const;

export function Aparencia() {
  const { tema, acento, temaResolvido, mudarTema, mudarAcento } = useTema();
  const { level, purchases, salvarPerfil } = useStudentData();
  const [aviso, setAviso] = useState<string | null>(null);

  const corAtual = ACENTOS.find((a) => a.id === acento)?.amostra ?? ACENTOS[0].amostra;

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

  const trancadas = ACENTOS.filter((a) => a.item && !temItem(itemDaLoja(a.item)!, level.level, purchases));

  return (
    <div className="space-y-6">
      <Card as="section" aria-labelledby="titulo-modo" className="space-y-3">
        <SectionLabel as="h2" id="titulo-modo">
          Modo
        </SectionLabel>
        <div className="grid gap-2 sm:grid-cols-3">
          {TEMAS.map((t) => {
            const ativo = tema === t.id;
            const Icone = ICONE_DO_MODO[t.id];
            return (
              <label
                key={t.id}
                className={`flex cursor-pointer flex-col gap-3 rounded-xl border p-3 transition-colors ${
                  ativo ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-line-strong'
                }`}
              >
                <span className="flex items-center justify-center rounded-lg bg-sunken py-2 text-ink-faint">
                  <VinhetaJanela
                    size={88}
                    acento={corAtual}
                    escuro={t.id === 'escuro'}
                    dividida={t.id === 'sistema'}
                  />
                </span>
                <span className="flex items-start gap-2.5">
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
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                      <Icone size={15} className="text-ink-faint" />
                      {t.title}
                    </span>
                    <span className="block text-xs leading-relaxed text-ink-soft">
                      {t.id === 'sistema' && tema === 'sistema' ? `Agora: ${temaResolvido}.` : t.description}
                    </span>
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </Card>

      <Card as="section" aria-labelledby="titulo-cores" className="space-y-3">
        <SectionLabel as="h2" id="titulo-cores">
          Cor de destaque
        </SectionLabel>
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
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    ativo ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-line-strong'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span className="relative shrink-0 rounded-lg bg-sunken px-1 py-1" aria-hidden>
                    <VinhetaJanela size={64} acento={a.amostra} escuro={temaResolvido === 'escuro'} />
                    {(ativo || !aberto) && (
                      <span
                        className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface text-white"
                        style={{ background: aberto ? a.amostra : 'var(--color-ink-faint)' }}
                      >
                        {ativo ? <IconCheck size={13} strokeWidth={3} /> : <IconLock size={12} />}
                      </span>
                    )}
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
        {trancadas.length > 0 && (
          <Link
            to="/app/perfil/loja"
            className="inline-flex min-h-6 items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900"
          >
            Ver as cores na loja
            <IconArrowRight size={15} />
          </Link>
        )}
      </Card>

      {aviso && (
        <p role="status" className="text-xs leading-relaxed text-energy-700">
          {aviso}
        </p>
      )}
    </div>
  );
}
