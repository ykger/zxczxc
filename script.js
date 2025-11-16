/* Emoji Word Hunt - completo
   - HTML/CSS/JS puro
   - Fase1: adivinar 10 emojis (3 min)
   - Fase2: sopa de letras dinámica (7 min)
   - Selección por click y arrastre compatible con mouse y touch
   - Inicialización segura y código comentado
*/

/* ============================
   DATA: 50 emojis con una sola palabra en inglés
   ============================ */
const EMOJI_LIST = [
  { e: "🍎", w: "apple" },
  { e: "🍌", w: "banana" },
  { e: "📚", w: "book" },
  { e: "🪑", w: "chair" },
  { e: "🛋️", w: "couch" },
  { e: "🛏️", w: "bed" },
  { e: "💡", w: "lamp" },
  { e: "📱", w: "phone" },
  { e: "🔑", w: "key" },
  { e: "⏰", w: "clock" },
  { e: "☕", w: "cup" },
  { e: "💻", w: "laptop" },
  { e: "🖱️", w: "mouse" },
  { e: "⌨️", w: "keyboard" },
  { e: "🖥️", w: "monitor" },
  { e: "🎧", w: "headphones" },
  { e: "📷", w: "camera" },
  { e: "🎸", w: "guitar" },
  { e: "👟", w: "shoe" },
  { e: "🧦", w: "socks" },
  { e: "🎒", w: "backpack" },
  { e: "🔨", w: "hammer" },
  { e: "🔧", w: "wrench" },
  { e: "🧰", w: "toolbox" },
  { e: "🪛", w: "screwdriver" },
  { e: "✂️", w: "scissors" },
  { e: "🪥", w: "toothbrush" },
  { e: "🧼", w: "soap" },
  { e: "🥤", w: "bottle" },
  { e: "🍽️", w: "plate" },
  { e: "🍴", w: "fork" },
  { e: "🥄", w: "spoon" },
  { e: "🔦", w: "flashlight" },
  { e: "🕯️", w: "candle" },
  { e: "📺", w: "television" },
  { e: "🧮", w: "abacus" },
  { e: "📅", w: "calendar" },
  { e: "🧷", w: "pin" },
  { e: "🧸", w: "teddy" },
  { e: "💳", w: "wallet" },
  { e: "🪙", w: "coin" },
  { e: "📎", w: "paperclip" },
  { e: "📐", w: "ruler" },
  { e: "🔒", w: "lock" },
  { e: "🧵", w: "thread" },
  { e: "🪡", w: "needle" },
  { e: "🧣", w: "scarf" },
  { e: "🧤", w: "glove" },
  { e: "🚲", w: "bicycle" },
  { e: "🚗", w: "car" }
];

/* ============================
   ELEMENTOS DOM (asignados en init)
   ============================ */
let startScreen, phase1Screen, phase2Screen, scoreScreen;
let playBtn, howBtn, howModal, closeHow;
let emojiDisplay, phase1IndexEl, guessInput, nextBtn, skipBtn, phase1TimerEl;
let gridEl, wordListEl, phase2TimerEl, finishPhase2Btn;
let scoreP1, scoreP2, scoreTotal, finalGrade, playAgainBtn;

/* ============================
   ESTADO DEL JUEGO
   ============================ */
let chosenSet = [];
let currentIndex = 0;
let phase1Timer = null;
let phase1TimeLeft = 180;

let phase2Timer = null;
let phase2TimeLeft = 420;

let gridSize = 15;
let grid = [];
let placedWords = [];
let cellElements = {}; // "r-c" => elemento

/* ============================
   UTILIDADES
   ============================ */
