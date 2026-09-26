import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { useStudentData } from '../../contexts/StudentDataContext';
import { useTema } from '../../contexts/TemaContext';
import { itemDaLoja, posseDe, RARIDADES, type ItemDaLoja, type Posse, type Purchase } from '../../lib/economia';
import { ACENTOS } from '../../lib/tema';
import { AVATARES, AvatarDesenhado } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { SectionLabel, cardClasses } from '../ui/Card';
import { IconCheck, IconLock } from '../ui/Icon';
import { VinhetaFloco, VinhetaJanela, VinhetaRaioDuplo } from '../ui/Ilustracao';

/**
 * O inventário: tudo o que é da pessoa, por categoria, e o que falta para o
 * resto.
 *
 * A loja responde "o que eu posso comprar"; aqui a pergunta é "o que eu já
 * tenho, e o que estou usando". Cada coisa diz de onde veio — de graça, pelo
 * nível, comprada — porque a origem é parte do que ela significa. O que está
 * trancado diz o nível que abre e o preço, e leva à loja; nada aqui vende.
 *
 * Equipar é um toque: o avatar e a cor valem na hora e vão para a conta.
 */

const ORIGEM: Record<Extract<Posse, { tem: true }>['origem'], string> = {
  livre: 'de graça',
  nivel: 'pelo nível',
  compra: 'comprado',
};

interface Peca {
  chave: string;
  titulo: string;
  figura: ReactNode;
  item: ItemDaLoja | undefined;
  posse: Posse;
  equipado: boolean;
  equipar: () => Promise<{ error?: string }>;
}

/** Quantos cosméticos (avatares e cores, os de graça incluídos) já são da pessoa. */
export function contarCosmeticos(nivel: number, purchases: Purchase[]): { seus: number; total: number } {
  const itens = [
    ...AVATARES.map((p) => itemDaLoja(`avatar-${p.id}`)),
    ...ACENTOS.map((a) => (a.item ? itemDaLoja(a.item) : undefined)),
  ];
  return { seus: itens.filter((i) => posseDe(i, nivel, purchases).tem).length, total: itens.length };
}

/** Equipado primeiro, depois o que é seu, depois o que falta — pelo nível que abre. */
function emOrdem(pecas: Peca[]): Peca[] {
  const peso = (p: Peca) => (p.equipado ? 0 : p.posse.tem ? 1 : 2);
  const nivel = (p: Peca) => (p.posse.tem ? 0 : (p.posse.nivel ?? 99));
  return [...pecas].sort((a, b) => peso(a) - peso(b) || nivel(a) - nivel(b));
}

