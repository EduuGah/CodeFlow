import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ITENS, PRECO_DO_NIVEL, RARIDADES, raridadeDoNivel, type ItemDaLoja } from '../../lib/economia';
import {
  compararCatalogo,
  definirItemAtivo,
  fetchCatalogoDoBanco,
  gerarLinhas,
  type Divergencia,
  type LinhaDoBanco,
  type RascunhoDeItem,
} from '../../lib/loja-admin';
import { IconArrowLeft, IconCheck, IconInfo } from '../../components/ui/Icon';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, SectionLabel } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

/**
 * Administração da loja.
 *
 * A mesma decisão da administração de conteúdo: o catálogo é código revisado
 * em pull request — `ITENS` e a migração que o espelha. Esta tela não grava
 * item nenhum no banco. Ela faz três coisas:
 *
 * 1. mostra onde o banco e o código discordam — quase sempre uma migração que
 *    ainda não rodou, e é o jeito mais rápido de saber qual;
 * 2. tira um item da venda e devolve (`definir_item_ativo`, 0017) — para um
 *    defeito que não pode esperar o próximo pull request;
 * 3. gera as duas linhas de um item novo, com o preço e a raridade que o
 *    nível dá, para colar no pull request.
 */

const campo =
  'w-full rounded-lg border border-control bg-surface px-3 py-2.5 text-sm text-ink transition-colors placeholder:text-ink-faint focus:border-brand-500';

function frase(d: Divergencia): string {
  switch (d.tipo) {
    case 'falta_no_banco':
      return 'está no código e não no banco: a loja mostra, e a compra recusa. Falta rodar a migração que o cria.';
    case 'so_no_banco':
      return 'está no banco e não no código: ninguém vê.';
    case 'preco':
      return `o banco cobra ${d.banco}, a loja mostra ${d.codigo}. Falta rodar a migração mais nova que muda o preço.`;
    case 'categoria':
      return `o banco diz ${d.banco}, o código diz ${d.codigo}.`;
    case 'janela':
      return 'a janela de venda do banco não é a do código.';
  }
}

function comoAbre(item: ItemDaLoja): string {
  if (item.nivelQueLibera !== undefined) return `nível ${item.nivelQueLibera}`;
  if (item.disponivelDe && item.disponivelAte) {
    const dia = (iso: string) =>
      new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
    return `de ${dia(item.disponivelDe)} a ${dia(new Date(Date.parse(item.disponivelAte) - 1).toISOString())}`;
  }
  return item.tipo === 'consumivel' ? 'consumível' : 'só por moedas';
}

const NIVEIS = Object.keys(PRECO_DO_NIVEL).map(Number).sort((a, b) => a - b);
const ONDE_DESENHAR: Record<RascunhoDeItem['tipo'], string> = {
  avatar: 'src/client/components/ui/Avatar.tsx (AVATARES)',
  moldura: 'src/client/components/ui/Moldura.tsx (MOLDURAS e DESENHOS)',
  fundo: 'src/client/components/ui/Fundo.tsx (FUNDOS e Desenho)',
};