function randInt(n) { return Math.floor(Math.random() * n); }
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function formatTime(sec) {
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/* ============================
   NAVEGACIÓN / PANTALLAS
   ============================ */
function showScreen(screenEl) {
  const screens = [startScreen, phase1Screen, phase2Screen, scoreScreen];
  screens.forEach(s => {
    if (!s) return;
    s.classList.remove("visible");
    if (!s.classList.contains("hidden")) s.classList.add("hidden");
  });
  if (!screenEl) return;
  screenEl.classList.remove("hidden");
  screenEl.classList.add("visible");
}

/* ============================
   PREPARAR JUEGO
   ============================ */
function prepareGame() {
  const pool = [...EMOJI_LIST];
  shuffle(pool);
  chosenSet = pool.slice(0, 10).map(item => ({ ...item, guessed: false, answerGiven: "" }));
  currentIndex = 0;
  phase1TimeLeft = 180;
  phase2TimeLeft = 420;
}

/* ============================
   FASE 1 - ADIVINAR EMOJIS
   ============================ */
function startPhase1() {
  showScreen(phase1Screen);
  updatePhase1UI();
  guessInput.addEventListener("keydown", onGuessKeydown);
  phase1TimerEl.textContent = formatTime(phase1TimeLeft);
  if (phase1Timer) clearInterval(phase1Timer);
  phase1Timer = setInterval(() => {
    phase1TimeLeft--;
    phase1TimerEl.textContent = formatTime(phase1TimeLeft);
    if (phase1TimeLeft <= 0) {
      clearInterval(phase1Timer);
      phase1Timer = null;
      startPhase2();
    }
  }, 1000);
}

function onGuessKeydown(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    guessInput.classList.add("blocked");
    setTimeout(() => guessInput.classList.remove("blocked"), 250);
  }
}

function updatePhase1UI() {
  const current = chosenSet[currentIndex];
  phase1IndexEl.textContent = `${currentIndex + 1}`;
  emojiDisplay.textContent = current.e;
  guessInput.value = "";
  guessInput.focus();
}

function handleNext() {
  const val = guessInput.value.trim().toLowerCase();
  const target = chosenSet[currentIndex].w.toLowerCase();
  chosenSet[currentIndex].answerGiven = val;
  chosenSet[currentIndex].guessed = (val === target);
  currentIndex++;
  if (currentIndex >= chosenSet.length) {
    if (phase1Timer) clearInterval(phase1Timer);
    startPhase2();
    return;
  }
  updatePhase1UI();
}

function handleSkip() {
  chosenSet[currentIndex].answerGiven = "";
  chosenSet[currentIndex].guessed = false;
  currentIndex++;
  if (currentIndex >= chosenSet.length) {
    if (phase1Timer) clearInterval(phase1Timer);
    startPhase2();
    return;
  }
  updatePhase1UI();
}

/* ============================
   FASE 2 - SOPA DE LETRAS
   ============================ */
function startPhase2() {
  showScreen(phase2Screen);
  if (phase1Timer) { clearInterval(phase1Timer); phase1Timer = null; }
  const words = chosenSet.map(x => x.w.toUpperCase());
  generateGrid(gridSize, words);
  renderGrid();
  renderWordList();
  phase2TimerEl.textContent = formatTime(phase2TimeLeft);
  if (phase2Timer) clearInterval(phase2Timer);
  phase2Timer = setInterval(() => {
    phase2TimeLeft--;
    phase2TimerEl.textContent = formatTime(phase2TimeLeft);
    if (phase2TimeLeft <= 0) {
      clearInterval(phase2Timer); phase2Timer = null;
      endGame();
    }
  }, 1000);
}

