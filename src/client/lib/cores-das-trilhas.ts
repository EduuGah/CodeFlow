/**
 * Uma cor por trilha.
 *
 * Cor com significado: cada assunto tem a sua, e ela aparece no marco do
 * percurso, na faixa da trilha e no cabeçalho da aula — a pessoa reconhece
 * "estou em SQL" pela cor antes de ler. São preenchimentos sólidos que
 * aguentam texto branco por cima nos dois modos (o teste de contraste confere
 * cada uma), e nenhum deles é a cor da marca, para a trilha nunca parecer um
 * botão.
 */
export const CORES_DAS_TRILHAS: Record<string, string> = {
  'track-js-fundamentos': '#8f6a12',
  'track-logica': '#5b5f8f',
  'track-estruturas': '#6b4fa0',
  'track-git': '#8a3a4a',
  'track-web': '#557a2f',
  'track-pagina': '#b04e22',
  'track-typescript': '#3178c6',
  'track-react': '#157a8c',
  'track-sql': '#7a3f8a',
  'track-node': '#35753c',
  'track-orm': '#a05a2c',
  'track-engenharia': '#4a5d78',
  'track-testes': '#256e56',
  'track-projeto': '#9a3f5c',
  'track-deploy': '#146b56',
  'track-terminal': '#4a4a4a',
  'track-python': '#2d6a8f',
};

const PADRAO = '#55605d';

export function corDaTrilha(trackId: string): string {
  return CORES_DAS_TRILHAS[trackId] ?? PADRAO;
}
