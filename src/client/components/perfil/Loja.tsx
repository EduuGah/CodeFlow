import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useStudentData } from '../../contexts/StudentDataContext';
import {
  HORAS_DE_DOBRO,
  ITENS,
  MOEDAS,
  RARIDADES,
  temItem,
  type ItemDaLoja,
  type Raridade,
  type TipoDeItem,
} from '../../lib/economia';
import { FiguraDoItem } from './FiguraDoItem';
import { Button } from '../ui/Button';
import { Card, SectionLabel, cardClasses } from '../ui/Card';
import {
  IconCalendarCheck,
  IconCheck,
  IconCoin,
  IconLesson,
  IconLock,
  IconProject,
  IconStreak,
  IconTarget,
} from '../ui/Icon';
import { VinhetaMoedas } from '../ui/Ilustracao';

/**
 * A loja.
 *
 * O saldo é ganho menos gasto, e os dois números ficam à vista com a origem
 * de cada um — moeda que a pessoa não consegue auditar vira superstição, igual
 * ao XP. Ao lado, a tabela de como se ganha: são os números de verdade de
 * `MOEDAS`, não uma promessa.
 *
 * Cada item é um card com a figura do que ele é: o floco, o raio, a janela
 * pintada na cor do tema, o avatar. Comprar pede uma confirmação em linha (o
 * botão vira "Confirmar por 60"), não um modal: a decisão é pequena, e o
 * arrependimento é de um toque. Um consumível pode ser comprado de novo; um
 * cosmético que a pessoa já tem — por nível ou por compra — aparece como seu.
 *
 * Os filtros e o saldo ficam presos no topo enquanto a lista rola: é o que se
 * consulta a cada item ("isso cabe?"), e rolar de volta para ver o saldo era
 * o gesto mais repetido da página.
 */

/** O selo da raridade: texto sempre, a cor só reforça. */
const TOM_DA_RARIDADE: Record<Raridade, string> = {
  comum: 'bg-sunken text-ink-soft',
  incomum: 'bg-success-50 text-success-700',
  raro: 'bg-brand-50 text-brand-700',
  epico: 'bg-energy-50 text-energy-700',
  lendario: 'bg-energy-50 text-energy-700',
};

type Filtro = 'todos' | TipoDeItem;

const FILTROS: Array<{ id: Filtro; rotulo: string }> = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'avatar', rotulo: 'Avatares' },
  { id: 'tema', rotulo: 'Temas' },
  { id: 'consumivel', rotulo: 'Consumíveis' },
];

const COMO_GANHAR = [
  { Icone: IconLesson, texto: 'aula concluída', valor: MOEDAS.porAulaConcluida },
  { Icone: IconProject, texto: 'projeto entregue', valor: MOEDAS.porProjetoEntregue },
  { Icone: IconTarget, texto: 'desafio do dia', valor: MOEDAS.porDesafioDiario },
  { Icone: IconCalendarCheck, texto: 'desafio da semana', valor: MOEDAS.porDesafioSemanal },
  { Icone: IconStreak, texto: '7 dias seguidos', valor: MOEDAS.porSemanaSeguida },
  { Icone: IconStreak, texto: '30 dias seguidos', valor: MOEDAS.porMesSeguido },
];

