import { CabecalhoDaSecao } from '../../../components/perfil/CabecalhoDaSecao';
import { Conquistas } from '../../../components/perfil/Conquistas';
import { VinhetaMedalha } from '../../../components/ui/Ilustracao';
import { Carregando, Skeleton } from '../../../components/ui/Skeleton';
import { useStudentData } from '../../../contexts/StudentDataContext';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';

/** As conquistas, por categoria. O corpo está em `components/perfil/Conquistas`. */
export function PerfilConquistas() {
  useDocumentTitle('Conquistas');
  const { loading, achievements } = useStudentData();
  const abertas = achievements.filter((c) => c.unlocked).length;

  return (
    <div className="space-y-6">
      <CabecalhoDaSecao
        titulo="Conquistas"
        descricao="Cada uma diz o que você fez para merecê-la — ou o que falta."
        tom="energy"
        vinheta={<VinhetaMedalha size={44} />}
        lado={
          !loading && (
            <span className="label-mono tabular-nums text-ink-faint">
              {abertas} de {achievements.length}
            </span>
          )
        }
      />
      {loading ? (
        <Carregando o="as conquistas">
          <Skeleton className="h-64 w-full rounded-xl" />
        </Carregando>
      ) : (
        <Conquistas conquistas={achievements} />
      )}
    </div>
  );
}
