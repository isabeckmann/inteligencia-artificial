export type Cromossomo = number[];
export type Selecao = "roleta" | "torneio" | "ranking";
export type Cruzamento = "um-ponto" | "dois-pontos" | "uniforme";

export interface Config {
  n: number;
  tamanhoPopulacao: number;
  selecao: Selecao;
  cruzamento: Cruzamento;
  taxaMutacao: number;
  maxGeracoes: number;
  elitismo: boolean;
  limiteEstagnacao: number;
}

export interface Avaliado { cromossomo: Cromossomo; fitness: number }
export interface Geracao { numero: number; melhor: Avaliado; media: number; resolvido: boolean; fim: boolean }

export const aleatorio = (max: number): number => Math.floor(Math.random() * max);
export const maxPares = (n: number): number => (n * (n - 1)) / 2;

export const criarIndividuo = (n: number): Cromossomo => Array.from({ length: n }, () => aleatorio(n));

const emConflitoPar = (c: Cromossomo, i: number, j: number): boolean =>
  c[i] === c[j] || Math.abs((c[i] ?? 0) - (c[j] ?? 0)) === Math.abs(i - j);

export function contarConflitos(c: Cromossomo): number {
  let total = 0;
  for (let i = 0; i < c.length; i++)
    for (let j = i + 1; j < c.length; j++) if (emConflitoPar(c, i, j)) total++;
  return total;
}

export function colunasEmConflito(c: Cromossomo): boolean[] {
  const r = c.map(() => false);
  for (let i = 0; i < c.length; i++)
    for (let j = i + 1; j < c.length; j++) if (emConflitoPar(c, i, j)) { r[i] = true; r[j] = true; }
  return r;
}

export const fitness = (c: Cromossomo): number => maxPares(c.length) - contarConflitos(c);

export function selecionarPai(pop: Avaliado[], tipo: Selecao): Cromossomo {
  const ultimo = pop[pop.length - 1]!;
  if (tipo === "torneio") {
    let melhor = pop[aleatorio(pop.length)]!;
    for (let k = 1; k < 3; k++) {
      const c = pop[aleatorio(pop.length)]!;
      if (c.fitness > melhor.fitness) melhor = c;
    }
    return melhor.cromossomo;
  }
  if (tipo === "ranking") {
    const ord = [...pop].sort((a, b) => a.fitness - b.fitness);
    let r = Math.random() * ((ord.length * (ord.length + 1)) / 2);
    for (let i = 0; i < ord.length; i++) {
      if (r < i + 1) return ord[i]!.cromossomo;
      r -= i + 1;
    }
    return ord[ord.length - 1]!.cromossomo;
  }
  let r = Math.random() * pop.reduce((s, e) => s + e.fitness + 1, 0);
  for (const e of pop) {
    r -= e.fitness + 1;
    if (r <= 0) return e.cromossomo;
  }
  return ultimo.cromossomo;
}

export function cruzar(p1: Cromossomo, p2: Cromossomo, tipo: Cruzamento): Cromossomo {
  const n = p1.length;
  if (tipo === "uniforme") return p1.map((g, i) => (Math.random() < 0.5 ? g : p2[i]!));
  if (tipo === "dois-pontos") {
    let a = aleatorio(n), b = aleatorio(n);
    if (a > b) [a, b] = [b, a];
    return p2.map((g, i) => (i >= a && i <= b ? p1[i]! : g)); 
  }
  const corte = 1 + aleatorio(n - 1);
  return [...p1.slice(0, corte), ...p2.slice(corte)];
}

export const mutar = (c: Cromossomo, taxa: number): Cromossomo =>
  c.map((g) => (Math.random() * 100 < taxa ? aleatorio(c.length) : g));

export class AlgoritmoGenetico {
  populacao: Cromossomo[];
  geracao = 0;
  estagnacao = 0;
  private melhorFitness = -1;

  constructor(readonly cfg: Config) {
    this.populacao = Array.from({ length: cfg.tamanhoPopulacao }, () => criarIndividuo(cfg.n));
  }

  passo(): Geracao {
    const av = this.populacao.map((c) => ({ cromossomo: c, fitness: fitness(c) }));
    const melhor = av.reduce((a, b) => (b.fitness > a.fitness ? b : a));
    const media = av.reduce((s, e) => s + e.fitness, 0) / av.length;
    this.geracao++;

    if (melhor.fitness > this.melhorFitness) { this.melhorFitness = melhor.fitness; this.estagnacao = 0; }
    else this.estagnacao++;

    const resolvido = melhor.fitness === maxPares(this.cfg.n);
    const fim = resolvido || this.geracao >= this.cfg.maxGeracoes;
    if (!fim) this.reproduzir(av, melhor);
    return { numero: this.geracao, melhor, media, resolvido, fim };
  }

  private reproduzir(av: Avaliado[], melhor: Avaliado): void {
    const { tamanhoPopulacao, selecao, cruzamento, taxaMutacao, elitismo, limiteEstagnacao } = this.cfg;
    const nova: Cromossomo[] = elitismo ? [[...melhor.cromossomo]] : [];
    while (nova.length < tamanhoPopulacao) {
      const filho = cruzar(selecionarPai(av, selecao), selecionarPai(av, selecao), cruzamento);
      nova.push(mutar(filho, taxaMutacao));
    }
    if (this.estagnacao > 0 && this.estagnacao % limiteEstagnacao === 0) {
      const inicio = elitismo ? 1 : 0;
      const qtd = Math.max(1, Math.floor(tamanhoPopulacao * 0.3));
      for (let k = inicio; k < inicio + qtd && k < nova.length; k++) nova[k] = criarIndividuo(this.cfg.n);
    }
    this.populacao = nova;
  }
}

export const configPadrao: Config = {
  n: 8, tamanhoPopulacao: 100, selecao: "torneio", cruzamento: "um-ponto",
  taxaMutacao: 1, maxGeracoes: 500, elitismo: true, limiteEstagnacao: 40,
};
