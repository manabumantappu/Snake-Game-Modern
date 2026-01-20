const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 16;
let snake, food, dir, score, level, speed, game;
let isPaused = false;
let isRunning = false;

const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const highScoreEl = document.getElementById("highScore");

const highScoreKey = "snake_high_score";

function initGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  food = spawnFood();
  dir = "RIGHT";
  score = 0;
  level = 1;
  speed = 150;
  isPaused = false;

  scoreEl.textContent = score;
  levelEl.textContent = level;
  highScoreEl.textContent = localStorage.getItem(highScoreKey) || 0;

  clearInterval(game);
}

function spawnFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box,
    };
  } while (collision(newFood, snake));
  return newFood;
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && dir !== "RIGHT") dir = "LEFT";
  if (e.key === "ArrowUp" && dir !== "DOWN") dir = "UP";
  if (e.key === "ArrowRight" && dir !== "LEFT") dir = "RIGHT";
  if (e.key === "ArrowDown" && dir !== "UP") dir = "DOWN";
});

function draw() {
  if (isPaused) return;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#4caf50" : "#81c784";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  let headX = snake[0].x;
  let headY = snake[0].y;

  if (dir === "LEFT") headX -= box;
  if (dir === "UP") headY -= box;
  if (dir === "RIGHT") headX += box;
  if (dir === "DOWN") headY += box;

// Game Over
if (
  headX < 0 ||
  headY < 0 ||
  headX >= canvas.width ||
  headY >= canvas.height ||
  collision({ x: headX, y: headY }, snake)
) {
  clearInterval(game);   // ⬅️ DI SINI
  isRunning = false;     // ⬅️ TEMPEL BARIS INI
  alert("Game Over!");
  saveHighScore();
  return;
}


  let newHead = { x: headX, y: headY };

  if (headX === food.x && headY === food.y) {
    score++;
    scoreEl.textContent = score;

    if (score % 5 === 0) {
      level++;
      levelEl.textContent = level;
      speed = Math.max(50, speed - 15);
      clearInterval(game);
      game = setInterval(draw, speed);
    }

    food = spawnFood();
  } else {
    snake.pop();
  }

  snake.unshift(newHead);
}

function collision(head, array) {
  return array.some(
    (seg) => head.x === seg.x && head.y === seg.y
  );
}

function saveHighScore() {
  const highScore = localStorage.getItem(highScoreKey) || 0;
  if (score > highScore) {
    localStorage.setItem(highScoreKey, score);
  }
}

document.getElementById("startBtn").onclick = () => {
  if (isRunning) return;
  initGame();
  game = setInterval(draw, speed);
  isRunning = true;
};

document.getElementById("restartBtn").onclick = () => {
  clearInterval(game);
  initGame();
  game = setInterval(draw, speed);
  isRunning = true;
};

document.getElementById("pauseBtn").onclick = () => {
  isPaused = !isPaused;
};

document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

// === TOUCH CONTROL (SWIPE) ===
let startX, startY;

canvas.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

canvas.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - startX;
  const dy = e.changedTouches[0].clientY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && dir !== "LEFT") dir = "RIGHT";
    if (dx < 0 && dir !== "RIGHT") dir = "LEFT";
  } else {
    if (dy > 0 && dir !== "UP") dir = "DOWN";
    if (dy < 0 && dir !== "DOWN") dir = "UP";
  }
});
