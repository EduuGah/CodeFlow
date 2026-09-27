import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useStudentData } from '../../contexts/StudentDataContext';
import { estadoDosTitulos, tituloParaMostrar, type EstadoDoTitulo } from '../../lib/titulos';
import { Button } from '../ui/Button';
import { SectionLabel, cardClasses } from '../ui/Card';
import { IconCheck, IconLock } from '../ui/Icon';

/**
 * Os títulos no inventário: os que a pessoa ganhou, para escolher um, e os
 * que faltam, com a conquista que abre cada um.
 *
 * Nada aqui leva à loja — título não se vende. O trancado leva às conquistas,
 * que é onde está o caminho até ele.
 */

/** Quão perto de abrir: a média do progresso das conquistas que faltam. */
function proximidade(estado: EstadoDoTitulo): number {
  if (estado.faltam.length === 0) return 1;
  const partes = estado.faltam.map((c) => (c.progresso ? c.progresso.atual / c.progresso.meta : 0));
  return partes.reduce((a, b) => a + b, 0) / partes.length;
}

export function EscolherTitulo({ onAviso }: { onAviso: (aviso: { ok: boolean; texto: string }) => void }) {
  const { perfil, achievements, level, salvarPerfil } = useStudentData();
  const [gravando, setGravando] = useState<string | null>(null);

  const estados = estadoDosTitulos(achievements);
  // O escolhido só conta se ainda for da pessoa (`tituloParaMostrar`).
  const emUso = tituloParaMostrar(perfil.titulo, achievements) ? perfil.titulo : null;
  const ganhos = estados.filter((e) => e.tem);
  const trancados = estados.filter((e) => !e.tem).sort((a, b) => proximidade(b) - proximidade(a));

  const usar = async (id: string | null, nome: string | null) => {
    setGravando(id ?? 'nenhum');
    const { error } = await salvarPerfil({ titulo: id });
    setGravando(null);
    onAviso(
      error
        ? { ok: false, texto: `O título não foi trocado. ${error}` }
        : { ok: true, texto: nome ? `${nome} aparece ao lado do seu nome.` : 'Sem título: o perfil mostra só o nível.' }
    );
  };

  return (
    <section aria-label="Títulos">
      <SectionLabel as="h2" className="mb-0.5">
        Títulos
      </SectionLabel>
      <p className="mb-3 text-xs leading-relaxed text-ink-faint">
        Ao lado do seu nome. Cada um vem de uma conquista — nenhum se compra.{' '}
        {ganhos.length} de {estados.length} são seus.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <li className={cardClasses({ padding: 'sm', className: 'flex flex-col gap-1.5' })}>
          <span className="font-semibold text-ink">Sem título</span>
          <span className="text-xs leading-relaxed text-ink-soft">
            O perfil mostra só o nível ({level.title}).
          </span>
          <Estado emUso={emUso === null} gravando={gravando === 'nenhum'} rotulo="Sem título" onUsar={() => void usar(null, null)} />
        </li>
        {ganhos.map(({ titulo }) => (
          <li key={titulo.id} className={cardClasses({ padding: 'sm', className: 'flex flex-col gap-1.5' })}>
            <span className="font-semibold text-brand-700">{titulo.nome}</span>
            <span className="text-xs leading-relaxed text-ink-soft">
              Pela conquista{' '}
              {achievements
                .filter((c) => titulo.conquistas.includes(c.id))
                .map((c) => c.title)
                .join(', ')}
              .
            </span>
            <Estado
              emUso={emUso === titulo.id}
              gravando={gravando === titulo.id}
              rotulo={titulo.nome}
              onUsar={() => void usar(titulo.id, titulo.nome)}
            />
          </li>
        ))}
        {trancados.map(({ titulo, faltam }) => (
          <li key={titulo.id} className={cardClasses({ padding: 'sm', className: 'flex flex-col gap-1.5 bg-sunken' })}>
            <span className="flex items-center gap-1.5 font-semibold text-ink-soft">
              <IconLock size={13} className="shrink-0 text-ink-faint" aria-hidden />
              {titulo.nome}
            </span>
            {/* Uma frase com o link dentro: é texto corrido, e é assim que se lê. */}
            <p className="text-xs leading-relaxed text-ink-soft">
              {faltam.length === 1 ? 'Falta a conquista ' : 'Faltam as conquistas '}
              {faltam.map((c, i) => (
                <span key={c.id}>
                  {i > 0 && (i === faltam.length - 1 ? ' e ' : ', ')}
                  <span className="font-semibold text-ink">{c.title}</span>
                  {c.progresso && (
                    <span className="tabular-nums">
                      {' '}
                      ({c.progresso.atual}/{c.progresso.meta})
                    </span>
                  )}
                </span>
              ))}
              .{' '}
              <Link to="/app/perfil/conquistas" className="font-semibold text-brand-700 underline">
                Ver conquistas
              </Link>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Estado({
  emUso,
  gravando,
  rotulo,
  onUsar,
}: {
  emUso: boolean;
  gravando: boolean;
  rotulo: string;
  onUsar: () => void;
}) {
  if (emUso) {
    return (
      <span className="inline-flex items-center gap-1 self-start rounded-full bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-700">
        <IconCheck size={12} strokeWidth={3} />
        Em uso
      </span>
    );
  }
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-8 self-start"
      loading={gravando}
      onClick={onUsar}
      aria-label={`Usar ${rotulo}`}
    >
      Usar
    </Button>
  );
}
