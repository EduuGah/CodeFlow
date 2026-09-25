import { listProjects, listTracks } from '../../content';
import { ETAPAS_DO_PERCURSO } from '../../content/percurso';
import type { Attempt } from './mastery';
import type { FlashcardReview } from './review';
import { emDobro, janelasDeDobro, type Purchase } from './economia';
import { desafiosConcluidos, type DesafioConcluido } from './desafios';
import { calcularSequencia, correntesDaHistoria } from './sequencia';

/**
 * XP, níveis e conquistas.
 *
 * O §175 é explícito sobre o risco: gamificação mal desenhada faz o aluno
 * estudar para ganhar ponto, responder rápido e pular conteúdo. As regras aqui
 * foram escolhidas para tornar isso impossível ou inútil:
 *
 * - **Nada é farmável.** XP de exercício conta uma vez por exercício distinto.
 *   Repetir o mesmo cem vezes rende o mesmo que resolver uma.
 * - **Velocidade não vale nada.** Não existe bônus por tempo (§174).
 * - **Persistência vale.** Quem resolve depois de errar várias vezes ganha um
 *   bônus que quem acerta de primeira não ganha — errar e insistir é o
 *   comportamento que a plataforma quer reforçar.
 * - **Autonomia vale.** Resolver sem revelar dica rende mais.
 *
 * Tudo é derivado do histórico que já existe. Não há tabela de pontos: o XP é
 * uma leitura dos fatos, então não pode ficar dessincronizado deles. O dobro
 * de XP da loja entra do mesmo jeito: a compra é um fato com hora, e o que
 * aconteceu nas 24 horas seguintes vale o dobro na recontagem.
 */

export const XP = {
  /** Por exercício distinto resolvido. */
  exercicioResolvido: 20,
  /** Adicional por ter resolvido sem revelar nenhuma dica. */
  bonusSemDica: 10,
  /** Adicional por ter resolvido depois de pelo menos uma falha. */
  bonusPersistencia: 5,
  porAulaConcluida: 50,
  porProjetoEntregue: 150,
  /** Por cartão distinto revisado ao menos uma vez. */
  porCartaoRevisado: 5,
} as const;

export interface XpBreakdown {
  exercicios: number;
  aulas: number;
  projetos: number;
  revisao: number;
  desafios: number;
  /** Quanto do total veio do dobro. Aparece na partição para o número ser auditável. */
  dobrado: number;
  total: number;
}

export interface GamificationInput {
  attempts: Attempt[];
  completedLessons: string[];
  completedProjects: string[];
  reviews: FlashcardReview[];
  purchases?: Purchase[];
  hoje?: Date;
}

/** Meio-dia local de um `AAAA-MM-DD`: o instante que representa um dia inteiro. */
function meioDia(dia: string): number {
  const [ano, mes, d] = dia.split('-').map(Number);
  return new Date(ano, mes - 1, d, 12).getTime();
}

