import { CabecalhoDaSecao } from '../../../components/perfil/CabecalhoDaSecao';
import { Inventario } from '../../../components/perfil/Inventario';
import { VinhetaCaixa } from '../../../components/ui/Ilustracao';
import { Carregando, Skeleton } from '../../../components/ui/Skeleton';
import { useStudentData } from '../../../contexts/StudentDataContext';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';

/** O inventário, numa página só sua. O corpo está em `components/perfil/Inventario`. */
export function PerfilInventario() {
  useDocumentTitle('Inventário');
  const { loading } = useStudentData();

  return (
    <div className="space-y-6">
      <CabecalhoDaSecao
        titulo="Inventário"
        descricao="O que é seu — de graça, pelo nível ou comprado —, o que você está usando e o que falta para o resto."
        tom="brand"
        vinheta={<VinhetaCaixa size={44} />}
      />
      {loading ? (
        <Carregando o="o inventário">
          <Skeleton className="h-64 w-full rounded-xl" />
        </Carregando>
      ) : (
        <Inventario />
      )}
    </div>
  );
}
