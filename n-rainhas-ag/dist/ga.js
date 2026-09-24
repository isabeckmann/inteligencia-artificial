// Lógica pura do Algoritmo Genético (sem DOM), para o problema das N-Rainhas.
// Cromossomo: índice = coluna, valor = linha da rainha naquela coluna.
// Logo, nunca há conflito de coluna; só de linha e diagonal.
export const aleatorio = (max) => Math.floor(Math.random() * max);
export const maxPares = (n) => (n * (n - 1)) / 2;
export const criarIndividuo = (n) => Array.from({ length: n }, () => aleatorio(n));
const emConflitoPar = (c, i, j) => c[i] === c[j] || Math.abs((c[i] ?? 0) - (c[j] ?? 0)) === Math.abs(i - j);
export function contarConflitos(c) {
    let total = 0;
    for (let i = 0; i < c.length; i++)
        for (let j = i + 1; j < c.length; j++)
            if (emConflitoPar(c, i, j))
                total++;
    return total;
}
/** Marca quais colunas têm uma rainha sendo atacada (para pintar de vermelho). */
export function colunasEmConflito(c) {
    const r = c.map(() => false);
    for (let i = 0; i < c.length; i++)
        for (let j = i + 1; j < c.length; j++)
            if (emConflitoPar(c, i, j)) {
                r[i] = true;
                r[j] = true;
            }
    return r;
}
// Fitness = pares possíveis - pares em conflito. Máximo (n(n-1)/2) = solução.
export const fitness = (c) => maxPares(c.length) - contarConflitos(c);
export function selecionarPai(pop, tipo) {
    const ultimo = pop[pop.length - 1];
    if (tipo === "torneio") {
        let melhor = pop[aleatorio(pop.length)];
        for (let k = 1; k < 3; k++) {
            const c = pop[aleatorio(pop.length)];
            if (c.fitness > melhor.fitness)
                melhor = c;
        }
        return melhor.cromossomo;
    }
    if (tipo === "ranking") {
        const ord = [...pop].sort((a, b) => a.fitness - b.fitness); // pior = posição 1
        let r = Math.random() * ((ord.length * (ord.length + 1)) / 2);
        for (let i = 0; i < ord.length; i++) {
            if (r < i + 1)
                return ord[i].cromossomo;
            r -= i + 1;
        }
        return ord[ord.length - 1].cromossomo;
    }
    // roleta: peso = fitness + 1 (evita peso zero)
    let r = Math.random() * pop.reduce((s, e) => s + e.fitness + 1, 0);
    for (const e of pop) {
        r -= e.fitness + 1;
        if (r <= 0)
            return e.cromossomo;
    }
    return ultimo.cromossomo;
}
export function cruzar(p1, p2, tipo) {
    const n = p1.length;
    if (tipo === "uniforme")
        return p1.map((g, i) => (Math.random() < 0.5 ? g : p2[i]));
    if (tipo === "dois-pontos") {
        let a = aleatorio(n), b = aleatorio(n);
        if (a > b)
            [a, b] = [b, a];
        return p2.map((g, i) => (i >= a && i <= b ? p1[i] : g)); // trecho [a,b] vem do pai 1
    }
    const corte = 1 + aleatorio(n - 1); // um ponto
    return [...p1.slice(0, corte), ...p2.slice(corte)];
}
/** Mutação por substituição: cada gene, com probabilidade `taxa`%, ganha uma linha aleatória. */
export const mutar = (c, taxa) => c.map((g) => (Math.random() * 100 < taxa ? aleatorio(c.length) : g));
export class AlgoritmoGenetico {
    cfg;
    populacao;
    geracao = 0;
    estagnacao = 0;
    melhorFitness = -1;
    constructor(cfg) {
        this.cfg = cfg;
        this.populacao = Array.from({ length: cfg.tamanhoPopulacao }, () => criarIndividuo(cfg.n));
    }
    /** Executa uma geração: avalia, checa parada e (se não acabou) gera a próxima população. */
    passo() {
        const av = this.populacao.map((c) => ({ cromossomo: c, fitness: fitness(c) }));
        const melhor = av.reduce((a, b) => (b.fitness > a.fitness ? b : a));
        const media = av.reduce((s, e) => s + e.fitness, 0) / av.length;
        this.geracao++;
        if (melhor.fitness > this.melhorFitness) {
            this.melhorFitness = melhor.fitness;
            this.estagnacao = 0;
        }
        else
            this.estagnacao++;
        const resolvido = melhor.fitness === maxPares(this.cfg.n);
        const fim = resolvido || this.geracao >= this.cfg.maxGeracoes;
        if (!fim)
            this.reproduzir(av, melhor);
        return { numero: this.geracao, melhor, media, resolvido, fim };
    }
    reproduzir(av, melhor) {
        const { tamanhoPopulacao, selecao, cruzamento, taxaMutacao, elitismo, limiteEstagnacao } = this.cfg;
        const nova = elitismo ? [[...melhor.cromossomo]] : [];
        while (nova.length < tamanhoPopulacao) {
            const filho = cruzar(selecionarPai(av, selecao), selecionarPai(av, selecao), cruzamento);
            nova.push(mutar(filho, taxaMutacao));
        }
        // Estagnou: troca 30% da população por indivíduos aleatórios (preserva o elitista, se houver)
        if (this.estagnacao > 0 && this.estagnacao % limiteEstagnacao === 0) {
            const inicio = elitismo ? 1 : 0;
            const qtd = Math.max(1, Math.floor(tamanhoPopulacao * 0.3));
            for (let k = inicio; k < inicio + qtd && k < nova.length; k++)
                nova[k] = criarIndividuo(this.cfg.n);
        }
        this.populacao = nova;
    }
}
export const configPadrao = {
    n: 8, tamanhoPopulacao: 100, selecao: "torneio", cruzamento: "um-ponto",
    taxaMutacao: 1, maxGeracoes: 500, elitismo: true, limiteEstagnacao: 40,
};
