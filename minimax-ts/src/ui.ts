import { melhorMovimento, MAX, MIN } from "./minimax.js";
import { velha, vezDe } from "./velha.js";

// Declarado como readonly number[] para aceitar retornos imutáveis do jogo da velha
let estado: readonly number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let jogoAtivo = true;

const $status = document.getElementById("status") as HTMLElement;
const celulas = document.querySelectorAll<HTMLElement>(".celula");
const btnReiniciar = document.getElementById("reiniciar") as HTMLButtonElement;

function renderizar(): void {
  celulas.forEach((celula, i) => {
    const valor = estado[i];
    celula.textContent = valor === MAX ? "X" : valor === MIN ? "O" : "";
    if (valor !== 0) {
      celula.classList.add("ocupada");
    } else {
      celula.classList.remove("ocupada");
    }
  });
}

function verificarFimDeJogo(): boolean {
  if (velha.terminal(estado)) {
    jogoAtivo = false;
    const res = velha.avaliacao(estado);
    if (res === MAX) {
      $status.textContent = "Você venceu! (X)";
    } else if (res === MIN) {
      $status.textContent = "A IA venceu! (O)";
    } else {
      $status.textContent = "Empate!";
    }
    return true;
  }
  return false;
}

function jogadaComputador(): void {
  if (!jogoAtivo) return;

  $status.textContent = "IA pensando...";

  setTimeout(() => {
    const jogadorAtual = vezDe(estado);
    const resultado = melhorMovimento(velha as any, estado, jogadorAtual, 9);

    // Garante estritamente que resultado.movimento é um número válido
    if (typeof resultado.movimento === "number") {
      estado = velha.aplicar(estado, resultado.movimento);
      renderizar();
      if (!verificarFimDeJogo()) {
        $status.textContent = "Sua vez (Você é o X)";
      }
    }
  }, 200);
}

function aoClicarCelula(index: number): void {
  if (!jogoAtivo || estado[index] !== 0) return;

  estado = velha.aplicar(estado, index);
  renderizar();

  if (!verificarFimDeJogo()) {
    jogadaComputador();
  }
}

function reiniciar(): void {
  estado = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  jogoAtivo = true;
  $status.textContent = "Sua vez (Você é o X)";
  renderizar();
}

celulas.forEach((celula) => {
  celula.addEventListener("click", () => {
    const idx = Number(celula.dataset.index);
    aoClicarCelula(idx);
  });
});

btnReiniciar.addEventListener("click", reiniciar);

renderizar();