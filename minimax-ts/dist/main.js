import { melhorMovimento, minimax, MAX } from "./minimax.js";
import { mostrar, velha, vencedor, vezDe } from "./velha.js";
const arvore = [[3, 5], [2, 9], [0, 7]];
const jogoArvore = {
    terminal: (n) => typeof n === "number",
    avaliacao: (n) => (typeof n === "number" ? n : 0),
    movimentos: (n) => (Array.isArray(n) ? n.map((_, i) => i) : []),
    aplicar: (n, i) => n[i],
};
console.log("Árvore de exemplo, valor da raiz (esperado 3):", minimax(jogoArvore, arvore, 5, MAX));
const vazio = Array(9).fill(0);
for (const poda of [false, true]) {
    const contador = { nos: 0 };
    const v = minimax(velha, vazio, 9, MAX, { poda, contador });
    console.log(`Tabuleiro vazio, ${poda ? "com" : "sem"} poda: valor ${v}, nós visitados ${contador.nos}`);
}
let e = vazio;
while (!velha.terminal(e)) {
    const { movimento } = melhorMovimento(velha, e, vezDe(e), 9);
    e = velha.aplicar(e, movimento);
}
console.log("\nPartida final:\n" + mostrar(e));
console.log("Resultado:", vencedor(e) === 0 ? "empate" : "alguém venceu (não deveria!)");
