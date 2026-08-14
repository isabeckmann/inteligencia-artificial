# Tabuleiro N-Rainhas Interativo

Tabuleiro de xadrez visual e interativo feito em **TypeScript** e **CSS**, criado como base para resolver o problema clássico das **N-Rainhas**.

## 📁 Estrutura do projeto

```
nqueens-board/
├── index.html       # Página HTML que carrega o CSS e o JS
├── styles.css        # Estilos visuais do tabuleiro
├── chessboard.ts      # Código-fonte em TypeScript
└── chessboard.js      # Versão compilada (JavaScript), já pronta para uso
```

## ▶️ Como abrir

Não é necessário instalar nada para visualizar o tabuleiro — o `chessboard.js` já vem compilado.

**Opção 1 — Duplo clique**
Dê duplo clique no arquivo `index.html`. Ele abre direto no seu navegador padrão.

**Opção 2 — Terminal**
```bash
# dentro da pasta nqueens-board
open index.html        # macOS
xdg-open index.html    # Linux
start index.html        # Windows (cmd)
```

**Opção 3 — Servidor local (opcional)**
```bash
cd nqueens-board
python3 -m http.server 8000
```
Depois acesse `http://localhost:8000` no navegador.

> Os três arquivos (`index.html`, `styles.css`, `chessboard.js`) precisam estar na mesma pasta.

## 🛠️ Como editar e recompilar o TypeScript

Se você alterar o `chessboard.ts`, precisa recompilar para gerar um novo `chessboard.js`:

```bash
# instalar o compilador TypeScript (uma vez só)
npm install -g typescript

# compilar
tsc chessboard.ts --target ES2017 --lib DOM,ES2017 --strict
```

Isso vai gerar um novo `chessboard.js` atualizado, que é o arquivo que o `index.html` carrega.

## ✨ Funcionalidades atuais

- **Tabuleiro configurável**: escolha o tamanho N (de 4 a 12) pelo campo no topo.
- **Colocar/remover rainhas**: clique em uma casa para colocar uma rainha (♛); clique de novo para remover.
- **Detecção de conflitos em tempo real**: rainhas que se atacam (mesma coluna ou diagonal) ficam destacadas em vermelho.
- **Status ao vivo**: mostra quantas rainhas foram colocadas e quantos conflitos existem; exibe "✅ Solução válida!" quando o tabuleiro está completo e sem conflitos.
- **Botão "Limpar rainhas"**: remove todas as rainhas do tabuleiro.
- **Botão "Resolver (1ª solução)"**: calcula automaticamente uma solução válida via backtracking e a exibe no tabuleiro.

## 🧩 Preparado para evoluir o problema das N-Rainhas

A classe `ChessBoard` (em `chessboard.ts`) já expõe métodos pensados para as próximas etapas:

| Método | Descrição |
|---|---|
| `isValidBoard(): boolean` | Retorna `true` se o arranjo atual de rainhas não tem nenhum conflito. |
| `solveNQueens(): number[] \| null` | Resolve o problema via backtracking a partir do tamanho atual do tabuleiro e retorna a primeira solução encontrada como um array `queens[row] = col`, ou `null` se não houver solução. |
| `showFirstSolution(): void` | Aplica a primeira solução encontrada diretamente no tabuleiro visual. |
| `setSize(n: number): void` | Redefine o tamanho do tabuleiro (N) e redesenha tudo do zero. |
| `clearQueens(): void` | Remove todas as rainhas sem alterar o tamanho do tabuleiro. |

### Ideias para próximos passos
- Animar o processo de backtracking passo a passo (mostrando cada tentativa e retrocesso).
- Listar/contabilizar **todas** as soluções possíveis para um dado N.
- Comparar a colocação manual do usuário com uma solução ótima calculada.
- Adicionar modo "dica": destacar automaticamente onde uma rainha pode ser colocada com segurança.
- Persistir o estado do tabuleiro (localStorage) ou compartilhar uma configuração via URL.

## 🎨 Personalização visual

As cores principais estão centralizadas em variáveis CSS no topo do `styles.css`:

```css
:root {
  --light-cell: #f0d9b5;   /* casas claras */
  --dark-cell: #b58863;    /* casas escuras */
  --queen-color: #1a1a1a;  /* cor da rainha */
  --conflict-color: #e74c3c; /* cor de conflito */
  --accent: #2e7d32;       /* cor de destaque/status */
}
```

Basta alterar esses valores para trocar o tema do tabuleiro.

## ✅ Requisitos

- Qualquer navegador moderno (Chrome, Firefox, Edge, Safari).
- Node.js + npm apenas se for **editar e recompilar** o TypeScript (não é necessário só para visualizar).