/* Generador de la sopa (coloca palabras en 8 direcciones) */
function generateGrid(size, words) {
  grid = Array.from({ length: size }, () => Array.from({ length: size }, () => ""));
  placedWords = [];
  const directions = [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];

  for (const word of words) {
    const w = word.replace(/\s+/g, "").toUpperCase();
    let placed = false;
    for (let attempt = 0; attempt < 400 && !placed; attempt++) {
      const dir = directions[randInt(directions.length)];
      const len = w.length;
      const dr = dir[0], dc = dir[1];
      const r = randInt(size);
      const c = randInt(size);
      const endR = r + dr * (len - 1);
      const endC = c + dc * (len - 1);
      if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;

      let ok = true;
      let coords = [];
      for (let k = 0; k < len; k++) {
        const rr = r + dr * k;
        const cc = c + dc * k;
        const ch = grid[rr][cc];
        if (ch !== "" && ch !== w[k]) { ok = false; break; }
        coords.push({ r: rr, c: cc });
      }
      if (!ok) continue;

      for (let k = 0; k < len; k++) {
        const rr = r + dr * k;
        const cc = c + dc * k;
        grid[rr][cc] = w[k];
      }
      placedWords.push({ word: w, coords, found: false });
      placed = true;
    }

    if (!placed) {
      // fallback horizontal
      for (let r = 0; r < size && !placed; r++) {
        for (let c = 0; c + w.length <= size && !placed; c++) {
          let ok = true;
          for (let k = 0; k < w.length; k++) {
            const ch = grid[r][c + k];
            if (ch !== "" && ch !== w[k]) { ok = false; break; }
          }
          if (!ok) continue;
          const coords = [];
          for (let k = 0; k < w.length; k++) {
            grid[r][c + k] = w[k];
            coords.push({ r, c: c + k });
          }
          placedWords.push({ word: w, coords, found: false });
          placed = true;
        }
      }
      if (!placed) {
        // last resort
        const coords = [];
        for (let k = 0; k < Math.min(w.length, size); k++) {
          coords.push({ r: 0, c: k });
          grid[0][k] = w[k];
        }
        placedWords.push({ word: w, coords, found: false });
      }
    }
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) grid[r][c] = alphabet[randInt(alphabet.length)];
    }
  }
}

/* Renderiza la cuadrícula y almacena referencias a las celdas */
function renderGrid() {
  gridEl.innerHTML = "";
  gridEl.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  cellElements = {};
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.textContent = grid[r][c];
      gridEl.appendChild(cell);
      cellElements[`${r}-${c}`] = cell;
    }
  }
  attachSelectionListeners();
}

/* Lista lateral: muestra palabra completa si acertaste en fase1, o truncada si no */
function renderWordList() {
  wordListEl.innerHTML = "";
  for (let i = 0; i < placedWords.length; i++) {
    const pw = placedWords[i];
    const lower = pw.word.toLowerCase();
    const originalIndex = chosenSet.findIndex(x => x.w.toLowerCase() === lower);
    const li = document.createElement("li");
    li.dataset.word = pw.word;
    li.id = `word-${i}`;
    li.className = "";
    const span = document.createElement("span");
    span.className = "word";
    if (originalIndex !== -1 && chosenSet[originalIndex].guessed) {
      span.textContent = pw.word;
    } else {
      span.textContent = pw.word.slice(0, 3) + (pw.word.length > 3 ? "…" : "");
    }
    li.appendChild(span);
    wordListEl.appendChild(li);
  }
}

/* ============================
   SELECCIÓN (mouse & touch)
   - Implementación robusta usando pointerdown en grid + pointermove/pointerup global
   - Funciona en laptop y en dispositivos táctiles
   ============================ */

let selecting = false;
let selStart = null;
let selCurrent = null;
let highlighted = [];

/* Obtiene la celda debajo de unas coordenadas cliente */
function cellFromPoint(clientX, clientY) {
  const el = document.elementFromPoint(clientX, clientY);
  if (!el) return null;
  return el.closest && el.closest(".cell");
}

/* Adjunta listeners al grid (un único handler para pointerdown) */
function attachSelectionListeners() {
  // Remove previous event listeners by replacing grid children clones (cheap cleanup)
  // Note: renderGrid ya reconstruyó las celdas, así que normalmente no hay listeners
  gridEl.style.touchAction = "none";
  gridEl.removeEventListener("pointerdown", onPointerDown);
  gridEl.addEventListener("pointerdown", onPointerDown, { passive: false });
  // ensure no stale global listeners
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
}

function onPointerDown(e) {
  // only primary mouse button
  if (e.pointerType === "mouse" && e.button !== 0) return;

  // Prevent default to avoid text selection / scroll during touch drag
  e.preventDefault();

  const cell = cellFromPoint(e.clientX, e.clientY);
  if (!cell) return;
  const r = parseInt(cell.dataset.r, 10);
  const c = parseInt(cell.dataset.c, 10);
  if (Number.isNaN(r) || Number.isNaN(c)) return;

  selecting = true;
  selStart = { r, c };
  selCurrent = { r, c };

  clearTemporarySelection();
  highlightPath(selStart, selCurrent);

  // start global listeners
  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", onPointerUp, { passive: false });

  // try capture pointer to continue receiving events
  try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
}

