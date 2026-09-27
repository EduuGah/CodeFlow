import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { useStudentData } from '../../contexts/StudentDataContext';
import { useTema } from '../../contexts/TemaContext';
import { itemDaLoja, posseDe, RARIDADES, visivel, type ItemDaLoja, type Posse, type Purchase } from '../../lib/economia';
import { ITENS_DE_CONQUISTA, posseDeConquista, type ItemDeConquista, type PosseDeConquista } from '../../lib/exclusivos';
import type { Achievement } from '../../lib/gamification';
import { ACENTOS } from '../../lib/tema';
import { AVATARES, AvatarDesenhado, avatarPreset } from '../ui/Avatar';
import { FUNDOS, FundoDesenhado, ehFundo, type IdDeFundo } from '../ui/Fundo';
import { ComMoldura, MOLDURAS, ehMoldura, type IdDeMoldura } from '../ui/Moldura';
import { Button } from '../ui/Button';
import { SectionLabel, cardClasses } from '../ui/Card';
import { IconCheck, IconLock } from '../ui/Icon';
import { VinhetaFloco, VinhetaJanela, VinhetaRaioDuplo } from '../ui/Ilustracao';
import { EscolherTitulo } from './EscolherTitulo';

/**
 * O inventário: tudo o que é da pessoa, por categoria, e o que falta para o
 * resto.
 *
 * A loja responde "o que eu posso comprar"; aqui a pergunta é "o que eu já
 * tenho, e o que estou usando". Cada coisa diz de onde veio — de graça, pelo
 * nível, comprada — porque a origem é parte do que ela significa. O que está
 * trancado diz o nível que abre e o preço, e leva à loja; nada aqui vende.
 * Os itens de conquista não têm preço: o trancado diz a conquista que falta.
 *
 * Equipar é um toque: vale na hora e vai para a conta. Moldura e fundo têm
 * também o "sem": tirar é uma escolha tão legítima quanto pôr.
 */

type PosseDaPeca = Posse | PosseDeConquista;

const ORIGEM: Record<Extract<PosseDaPeca, { tem: true }>['origem'], string> = {
  livre: 'de graça',
  nivel: 'pelo nível',
  compra: 'comprado',
  conquista: 'pela conquista',
};

interface Peca {
  chave: string;
  titulo: string;
  figura: ReactNode;
  item: ItemDaLoja | undefined;
  posse: PosseDaPeca;
  /** Não se vende: abre por conquista. */
  exclusivo?: boolean;
  equipado: boolean;
  equipar: () => Promise<{ error?: string }>;
  /** A cor vale neste aparelho mesmo se a conta não gravar; o resto, não. */
  local?: boolean;
  /** O que dizer quando der certo, se não for "<título> equipado". */
  feito?: string;
}

/** Quantos cosméticos (os de graça e os de conquista incluídos) já são da pessoa. */
export function contarCosmeticos(
  nivel: number,
  purchases: Purchase[],
  conquistas: Achievement[]
): { seus: number; total: number } {
  const itens = [
    ...AVATARES.map((p) => itemDaLoja(`avatar-${p.id}`)),
    ...ACENTOS.map((a) => (a.item ? itemDaLoja(a.item) : undefined)),
    ...MOLDURAS.map((id) => itemDaLoja(`moldura-${id}`)),
    ...FUNDOS.map((id) => itemDaLoja(`fundo-${id}`)),
  ];
  // Um sazonal fora da janela só conta para quem o tem.
  const contaveis = itens.filter((i) => !i || visivel(i, nivel, purchases));
  const daLoja = contaveis.filter((i) => posseDe(i, nivel, purchases).tem).length;
  const deConquista = ITENS_DE_CONQUISTA.filter((i) => posseDeConquista(i, conquistas).tem).length;
  return { seus: daLoja + deConquista, total: contaveis.length + ITENS_DE_CONQUISTA.length };
}

/** Equipado primeiro, depois o que é seu, depois o que falta — pelo nível que abre (conquista por último). */
function emOrdem(pecas: Peca[]): Peca[] {
  const peso = (p: Peca) => (p.equipado ? 0 : p.posse.tem ? 1 : 2);
  const nivel = (p: Peca) => (p.posse.tem ? 0 : 'nivel' in p.posse ? (p.posse.nivel ?? 99) : 100);
  return [...pecas].sort((a, b) => peso(a) - peso(b) || nivel(a) - nivel(b));
}