export function computeXp(entrada: GamificationInput): XpBreakdown {
  const { attempts, completedLessons, completedProjects, reviews, purchases = [] } = entrada;
  const janelas = janelasDeDobro(purchases);
  let dobrado = 0;
  /** Soma `base`, dobrada se o instante cair numa janela de dobro. */
  const somar = (base: number, quando: string | number | null) => {
    if (quando !== null && emDobro(quando, janelas)) {
      dobrado += base;
      return base * 2;
    }
    return base;
  };

  // Agrupa por exercício para pontuar cada um uma única vez.
  const porExercicio = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const lista = porExercicio.get(a.exerciseId) ?? [];
    lista.push(a);
    porExercicio.set(a.exerciseId, lista);
  }

  let exercicios = 0;
  // A última tentativa certa em cada aula: é quando a aula "fechou".
  const fechamentoDaAula = new Map<string, string>();

  for (const tentativas of porExercicio.values()) {
    const acertos = tentativas.filter((t) => t.correct);
    if (acertos.length === 0) continue;

    // O primeiro acerto é o instante do XP: resolver de novo não rende, então
    // também não pode ganhar o dobro depois.
    const primeiroAcerto = [...acertos].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
    let base = XP.exercicioResolvido;
    if (acertos.some((t) => t.hintsUsed === 0)) base += XP.bonusSemDica;
    if (tentativas.some((t) => !t.correct)) base += XP.bonusPersistencia;
    exercicios += somar(base, primeiroAcerto.createdAt);

    for (const t of acertos) {
      const atual = fechamentoDaAula.get(t.lessonId);
      if (atual === undefined || t.createdAt > atual) fechamentoDaAula.set(t.lessonId, t.createdAt);
    }
  }

  let aulas = 0;
  for (const id of completedLessons) {
    aulas += somar(XP.porAulaConcluida, fechamentoDaAula.get(id) ?? null);
  }

  // Projetos não têm hora registrada: valem o de sempre, e a loja diz isso.
  const projetos = completedProjects.length * XP.porProjetoEntregue;

  const primeiraRevisao = new Map<string, string>();
  for (const r of reviews) {
    const atual = primeiraRevisao.get(r.flashcardId);
    if (atual === undefined || r.createdAt < atual) primeiraRevisao.set(r.flashcardId, r.createdAt);
  }
  let revisao = 0;
  for (const quando of primeiraRevisao.values()) revisao += somar(XP.porCartaoRevisado, quando);

  let desafios = 0;
  for (const d of desafiosConcluidos(entrada)) desafios += somar(d.recompensa.xp, meioDia(d.dia));

  return {
    exercicios,
    aulas,
    projetos,
    revisao,
    desafios,
    dobrado,
    total: exercicios + aulas + projetos + revisao + desafios,
  };
}

/**
 * Níveis sem teto.
 *
 * A versão anterior tinha seis níveis e o último era alcançado com 3.200 XP —
 * menos de um quinto do que o catálogo rende. Agora o XP mínimo do nível *n*
 * é `75 · n · (n − 1)`: 150 para o 2, 450 para o 3, 1.500 para o 5, 6.750
 * para o 10, 28.500 para o 20. Cada nível pede um pouco mais que o anterior,
 * sem a escalada de jogo que exige moer conteúdo; e a fórmula não acaba, então
 * conteúdo novo nunca deixa o nível parado no teto.
 *
 * Os títulos marcam faixas, e o último se repete: "Mestre 27" é um nível, não
 * um beco.
 */
export function xpMinimoDoNivel(nivel: number): number {
  return 75 * nivel * (nivel - 1);
}

export const TITULOS: ReadonlyArray<{ aPartirDe: number; title: string }> = [
  { aPartirDe: 1, title: 'Explorador' },
  { aPartirDe: 3, title: 'Iniciante' },
  { aPartirDe: 5, title: 'Praticante' },
  { aPartirDe: 7, title: 'Construtor' },
  { aPartirDe: 10, title: 'Desenvolvedor' },
  { aPartirDe: 13, title: 'Desenvolvedor pleno' },
  { aPartirDe: 16, title: 'Desenvolvedor sênior' },
  { aPartirDe: 20, title: 'Arquiteto' },
  { aPartirDe: 25, title: 'Mestre' },
];

/** A próxima faixa de título depois de um nível, ou `null` na última. */
export function proximaFaixa(nivel: number): { aPartirDe: number; title: string } | null {
  return TITULOS.find((f) => f.aPartirDe > nivel) ?? null;
}

export function tituloDoNivel(nivel: number): string {
  let titulo = TITULOS[0].title;
  for (const faixa of TITULOS) if (nivel >= faixa.aPartirDe) titulo = faixa.title;
  return titulo;
}

export interface LevelInfo {
  level: number;
  title: string;
  xp: number;
  /** XP acumulado dentro do nível atual. */
  xpIntoLevel: number;
  /** XP necessário para fechar o nível. */
  xpForNextLevel: number;
  nextTitle: string;
  /** O próximo nível traz um título novo? É quando vale anunciar. */
  proximoMudaTitulo: boolean;
}

export function levelFromXp(xp: number): LevelInfo {
  let nivel = 1;
  while (xp >= xpMinimoDoNivel(nivel + 1)) nivel += 1;

  const base = xpMinimoDoNivel(nivel);
  const proximo = xpMinimoDoNivel(nivel + 1);
  const title = tituloDoNivel(nivel);
  const nextTitle = tituloDoNivel(nivel + 1);

  return {
    level: nivel,
    title,
    xp,
    xpIntoLevel: xp - base,
    xpForNextLevel: proximo - base,
    nextTitle,
    proximoMudaTitulo: nextTitle !== title,
  };
}

