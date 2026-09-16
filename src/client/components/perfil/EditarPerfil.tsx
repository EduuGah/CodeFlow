import { useId, useRef, useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { useStudentData } from '../../contexts/StudentDataContext';
import { itemDaLoja, temItem } from '../../lib/economia';
import { reduzirFoto, uploadFoto } from '../../lib/perfil';
import { AVATARES, AVATARES_LIVRES, Avatar, AvatarDesenhado } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { IconCamera, IconLock } from '../ui/Icon';

/**
 * Editar nome e foto.
 *
 * Um painel que abre embaixo do cabeçalho, não um modal: no celular o modal
 * vira uma segunda tela sem contexto, e um painel deixa a pessoa ver o
 * resultado no cabeçalho ao lado enquanto escolhe.
 *
 * O nome escolhido vale por cima do nome do Google; vazio volta para ele. O
 * avatar é um dos desenhados (seis livres; três abrem por nível ou moedas)
 * ou uma foto enviada — redimensionada aqui, antes de subir.
 */
export function EditarPerfil({ aoFechar }: { aoFechar: () => void }) {
  const { user } = useAuth();
  const { perfil, level, purchases, salvarPerfil } = useStudentData();
  const [nome, setNome] = useState(perfil.displayName ?? '');
  const [avatar, setAvatar] = useState<string | null>(perfil.avatar);
  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);
  const idDoNome = useId();

  const fotoDoGoogle = user?.user_metadata?.avatar_url as string | undefined;
  const nomeDoGoogle = (user?.user_metadata?.full_name as string | undefined) ?? '';

  const liberado = (id: string) => {
    if (AVATARES_LIVRES.includes(id)) return true;
    const item = itemDaLoja(`avatar-${id}`);
    return item ? temItem(item, level.level, purchases) : false;
  };

  const escolherFoto = async (arquivo: File | undefined) => {
    if (!arquivo || !user) return;
    setErro(null);
    setEnviando(true);
    try {
      const reduzida = await reduzirFoto(arquivo);
      const { url, error } = await uploadFoto(user.id, reduzida);
      if (error || !url) setErro(error ?? 'Não foi possível enviar a foto.');
      else setAvatar(url);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível processar a imagem.');
    } finally {
      setEnviando(false);
    }
  };

  const salvar = async () => {
    setSalvando(true);
    setErro(null);
    const { error } = await salvarPerfil({ displayName: nome.trim() || null, avatar });
    setSalvando(false);
    if (error) setErro(error);
    else aoFechar();
  };

  return (
    <Card as="section" aria-labelledby="titulo-editar" className="space-y-5">
      <h2 id="titulo-editar" className="font-bold text-ink">
        Editar perfil
      </h2>

      <div>
        <label htmlFor={idDoNome} className="label-mono mb-1.5 block text-ink-faint">
          Como você quer ser chamado
        </label>
        <input
          id={idDoNome}
          type="text"
          value={nome}
          maxLength={40}
          placeholder={nomeDoGoogle || 'Seu nome'}
          onChange={(e) => setNome(e.target.value)}
          className="h-11 w-full rounded-lg border border-control bg-surface px-3 text-ink placeholder:text-ink-faint focus-visible:border-brand-500"
        />
        <p className="mt-1 text-xs text-ink-faint">
          {nomeDoGoogle ? `Vazio usa o nome da sua conta Google: ${nomeDoGoogle}.` : 'É o nome que aparece na tela inicial.'}
        </p>
      </div>

      <div>
        <p className="label-mono mb-2 text-ink-faint">Avatar</p>
        <ul className="flex flex-wrap gap-2" aria-label="Avatares">
          {AVATARES.map((preset) => {
            const id = `preset:${preset.id}`;
            const aberto = liberado(preset.id);
            const escolhido = avatar === id;
            const item = itemDaLoja(`avatar-${preset.id}`);
            return (
              <li key={preset.id}>
                <button
                  type="button"
                  disabled={!aberto}
                  aria-pressed={escolhido}
                  aria-label={
                    aberto
                      ? `Avatar ${preset.title}`
                      : `Avatar ${preset.title} — abre no nível ${item?.nivelQueLibera} ou por ${item?.price} moedas na loja`
                  }
                  title={aberto ? preset.title : `Abre no nível ${item?.nivelQueLibera} ou na loja`}
                  onClick={() => setAvatar(id)}
                  className={`relative rounded-full p-0.5 ring-2 ring-offset-2 ring-offset-surface transition-colors ${
                    escolhido ? 'ring-brand-600' : 'ring-transparent hover:ring-line-strong'
                  } disabled:opacity-40`}
                >
                  <AvatarDesenhado preset={preset} size={44} />
                  {!aberto && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface text-ink-faint ring-1 ring-line">
                      <IconLock size={12} />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Avatar escolhido={avatar} fotoDoGoogle={fotoDoGoogle} nome={nome || nomeDoGoogle || 'E'} size={44} />
        <input
          ref={arquivoRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Escolher uma foto"
          onChange={(e) => escolherFoto(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={enviando}
          onClick={() => arquivoRef.current?.click()}
          icon={<IconCamera size={16} />}
        >
          {enviando ? 'Enviando…' : 'Enviar uma foto'}
        </Button>
        {(avatar || fotoDoGoogle) && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setAvatar(fotoDoGoogle ? null : 'preset:folha')}>
            {fotoDoGoogle ? 'Usar a foto do Google' : 'Voltar ao avatar'}
          </Button>
        )}
      </div>

      {erro && (
        <p role="alert" className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {erro}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={salvar} loading={salvando} disabled={salvando || enviando}>
          Salvar
        </Button>
        <Button type="button" variant="ghost" onClick={aoFechar} disabled={salvando}>
          Cancelar
        </Button>
      </div>
    </Card>
  );
}