export function Inventario() {
  const { perfil, level, purchases, sequencia, dobro, salvarPerfil, achievements } = useStudentData();
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
      local: true,
    };
  });

  /** O que todo item de conquista tem em comum: sem preço, posse pela conquista. */
  const deConquista = (item: ItemDeConquista) => ({
    chave: item.id,
    titulo: item.title,
    item: undefined,
    posse: posseDeConquista(item, achievements),
    exclusivo: true,
  });

  // As molduras aparecem no avatar da própria pessoa (ou num de graça, se ela
  // usa foto): é assim que ela vai vê-las.
  const base = avatarPreset(perfil.avatar?.startsWith('preset:') ? perfil.avatar.slice('preset:'.length) : '') ?? AVATARES[0];
  const molduraAtual = ehMoldura(perfil.moldura) ? perfil.moldura : null;
  const molduras: Peca[] = [
    {
      chave: 'moldura-nenhuma',
      titulo: 'Sem moldura',
      figura: <AvatarDesenhado preset={base} size={48} />,
      item: undefined,
      posse: { tem: true, origem: 'livre' },
      equipado: molduraAtual === null,
      equipar: () => salvarPerfil({ moldura: null }),
      feito: 'Moldura tirada.',
    },
    ...MOLDURAS.map((id): Peca => {
      const item = itemDaLoja(`moldura-${id}`);
      return {
        chave: `moldura-${id}`,
        titulo: item?.title ?? id,
        figura: (
          <ComMoldura moldura={id} size={48}>
            <AvatarDesenhado preset={base} size={48} />
          </ComMoldura>
        ),
        item,
        posse: posseDe(item, level.level, purchases),
        equipado: molduraAtual === id,
        equipar: () => salvarPerfil({ moldura: id }),
      };
    }),
    ...ITENS_DE_CONQUISTA.filter((i) => i.tipo === 'moldura').map((item): Peca => {
      const id = item.curto as IdDeMoldura;
      return {
        ...deConquista(item),
        figura: (
          <ComMoldura moldura={id} size={48}>
            <AvatarDesenhado preset={base} size={48} />
          </ComMoldura>
        ),
        equipado: molduraAtual === id,
        equipar: () => salvarPerfil({ moldura: id }),
      };
    }),
  ];

  const fundoAtual = ehFundo(perfil.fundo) ? perfil.fundo : null;
  const fundos: Peca[] = [
    {
      chave: 'fundo-nenhum',
      titulo: 'Sem fundo',
      figura: <span className="block h-12 w-20 rounded-lg border border-dashed border-line-strong bg-sunken" />,
      item: undefined,
      posse: { tem: true, origem: 'livre' },
      equipado: fundoAtual === null,
      equipar: () => salvarPerfil({ fundo: null }),
      feito: 'Fundo tirado.',
    },
    ...FUNDOS.filter((id) => {
      // O sazonal fora da janela não aparece para quem não o tem.
      const item = itemDaLoja(`fundo-${id}`);
      return !item || visivel(item, level.level, purchases);
    }).map((id): Peca => {
      const item = itemDaLoja(`fundo-${id}`);
      return {
        chave: `fundo-${id}`,
        titulo: item?.title ?? id,
        figura: <FundoDesenhado id={id} className="h-12 w-20 rounded-lg" />,
        item,
        posse: posseDe(item, level.level, purchases),
        equipado: fundoAtual === id,
        equipar: () => salvarPerfil({ fundo: id }),
      };
    }),
    ...ITENS_DE_CONQUISTA.filter((i) => i.tipo === 'fundo').map((item): Peca => {
      const id = item.curto as IdDeFundo;
      return {
        ...deConquista(item),
        figura: <FundoDesenhado id={id} className="h-12 w-20 rounded-lg" />,
        equipado: fundoAtual === id,
        equipar: () => salvarPerfil({ fundo: id }),
      };
    }),
  ];

  const equipar = async (peca: Peca) => {
    setEquipando(peca.chave);
    const { error } = await peca.equipar();
    setEquipando(null);
    setAviso(
      error
        ? {
            ok: false,
            texto: peca.local
              ? `${peca.titulo} vale neste aparelho, mas não foi salvo na sua conta. ${error}`
              : `${peca.titulo} não foi equipado. ${error}`,
          }
        : { ok: true, texto: peca.feito ?? `${peca.titulo} equipado.` }
    );
  };

  const secoes = [
    { titulo: 'Avatares', nota: 'O que aparece no seu perfil e na tela inicial.', pecas: emOrdem(avatares) },
    { titulo: 'Molduras', nota: 'Um anel na borda do seu avatar.', pecas: emOrdem(molduras) },
    { titulo: 'Fundos', nota: 'A capa do seu perfil, acima do seu nome.', pecas: emOrdem(fundos) },
    { titulo: 'Cores de destaque', nota: 'A cor dos botões, das barras e dos destaques.', pecas: emOrdem(cores) },
  ];

  const { seus, total } = contarCosmeticos(level.level, purchases, achievements);

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
                    {peca.exclusivo && <span className="text-xs font-semibold text-ink-faint">De conquista</span>}
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
                  ) : 'conquista' in peca.posse ? (
                    // Não se vende: o caminho é a conquista, e é para lá que o link leva.
                    <p className="text-xs leading-relaxed text-ink-soft">
                      Abre com a conquista{' '}
                      <span className="font-semibold text-ink">{peca.posse.conquista?.title}</span>
                      {peca.posse.conquista?.progresso && (
                        <span className="tabular-nums">
                          {' '}
                          ({peca.posse.conquista.progresso.atual}/{peca.posse.conquista.progresso.meta})
                        </span>
                      )}
                      .{' '}
                      <Link to="/app/perfil/conquistas" className="font-semibold text-brand-700 underline">
                        Ver conquistas
                      </Link>
                    </p>
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

      <EscolherTitulo onAviso={setAviso} />

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