export function Loja() {
  const { moedas, purchases, level, sequencia, dobro, comprar, incompleto, reload } = useStudentData();
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [comprando, setComprando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [comprado, setComprado] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const confirmar = async (item: ItemDaLoja) => {
    setComprando(item.id);
    setErro(null);
    const { error } = await comprar(item.id);
    setComprando(null);
    setConfirmando(null);
    if (error) setErro(error);
    else setComprado(item.id);
  };

  const grupos: Array<{ tipo: TipoDeItem; titulo: string; nota: string; itens: ItemDaLoja[] }> = [
    {
      tipo: 'consumivel',
      titulo: 'Para usar',
      nota: 'Consumíveis: cada compra é um uso.',
      itens: ITENS.filter((i) => i.tipo === 'consumivel'),
    },
    {
      tipo: 'tema',
      titulo: 'Cores de destaque',
      nota: 'Abrem por nível ou por moedas — o que vier primeiro. Aplicam-se na aparência.',
      itens: ITENS.filter((i) => i.tipo === 'tema'),
    },
    {
      tipo: 'avatar',
      titulo: 'Avatares',
      nota: 'Os que não vêm de graça — cada um abre no nível dele, ou antes, com moedas. Escolha em editar perfil.',
      itens: ITENS.filter((i) => i.tipo === 'avatar'),
    },
  ];

  const cartao = (item: ItemDaLoja) => {
    const seu = temItem(item, level.level, purchases);
    // Com o histórico incompleto o saldo não é confiável — nem para mais, nem para menos.
    const daPara = !incompleto && moedas.saldo >= item.price;
    const estaConfirmando = confirmando === item.id;
    const liberadoPorNivel = item.nivelQueLibera !== undefined && level.level >= item.nivelQueLibera;

    return (
      // No celular a figura fica à esquerda e o card é uma linha; de `sm` para
      // cima vira um cartão em pé. Empilhar cartões em pé numa tela estreita
      // dava uma rolagem de 8 000 px para nove itens.
      <li key={item.id} className={cardClasses({ padding: 'none', className: 'flex overflow-hidden sm:flex-col' })}>
        <div className="relative flex w-24 shrink-0 items-center justify-center bg-sunken sm:h-28 sm:w-auto">
          <FiguraDoItem item={item} />
          {seu && (
            <span
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-success-600 text-white"
              aria-hidden
            >
              <IconCheck size={13} strokeWidth={3} />
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1 p-3 sm:p-4">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-ink">{item.title}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TOM_DA_RARIDADE[item.raridade]}`}>
              {RARIDADES[item.raridade].rotulo}
            </span>
          </span>
          <span className="text-sm leading-relaxed text-ink-soft">{item.description}</span>
          {item.nivelQueLibera !== undefined && !seu && (
            <span className="label-mono text-ink-faint">ou de graça no nível {item.nivelQueLibera}</span>
          )}
          {item.id === 'congelar-sequencia' && sequencia.congelamentosRestantes > 0 && (
            <span className="label-mono text-brand-700">
              {sequencia.congelamentosRestantes} guardado{sequencia.congelamentosRestantes === 1 ? '' : 's'}
            </span>
          )}
          {item.id === 'dobro-de-xp' && dobro && (
            <span className="label-mono text-brand-700">
              ativo até {dobro.ate.toLocaleString('pt-BR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
            {seu ? (
              <span className="label-mono text-success-700">{liberadoPorNivel ? 'seu, pelo nível' : 'seu'}</span>
            ) : estaConfirmando ? (
              <>
                <Button size="sm" onClick={() => confirmar(item)} loading={comprando === item.id} icon={<IconCoin size={15} />}>
                  Confirmar por {item.price}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmando(null)} disabled={comprando === item.id}>
                  Não
                </Button>
              </>
            ) : (
              <>
                <span className="label-mono text-ink-faint">
                  {incompleto ? 'saldo indisponível' : daPara ? 'dá para comprar' : `faltam ${item.price - moedas.saldo}`}
                </span>
                <Button
                  size="sm"
                  variant={daPara ? 'primary' : 'outline'}
                  disabled={!daPara}
                  onClick={() => setConfirmando(item.id)}
                  icon={daPara ? <IconCoin size={15} /> : <IconLock size={15} />}
                  title={daPara || incompleto ? undefined : `Faltam ${item.price - moedas.saldo} moedas`}
                >
                  {item.price}
                </Button>
              </>
            )}
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      {/* O saldo, com a origem. */}
      <Card as="section" aria-labelledby="titulo-saldo" className="flex flex-wrap items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-energy-50 text-energy-700" aria-hidden>
          <VinhetaMoedas size={44} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="titulo-saldo" className="text-2xl font-extrabold tabular-nums tracking-tight text-ink">
            {moedas.saldo} moedas
          </h2>
          <p className="text-xs leading-relaxed text-ink-faint">
            ganhas {moedas.ganhas.total} · gastas {moedas.gastas}
          </p>
          <p className="text-xs leading-relaxed text-ink-faint">
            aulas {moedas.ganhas.aulas} · projetos {moedas.ganhas.projetos} · desafios {moedas.ganhas.desafios} ·
            sequência {moedas.ganhas.sequencia}
          </p>
        </div>
      </Card>

      {incompleto && (
        <Card tone="caution" className="flex flex-wrap items-center justify-between gap-3 text-sm text-energy-700">
          <span className="min-w-0 flex-1">
            Parte do seu histórico não carregou, então o saldo acima pode estar errado. As compras voltam quando
            ele carregar inteiro.
          </span>
          <Button size="sm" variant="outline" onClick={reload}>
            Carregar de novo
          </Button>
        </Card>
      )}

      {erro && (
        <p role="alert" className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {erro}
        </p>
      )}
      {comprado && !erro && (
        <p role="status" className="animar-pousar rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-sm text-success-700">
          Comprado: {ITENS.find((i) => i.id === comprado)?.title}.
          {comprado === 'congelar-sequencia' && ' Ele entra sozinho no primeiro dia sem estudo.'}
          {comprado === 'dobro-de-xp' && ` Vale a partir de agora, por ${HORAS_DE_DOBRO} horas.`}
          {comprado.startsWith('tema-') && (
            <>
              {' '}
              <Link to="/app/perfil/aparencia" className="font-semibold underline">
                Aplicar na aparência
              </Link>
              .
            </>
          )}
        </p>
      )}

      {/* Preso no topo: o filtro e o saldo, que se consultam a cada item. */}
      <div className="sticky top-0 z-20 -mx-4 flex items-center gap-2 border-b border-line bg-canvas/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        {/* Numa tela estreita, só os filtros quebram linha: o saldo fica à direita. */}
        <div role="group" aria-label="Mostrar" className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {FILTROS.map(({ id, rotulo }) => (
            <button
              key={id}
              type="button"
              aria-pressed={filtro === id}
              onClick={() => setFiltro(id)}
              className={`min-h-8 rounded-full border px-2.5 text-xs font-semibold transition-colors sm:min-h-9 sm:px-3 sm:text-sm ${
                filtro === id
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink'
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>
        <span className="flex shrink-0 items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm font-bold tabular-nums text-ink">
            <IconCoin size={15} className="text-energy-700" aria-hidden />
            {incompleto ? '—' : moedas.saldo}
            <span className="sr-only">moedas de saldo</span>
          </span>
          <Link
            to="/app/perfil/inventario"
            className="inline-flex min-h-8 items-center text-sm font-semibold text-brand-700 hover:underline"
          >
            Inventário
          </Link>
        </span>
      </div>

      {grupos
        .filter((g) => filtro === 'todos' || g.tipo === filtro)
        .map((g) => (
          <section key={g.titulo} aria-label={g.titulo}>
            <SectionLabel as="h2" className="mb-0.5">
              {g.titulo}
            </SectionLabel>
            <p className="mb-3 text-xs leading-relaxed text-ink-faint">{g.nota}</p>
            <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">{g.itens.map(cartao)}</ul>
          </section>
        ))}

      <Card as="section" aria-labelledby="titulo-ganhar" tone="sunken">
        <h2 id="titulo-ganhar" className="font-bold text-ink">
          Como as moedas entram
        </h2>
        <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {COMO_GANHAR.map(({ Icone, texto, valor }) => (
            <li key={texto} className="flex items-center gap-2.5 text-sm text-ink-soft">
              <Icone size={17} className="shrink-0 text-ink-faint" />
              <span className="flex-1">{texto}</span>
              <span className="label-mono flex items-center gap-1 tabular-nums text-ink">
                <IconCoin size={12} />
                {valor}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          Tudo entra sozinho, na hora. Nada aqui é comprado com dinheiro.
        </p>
      </Card>
    </div>
  );
}
