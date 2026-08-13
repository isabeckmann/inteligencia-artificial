type Cell = {
  row: number;
  col: number;
  element: HTMLDivElement;
};

class ChessBoard {
  private size: number;
  private container: HTMLElement;
  private boardEl!: HTMLDivElement;
  private statusEl!: HTMLDivElement;
  private cells: Cell[][] = [];

  private queens: number[] = [];

  constructor(container: HTMLElement, size: number = 8) {
    this.container = container;
    this.size = size;
    this.queens = new Array(size).fill(-1);
    this.render();
  }
  private render(): void {
    this.container.innerHTML = "";
    this.cells = [];

    const wrapper = document.createElement("div");
    wrapper.className = "chess-wrapper";

    wrapper.appendChild(this.buildControls());

    this.boardEl = document.createElement("div");
    this.boardEl.className = "chess-board";
    this.boardEl.style.setProperty("--n", String(this.size));

    for (let row = 0; row < this.size; row++) {
      const rowCells: Cell[] = [];
      for (let col = 0; col < this.size; col++) {
        const cellEl = document.createElement("div");
        cellEl.className = "cell " + ((row + col) % 2 === 0 ? "light" : "dark");
        cellEl.dataset.row = String(row);
        cellEl.dataset.col = String(col);
        cellEl.addEventListener("click", () => this.onCellClick(row, col));
        this.boardEl.appendChild(cellEl);
        rowCells.push({ row, col, element: cellEl });
      }
      this.cells.push(rowCells);
    }
    wrapper.appendChild(this.boardEl);

    this.statusEl = document.createElement("div");
    this.statusEl.className = "chess-status";
    wrapper.appendChild(this.statusEl);

    this.container.appendChild(wrapper);
    this.refreshBoard();
  }

  private buildControls(): HTMLDivElement {
    const controls = document.createElement("div");
    controls.className = "chess-controls";

    const label = document.createElement("label");
    label.textContent = "Tamanho do tabuleiro (N): ";
    label.htmlFor = "board-size";

    const input = document.createElement("input");
    input.type = "number";
    input.id = "board-size";
    input.min = "4";
    input.max = "12";
    input.value = String(this.size);
    input.addEventListener("change", () => {
      const value = Math.min(12, Math.max(4, Number(input.value) || 8));
      input.value = String(value);
      this.setSize(value);
    });

    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Limpar rainhas";
    clearBtn.addEventListener("click", () => this.clearQueens());

    const solveBtn = document.createElement("button");
    solveBtn.textContent = "Resolver (1ª solução)";
    solveBtn.addEventListener("click", () => this.showFirstSolution());

    controls.appendChild(label);
    controls.appendChild(input);
    controls.appendChild(clearBtn);
    controls.appendChild(solveBtn);
    return controls;
  }

  public setSize(newSize: number): void {
    this.size = newSize;
    this.queens = new Array(newSize).fill(-1);
    this.render();
  }

  public clearQueens(): void {
    this.queens = new Array(this.size).fill(-1);
    this.refreshBoard();
  }

  private onCellClick(row: number, col: number): void {
    if (this.queens[row] === col) {
      this.queens[row] = -1;
    } else {
      this.queens[row] = col;
    }
    this.refreshBoard();
  }

  private attacks(r1: number, c1: number, r2: number, c2: number): boolean {
    if (r1 === r2 && c1 === c2) return false;
    if (c1 === c2) return true;
    if (Math.abs(r1 - r2) === Math.abs(c1 - c2)) return true;
    return false;
  }

  private getConflicts(): Set<string> {
    const conflicts = new Set<string>();
    for (let r1 = 0; r1 < this.size; r1++) {
      const c1 = this.queens[r1];
      if (c1 === -1) continue;
      for (let r2 = r1 + 1; r2 < this.size; r2++) {
        const c2 = this.queens[r2];
        if (c2 === -1) continue;
        if (this.attacks(r1, c1, r2, c2)) {
          conflicts.add(`${r1},${c1}`);
          conflicts.add(`${r2},${c2}`);
        }
      }
    }
    return conflicts;
  }

  private refreshBoard(): void {
    const conflicts = this.getConflicts();

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const { element } = this.cells[row][col];
        const hasQueen = this.queens[row] === col;

        element.classList.toggle("has-queen", hasQueen);
        element.classList.toggle("conflict", hasQueen && conflicts.has(`${row},${col}`));
        element.textContent = hasQueen ? "♛" : "";
      }
    }

    const placed = this.queens.filter((c) => c !== -1).length;
    const conflictPairs = conflicts.size / 2;
    const isComplete = placed === this.size && conflictPairs === 0;

    this.statusEl.textContent = isComplete
      ? `Solução válida! ${placed}/${this.size} rainhas, sem conflitos.`
      : `Rainhas: ${placed}/${this.size} | Conflitos: ${conflictPairs}`;
    this.statusEl.classList.toggle("ok", isComplete);
  }

  public isValidBoard(): boolean {
    return this.getConflicts().size === 0;
  }

  public solveNQueens(): number[] | null {
    const n = this.size;
    const cols = new Set<number>();
    const diag1 = new Set<number>(); // row - col
    const diag2 = new Set<number>(); // row + col
    const placement: number[] = new Array(n).fill(-1);

    const backtrack = (row: number): boolean => {
      if (row === n) return true;
      for (let col = 0; col < n; col++) {
        if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue;
        placement[row] = col;
        cols.add(col);
        diag1.add(row - col);
        diag2.add(row + col);

        if (backtrack(row + 1)) return true;

        cols.delete(col);
        diag1.delete(row - col);
        diag2.delete(row + col);
      }
      return false;
    };

    return backtrack(0) ? placement.slice() : null;
  }

  public showFirstSolution(): void {
    const solution = this.solveNQueens();
    if (!solution) {
      this.statusEl.textContent = `Não há solução para N = ${this.size}.`;
      return;
    }
    this.queens = solution;
    this.refreshBoard();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("app");
  if (root) {
    new ChessBoard(root, 8);
  }
});