function onPointerMove(e) {
  if (!selecting) return;
  e.preventDefault();
  const cell = cellFromPoint(e.clientX, e.clientY);
  if (!cell) return;
  const r = parseInt(cell.dataset.r, 10);
  const c = parseInt(cell.dataset.c, 10);
  if (Number.isNaN(r) || Number.isNaN(c)) return;

  if (!selCurrent || selCurrent.r !== r || selCurrent.c !== c) {
    selCurrent = { r, c };
    clearTemporarySelection();
    highlightPath(selStart, selCurrent);
  }
}

function onPointerUp(e) {
  if (!selecting) return;
  try { e.preventDefault(); } catch (err) {}
  selecting = false;
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);

  const selectedCells = [...highlighted];
  if (selectedCells.length === 0) { clearTemporarySelection(); return; }

  const letters = selectedCells.map(el => el.textContent).join("");
  const reversed = letters.split("").reverse().join("");
  const match = placedWords.find(pw => !pw.found && (pw.word === letters || pw.word === reversed));

  if (match) {
    markFound(match);
    checkAllFound();
  } else {
    selectedCells.forEach(el => {
      el.classList.add("wrong");
      setTimeout(() => el.classList.remove("wrong"), 300);
    });
  }

  highlighted.forEach(el => el.classList.remove("selected"));
  highlighted = [];
}

/* Construye una línea recta (8 direcciones) entre start y current y marca celdas */
function highlightPath(start, current) {
  if (!start || !current) return;
  const dr = current.r - start.r;
  const dc = current.c - start.c;

  let stepR = 0, stepC = 0;
  if (dr === 0 && dc === 0) { stepR = 0; stepC = 0; }
  else if (dr === 0) { stepR = 0; stepC = Math.sign(dc); }
  else if (dc === 0) { stepR = Math.sign(dr); stepC = 0; }
  else if (Math.abs(dr) === Math.abs(dc)) { stepR = Math.sign(dr); stepC = Math.sign(dc); }
  else {
    if (Math.abs(dr) > Math.abs(dc)) { stepR = Math.sign(dr); stepC = 0; }
    else { stepR = 0; stepC = Math.sign(dc); }
  }

  let r = start.r, c = start.c;
  const path = [{ r, c }];

  if (!(stepR === 0 && stepC === 0)) {
    while (!(r === current.r && c === current.c)) {
      r += stepR;
      c += stepC;
      if (r < 0 || c < 0 || r >= gridSize || c >= gridSize) break;
      path.push({ r, c });
      if (path.length > gridSize + 5) break;
    }
  }

  highlighted.forEach(el => el.classList.remove("selected"));
  highlighted = [];
  for (const p of path) {
    const el = cellElements[`${p.r}-${p.c}`];
    if (el) {
      el.classList.add("selected");
      highlighted.push(el);
    }
  }
}

function clearTemporarySelection() {
  highlighted.forEach(el => el.classList.remove("selected"));
  highlighted = [];
}

/* Marca palabra encontrada (resalta y actualiza lista) */
function markFound(pw) {
  pw.found = true;
  for (const coord of pw.coords) {
    const el = cellElements[`${coord.r}-${coord.c}`];
    if (el) el.classList.add("found");
  }
  const liIndex = placedWords.indexOf(pw);
  const li = document.getElementById(`word-${liIndex}`);
  if (li) li.classList.add("found");
}

/* Comprueba si todas las palabras fueron encontradas */
function checkAllFound() {
  if (placedWords.every(p => p.found)) {
    if (phase2Timer) { clearInterval(phase2Timer); phase2Timer = null; }
    endGame();
  }
}

/* Botón Finish en fase 2 */
function handleFinishPhase2() {
  if (phase2Timer) { clearInterval(phase2Timer); phase2Timer = null; }
  endGame();
}

/* ============================
   FIN DEL JUEGO: puntuación y pantalla final
   ============================ */
