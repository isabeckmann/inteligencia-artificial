export const MAX = 1;
export const MIN = -1;
export function minimax(jogo, estado, profundidade, jogador, opcoes = {}, alfa = -Infinity, beta = Infinity) {
    if (profundidade < 0)
        throw new RangeError("A profundidade deve ser maior ou igual a zero.");
    const { poda = false, contador } = opcoes;
    if (contador)
        contador.nos++;
    if (profundidade === 0 || jogo.terminal(estado))
        return jogo.avaliacao(estado);
    const proximo = jogador === MAX ? MIN : MAX;
    let valor = jogador === MAX ? -Infinity : Infinity;
    for (const m of jogo.movimentos(estado)) {
        const v = minimax(jogo, jogo.aplicar(estado, m), profundidade - 1, proximo, opcoes, alfa, beta);
        if (jogador === MAX) {
            valor = Math.max(valor, v);
            alfa = Math.max(alfa, valor);
        }
        else {
            valor = Math.min(valor, v);
            beta = Math.min(beta, valor);
        }
        if (poda && beta <= alfa)
            break;
    }
    return valor;
}
export function melhorMovimento(jogo, estado, jogador, profundidade, poda = true) {
    const contador = { nos: 0 };
    const proximo = jogador === MAX ? MIN : MAX;
    let melhoresMovimentos = [];
    let valorMelhor = jogador === MAX ? -Infinity : Infinity;
    for (const m of jogo.movimentos(estado)) {
        const v = minimax(jogo, jogo.aplicar(estado, m), profundidade - 1, proximo, { poda, contador });
        const ehMelhor = jogador === MAX ? v > valorMelhor : v < valorMelhor;
        const ehIgual = v === valorMelhor;
        if (ehMelhor) {
            valorMelhor = v;
            melhoresMovimentos = [m];
        }
        else if (ehIgual) {
            melhoresMovimentos.push(m);
        }
    }
    const movimentoSorteado = melhoresMovimentos.length > 0
        ? melhoresMovimentos[Math.floor(Math.random() * melhoresMovimentos.length)]
        : null;
    return { movimento: movimentoSorteado, valor: valorMelhor, nos: contador.nos };
}
