import { AlgoritmoGenetico, colunasEmConflito, maxPares, type Config, type Cromossomo, type Cruzamento, type Selecao } from "./ga.js";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
let ag: AlgoritmoGenetico;
let timer: number | undefined;

// Estado para o modo interativo (jogador humano)
let tabuleiroManual: Cromossomo = new Array(8).fill(-1);

function lerConfig(): Config {
  return {
    n: 8,
    tamanhoPopulacao: Math.max(4, +$<HTMLInputElement>("pop").value || 100),
    selecao: $<HTMLSelectElement>("selecao").value as Selecao,
    cruzamento: $<HTMLSelectElement>("cruzamento").value as Cruzamento,
    taxaMutacao: +$<HTMLInputElement>("mutacao").value || 0,
    maxGeracoes: Math.max(1, +$<HTMLInputElement>("maxger").value || 500),
    elitismo: $<HTMLInputElement>("elitismo").checked,
    limiteEstagnacao: 40,
  };
}

function desenhar(c: Cromossomo): void {
  const ruins = colunasEmConflito(c);
  const html: string[] = [];
  for (let l = 0; l < 8; l++) {
    for (let col = 0; col < 8; col++) {
      const rainha = c[col] === l;
      const cls = ["casa", (l + col) % 2 ? "escura" : "clara", rainha && ruins[col] ? "conflito" : ""].join(" ");
      html.push(`<div class="${cls}" data-col="${col}" data-lin="${l}">${rainha ? "♛" : ""}</div>`);
    }
  }
  const tabEl = $("tabuleiro");
  tabEl.innerHTML = html.join("");

  // Adiciona evento de clique nas casas do tabuleiro para permitir o jogo manual
  tabEl.querySelectorAll<HTMLElement>(".casa").forEach((el) => {
    el.addEventListener("click", () => {
      const col = +el.dataset.col!;
      const lin = +el.dataset.lin!;
      aoClicarCasa(col, lin);
    });
  });
}

function aoClicarCasa(coluna: number, linha: number): void {
  if (timer !== undefined) parar(); // Interrompe o AG se estiver rodando

  // Alterna a posição da rainha na coluna clicada
  if (tabuleiroManual[coluna] === linha) {
    tabuleiroManual[coluna] = -1; // Remove rainha
  } else {
    tabuleiroManual[coluna] = linha; // Coloca rainha
  }

  desenhar(tabuleiroManual);

  // Calcula e exibe estatísticas do tabuleiro do jogador
  const conflitosMap = colunasEmConflito(tabuleiroManual);
  const numConflitos = conflitosMap.filter(Boolean).length;
  const rainhasColocadas = tabuleiroManual.filter((x) => x !== -1).length;

  $("s-conf").textContent = String(numConflitos);
  if (rainhasColocadas === 8 && numConflitos === 0) {
    $("resultado").textContent = "Parabéns! Você resolveu o problema das 8 Rainhas!";
  } else {
    $("resultado").textContent = `Modo Jogador: ${rainhasColocadas}/8 rainhas posicionadas.`;
  }
}

function parar(): void { 
  clearInterval(timer); 
  timer = undefined; 
  $("rodar").textContent = "Rodar"; 
}

function passo(): void {
  const g = ag.passo();
  const conflitos = maxPares(ag.cfg.n) - g.melhor.fitness;
  tabuleiroManual = [...g.melhor.cromossomo]; // Atualiza o estado visual
  desenhar(g.melhor.cromossomo);
  $("s-ger").textContent = String(g.numero);
  $("s-fit").textContent = `${g.melhor.fitness}/${maxPares(ag.cfg.n)}`;
  $("s-conf").textContent = String(conflitos);
  $("s-est").textContent = String(ag.estagnacao);
  const li = document.createElement("li");
  li.textContent = `Ger. ${g.numero} — melhor ${g.melhor.fitness}, média ${g.media.toFixed(1)} — [${g.melhor.cromossomo.map((x) => x + 1).join(", ")}]`;
  $("historico").prepend(li);
  while ($("historico").children.length > 200) $("historico").lastElementChild?.remove();
  if (g.fim) {
    parar();
    $("resultado").textContent = g.resolvido
      ? `Solução encontrada na geração ${g.numero}: nenhuma rainha ataca outra.`
      : `Limite de gerações atingido. Melhor resultado: ${conflitos} conflito(s).`;
    $<HTMLButtonElement>("passo").disabled = $<HTMLButtonElement>("rodar").disabled = true;
  }
}

function reiniciar(): void {
  parar();
  ag = new AlgoritmoGenetico(lerConfig());
  tabuleiroManual = new Array(8).fill(-1);
  $("historico").innerHTML = "";
  $("resultado").textContent = "Modo Jogador ativo: clique nas casas do tabuleiro para jogar.";
  for (const id of ["s-ger", "s-conf", "s-est"]) $(id).textContent = "0";
  $("s-fit").textContent = "–";
  $<HTMLButtonElement>("passo").disabled = $<HTMLButtonElement>("rodar").disabled = false;
  desenhar(tabuleiroManual);
}

$("reiniciar").addEventListener("click", reiniciar);
$("passo").addEventListener("click", passo);
$("rodar").addEventListener("click", () => {
  if (timer !== undefined) return parar();
  $("rodar").textContent = "Pausar";
  timer = window.setInterval(passo, 60);
});
reiniciar();