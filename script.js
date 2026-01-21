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
  snake = [{ x: 8 * box, y: 8 * box }];
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
function draw() {
  if (isPaused) return;

  // === DRAW BACKGROUND ===
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // === DRAW FOOD ===
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // === DRAW SNAKE ===
  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? "#4caf50" : "#81c784";
    ctx.fillRect(seg.x, seg.y, box, box);
  });

  // === MOVE HEAD ===
  let head = { ...snake[0] };
  if (dir === "LEFT") head.x -= box;
  if (dir === "UP") head.y -= box;
  if (dir === "RIGHT") head.x += box;
  if (dir === "DOWN") head.y += box;

  // === GAME OVER CHECK ===
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
    saveHighScore();
    alert("Game Over!");
    return;
  }

  // === EAT FOOD ===
  if (head.x === food.x && head.y === food.y) {
    soundEat.play().catch(() => {});
    score++;
    scoreEl.textContent = score;

    if (score % 5 === 0) {
      level++;
      levelEl.textContent = level;
      speed = Math.max(60, speed - 15);
      restartInterval();
    }

    food = spawnFood();
  } else {
    snake.pop();
  }

  snake.unshift(head);
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
  draw(); // gambar frame pertama
  gameInterval = setInterval(draw, speed);
  isRunning = true;
};

document.getElementById("restartBtn").onclick = () => {
  initGame();
  draw();
  gameInterval = setInterval(draw, speed);
  isRunning = true;
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
