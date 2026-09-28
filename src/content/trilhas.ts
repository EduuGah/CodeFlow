import type { Track } from './types';
import { trackJsFundamentos } from './tracks/javascript';
import { trackLogica } from './tracks/logica';
import { trackWeb } from './tracks/web';
import { trackPagina } from './tracks/pagina';
import { trackTypescript } from './tracks/typescript';
import { trackReact } from './tracks/react';
import { trackSql } from './tracks/sql';
import { trackNode } from './tracks/node';
import { trackEngenharia } from './tracks/engenharia';
import { trackProjeto } from './tracks/projeto';
import { trackTestes } from './tracks/testes';
import { trackGit } from './tracks/git';
import { trackTerminal } from './tracks/terminal';
import { trackPython } from './tracks/python';
import { trackDeploy } from './tracks/deploy';
import { trackEstruturas } from './tracks/estruturas';
import { trackOrm } from './tracks/orm';

/**
 * As trilhas, na ordem em que aparecem ao aluno. Pequenas (a ordem das aulas
 * e as seções), então vão inteiras no pacote principal: o catálogo e o
 * índice importam daqui.
 */
export const TRILHAS: readonly Track[] = [
  trackJsFundamentos,
  trackLogica,
  trackEstruturas,
  trackGit,
  trackWeb,
  trackPagina,
  trackTypescript,
  trackReact,
  trackSql,
  trackNode,
  trackOrm,
  trackEngenharia,
  trackTestes,
  trackProjeto,
  trackDeploy,
  trackTerminal,
  trackPython,
];

export const TRILHA_PADRAO: Track = trackJsFundamentos;
