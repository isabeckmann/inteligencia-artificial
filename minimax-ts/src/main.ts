import { melhorMovimento, minimax, MAX, type Contador } from "./minimax.js";
import { mostrar, velha, vencedor, vezDe, type Estado } from "./velha.js";

type No = number | No[];
const arvore: No = [[3, 5], [2, 9], [0, 7]];
const jogoArvore = {
  terminal: (n: No) => typeof n === "number",
  avaliacao: (n: No) => (typeof n === "number" ? n : 0),
  movimentos: (n: No) => (Array.isArray(n) ? n.map((_, i) => i) : []),
  aplicar: (n: No, i: number) => (n as No[])[i]!,
};
console.log("Árvore de exemplo, valor da raiz (esperado 3):", minimax(jogoArvore, arvore, 5, MAX));

const vazio: Estado = Array(9).fill(0);
for (const poda of [false, true]) {
  const contador: Contador = { nos: 0 };
  const v = minimax(velha, vazio, 9, MAX, { poda, contador });
  console.log(`Tabuleiro vazio, ${poda ? "com" : "sem"} poda: valor ${v}, nós visitados ${contador.nos}`);
}

let e: Estado = vazio;
while (!velha.terminal(e)) {
  const { movimento } = melhorMovimento(velha, e, vezDe(e), 9);
  e = velha.aplicar(e, movimento!);
}
console.log("\nPartida final:\n" + mostrar(e));
console.log("Resultado:", vencedor(e) === 0 ? "empate" : "alguém venceu (não deveria!)");
