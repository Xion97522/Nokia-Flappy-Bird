const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Game variables
const width = 20;
const height = 10;
let birdY = Math.floor(height / 2);
let frames = 0;
let pipes = [];
let score = 0;
let gameOver = false;

// Create new pipe every 10 frames
function addPipe() {
  const gapSize = 3;
  const gapStart = Math.floor(Math.random() * (height - gapSize - 2)) + 1;
  pipes.push({ x: width - 1, gapStart, gapEnd: gapStart + gapSize });
}

// Move pipes left and remove if offscreen
function movePipes() {
  pipes.forEach(pipe => pipe.x--);
  if (pipes.length && pipes[0].x < 0) {
    pipes.shift();
    score++;
  }
}

// Check collision with pipes or ground/ceiling
function checkCollision() {
  if (birdY < 0 || birdY >= height) return true;
  for (const pipe of pipes) {
    if (pipe.x === 3) {
      if (birdY < pipe.gapStart || birdY > pipe.gapEnd) return true;
    }
  }
  return false;
}

// Render game screen as text grid with pipe brackets
function renderScreen() {
  let screen = '';
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 3 && y === birdY) {
        screen += '>'; // bird
      } else {
        let char = '.';
        for (const pipe of pipes) {
          if (pipe.x === x) {
            if (y < pipe.gapStart || y > pipe.gapEnd) {
              if (y === 0) char = '[';
              else if (y === height - 1) char = ']';
              else char = '|';
            }
          }
        }
        screen += char;
      }
    }
    screen += '\n';
  }
  return screen;
}

// Reset game state
function resetGame() {
  birdY = Math.floor(height / 2);
  frames = 0;
  pipes = [];
  score = 0;
  gameOver = false;
  addPipe();
}

// Game loop step: flap or no flap
function gameStep(flap) {
  frames++;
  if (frames % 10 === 0) addPipe();
  movePipes();

  if (flap) birdY--;
  else birdY++;

  if (checkCollision()) gameOver = true;
}

// HTML wrapper
function renderPage(content) {
  return `
  <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
  <html>
  <head>
    <title>Flappy Bird - Nokia 110 4G</title>
    <style>
      body { background:#000; color:#0f0; font-family: monospace; white-space: pre; }
      button { background:#0f0; border:none; color:#000; font-weight:bold; font-family: monospace; padding: 0.3em 1em; margin: 0.2em; cursor: pointer; }
      p { margin: 0.3em 0; }
    </style>
  </head>
  <body>
    ${content}
  </body>
  </html>
  `;
}

// Routes
app.get('/', (req, res) => {
  if (gameOver) {
    const html = `
    <pre>${renderScreen()}</pre>
    <p>Game Over! Score: ${score}</p>
    <form method="POST" action="/reset"><button>Restart</button></form>
    `;
    return res.send(renderPage(html));
  }

  const html = `
    <pre>${renderScreen()}</pre>
    <p>Score: ${score}</p>
    <form method="POST" action="/flap"><button>Flap</button></form>
    <form method="POST" action="/noflap"><button>Do Nothing</button></form>
  `;
  res.send(renderPage(html));
});

app.post('/flap', (req, res) => {
  if (!gameOver) gameStep(true);
  res.redirect('/');
});

app.post('/noflap', (req, res) => {
  if (!gameOver) gameStep(false);
  res.redirect('/');
});

app.post('/reset', (req, res) => {
  resetGame();
  res.redirect('/');
});

// Start fresh on load
resetGame();

app.listen(port, () => {
  console.log(`Flappy Bird Nokia 110 4G running at http://localhost:${port}`);
});
