import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { Acento, Tema } from '../lib/perfil';
import {
  acentoGuardado,
  aplicarAcento,
  aplicarTema,
  ouvirSistema,
  temaGuardado,
} from '../lib/tema';

/**
 * O tema da sessão.
 *
 * Nasce do que está no `localStorage` (o `index.html` já pintou a página com
 * isso), e quem tiver o perfil do aluno o sincroniza com `adotar` quando ele
 * chega. As telas só chamam `mudarTema`/`mudarAcento`; gravar no perfil é de
 * quem chama, porque este contexto vive fora do login também.
 */
interface TemaContextType {
  tema: Tema;
  acento: Acento;
  mudarTema: (tema: Tema) => void;
  mudarAcento: (acento: Acento) => void;
  /** Sincroniza com o que veio do perfil, sem gravar de volta. */
  adotar: (valores: { theme: Tema | null; accent: Acento | null }) => void;
}

const TemaContext = createContext<TemaContextType | undefined>(undefined);

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => temaGuardado());
  const [acento, setAcento] = useState<Acento>(() => acentoGuardado());

  useEffect(() => {
    aplicarTema(tema);
    if (tema !== 'sistema') return;
    return ouvirSistema(() => aplicarTema('sistema'));
  }, [tema]);

  useEffect(() => {
    aplicarAcento(acento);
  }, [acento]);

  const adotar = useCallback((valores: { theme: Tema | null; accent: Acento | null }) => {
    if (valores.theme) setTema(valores.theme);
    if (valores.accent) setAcento(valores.accent);
  }, []);

  const valor = useMemo<TemaContextType>(
    () => ({ tema, acento, mudarTema: setTema, mudarAcento: setAcento, adotar }),
    [tema, acento, adotar]
  );

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema() {
  const contexto = useContext(TemaContext);
  if (contexto === undefined) throw new Error('useTema deve ser usado dentro de um TemaProvider');
  return contexto;
}

/** Para quem pode viver sem o provedor — os testes de componente montam sem ele. */
export function useTemaOpcional(): TemaContextType | undefined {
  return useContext(TemaContext);
}