/** As linguagens do catálogo, na ordem em que a conquista "Poliglota" as lista. */
const LINGUAGENS_DO_CATALOGO = ['javascript', 'typescript', 'react', 'sql', 'node', 'python', 'html'] as const;

export type CategoriaDeConquista = 'habitos' | 'habilidades' | 'trilhas' | 'etapas' | 'marcos';

export const CATEGORIAS_DE_CONQUISTA: Record<CategoriaDeConquista, string> = {
  habitos: 'Hábitos',
  habilidades: 'Habilidades',
  trilhas: 'Trilhas',
  etapas: 'Etapas do percurso',
  marcos: 'Marcos',
};

export interface Achievement {
  id: string;
  title: string;
  /** O que o aluno fez para merecer — ou o que falta fazer. */
  description: string;
  categoria: CategoriaDeConquista;
  unlocked: boolean;
  /** Para as conquistas de contagem: quanto já foi, e quanto falta. */
  progresso?: { atual: number; meta: number };
}

/**
 * Conquistas pedagógicas (§173).
 *
 * Marcam habilidades e hábitos antes de volume: "resolveu sem dica" e "voltou
 * depois de errar" dizem algo sobre o aluno. As de contagem existem — dez
 * exercícios sem dica, cinquenta resolvidos — mas contam coisas distintas,
 * então não se ganham repetindo; e as de trilha marcam o percurso inteiro.
 */
