// Interface (DOM). Toda a lógica do AG está em ga.ts.
import { AlgoritmoGenetico, colunasEmConflito, maxPares } from "./ga.js";
const $ = (id) => document.getElementById(id);
let ag;
let timer;
function lerConfig() {
    return {
        n: 8,
        tamanhoPopulacao: Math.max(4, +$("pop").value || 100),
        selecao: $("selecao").value,
        cruzamento: $("cruzamento").value,
        taxaMutacao: +$("mutacao").value || 0,
        maxGeracoes: Math.max(1, +$("maxger").value || 500),
        elitismo: $("elitismo").checked,
        limiteEstagnacao: 40,
    };
}
function desenhar(c) {
    const ruins = colunasEmConflito(c);
    const html = [];
    for (let l = 0; l < 8; l++)
        for (let col = 0; col < 8; col++) {
            const rainha = c[col] === l;
            const cls = ["casa", (l + col) % 2 ? "escura" : "clara", rainha && ruins[col] ? "conflito" : ""].join(" ");
            html.push(`<div class="${cls}">${rainha ? "♛" : ""}</div>`);
        }
    $("tabuleiro").innerHTML = html.join("");
}
function parar() { clearInterval(timer); timer = undefined; $("rodar").textContent = "Rodar"; }
function passo() {
    const g = ag.passo();
    const conflitos = maxPares(ag.cfg.n) - g.melhor.fitness;
    desenhar(g.melhor.cromossomo);
    $("s-ger").textContent = String(g.numero);
    $("s-fit").textContent = `${g.melhor.fitness}/${maxPares(ag.cfg.n)}`;
    $("s-conf").textContent = String(conflitos);
    $("s-est").textContent = String(ag.estagnacao);
    const li = document.createElement("li");
    li.textContent = `Ger. ${g.numero} — melhor ${g.melhor.fitness}, média ${g.media.toFixed(1)} — [${g.melhor.cromossomo.map((x) => x + 1).join(", ")}]`;
    $("historico").prepend(li);
    while ($("historico").children.length > 200)
        $("historico").lastElementChild?.remove();
    if (g.fim) {
        parar();
        $("resultado").textContent = g.resolvido
            ? `Solução encontrada na geração ${g.numero}: nenhuma rainha ataca outra.`
            : `Limite de gerações atingido. Melhor resultado: ${conflitos} conflito(s).`;
        $("passo").disabled = $("rodar").disabled = true;
    }
}
function reiniciar() {
    parar();
    ag = new AlgoritmoGenetico(lerConfig());
    $("historico").innerHTML = "";
    $("resultado").textContent = "";
    for (const id of ["s-ger", "s-conf", "s-est"])
        $(id).textContent = "0";
    $("s-fit").textContent = "–";
    $("passo").disabled = $("rodar").disabled = false;
    desenhar([]);
}
$("reiniciar").addEventListener("click", reiniciar);
$("passo").addEventListener("click", passo);
$("rodar").addEventListener("click", () => {
    if (timer !== undefined)
        return parar();
    $("rodar").textContent = "Pausar";
    timer = window.setInterval(passo, 60);
});
reiniciar();
