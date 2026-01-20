const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 16;
const gridCount = canvas.width / box;

let snake, food, dir, score, level, speed;
let gameInterval = null;
let isPaused = false;
let isRunning = false;

const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const highScoreEl = document.getElementById("highScore");

const HIGH_SCORE_KEY = "snake_high_score";

// ================= INIT =================
function initGame() {
  snake = [{ x: 8 * box, y: 8 * box }];
  dir = "RIGHT"; // ✅ WAJIB
  food = spawnFood();
  score = 0;
  level = 1;
  speed = 150;
  isPaused = false;

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
  } while (snake && collision(pos, snake));
  return pos;
}

// ================= DRAW =================
function draw() {
  if (isPaused) return;

  // MOVE HEAD
  let head = { ...snake[0] };
  if (dir === "LEFT") head.x -= box;
  if (dir === "UP") head.y -= box;
  if (dir === "RIGHT") head.x += box;
  if (dir === "DOWN") head.y += box;

  // GAME OVER CHECK (SETELAH GERAK)
  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= canvas.width ||
    head.y >= canvas.height ||
    collision(head, snake)
  ) {
    clearInterval(gameInterval);
    isRunning = false;
    saveHighScore();
    alert("Game Over!");
    return;
  }

  // EAT FOOD
  if (head.x === food.x && head.y === food.y) {
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

  // DRAW CANVAS
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // DRAW SNAKE
  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? "#4caf50" : "#81c784";
    ctx.fillRect(seg.x, seg.y, box, box);
  });

  // DRAW FOOD
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);
}

// ================= UTIL =================
function collision(head, body) {
  return body.some(
    (seg) => seg.x === head.x && seg.y === head.y
  );
}

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

// ================= CONTROL =================
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && dir !== "RIGHT") dir = "LEFT";
  if (e.key === "ArrowUp" && dir !== "DOWN") dir = "UP";
  if (e.key === "ArrowRight" && dir !== "LEFT") dir = "RIGHT";
  if (e.key === "ArrowDown" && dir !== "UP") dir = "DOWN";
});

document.getElementById("startBtn").onclick = () => {
  if (isRunning) return;
  initGame();
  gameInterval = setInterval(draw, speed);
  isRunning = true;
};

document.getElementById("restartBtn").onclick = () => {
  initGame();
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

// ================= TOUCH =================
let startX, startY;
canvas.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

canvas.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - startX;
  const dy = e.changedTouches[0].clientY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && dir !== "LEFT") dir = "RIGHT";
    else if (dx < 0 && dir !== "RIGHT") dir = "LEFT";
  } else {
    if (dy > 0 && dir !== "UP") dir = "DOWN";
    else if (dy < 0 && dir !== "DOWN") dir = "UP";
  }
});

