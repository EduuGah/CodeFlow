import type { ComponentType } from 'react';

import type { Achievement } from '../../lib/gamification';
import {
  IconAlert,
  IconAward,
  IconBolt,
  IconCalendar,
  IconCalendarCheck,
  IconCheckCircle,
  IconChecklist,
  IconChart,
  IconClock,
  IconCompass,
  IconComponent,
  IconDatabase,
  IconDevice,
  IconEdit,
  IconFlag,
  IconLayers,
  IconLesson,
  IconMedal,
  IconMoon,
  IconNoHint,
  IconPalette,
  IconPlay,
  IconProject,
  IconRetry,
  IconReview,
  IconStreak,
  IconSun,
  IconTarget,
  IconTrack,
  IconTrophy,
  IconTypes,
  type IconProps,
} from '../ui/Icon';

/**
 * Qual ícone cada conquista e cada desafio leva.
 *
 * A medalha genérica dizia só "aberta"; com um ícone por feito, a grade de
 * conquistas conta o que a pessoa fez antes de ela ler — e uma conquista
 * fechada mostra o que está por vir. As de trilha usam o ícone de trilha e
 * a cor da trilha (a cor fica com quem desenha a pastilha).
 */
const POR_CONQUISTA: Record<string, ComponentType<IconProps>> = {
  'primeiro-codigo': IconPlay,
  persistente: IconRetry,
  revisor: IconReview,
  constante: IconStreak,
  'semana-inteira': IconCalendarCheck,
  'mes-inteiro': IconCalendar,
  desafiante: IconTarget,
  'semana-cumprida': IconChecklist,
  'primeiro-acerto': IconCheckCircle,
  'sem-ajuda': IconNoHint,
  autonomo: IconNoHint,
  insistente: IconRetry,
  abrangente: IconLayers,
  vasto: IconCompass,
  tipado: IconTypes,
  componente: IconComponent,
  consultou: IconDatabase,
  'subiu-servidor': IconDevice,
  cobra: IconChart,
  'desenhou-a-pagina': IconPalette,
  poliglota: IconBolt,
  'primeira-aula': IconLesson,
  'percurso-inteiro': IconFlag,
  'primeiro-projeto': IconProject,
  cinquenta: IconChecklist,
  cem: IconAward,
  duzentos: IconTrophy,
  'vinte-aulas': IconLesson,
  'cem-aulas': IconTrophy,
  'todos-os-projetos': IconTrophy,
  coruja: IconMoon,
  'cedo-da-manha': IconSun,
  retomada: IconClock,
  detetive: IconAlert,
  refatorador: IconEdit,
  professor: IconChecklist,
  'trilha-sem-dica': IconNoHint,
  perfeccionista: IconCheckCircle,
};

export function iconeDaConquista(conquista: Pick<Achievement, 'id' | 'categoria'>): ComponentType<IconProps> {
  if (conquista.id.startsWith('trilha-')) return IconTrack;
  if (conquista.id.startsWith('etapa-')) return IconFlag;
  return POR_CONQUISTA[conquista.id] ?? IconMedal;
}

/** Os desafios são poucos e nomeados pelo que pedem; o ícone segue o pedido. */
const POR_DESAFIO: Array<[RegExp, ComponentType<IconProps>]> = [
  [/resolver|exercicios/, IconCheckCircle],
  [/sem-dica/, IconNoHint],
  [/revisar/, IconReview],
  [/insistir/, IconRetry],
  [/aula/, IconLesson],
  [/dias/, IconCalendarCheck],
  [/conceitos/, IconLayers],
];

export function iconeDoDesafio(id: string): ComponentType<IconProps> {
  return POR_DESAFIO.find(([re]) => re.test(id))?.[1] ?? IconTarget;
}
