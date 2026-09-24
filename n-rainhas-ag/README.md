# N-Rainhas com Algoritmo Genético (TypeScript)

- `src/ga.ts`: lógica pura do AG (cromossomo, fitness, seleção, crossover, mutação, ciclo evolutivo).
- `src/main.ts`: interface no navegador. `src/cli.ts`: experimento comparando as 9 combinações.

## Como rodar
```
npm install
npm start            # compila e abre um servidor local (módulos ES não abrem por duplo clique)
npm run experimento  # tabela de sucesso/gerações no terminal
```
Alternativa ao `npm start`: `npm run build` e depois `python3 -m http.server`, abrindo http://localhost:8000.

## Modelagem
- Cromossomo: vetor de 8 posições (índice = coluna, valor = linha). Não há conflito de coluna.
- Fitness = 28 − pares em conflito (28 = solução).
- Seleção: roleta (peso fitness+1), torneio (k=3), ranking linear.
- Crossover: um ponto, dois pontos, uniforme. Mutação: substituição aleatória do gene.
- Elitismo opcional e injeção de 30% de indivíduos aleatórios após 40 gerações sem melhora.
