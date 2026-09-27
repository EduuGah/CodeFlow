import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { useStudentData } from '../../contexts/StudentDataContext';
import { useTema } from '../../contexts/TemaContext';
import { mudancaDeEquipar } from '../../lib/equipar';
import { nomeParaMostrar } from '../../lib/perfil';
import { inicioDaSemana } from '../../lib/desafios';
import { destaquesDaSemana } from '../../lib/destaques';
import { fetchInativos } from '../../lib/loja-admin';
import { diaLocal, RECUPERAR_SEQUENCIA, somarDias } from '../../lib/sequencia';
import { ACENTOS } from '../../lib/tema';
import { PreviaDoPerfil } from './PreviaDoPerfil';
import {
  aVenda,
  HORAS_DE_DOBRO,
  itemDaLoja,
  ITENS,
  MOEDAS,
  RARIDADES,
  temItem,
  type ItemDaLoja,
  type Raridade,
  type TipoDeItem,
  visivel,
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
  { id: 'moldura', rotulo: 'Molduras' },
  { id: 'fundo', rotulo: 'Fundos' },
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

/**
 * "15 de janeiro": o último dia inteiro da janela (o fim é exclusivo), no
 * horário de Brasília — o da janela. No fuso do aparelho, um navegador em UTC
 * diria "16", porque a janela fecha às 3h UTC.
 */
function ultimoDiaDaJanela(ate: string): string {
  return new Date(Date.parse(ate) - 1).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Sao_Paulo',
  });
}

