import { CabecalhoDaSecao } from '../../../components/perfil/CabecalhoDaSecao';
import { Loja } from '../../../components/perfil/Loja';
import { VinhetaMoedas } from '../../../components/ui/Ilustracao';
import { Carregando, Skeleton } from '../../../components/ui/Skeleton';
import { useStudentData } from '../../../contexts/StudentDataContext';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';

/** A loja, numa página só sua. O corpo está em `components/perfil/Loja`. */
export function PerfilLoja() {
  useDocumentTitle('Loja');
  const { loading } = useStudentData();

  return (
    <div className="space-y-6">
      <CabecalhoDaSecao
        titulo="Loja"
        descricao="Moedas que você ganhou estudando, trocadas por coisas que ajudam a continuar."
        tom="energy"
        vinheta={<VinhetaMoedas size={44} />}
      />
      {loading ? (
        <Carregando o="a loja">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="mt-4 h-64 w-full rounded-xl" />
        </Carregando>
      ) : (
        <Loja />
      )}
    </div>
  );
}
