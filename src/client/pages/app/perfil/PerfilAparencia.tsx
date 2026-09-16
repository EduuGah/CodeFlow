import { Aparencia } from '../../../components/perfil/Aparencia';
import { CabecalhoDaSecao } from '../../../components/perfil/CabecalhoDaSecao';
import { VinhetaPaleta } from '../../../components/ui/Ilustracao';
import { Carregando, Skeleton } from '../../../components/ui/Skeleton';
import { useStudentData } from '../../../contexts/StudentDataContext';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';

/** Modo e cor de destaque. O corpo está em `components/perfil/Aparencia`. */
export function PerfilAparencia() {
  useDocumentTitle('Aparência');
  const { loading } = useStudentData();

  return (
    <div className="space-y-6">
      <CabecalhoDaSecao
        titulo="Aparência"
        descricao="Claro ou escuro, e a cor que marca a interface. Vale em todos os seus aparelhos."
        vinheta={<VinhetaPaleta size={44} />}
      />
      {loading ? (
        <Carregando o="a aparência">
          <Skeleton className="h-40 w-full rounded-xl" />
        </Carregando>
      ) : (
        <Aparencia />
      )}
    </div>
  );
}
