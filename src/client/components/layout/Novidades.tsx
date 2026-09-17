import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { useStudentData } from '../../contexts/StudentDataContext';
import { inicioDaSemana } from '../../lib/desafios';
import { estadoAtual, guardarVisto, lerVisto, novidades, type Novidade } from '../../lib/novidades';
import { diaLocal } from '../../lib/sequencia';
import { Medalha } from '../perfil/Conquistas';
import { IconClose, IconCoin } from '../ui/Icon';
import { VinhetaAlvo, VinhetaMedalha } from '../ui/Ilustracao';

/**
 * Os avisos de novidade: subiu de nível, abriu uma conquista, cumpriu um
 * desafio.
 *
 * Aparecem quando a pessoa volta ao aplicativo — a aula é uma tela de foco,
 * sem avisos por cima — e um de cada vez, com a figura do que aconteceu.
 * Cada um fica seis segundos ou até o toque; o próximo entra em seguida.
 * O que já foi visto fica guardado neste aparelho; nada disso é gravado no
 * banco, porque o banco só guarda fatos, e "a pessoa viu" não é um.
 */
const DURACAO_MS = 6000;

export function Novidades() {
  const { user } = useAuth();
  const { loading, level, achievements, desafios } = useStudentData();
  const [fila, setFila] = useState<Novidade[]>([]);

  const atual = useMemo(() => {
    if (loading) return null;
    const hoje = diaLocal(new Date());
    return estadoAtual({ nivel: level.level, achievements, desafios, hoje, segunda: inicioDaSemana(hoje) });
  }, [loading, level.level, achievements, desafios]);

  useEffect(() => {
    if (!user || !atual) return;
    const visto = lerVisto(user.id);
    const lista = novidades(visto, atual, {
      achievements,
      desafios: [...desafios.dia, ...desafios.semana],
      tituloDoNivel: level.title,
    });
    // Guardar já: se a página recarregar no meio, é melhor perder um aviso do
    // que repetir todos.
    guardarVisto(user.id, atual);
    if (lista.length > 0) setFila((f) => [...f, ...lista]);
  }, [user, atual, achievements, desafios, level.title]);

  const novidade = fila[0];

  useEffect(() => {
    if (!novidade) return;
    const timer = setTimeout(() => setFila((f) => f.slice(1)), DURACAO_MS);
    return () => clearTimeout(timer);
  }, [novidade]);

  if (!novidade) return null;

  const fechar = () => setFila((f) => f.slice(1));

  return (
    <div
      role="status"
      className="animar-pousar fixed inset-x-4 bottom-20 z-40 mx-auto max-w-sm rounded-xl border border-line bg-surface p-3 shadow-lg md:inset-x-auto md:bottom-6 md:right-6"
    >
      <div className="flex items-center gap-3">
        <span className="shrink-0" aria-hidden>
          {novidade.tipo === 'nivel' && (
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
              <VinhetaMedalha size={36} />
              <span className="absolute -bottom-1 -right-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white">
                {novidade.nivel}
              </span>
            </span>
          )}
          {novidade.tipo === 'conquista' && <Medalha conquista={novidade.conquista} size={48} />}
          {novidade.tipo === 'desafio' && (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
              <VinhetaAlvo size={34} />
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          {novidade.tipo === 'nivel' && (
            <>
              <span className="label-mono block text-brand-700">Subiu de nível</span>
              <span className="block truncate text-sm font-bold text-ink">
                Nível {novidade.nivel} · {novidade.titulo}
              </span>
            </>
          )}
          {novidade.tipo === 'conquista' && (
            <>
              <span className="label-mono block text-energy-700">Conquista aberta</span>
              <span className="block truncate text-sm font-bold text-ink">{novidade.conquista.title}</span>
            </>
          )}
          {novidade.tipo === 'desafio' && (
            <>
              <span className="label-mono block text-success-700">
                Desafio {novidade.estado.desafio.periodo === 'dia' ? 'do dia' : 'da semana'} cumprido
              </span>
              <span className="flex items-center gap-1.5 truncate text-sm font-bold text-ink">
                {novidade.estado.desafio.title}
                <span className="label-mono flex items-center gap-0.5 font-medium text-ink-faint">
                  <IconCoin size={11} />+{novidade.estado.recompensa.moedas}
                </span>
              </span>
            </>
          )}
          <Link
            to={novidade.tipo === 'desafio' ? '/app/perfil/desafios' : novidade.tipo === 'conquista' ? '/app/perfil/conquistas' : '/app/perfil'}
            onClick={fechar}
            className="mt-0.5 block text-xs font-semibold text-brand-700 hover:text-brand-900"
          >
            Ver no perfil
          </Link>
        </span>

        <button
          type="button"
          onClick={fechar}
          aria-label="Fechar aviso"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-faint hover:bg-sunken hover:text-ink"
        >
          <IconClose size={16} />
        </button>
      </div>
      {fila.length > 1 && (
        <p className="label-mono mt-2 text-ink-faint">
          mais {fila.length - 1} {fila.length - 1 === 1 ? 'novidade' : 'novidades'}
        </p>
      )}
    </div>
  );
}
