// ================= CANVAS =================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ================= SOUND =================
const soundEat = new Audio("sounds/eat.wav");
const soundGameOver = new Audio("sounds/gameover.wav");
const soundClick = new Audio("sounds/click.wav");
const soundStart = new Audio("sounds/start.wav");
soundClick.volume = 0.5;

let soundEnabled = true;

// ================= GAME CONFIG =================
const box = 16;
const gridCount = canvas.width / box;

// ================= SMOOTH MOVEMENT =================
let lastTime = 0;
let accumulator = 0;
const STEP = 100; // ms, kecepatan logika snake

console.log("STEP =", STEP); // SEMENTARA

let snake = [];
let food = null;
let dir = "RIGHT";
let score = 0;
let level = 1;
let speed = 150;
let gameInterval = null;
let isPaused = false;
let isRunning = false;

// ================= UI =================
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const highScoreEl = document.getElementById("highScore");
const HIGH_SCORE_KEY = "snake_high_score";

// ================= INIT GAME =================
function initGame() {
snake = [{
  x: 8 * box,
  y: 8 * box,
  prevX: 8 * box,
  prevY: 8 * box
}];

  dir = "RIGHT";
  score = 0;
  level = 1;
  speed = 150;
  isPaused = false;

  food = spawnFood();

  scoreEl.textContent = score;
  levelEl.textContent = level;
  highScoreEl.textContent =
    localStorage.getItem(HIGH_SCORE_KEY) || 0;

  clearInterval(gameInterval);
}

// ================= FOOD =================
function spawnFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * gridCount) * box,
      y: Math.floor(Math.random() * gridCount) * box,
    };
  } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
  return pos;
}

// ================= COLLISION =================
function collision(head, body) {
  return body.some(
    seg => seg.x === head.x && seg.y === head.y
  );
}

// ================= DRAW =================
function drawSmooth(alpha) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // snake
  snake.forEach((seg, i) => {
    const x = seg.prevX + (seg.x - seg.prevX) * alpha;
    const y = seg.prevY + (seg.y - seg.prevY) * alpha;

    ctx.fillStyle = i === 0 ? "#4caf50" : "#81c784";
    ctx.fillRect(x, y, box, box);
  });
}

  // === HITUNG POSISI BARU ===
  function updateLogic() {
  let head = { ...snake[0] };

  if (dir === "LEFT") head.x -= box;
  if (dir === "UP") head.y -= box;
  if (dir === "RIGHT") head.x += box;
  if (dir === "DOWN") head.y += box;

  // Game over
  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= canvas.width ||
    head.y >= canvas.height ||
    collision(head, snake.slice(1))
  ) {
    clearInterval(gameInterval);
    isRunning = false;
    soundGameOver.play().catch(() => {});
    alert("Game Over!");
    return;
  }

  // Eat
  if (head.x === food.x && head.y === food.y) {
    soundEat.play().catch(() => {});
    score++;
    scoreEl.textContent = score;
    food = spawnFood();
  } else {
    snake.pop();
  }

  snake.unshift({
    x: head.x,
    y: head.y,
    prevX: snake[0].x,
    prevY: snake[0].y
  });
}

//=== GAME LOOP SMOOTH SYSTEM ===
function gameLoop(timestamp) {
  if (!isRunning) return;

  if (!lastTime) lastTime = timestamp;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  accumulator += delta;

  while (accumulator >= STEP) {
    updateLogic();
    accumulator -= STEP;
  }

  const alpha = accumulator / STEP;
  drawSmooth(alpha);

  requestAnimationFrame(gameLoop);
}

// ================= UTIL =================
function saveHighScore() {
  const high = localStorage.getItem(HIGH_SCORE_KEY) || 0;
  if (score > high) {
    localStorage.setItem(HIGH_SCORE_KEY, score);
  }
}

function restartInterval() {
  clearInterval(gameInterval);
  gameInterval = setInterval(draw, speed);
}

// ================= CONTROL (KEYBOARD) =================
document.addEventListener("keydown", (e) => {
  if (e.repeat) return;

  let changed = false;

  if (e.key === "ArrowLeft" && dir !== "RIGHT") {
    dir = "LEFT"; changed = true;
  }
  if (e.key === "ArrowUp" && dir !== "DOWN") {
    dir = "UP"; changed = true;
  }
  if (e.key === "ArrowRight" && dir !== "LEFT") {
    dir = "RIGHT"; changed = true;
  }
  if (e.key === "ArrowDown" && dir !== "UP") {
    dir = "DOWN"; changed = true;
  }

  if (changed) {
    soundClick.currentTime = 0;
    soundClick.play().catch(() => {});
  }
});

// ================= BUTTONS =================
document.getElementById("startBtn").onclick = () => {
  soundStart.play().catch(() => {});
  if (isRunning) return;

  initGame();
  isRunning = true;
  lastTime = 0;
  accumulator = 0;

  requestAnimationFrame(gameLoop);
};

document.getElementById("restartBtn").onclick = () => {
  initGame();
  isRunning = true;
  lastTime = 0;
  accumulator = 0;
  requestAnimationFrame(gameLoop);
};


document.getElementById("pauseBtn").onclick = () => {
  isPaused = !isPaused;
};

// ================= THEME =================
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

// ================= TOUCH (MOBILE) =================
let startX, startY;

canvas.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

canvas.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - startX;
  const dy = e.changedTouches[0].clientY - startY;

  let changed = false;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && dir !== "LEFT") {
      dir = "RIGHT"; changed = true;
    } else if (dx < 0 && dir !== "RIGHT") {
      dir = "LEFT"; changed = true;
    }
  } else {
    if (dy > 0 && dir !== "UP") {
      dir = "DOWN"; changed = true;
    } else if (dy < 0 && dir !== "DOWN") {
      dir = "UP"; changed = true;
    }
  }

  if (changed) {
    soundClick.currentTime = 0;
    soundClick.play().catch(() => {});
  }
});
