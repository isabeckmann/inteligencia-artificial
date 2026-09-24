import { MAX, MIN } from "./minimax.js";
const LINHAS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
export function vencedor(e) {
    for (const [a, b, c] of LINHAS)
        if (e[a] !== 0 && e[a] === e[b] && e[b] === e[c])
            return e[a];
    return 0;
}
export const vezDe = (e) => e.filter((v) => v === MAX).length === e.filter((v) => v === MIN).length ? MAX : MIN;
export const velha = {
    terminal: (e) => vencedor(e) !== 0 || !e.includes(0),
    avaliacao: (e) => vencedor(e),
    movimentos: (e) => e.flatMap((v, i) => (v === 0 ? [i] : [])),
    aplicar: (e, m) => e.map((v, i) => (i === m ? vezDe(e) : v)),
};
export function mostrar(e) {
    const s = (v) => (v === MAX ? "X" : v === MIN ? "O" : ".");
    return [0, 3, 6].map((i) => e.slice(i, i + 3).map(s).join(" ")).join("\n");
}