export function Inventario() {
  const { perfil, level, purchases, sequencia, dobro, salvarPerfil } = useStudentData();
  const { acento, mudarAcento } = useTema();
  const [equipando, setEquipando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  const avatares: Peca[] = AVATARES.map((preset) => {
    const item = itemDaLoja(`avatar-${preset.id}`);
    return {
      chave: `avatar-${preset.id}`,
      titulo: `Avatar ${preset.title}`,
      figura: <AvatarDesenhado preset={preset} size={48} />,
      item,
      posse: posseDe(item, level.level, purchases),
      equipado: perfil.avatar === `preset:${preset.id}`,
      equipar: () => salvarPerfil({ avatar: `preset:${preset.id}` }),
    };
  });

  const cores: Peca[] = ACENTOS.map((a) => {
    const item = a.item ? itemDaLoja(a.item) : undefined;
    return {
      chave: `cor-${a.id}`,
      titulo: `Cor ${a.title}`,
      figura: <VinhetaJanela size={56} acento={a.amostra} escuro={false} />,
      item,
      posse: posseDe(item, level.level, purchases),
      equipado: acento === a.id,
      equipar: async () => {
        // Como na aparência: vale na hora neste aparelho, e depois vai para a conta.
        mudarAcento(a.id);
        return salvarPerfil({ accent: a.id });
      },
    };
  });

  const equipar = async (peca: Peca) => {
    setEquipando(peca.chave);
    const { error } = await peca.equipar();
    setEquipando(null);
    setAviso(
      error
        ? { ok: false, texto: `${peca.titulo} vale neste aparelho, mas não foi salvo na sua conta. ${error}` }
        : { ok: true, texto: `${peca.titulo} equipado.` }
    );
  };

  const secoes = [
    { titulo: 'Avatares', nota: 'O que aparece no seu perfil e na tela inicial.', pecas: emOrdem(avatares) },
    { titulo: 'Cores de destaque', nota: 'A cor dos botões, das barras e dos destaques.', pecas: emOrdem(cores) },
  ];

  const { seus, total } = contarCosmeticos(level.level, purchases);

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-soft">
        {seus} de {total} cosméticos são seus.{' '}
        <Link to="/app/perfil/loja" className="inline-flex min-h-6 items-center font-semibold text-brand-700 hover:underline">
          Ir à loja
        </Link>
      </p>

      {aviso && (
        <p
          role={aviso.ok ? 'status' : 'alert'}
          className={`rounded-lg border px-3 py-2 text-sm ${
            aviso.ok
              ? 'animar-pousar border-success-200 bg-success-50 text-success-700'
              : 'border-danger-200 bg-danger-50 text-danger-700'
          }`}
        >
          {aviso.texto}
        </p>
      )}

      {secoes.map((secao) => (
        <section key={secao.titulo} aria-label={secao.titulo}>
          <SectionLabel as="h2" className="mb-0.5">
            {secao.titulo}
          </SectionLabel>
          <p className="mb-3 text-xs leading-relaxed text-ink-faint">{secao.nota}</p>
          <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {secao.pecas.map((peca) => (
              <li
                key={peca.chave}
                className={cardClasses({
                  padding: 'sm',
                  className: `flex items-center gap-3 ${peca.posse.tem ? '' : 'bg-sunken'}`,
                })}
              >
                <span className={`relative shrink-0 ${peca.posse.tem ? '' : 'opacity-50'}`} aria-hidden>
                  {peca.figura}
                  {!peca.posse.tem && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface text-ink-faint ring-1 ring-line">
                      <IconLock size={12} />
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-semibold text-ink">{peca.titulo}</span>
                    {peca.item && (
                      <span className="text-xs font-semibold text-ink-faint">{RARIDADES[peca.item.raridade].rotulo}</span>
                    )}
                  </span>
                  {peca.posse.tem ? (
                    <span className="flex flex-wrap items-center gap-2">
                      {peca.equipado ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-700">
                          <IconCheck size={12} strokeWidth={3} />
                          Equipado
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          loading={equipando === peca.chave}
                          onClick={() => void equipar(peca)}
                          aria-label={`Equipar ${peca.titulo}`}
                        >
                          Equipar
                        </Button>
                      )}
                      <span className="label-mono text-ink-faint">{ORIGEM[peca.posse.origem]}</span>
                    </span>
                  ) : (
                    // Uma frase com o link dentro: é texto corrido, e é assim que se lê.
                    <p className="text-xs leading-relaxed text-ink-soft">
                      {peca.posse.nivel !== undefined ? `Abre no nível ${peca.posse.nivel}, ou ` : ''}
                      <Link to="/app/perfil/loja" className="font-semibold text-brand-700 underline">
                        {peca.posse.preco} moedas na loja
                      </Link>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section aria-label="Para usar">
        <SectionLabel as="h2" className="mb-0.5">
          Para usar
        </SectionLabel>
        <p className="mb-3 text-xs leading-relaxed text-ink-faint">
          Consumíveis: entram sozinhos quando servem, e cada compra é um uso.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          <li className={cardClasses({ padding: 'sm', className: 'flex items-center gap-3' })}>
            <span className="shrink-0" aria-hidden>
              <VinhetaFloco size={48} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink">Congelar a sequência</span>
              <span className="block text-sm text-ink-soft">
                {sequencia.congelamentosRestantes === 0
                  ? 'Nenhum guardado.'
                  : `${sequencia.congelamentosRestantes} guardado${sequencia.congelamentosRestantes === 1 ? '' : 's'} — entra no primeiro dia sem estudo.`}
              </span>
            </span>
          </li>
          <li className={cardClasses({ padding: 'sm', className: 'flex items-center gap-3' })}>
            <span className="shrink-0" aria-hidden>
              <VinhetaRaioDuplo size={48} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink">Dobro de XP</span>
              <span className="block text-sm text-ink-soft">
                {dobro
                  ? `Ativo até ${dobro.ate.toLocaleString('pt-BR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}.`
                  : 'Nenhum ativo.'}
              </span>
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
