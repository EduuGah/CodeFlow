import { CabecalhoDaSecao } from '../../../components/perfil/CabecalhoDaSecao';
import { CenaDesafio } from '../../../components/ui/Cena';
import { ListaDeDesafios } from '../../../components/perfil/Desafios';
import { Card, SectionLabel } from '../../../components/ui/Card';
import { IconClock } from '../../../components/ui/Icon';
import { VinhetaAlvo } from '../../../components/ui/Ilustracao';
import { Carregando, Skeleton } from '../../../components/ui/Skeleton';
import { useStudentData } from '../../../contexts/StudentDataContext';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { RECOMPENSA } from '../../../lib/desafios';

/**
 * Os desafios do dia e da semana.
 *
 * Além da lista, o que a tela inicial não tem espaço para dizer: quando cada
 * um troca (à meia-noite; toda segunda), quanto cada um rende, e quantos a
 * pessoa já cumpriu desde que começou — que é o número que faz "dez desafios
 * do dia" ser uma conquista que se vê chegar.
 */

/** "em 5 h", "em 40 min", "em 3 dias". */
function ateAVirada(agora: Date): { dia: string; semana: string } {
  const meiaNoite = new Date(agora);
  meiaNoite.setHours(24, 0, 0, 0);
  const minutos = Math.max(1, Math.round((meiaNoite.getTime() - agora.getTime()) / 60_000));
  const dia = minutos >= 60 ? `em ${Math.round(minutos / 60)} h` : `em ${minutos} min`;

  // getDay: 0 é domingo. Dias até a próxima segunda, contando a virada de hoje.
  const diasAteSegunda = ((8 - agora.getDay()) % 7) || 7;
  const semana = diasAteSegunda === 1 ? dia : `em ${diasAteSegunda} dias`;
  return { dia, semana };
}

export function PerfilDesafios() {
  useDocumentTitle('Desafios');
  const { loading, desafios, desafiosCumpridos } = useStudentData();
  const virada = ateAVirada(new Date());

  return (
    <div className="space-y-6">
      <CabecalhoDaSecao
        titulo="Desafios"
        descricao="Metas curtas que trocam todo dia e toda segunda. Cumprir é receber: as moedas e o XP entram sozinhos."
        vinheta={<VinhetaAlvo size={44} />}
        lado={<CenaDesafio className="hidden w-60 sm:block" />}
      />

      {loading ? (
        <Carregando o="os desafios">
          <Skeleton className="h-40 w-full rounded-xl" />
        </Carregando>
      ) : (
        <>
          <Card as="section" aria-labelledby="titulo-hoje">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="titulo-hoje" className="font-bold text-ink">
                Hoje
              </h2>
              <span className="label-mono flex items-center gap-1 text-ink-faint">
                <IconClock size={13} />
                trocam {virada.dia}
              </span>
            </div>
            <ListaDeDesafios desafios={desafios.dia} />
          </Card>

          <Card as="section" aria-labelledby="titulo-semana">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="titulo-semana" className="font-bold text-ink">
                Esta semana
              </h2>
              <span className="label-mono flex items-center gap-1 text-ink-faint">
                <IconClock size={13} />
                trocam {virada.semana}
              </span>
            </div>
            <ListaDeDesafios desafios={desafios.semana} />
          </Card>

          <Card as="section" aria-labelledby="titulo-ate-agora" tone="sunken">
            <SectionLabel as="h2" id="titulo-ate-agora">
              Desde que você começou
            </SectionLabel>
            <dl className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs text-ink-faint">desafios do dia cumpridos</dt>
                <dd className="text-xl font-extrabold tabular-nums text-ink">{desafiosCumpridos.dia}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-faint">desafios da semana cumpridos</dt>
                <dd className="text-xl font-extrabold tabular-nums text-ink">{desafiosCumpridos.semana}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-ink-faint">
              Cada desafio do dia rende {RECOMPENSA.dia.moedas} moedas e {RECOMPENSA.dia.xp} XP; cada um da semana,{' '}
              {RECOMPENSA.semana.moedas} moedas e {RECOMPENSA.semana.xp} XP. O que conta é o que você faz nas aulas —
              não há botão de resgatar.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
