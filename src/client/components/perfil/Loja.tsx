import { useState } from 'react';

import { useStudentData } from '../../contexts/StudentDataContext';
import { ITENS, temItem, type ItemDaLoja } from '../../lib/economia';
import { Button } from '../ui/Button';
import { Card, SectionLabel } from '../ui/Card';
import { IconBolt, IconCheck, IconCoin, IconFreeze, IconLock, IconPalette } from '../ui/Icon';

/**
 * A loja.
 *
 * O saldo é ganho menos gasto, e os dois números ficam à vista com a origem
 * de cada um — moeda que a pessoa não consegue auditar vira superstição, igual
 * ao XP. Comprar pede uma confirmação em linha (o botão vira "Confirmar por
 * 60"), não um modal: a decisão é pequena, e o arrependimento é de um toque.
 *
 * Um consumível pode ser comprado de novo (cada compra é um uso); um
 * cosmético que a pessoa já tem — por nível ou por compra — aparece como seu,
 * sem botão.
 */
function IconeDoItem({ item }: { item: ItemDaLoja }) {
  if (item.id === 'congelar-sequencia') return <IconFreeze size={20} />;
  if (item.id === 'dobro-de-xp') return <IconBolt size={20} />;
  return <IconPalette size={20} />;
}

export function Loja() {
  const { moedas, purchases, level, sequencia, dobro, comprar } = useStudentData();
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [comprando, setComprando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [comprado, setComprado] = useState<string | null>(null);

  const confirmar = async (item: ItemDaLoja) => {
    setComprando(item.id);
    setErro(null);
    const { error } = await comprar(item.id);
    setComprando(null);
    setConfirmando(null);
    if (error) setErro(error);
    else setComprado(item.id);
  };

  const consumiveis = ITENS.filter((i) => i.tipo === 'consumivel');
  const cosmeticos = ITENS.filter((i) => i.tipo !== 'consumivel');

  const linha = (item: ItemDaLoja) => {
    const seu = temItem(item, level.level, purchases);
    const daPara = moedas.saldo >= item.price;
    const estaConfirmando = confirmando === item.id;
    const liberadoPorNivel = item.nivelQueLibera !== undefined && level.level >= item.nivelQueLibera;

    return (
      <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            seu ? 'bg-success-50 text-success-700' : 'bg-sunken text-ink-soft'
          }`}
        >
          {seu ? <IconCheck size={20} /> : <IconeDoItem item={item} />}
        </span>

        <span className="min-w-0 flex-1 basis-48">
          <span className="block font-semibold text-ink">{item.title}</span>
          <span className="block text-sm leading-relaxed text-ink-soft">{item.description}</span>
          {item.nivelQueLibera !== undefined && !seu && (
            <span className="label-mono mt-1 block text-ink-faint">
              ou de graça no nível {item.nivelQueLibera}
            </span>
          )}
          {item.id === 'congelar-sequencia' && sequencia.congelamentosRestantes > 0 && (
            <span className="label-mono mt-1 block text-brand-700">
              {sequencia.congelamentosRestantes} guardado{sequencia.congelamentosRestantes === 1 ? '' : 's'}
            </span>
          )}
          {item.id === 'dobro-de-xp' && dobro && (
            <span className="label-mono mt-1 block text-brand-700">
              ativo até {dobro.ate.toLocaleString('pt-BR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </span>

        <span className="flex shrink-0 items-center gap-2">
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
            <Button
              size="sm"
              variant="outline"
              disabled={!daPara}
              onClick={() => setConfirmando(item.id)}
              icon={daPara ? <IconCoin size={15} /> : <IconLock size={15} />}
              title={daPara ? undefined : `Faltam ${item.price - moedas.saldo} moedas`}
            >
              {item.price}
            </Button>
          )}
        </span>
      </li>
    );
  };

  return (
    <Card as="section" aria-labelledby="titulo-loja" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="titulo-loja" className="flex items-center gap-2 font-bold text-ink">
          <IconCoin size={18} className="text-energy-700" />
          {moedas.saldo} moedas
        </h2>
        <p className="text-xs leading-relaxed text-ink-faint">
          ganhas {moedas.ganhas.total} · gastas {moedas.gastas}
        </p>
      </div>

      {/* De onde as moedas vieram, para o número ser auditável. */}
      <p className="text-xs leading-relaxed text-ink-faint">
        aulas {moedas.ganhas.aulas} · projetos {moedas.ganhas.projetos} · desafios {moedas.ganhas.desafios} ·
        sequência {moedas.ganhas.sequencia}
      </p>

      {erro && (
        <p role="alert" className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {erro}
        </p>
      )}
      {comprado && !erro && (
        <p role="status" className="rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-sm text-success-700">
          Comprado: {ITENS.find((i) => i.id === comprado)?.title}.
          {comprado === 'congelar-sequencia' && ' Ele entra sozinho no primeiro dia sem estudo.'}
          {comprado === 'dobro-de-xp' && ' Vale a partir de agora, por 24 horas.'}
        </p>
      )}

      <div>
        <SectionLabel as="h3" className="mb-1">
          Para usar
        </SectionLabel>
        <ul className="divide-y divide-line">{consumiveis.map(linha)}</ul>
      </div>

      <div>
        <SectionLabel as="h3" className="mb-1">
          Aparência
        </SectionLabel>
        <ul className="divide-y divide-line">{cosmeticos.map(linha)}</ul>
      </div>
    </Card>
  );
}