function endGame() {
  const p1 = chosenSet.filter(x => x.guessed).length;
  const p2 = placedWords.filter(x => x.found).length;
  const total = p1 + p2;
  scoreP1.textContent = p1;
  scoreP2.textContent = p2;
  scoreTotal.textContent = total;

  let grade = "C";
  if (total <= 5) grade = "C";
  else if (total <= 10) grade = "B";
  else if (total <= 15) grade = "A";
  else grade = "S";
  finalGrade.textContent = grade;

  showScreen(scoreScreen);
}

/* ============================
   RESET / Play again
   ============================ */
function resetGame() {
  if (phase1Timer) { clearInterval(phase1Timer); phase1Timer = null; }
  if (phase2Timer) { clearInterval(phase2Timer); phase2Timer = null; }
  chosenSet = [];
  placedWords = [];
  grid = [];
  cellElements = {};
  selStart = null;
  selCurrent = null;
  selecting = false;
  highlighted = [];
  showScreen(startScreen);
}

/* ============================
   EVENT WIRING: init
   ============================ */
function initElements() {
  startScreen = document.getElementById("start-screen");
  phase1Screen = document.getElementById("phase1-screen");
  phase2Screen = document.getElementById("phase2-screen");
  scoreScreen = document.getElementById("score-screen");

  playBtn = document.getElementById("play-btn");
  howBtn = document.getElementById("how-btn");
  howModal = document.getElementById("how-modal");
  closeHow = document.getElementById("close-how");

  emojiDisplay = document.getElementById("emoji-display");
  phase1IndexEl = document.getElementById("phase1-index");
  guessInput = document.getElementById("guess-input");
  nextBtn = document.getElementById("next-btn");
  skipBtn = document.getElementById("skip-btn");
  phase1TimerEl = document.getElementById("phase1-timer");

  gridEl = document.getElementById("grid");
  wordListEl = document.getElementById("word-list");
  phase2TimerEl = document.getElementById("phase2-timer");
  finishPhase2Btn = document.getElementById("finish-phase2");

  scoreP1 = document.getElementById("score-p1");
  scoreP2 = document.getElementById("score-p2");
  scoreTotal = document.getElementById("score-total");
  finalGrade = document.getElementById("final-grade");
  playAgainBtn = document.getElementById("play-again");
}

function initEventHandlers() {
  if (!playBtn) { console.error("playBtn not found"); return; }
  playBtn.addEventListener("click", () => {
    try {
      prepareGame();
      startPhase1();
    } catch (err) {
      console.error("Error starting game:", err);
      alert("Error starting the game. Revisa la consola.");
    }
  });

  if (howBtn && howModal) {
    howBtn.addEventListener("click", () => {
      howModal.classList.remove("hidden");
      howModal.setAttribute("aria-hidden", "false");
    });
  }
  if (closeHow && howModal) {
    closeHow.addEventListener("click", () => {
      howModal.classList.add("hidden");
      howModal.setAttribute("aria-hidden", "true");
    });
  }

  if (nextBtn) nextBtn.addEventListener("click", handleNext);
  if (skipBtn) skipBtn.addEventListener("click", handleSkip);
  if (finishPhase2Btn) finishPhase2Btn.addEventListener("click", handleFinishPhase2);
  if (playAgainBtn) playAgainBtn.addEventListener("click", resetGame);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && document.activeElement === guessInput) {
      e.preventDefault();
    }
  });
}

function init() {
  try {
    initElements();
    initEventHandlers();
    if (startScreen) showScreen(startScreen);
    console.log("Emoji Word Hunt initialized successfully.");
  } catch (err) {
    console.error("Initialization error:", err);
  }
}

document.addEventListener("DOMContentLoaded", init);

/* Notes:
 - La selección en fase 2 ahora usa elementFromPoint en pointermove para detectar celdas
   y funciona con mouse (click+drag) y touch (arrastrar con el dedo).
 - La sopa de letras se genera dinámicamente en JS; la lista lateral muestra
   palabras completas si se adivinaron en fase 1 o truncadas (3 letras + …) si no.
 - Código modular y comentado para facilitar cambios.
*/