export function AdminLoja() {
  useDocumentTitle('Loja · Administração');
  const [banco, setBanco] = useState<{ linhas: LinhaDoBanco[]; erro?: string } | null>(null);
  const [mudando, setMudando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [rascunho, setRascunho] = useState<RascunhoDeItem>({
    tipo: 'avatar',
    curto: '',
    titulo: '',
    descricao: '',
    nivel: 6,
  });
  const [copiado, setCopiado] = useState<'ts' | 'sql' | null>(null);

  useEffect(() => {
    let vivo = true;
    fetchCatalogoDoBanco().then((resultado) => {
      if (vivo) setBanco(resultado);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const divergencias = useMemo(() => (banco && !banco.erro ? compararCatalogo(ITENS, banco.linhas) : []), [banco]);
  const ativo = useMemo(() => new Map(banco?.linhas.map((l) => [l.id, l.ativo]) ?? []), [banco]);
  const gerado = gerarLinhas(rascunho, ITENS);
  const vazio = !rascunho.curto && !rascunho.titulo && !rascunho.descricao;

  const alternar = async (item: ItemDaLoja) => {
    const agora = ativo.get(item.id) ?? true;
    setMudando(item.id);
    const { error } = await definirItemAtivo(item.id, !agora);
    setMudando(null);
    if (error) {
      setAviso({ ok: false, texto: error });
      return;
    }
    setBanco((b) => b && { ...b, linhas: b.linhas.map((l) => (l.id === item.id ? { ...l, ativo: !agora } : l)) });
    setAviso({ ok: true, texto: agora ? `${item.title} saiu da venda.` : `${item.title} voltou à venda.` });
  };

  const copiar = async (qual: 'ts' | 'sql') => {
    try {
      await navigator.clipboard.writeText(qual === 'ts' ? gerado.ts : gerado.sql);
      setCopiado(qual);
      window.setTimeout(() => setCopiado(null), 1500);
    } catch {
      setAviso({ ok: false, texto: 'O navegador não deixou copiar. Selecione o texto e copie à mão.' });
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-8">
        <Link
          to="/admin"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          <IconArrowLeft size={16} />
          Administração
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Loja</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          O catálogo é código revisado em pull request. Aqui: onde o banco discorda do código, tirar um item da venda,
          e as linhas de um item novo.
        </p>
      </header>

      {aviso && (
        <p
          role={aviso.ok ? 'status' : 'alert'}
          className={`mb-6 rounded-lg border px-3 py-2 text-sm ${
            aviso.ok ? 'border-success-200 bg-success-50 text-success-700' : 'border-danger-200 bg-danger-50 text-danger-700'
          }`}
        >
          {aviso.texto}
        </p>
      )}

      <section className="mb-10" aria-labelledby="titulo-banco">
        <h2 id="titulo-banco" className="label-mono mb-3 text-ink-faint">
          Banco e código
        </h2>
        {!banco ? (
          <Skeleton className="h-16 w-full rounded-xl" />
        ) : banco.erro ? (
          <Card tone="caution" className="text-sm text-energy-700">
            {banco.erro}
          </Card>
        ) : divergencias.length === 0 ? (
          <Card tone="success" className="flex items-start gap-2 text-sm leading-relaxed text-success-700">
            <IconCheck size={16} className="mt-0.5 shrink-0" />O banco vende exatamente o que a loja mostra: {ITENS.length}{' '}
            itens, os mesmos preços, as mesmas janelas.
          </Card>
        ) : (
          <Card tone="caution">
            <p className="mb-2 flex items-start gap-2 text-sm font-semibold text-energy-700">
              <IconInfo size={16} className="mt-0.5 shrink-0" />
              {divergencias.length} {divergencias.length === 1 ? 'divergência' : 'divergências'} entre o banco e o código
            </p>
            <ul className="space-y-1 text-sm leading-relaxed text-ink-soft" data-divergencias>
              {divergencias.map((d) => (
                <li key={`${d.id}-${d.tipo}`}>
                  <code className="font-mono text-xs text-ink">{d.id}</code>: {frase(d)}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <section className="mb-10" aria-labelledby="titulo-itens">
        <h2 id="titulo-itens" className="label-mono mb-3 text-ink-faint">
          Itens ({ITENS.length})
        </h2>
        <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
          {ITENS.map((item) => {
            const naVenda = ativo.get(item.id) ?? true;
            return (
              <li key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2.5" data-item={item.id}>
                <span className="min-w-0 flex-1 basis-48">
                  <span className="block text-sm font-semibold text-ink">{item.title}</span>
                  <span className="block text-xs text-ink-faint">
                    {RARIDADES[item.raridade].rotulo} · {item.price} moedas · {comoAbre(item)}
                  </span>
                </span>
                {!naVenda && <Badge tone="caution">Fora da venda</Badge>}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  loading={mudando === item.id}
                  disabled={!banco || !!banco.erro || !ativo.has(item.id)}
                  onClick={() => void alternar(item)}
                  aria-label={`${naVenda ? 'Tirar da venda' : 'Devolver à venda'}: ${item.title}`}
                >
                  {naVenda ? 'Tirar da venda' : 'Devolver à venda'}
                </Button>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="titulo-novo">
        <h2 id="titulo-novo" className="label-mono mb-1 text-ink-faint">
          Item novo
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-ink-soft">
          O preço e a raridade saem do nível (<code className="font-mono text-xs">PRECO_DO_NIVEL</code>, calibrado pelo
          aluno-modelo). As duas linhas vão para o
          pull request: a primeira na lista da categoria em <code className="font-mono text-xs">economia.ts</code>, a
          segunda no <code className="font-mono text-xs">insert</code> de uma migração nova.
        </p>
        <Card>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-ink">
              Categoria
              <select
                className={`${campo} mt-1`}
                value={rascunho.tipo}
                onChange={(e) => setRascunho((r) => ({ ...r, tipo: e.target.value as RascunhoDeItem['tipo'] }))}
              >
                <option value="avatar">Avatar</option>
                <option value="moldura">Moldura</option>
                <option value="fundo">Fundo</option>
              </select>
            </label>
            <label className="text-sm font-medium text-ink">
              Nível que abre
              <select
                className={`${campo} mt-1`}
                value={rascunho.nivel}
                onChange={(e) => setRascunho((r) => ({ ...r, nivel: Number(e.target.value) }))}
              >
                {NIVEIS.map((n) => (
                  <option key={n} value={n}>
                    {n} — {PRECO_DO_NIVEL[n]} moedas, {RARIDADES[raridadeDoNivel(n)].rotulo.toLowerCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-ink">
              Id curto
              <input
                className={`${campo} mt-1 font-mono`}
                value={rascunho.curto}
                placeholder="jabuti"
                onChange={(e) => setRascunho((r) => ({ ...r, curto: e.target.value }))}
              />
            </label>
            <label className="text-sm font-medium text-ink">
              Título
              <input
                className={`${campo} mt-1`}
                value={rascunho.titulo}
                placeholder="Jabuti"
                onChange={(e) => setRascunho((r) => ({ ...r, titulo: e.target.value }))}
              />
            </label>
            <label className="text-sm font-medium text-ink sm:col-span-2">
              Descrição
              <input
                className={`${campo} mt-1`}
                value={rascunho.descricao}
                placeholder="Casco alto e passo sem pressa."
                onChange={(e) => setRascunho((r) => ({ ...r, descricao: e.target.value }))}
              />
            </label>
          </div>

          {!vazio && gerado.problemas.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm text-danger-700" role="alert">
              {gerado.problemas.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}

          {!vazio && gerado.problemas.length === 0 && (
            <div className="mt-4 space-y-3" data-gerado>
              {(
                [
                  ['ts', 'Em economia.ts', gerado.ts],
                  ['sql', 'Na migração nova', gerado.sql],
                ] as const
              ).map(([qual, rotulo, texto]) => (
                <div key={qual}>
                  <SectionLabel as="p" className="mb-1">
                    {rotulo}
                  </SectionLabel>
                  <div className="flex items-start gap-2">
                    <pre className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-sunken px-3 py-2 font-mono text-xs text-ink">
                      {texto}
                    </pre>
                    <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={() => void copiar(qual)}>
                      {copiado === qual ? 'Copiado' : 'Copiar'}
                    </Button>
                  </div>
                </div>
              ))}
              <p className="text-xs leading-relaxed text-ink-faint">
                E o desenho, em {ONDE_DESENHAR[rascunho.tipo]}. O teste de calibragem e o de migrações conferem o resto no
                CI.
              </p>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