export function Loja() {
  const {
    moedas,
    purchases,
    level,
    sequencia,
    recuperacao,
    dobro,
    comprar,
    incompleto,
    reload,
    historico,
    perfil,
    salvarPerfil,
  } = useStudentData();
  const { user } = useAuth();
  const { mudarAcento } = useTema();
  const nome = nomeParaMostrar(perfil, user);
  const fotoDoGoogle = user?.user_metadata?.avatar_url as string | undefined;
  const [previa, setPrevia] = useState<string | null>(null);
  const [realce, setRealce] = useState<string | null>(null);
  // O que a administração tirou da venda (0017). Sem resposta, nada some: o
  // banco recusa a compra de qualquer jeito.
  const [inativos, setInativos] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    let vivo = true;
    fetchInativos().then((ids) => {
      if (vivo) setInativos(ids);
    });
    return () => {
      vivo = false;
    };
  }, []);
  const naLoja = (item: ItemDaLoja) =>
    visivel(item, level.level, purchases) && (!inativos.has(item.id) || temItem(item, level.level, purchases));
  const [equipandoAgora, setEquipandoAgora] = useState(false);
  const [equipadoAgora, setEquipadoAgora] = useState<string | null>(null);
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
    else {
      setComprado(item.id);
      setEquipadoAgora(null);
    }
  };

  /** Logo depois da compra, sem ir ao inventário: a mesma gravação dele. */
  const equiparAgora = async (item: ItemDaLoja) => {
    const mudanca = mudancaDeEquipar(item);
    if (!mudanca) return;
    setEquipandoAgora(true);
    if (mudanca.accent) mudarAcento(mudanca.accent);
    const { error } = await salvarPerfil(mudanca);
    setEquipandoAgora(false);
    if (error) setErro(error);
    else setEquipadoAgora(item.id);
  };

  const itemComprado = comprado ? itemDaLoja(comprado) : undefined;

  // Com o histórico incompleto, a posse também não é confiável: sem vitrine.
  const destaques = incompleto
    ? []
    : destaquesDaSemana(inicioDaSemana(diaLocal(new Date())), level.level, purchases).filter((i) => !inativos.has(i.id));

  /** Da vitrine ao cartão do item, na seção dele, com um realce breve. */
  const irAoItem = (id: string) => {
    const cartao = document.getElementById(`item-${id}`);
    if (!cartao) return;
    const reduzir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    cartao.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'center' });
    cartao.focus({ preventScroll: true });
    setRealce(id);
    window.setTimeout(() => setRealce((atual) => (atual === id ? null : atual)), 2000);
  };

  /** O perfil como ficaria com o item equipado — nada é gravado. */
  const perfilCom = (item: ItemDaLoja) => {
    const mudanca = mudancaDeEquipar(item) ?? {};
    return {
      avatar: mudanca.avatar ?? perfil.avatar,
      moldura: mudanca.moldura ?? perfil.moldura,
      fundo: mudanca.fundo ?? perfil.fundo,
      cor: mudanca.accent ? ACENTOS.find((a) => a.id === mudanca.accent)?.amostra : undefined,
    };
  };

  const grupos: Array<{ tipo: TipoDeItem; titulo: string; nota: string; itens: ItemDaLoja[] }> = [
    {
      tipo: 'consumivel',
      titulo: 'Para usar',
      nota: 'Consumíveis: cada compra é um uso.',
      itens: ITENS.filter((i) => i.tipo === 'consumivel' && naLoja(i)),
    },
    {
      tipo: 'tema',
      titulo: 'Cores de destaque',
      nota: 'Abrem por nível ou por moedas — o que vier primeiro. Aplicam-se na aparência.',
      itens: ITENS.filter((i) => i.tipo === 'tema' && naLoja(i)),
    },
    {
      tipo: 'avatar',
      titulo: 'Avatares',
      nota: 'Os que não vêm de graça — cada um abre no nível dele, ou antes, com moedas. Escolha em editar perfil.',
      itens: ITENS.filter((i) => i.tipo === 'avatar' && naLoja(i)),
    },
    {
      tipo: 'moldura',
      titulo: 'Molduras',
      nota: 'Um anel na borda do avatar, no perfil e no início. Abrem por nível ou por moedas; equipe no inventário.',
      itens: ITENS.filter((i) => i.tipo === 'moldura' && naLoja(i)),
    },
    {
      tipo: 'fundo',
      titulo: 'Fundos',
      nota: 'A capa do perfil, acima do seu nome. Abrem por nível ou por moedas; equipe no inventário.',
      itens: ITENS.filter((i) => i.tipo === 'fundo' && naLoja(i)),
    },
  ];

  const cartao = (item: ItemDaLoja) => {
    const seu = temItem(item, level.level, purchases);
    // A recuperação só se vende quando salva alguma coisa: comprada sem um dia
    // para cobrir, seriam moedas jogadas fora.
    const semEfeito = item.id === RECUPERAR_SEQUENCIA && !recuperacao;
    // Com o histórico incompleto o saldo não é confiável — nem para mais, nem para menos.
    const daPara = !incompleto && !semEfeito && moedas.saldo >= item.price;
    const estaConfirmando = confirmando === item.id;
    const liberadoPorNivel = item.nivelQueLibera !== undefined && level.level >= item.nivelQueLibera;

    return (
      // No celular a figura fica à esquerda e o card é uma linha; de `sm` para
      // cima vira um cartão em pé. Empilhar cartões em pé numa tela estreita
      // dava uma rolagem de 8 000 px para nove itens.
      <li
        key={item.id}
        id={`item-${item.id}`}
        tabIndex={-1}
        className={cardClasses({
          padding: 'none',
          className: `flex overflow-hidden outline-none transition-shadow sm:flex-col ${
            realce === item.id ? 'ring-2 ring-brand-600 ring-offset-2 ring-offset-canvas' : ''
          }`,
        })}
      >
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
          {/* A prévia: o item no próprio cabeçalho da pessoa, antes de comprar. */}
          {mudancaDeEquipar(item) && (
            <>
              <button
                type="button"
                className="inline-flex min-h-6 items-center self-start text-sm font-semibold text-brand-700 hover:underline"
                aria-expanded={previa === item.id}
                aria-controls={`previa-${item.id}`}
                onClick={() => setPrevia((atual) => (atual === item.id ? null : item.id))}
              >
                {previa === item.id ? 'Fechar a prévia' : 'Ver no meu perfil'}
              </button>
              {previa === item.id && (
                <div id={`previa-${item.id}`} className="animar-pousar">
                  <PreviaDoPerfil nome={nome} nivel={level.level} fotoDoGoogle={fotoDoGoogle} {...perfilCom(item)} />
                </div>
              )}
            </>
          )}
          {item.nivelQueLibera !== undefined && !seu && (
            <span className="label-mono text-ink-faint">ou de graça no nível {item.nivelQueLibera}</span>
          )}
          {item.nivelQueLibera === undefined && !item.disponivelAte && item.tipo !== 'consumivel' && !seu && (
            <span className="label-mono text-ink-faint">só por moedas: nenhum nível abre</span>
          )}
          {/* O sazonal diz até quando, e só: sem relógio, sem "últimos dias". */}
          {item.disponivelAte && !seu && aVenda(item) && (
            <span className="label-mono text-ink-faint">
              à venda até {ultimoDiaDaJanela(item.disponivelAte)} · depois, quem comprou fica com ele
            </span>
          )}
          {item.id === 'congelar-sequencia' && sequencia.congelamentosRestantes > 0 && (
            <span className="label-mono text-brand-700">
              {sequencia.congelamentosRestantes} guardado{sequencia.congelamentosRestantes === 1 ? '' : 's'}
            </span>
          )}
          {item.id === RECUPERAR_SEQUENCIA && (
            <span className={`label-mono ${recuperacao ? 'text-brand-700' : 'text-ink-faint'}`}>
              {recuperacao
                ? `cobre ${recuperacao.dia === somarDias(diaLocal(new Date()), -1) ? 'ontem' : 'anteontem'}: a sequência volta a ${recuperacao.para} dias`
                : 'nada para recuperar agora'}
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
                  {incompleto
                    ? 'saldo indisponível'
                    : semEfeito
                      ? 'sem uso agora'
                      : daPara
                        ? 'dá para comprar'
                        : `faltam ${item.price - moedas.saldo}`}
                </span>
                <Button
                  size="sm"
                  variant={daPara ? 'primary' : 'outline'}
                  disabled={!daPara}
                  onClick={() => setConfirmando(item.id)}
                  icon={daPara ? <IconCoin size={15} /> : <IconLock size={15} />}
                  title={daPara || incompleto || semEfeito ? undefined : `Faltam ${item.price - moedas.saldo} moedas`}
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
          {comprado === RECUPERAR_SEQUENCIA && ` Sua sequência está em ${sequencia.atual} dia${sequencia.atual === 1 ? '' : 's'}.`}
          {equipadoAgora === comprado
            ? ' Equipado.'
            : itemComprado &&
              mudancaDeEquipar(itemComprado) && (
                <>
                  {' '}
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-1 h-8 align-middle"
                    loading={equipandoAgora}
                    onClick={() => void equiparAgora(itemComprado)}
                  >
                    Equipar agora
                  </Button>{' '}
                  <Link to="/app/perfil/inventario" className="font-semibold underline">
                    ou ver no inventário
                  </Link>
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

      {/* A vitrine: links para os cartões, não cópias deles — cada item mora
          numa seção só. */}
      {filtro === 'todos' && destaques.length > 0 && (
        <section aria-labelledby="titulo-destaques">
          <SectionLabel as="h2" id="titulo-destaques" className="mb-0.5">
            Destaques da semana
          </SectionLabel>
          <p className="mb-3 text-xs leading-relaxed text-ink-faint">
            Três dos que você ainda não tem, trocados toda segunda. Nenhum fica mais barato nem some: é só uma
            vitrine.
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {destaques.map((item) => (
              <a
                key={item.id}
                href={`#item-${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  irAoItem(item.id);
                }}
                className={cardClasses({
                  padding: 'none',
                  className:
                    'flex flex-col items-center gap-1.5 overflow-hidden p-2 text-center transition-colors hover:border-line-strong hover:bg-sunken sm:p-3',
                })}
                data-destaque={item.id}
              >
                <span className="flex h-16 items-center justify-center" aria-hidden>
                  <FiguraDoItem item={item} />
                </span>
                <span className="line-clamp-2 text-xs font-semibold leading-tight text-ink sm:text-sm">{item.title}</span>
                <span className="label-mono flex items-center gap-1 tabular-nums text-ink-faint">
                  <IconCoin size={12} aria-hidden />
                  {item.price}
                  <span className="sr-only"> moedas</span>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

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

      {historico.linhas.length > 0 && (
        <section aria-labelledby="titulo-historico">
          <SectionLabel as="h2" id="titulo-historico" className="mb-0.5">
            Histórico de compras
          </SectionLabel>
          <p className="mb-3 text-xs leading-relaxed text-ink-faint">
            O que sobrou depois de cada compra é recontado até aquele instante — não há saldo guardado.
            {historico.semData > 0 &&
              ` As ${historico.semData} moedas de projetos não têm hora, e entram como já ganhas em todas as linhas.`}
          </p>
          <Card as="ol" padding="none" className="divide-y divide-line overflow-hidden">
            {historico.linhas.map(({ compra, item, saldoDepois }) => (
              <li key={`${compra.createdAt}-${compra.item}`} className="flex flex-wrap items-center gap-x-4 gap-y-0.5 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">{item?.title ?? compra.item}</span>
                  <time dateTime={compra.createdAt} className="block text-xs text-ink-faint">
                    {new Date(compra.createdAt).toLocaleString('pt-BR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </span>
                <span className="text-right text-sm tabular-nums">
                  <span className="block font-semibold text-ink">{compra.price} moedas</span>
                  <span className="block text-xs text-ink-soft">
                    {incompleto ? 'saldo indisponível' : `sobraram ${saldoDepois}`}
                  </span>
                </span>
              </li>
            ))}
          </Card>
        </section>
      )}

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
