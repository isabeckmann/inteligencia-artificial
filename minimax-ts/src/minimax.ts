export const MAX = 1 as const;
export const MIN = -1 as const;
export type Jogador = typeof MAX | typeof MIN;

export interface Jogo<E, M> {
  terminal(estado: E): boolean;
  avaliacao(estado: E): number;
  movimentos(estado: E): M[];
  aplicar(estado: E, movimento: M): E;
}

export interface Contador { nos: number }

export function minimax<E, M>(
  jogo: Jogo<E, M>, estado: E, profundidade: number, jogador: Jogador,
  opcoes: { poda?: boolean; contador?: Contador } = {},
  alfa = -Infinity, beta = Infinity,
): number {
  if (profundidade < 0) throw new RangeError("A profundidade deve ser maior ou igual a zero.");
  const { poda = false, contador } = opcoes;
  if (contador) contador.nos++;
  if (profundidade === 0 || jogo.terminal(estado)) return jogo.avaliacao(estado);

  const proximo: Jogador = jogador === MAX ? MIN : MAX;
  let valor = jogador === MAX ? -Infinity : Infinity;
  for (const m of jogo.movimentos(estado)) {
    const v = minimax(jogo, jogo.aplicar(estado, m), profundidade - 1, proximo, opcoes, alfa, beta);
    if (jogador === MAX) { valor = Math.max(valor, v); alfa = Math.max(alfa, valor); }
    else { valor = Math.min(valor, v); beta = Math.min(beta, valor); }
    if (poda && beta <= alfa) break;
  }
  return valor;
}

export function melhorMovimento<E, M>(
  jogo: Jogo<E, M>, estado: E, jogador: Jogador, profundidade: number, poda = true,
): { movimento: M | null; valor: number; nos: number } {
  const contador: Contador = { nos: 0 };
  const proximo: Jogador = jogador === MAX ? MIN : MAX;
  
  let melhoresMovimentos: M[] = [];
  let valorMelhor = jogador === MAX ? -Infinity : Infinity;

  for (const m of jogo.movimentos(estado)) {
    const v = minimax(jogo, jogo.aplicar(estado, m), profundidade - 1, proximo, { poda, contador });
    
    const ehMelhor = jogador === MAX ? v > valorMelhor : v < valorMelhor;
    const ehIgual = v === valorMelhor;

    if (ehMelhor) {
      valorMelhor = v;
      melhoresMovimentos = [m];
    } else if (ehIgual) {
      melhoresMovimentos.push(m);
    }
  }

  const movimentoSorteado = melhoresMovimentos.length > 0 
    ? melhoresMovimentos[Math.floor(Math.random() * melhoresMovimentos.length)]! 
    : null;

  return { movimento: movimentoSorteado, valor: valorMelhor, nos: contador.nos };
}