export function computeAchievements(
  input: GamificationInput,
  desafios: DesafioConcluido[] = desafiosConcluidos(input)
): Achievement[] {
  const { attempts, completedLessons, completedProjects, reviews, purchases = [] } = input;

  const acertos = attempts.filter((a) => a.correct);
  const exerciciosResolvidos = new Set(acertos.map((a) => a.exerciseId));
  const semDica = new Set(acertos.filter((a) => a.hintsUsed === 0).map((a) => a.exerciseId));

  // Persistência: resolveu um exercício em que já havia falhado.
  const falhouAntes = new Set(attempts.filter((a) => !a.correct).map((a) => a.exerciseId));
  const insistidos = [...exerciciosResolvidos].filter((id) => falhouAntes.has(id));

  const conceitosPraticados = new Set(attempts.flatMap((a) => a.concepts));
  const cartoesRevisados = new Set(reviews.map((r) => r.flashcardId));

  const congelamentos = purchases.filter((p) => p.item === 'congelar-sequencia');
  const sequencia = calcularSequencia(attempts, congelamentos, input.hoje);
  const maiorCorrente = Math.max(0, ...correntesDaHistoria(attempts, congelamentos, input.hoje));

  const concluidas = new Set(completedLessons);
  const trilhas = listTracks();
  const trilhasConcluidas = trilhas.filter((t) => t.lessonIds.every((id) => concluidas.has(id)));
  const aulasPorLinguagem = (linguagem: string) =>
    trilhas.filter((t) => t.language === linguagem).some((t) => t.lessonIds.some((id) => concluidas.has(id)));

  const diarios = desafios.filter((d) => d.periodo === 'dia').length;
  const semanais = desafios.filter((d) => d.periodo === 'semana').length;

  const contagem = (atual: number, meta: number) => ({ atual: Math.min(atual, meta), meta });

  return [
    // Hábitos
    {
      id: 'primeiro-codigo',
      title: 'Primeiro código executado',
      description: 'Você rodou código na plataforma pela primeira vez.',
      categoria: 'habitos',
      unlocked: attempts.length > 0,
    },
    {
      id: 'persistente',
      title: 'Não desistiu',
      description: 'Você errou, voltou e resolveu — o hábito que mais importa aqui.',
      categoria: 'habitos',
      unlocked: insistidos.length > 0,
    },
    {
      id: 'revisor',
      title: 'Voltou para revisar',
      description: 'Você revisou pelo menos cinco cartões — revisão é onde o conteúdo fixa.',
      categoria: 'habitos',
      unlocked: cartoesRevisados.size >= 5,
      progresso: contagem(cartoesRevisados.size, 5),
    },
    {
      id: 'constante',
      title: 'Três dias seguidos',
      description: 'Você estudou em três dias consecutivos.',
      categoria: 'habitos',
      unlocked: maiorCorrente >= 3,
      progresso: contagem(Math.max(maiorCorrente, sequencia.atual), 3),
    },
    {
      id: 'semana-inteira',
      title: 'Uma semana seguida',
      description: 'Sete dias consecutivos de estudo. Uma sequência assim é o que faz o conteúdo ficar.',
      categoria: 'habitos',
      unlocked: maiorCorrente >= 7,
      progresso: contagem(maiorCorrente, 7),
    },
    {
      id: 'mes-inteiro',
      title: 'Um mês seguido',
      description: 'Trinta dias consecutivos. Poucas pessoas chegam aqui.',
      categoria: 'habitos',
      unlocked: maiorCorrente >= 30,
      progresso: contagem(maiorCorrente, 30),
    },
    {
      id: 'desafiante',
      title: 'Dez desafios do dia',
      description: 'Você cumpriu dez desafios diários.',
      categoria: 'habitos',
      unlocked: diarios >= 10,
      progresso: contagem(diarios, 10),
    },
    {
      id: 'semana-cumprida',
      title: 'Desafio da semana',
      description: 'Você cumpriu um desafio semanal.',
      categoria: 'habitos',
      unlocked: semanais >= 1,
    },

    // Habilidades
    {
      id: 'primeiro-acerto',
      title: 'Primeiro exercício resolvido',
      description: 'Um exercício passou em todos os testes.',
      categoria: 'habilidades',
      unlocked: exerciciosResolvidos.size > 0,
    },
    {
      id: 'sem-ajuda',
      title: 'Resolveu sozinho',
      description: 'Você resolveu um exercício sem abrir nenhuma dica.',
      categoria: 'habilidades',
      unlocked: semDica.size > 0,
    },
    {
      id: 'autonomo',
      title: 'Dez por conta própria',
      description: 'Dez exercícios diferentes resolvidos sem revelar dica.',
      categoria: 'habilidades',
      unlocked: semDica.size >= 10,
      progresso: contagem(semDica.size, 10),
    },
    {
      id: 'insistente',
      title: 'Cinco viradas',
      description: 'Cinco exercícios que você errou e depois resolveu.',
      categoria: 'habilidades',
      unlocked: insistidos.length >= 5,
      progresso: contagem(insistidos.length, 5),
    },
    {
      id: 'abrangente',
      title: 'Cinco conceitos praticados',
      description: 'Você exercitou cinco conceitos diferentes.',
      categoria: 'habilidades',
      unlocked: conceitosPraticados.size >= 5,
      progresso: contagem(conceitosPraticados.size, 5),
    },
    {
      id: 'vasto',
      title: 'Vinte e cinco conceitos',
      description: 'Vinte e cinco conceitos diferentes praticados: o mapa já é grande.',
      categoria: 'habilidades',
      unlocked: conceitosPraticados.size >= 25,
      progresso: contagem(conceitosPraticados.size, 25),
    },
    {
      id: 'tipado',
      title: 'Compilou com tipos',
      description: 'Você concluiu uma aula de TypeScript — o erro antes de rodar.',
      categoria: 'habilidades',
      unlocked: aulasPorLinguagem('typescript'),
    },
    {
      id: 'componente',
      title: 'Montou um componente',
      description: 'Você concluiu uma aula de React.',
      categoria: 'habilidades',
      unlocked: aulasPorLinguagem('react'),
    },
    {
      id: 'consultou',
      title: 'Consultou um banco',
      description: 'Você concluiu uma aula de SQL.',
      categoria: 'habilidades',
      unlocked: aulasPorLinguagem('sql'),
    },
    {
      id: 'subiu-servidor',
      title: 'Subiu um servidor',
      description: 'Você concluiu uma aula de Node.',
      categoria: 'habilidades',
      unlocked: aulasPorLinguagem('node'),
    },
    {
      id: 'cobra',
      title: 'Trocou de linguagem',
      description: 'Você concluiu uma aula de Python — a primeira fora da família JavaScript.',
      categoria: 'habilidades',
      unlocked: aulasPorLinguagem('python'),
    },
    {
      id: 'desenhou-a-pagina',
      title: 'Desenhou uma página',
      description: 'Você concluiu uma aula de HTML, CSS ou DOM.',
      categoria: 'habilidades',
      unlocked: aulasPorLinguagem('html'),
    },
    {
      id: 'poliglota',
      title: 'Poliglota',
      description: 'Ao menos uma aula concluída em cada linguagem do catálogo: JS, TS, React, SQL, Node, Python e HTML.',
      categoria: 'habilidades',
      unlocked: LINGUAGENS_DO_CATALOGO.every((linguagem) => aulasPorLinguagem(linguagem)),
      progresso: contagem(LINGUAGENS_DO_CATALOGO.filter((linguagem) => aulasPorLinguagem(linguagem)).length, LINGUAGENS_DO_CATALOGO.length),
    },

    // Trilhas
    {
      id: 'primeira-aula',
      title: 'Primeira aula concluída',
      description: 'Você fechou uma aula inteira.',
      categoria: 'trilhas',
      unlocked: completedLessons.length > 0,
    },
    ...trilhas.map((t) => ({
      id: `trilha-${t.id}`,
      title: `${t.title}, completa`,
      description: `Todas as ${t.lessonIds.length} aulas de ${t.title} concluídas.`,
      categoria: 'trilhas' as const,
      unlocked: trilhasConcluidas.includes(t),
      progresso: contagem(t.lessonIds.filter((id) => concluidas.has(id)).length, t.lessonIds.length),
    })),
    {
      id: 'percurso-inteiro',
      title: 'O percurso inteiro',
      description: 'Todas as trilhas publicadas, concluídas.',
      categoria: 'trilhas',
      unlocked: trilhas.length > 0 && trilhasConcluidas.length === trilhas.length,
      progresso: contagem(trilhasConcluidas.length, trilhas.length),
    },

    // Etapas do percurso: uma por etapa, quando todas as trilhas dela fecham.
    ...ETAPAS_DO_PERCURSO.map((etapa, indice) => {
      const fechadas = etapa.trackIds.filter((id) => trilhasConcluidas.some((t) => t.id === id)).length;
      return {
        id: `etapa-${indice}`,
        title: etapa.title,
        description: etapa.description,
        categoria: 'etapas' as const,
        unlocked: fechadas === etapa.trackIds.length,
        progresso: contagem(fechadas, etapa.trackIds.length),
      };
    }),

    // Marcos
    {
      id: 'primeiro-projeto',
      title: 'Primeiro projeto entregue',
      description: 'Você atendeu todos os critérios de aceitação de um projeto.',
      categoria: 'marcos',
      unlocked: completedProjects.length > 0,
    },
    {
      id: 'cinquenta',
      title: 'Cinquenta exercícios',
      description: 'Cinquenta exercícios diferentes resolvidos.',
      categoria: 'marcos',
      unlocked: exerciciosResolvidos.size >= 50,
      progresso: contagem(exerciciosResolvidos.size, 50),
    },
    {
      id: 'cem',
      title: 'Cem exercícios',
      description: 'Cem exercícios diferentes resolvidos.',
      categoria: 'marcos',
      unlocked: exerciciosResolvidos.size >= 100,
      progresso: contagem(exerciciosResolvidos.size, 100),
    },
    {
      id: 'duzentos',
      title: 'Duzentos exercícios',
      description: 'Duzentos exercícios diferentes resolvidos.',
      categoria: 'marcos',
      unlocked: exerciciosResolvidos.size >= 200,
      progresso: contagem(exerciciosResolvidos.size, 200),
    },
    {
      id: 'vinte-aulas',
      title: 'Vinte aulas',
      description: 'Vinte aulas concluídas.',
      categoria: 'marcos',
      unlocked: completedLessons.length >= 20,
      progresso: contagem(completedLessons.length, 20),
    },
    {
      id: 'cem-aulas',
      title: 'Cem aulas',
      description: 'Cem aulas concluídas — mais da metade do catálogo.',
      categoria: 'marcos',
      unlocked: completedLessons.length >= 100,
      progresso: contagem(completedLessons.length, 100),
    },
    {
      id: 'todos-os-projetos',
      title: 'Todos os projetos',
      description: 'Todos os projetos publicados, entregues.',
      categoria: 'marcos',
      unlocked: listProjects().length > 0 && completedProjects.length >= listProjects().length,
      progresso: contagem(completedProjects.length, listProjects().length),
    },
  ];
}
