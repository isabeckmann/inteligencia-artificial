// Experimento: compara as 9 combinações seleção x cruzamento (20 execuções cada).
import { AlgoritmoGenetico, configPadrao } from "./ga.js";
const selecoes = ["roleta", "torneio", "ranking"];
const cruzamentos = ["um-ponto", "dois-pontos", "uniforme"];
const EXECUCOES = 20;
console.log("seleção   | cruzamento  | sucesso | média de gerações");
for (const selecao of selecoes)
    for (const cruzamento of cruzamentos) {
        let ok = 0, soma = 0;
        for (let e = 0; e < EXECUCOES; e++) {
            const ag = new AlgoritmoGenetico({ ...configPadrao, selecao, cruzamento });
            for (;;) {
                const g = ag.passo();
                if (g.fim) {
                    if (g.resolvido) {
                        ok++;
                        soma += g.numero;
                    }
                    break;
                }
            }
        }
        console.log(`${selecao.padEnd(9)} | ${cruzamento.padEnd(11)} | ${ok}/${EXECUCOES}   | ${ok ? (soma / ok).toFixed(1) : "-"}`);
    }
