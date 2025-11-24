
const Security = {
  escapeOutput: (str) => {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const boardCanvas = document.getElementById('tetris-board');
  const boardCtx = boardCanvas.getContext('2d');
  const nextCanvas = document.getElementById('next-piece-canvas');
  const nextCtx = nextCanvas.getContext('2d');

  const startBtn = document.getElementById('game-start-btn');
  const gameOverMsg = document.getElementById('game-over-msg');
  const scoreEl = document.getElementById('game-score');
  const linesEl = document.getElementById('game-lines');
  const levelEl = document.getElementById('game-level');

  const COLS = 10, ROWS = 20, BLOCK_SIZE = 30;
  boardCanvas.width = COLS * BLOCK_SIZE;
  boardCanvas.height = ROWS * BLOCK_SIZE;
  boardCtx.scale(BLOCK_SIZE, BLOCK_SIZE);
  nextCtx.scale(BLOCK_SIZE, BLOCK_SIZE);

  const BG_COLOR_DARK = '#0a0a14';
  const BG_COLOR_LIGHT = '#f9fafb';
  const COLORS = {
    'I': '#5A89FE', 'O': '#ACFF00', 'T': '#8B5CF6',
    'S': '#34D399', 'Z': '#EF4444', 'J': '#FFA500',
    'L': '#0039C8', 'LANDED': '#8b9ed9'
  };
  const SHAPES = {
    'I': [[1, 1, 1, 1]], 'O': [[1, 1], [1, 1]], 'T': [[0, 1, 0], [1, 1, 1]],
    'S': [[0, 1, 1], [1, 1, 0]], 'Z': [[1, 1, 0], [0, 1, 1]],
    'J': [[1, 0, 0], [1, 1, 1]], 'L': [[0, 0, 1], [1, 1, 1]]
  };
  const PIECE_KEYS = 'IOTSZJL';

  let arena = createMatrix(COLS, ROWS);
  let player = { pos: { x: 0, y: 0 }, matrix: null, type: null };
  let nextPieceType = null;
  let score = 0, lines = 0, level = 1;
  let dropCounter = 0, dropInterval = 1000, lastTime = 0;
  let gameLoopId = null;

  function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
  }
  function createPiece(type) {
    player.matrix = SHAPES[type];
    player.type = type;
    player.pos.y = 0;
    player.pos.x = (Math.floor(COLS / 2)) - (Math.floor(player.matrix[0].length / 2));
  }
  function playerReset() {
    if (nextPieceType === null) createPiece(PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)]);
    else createPiece(nextPieceType);
    nextPieceType = PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)];
    drawNextPiece();
    if (collide(arena, player)) gameOver();
  }
  function drawMatrix(matrix, offset, ctx, colorOverride = null) {
    if (!matrix) return; 
    matrix.forEach((row, y) => { 
      row.forEach((value, x) => {
        if (value !== 0) {
          const color = colorOverride || (value === 1 ? COLORS[player.type] : COLORS['LANDED']);
          ctx.fillStyle = color;
          ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
        }
      });
    });
  }
  function draw() {
    const bgColor = document.body.classList.contains('dark') ? BG_COLOR_DARK : BG_COLOR_LIGHT;
    boardCtx.fillStyle = bgColor;
    boardCtx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
    drawMatrix(arena, { x: 0, y: 0 }, boardCtx, COLORS['LANDED']);
    drawMatrix(player.matrix, player.pos, boardCtx);
  }
  function drawNextPiece() {
    const nextMatrix = SHAPES[nextPieceType];
    const bgColor = document.body.classList.contains('dark') ? BG_COLOR_DARK : BG_COLOR_LIGHT;
    nextCtx.fillStyle = bgColor;
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    const offset = {
      x: (nextCanvas.width / BLOCK_SIZE - nextMatrix[0].length) / 2,
      y: (nextCanvas.height / BLOCK_SIZE - nextMatrix.length) / 2
    };
    nextMatrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          nextCtx.fillStyle = COLORS[nextPieceType];
          nextCtx.fillRect(x + offset.x, y + offset.y, 1, 1);
        }
      });
    });
  }
  function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) return true; 
      }
    }
    return false;
  }
  function merge(arena, player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value; 
      });
    });
  }
  function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
      player.pos.y--; 
      merge(arena, player);
      arenaSweep(); 
      playerReset(); 
    }
    dropCounter = 0; 
  }
  function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) player.pos.x -= dir; 
  }
  function rotate(matrix) {
    const newMatrix = [];
    for (let i = 0; i < matrix[0].length; i++) newMatrix.push([]);
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) newMatrix[x][y] = matrix[y][x];
    }
    newMatrix.forEach(row => row.reverse());
    return newMatrix;
  }
  function playerRotate() {
    const pos = player.pos.x;
    let offset = 1;
    const oldMatrix = player.matrix;
    player.matrix = rotate(oldMatrix); 
    while (collide(arena, player)) {
      player.pos.x += offset; 
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > player.matrix[0].length) {
        player.matrix = oldMatrix; 
        player.pos.x = pos; 
        return;
      }
    }
  }
  function arenaSweep() {
    let rowCount = 0;
    outer: for (let y = arena.length - 1; y > 0; --y) {
      for (let x = 0; x < arena[y].length; ++x) {
        if (arena[y][x] === 0) continue outer; 
      }
      const row = arena.splice(y, 1)[0].fill(0); 
      arena.unshift(row); ++y; rowCount++;
    }
    if (rowCount > 0) updateScore(rowCount);
  }
  function updateScore(rowCount) {
    const lineScores = [0, 100, 300, 500, 800]; 
    score += lineScores[rowCount] * level;
    lines += rowCount;
    level = Math.floor(lines / 10) + 1;
    dropInterval = 1000 - (level * 50);
    if (dropInterval < 100) dropInterval = 100; 
    scoreEl.textContent = score;
    linesEl.textContent = lines;
    levelEl.textContent = level;
  }
  
  async function gameOver() { 
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    gameLoopId = null;
    gameOverMsg.style.display = 'block';
    startBtn.textContent = "Mulai Lagi";
    
    await saveHighScore(score); 
    await loadLeaderboard(); 
  }

  async function saveHighScore(finalScore) {
    console.log("Mencoba menyimpan skor:", finalScore);
    if (finalScore === 0) return; 
    
    try {
      const result = await apiFetch('/api/auth/gamescore', {
        method: 'PUT',
        body: { score: finalScore }
      });
      console.log("Skor berhasil dikirim ke server.", result);
    } catch (error) {
      console.error("Gagal menyimpan skor:", error.message);
    }
  }

  function startGame() {
    arena.forEach(row => row.fill(0));
    score = 0; lines = 0; level = 1;
    dropInterval = 1000;
    updateScore(0); 
    gameOverMsg.style.display = 'none';
    playerReset(); 
    lastTime = 0; dropCounter = 0;
    if (!gameLoopId) {
      gameLoopId = requestAnimationFrame(gameLoop); 
      startBtn.textContent = "Berhenti";
    }
  }

  function gameLoop(time = 0) {
    if (!gameLoopId) return;
    if (lastTime === 0) lastTime = time;
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) playerDrop();
    draw();
    gameLoopId = requestAnimationFrame(gameLoop); 
  }

  document.addEventListener('keydown', event => {
    if (!gameLoopId) return; 
    if (event.key === 'a' || event.key === 'A' || event.key === 'ArrowLeft') playerMove(-1);
    else if (event.key === 'd' || event.key === 'D' || event.key === 'ArrowRight') playerMove(1);
    else if (event.key === 's' || event.key === 'S' || event.key === 'ArrowDown') playerDrop();
    else if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') playerRotate();
  });
  
  let touchStartX = 0, touchStartY = 0;
  boardCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: false });
  
  boardCanvas.addEventListener('touchend', (e) => {
    if (!gameLoopId) return;
    let deltaX = e.changedTouches[0].clientX - touchStartX;
    let deltaY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 30) playerMove(1);
      else if (deltaX < -30) playerMove(-1);
    } else {
      if (deltaY > 50) playerDrop(); 
      else if (deltaY < -30) playerRotate(); 
    }
  }, false);

  startBtn.addEventListener('click', () => {
    if (gameLoopId) {
      cancelAnimationFrame(gameLoopId);
      gameLoopId = null;
      startBtn.textContent = "Lanjutkan";
    } else {
      startBtn.textContent = "Berhenti";
      if (player.matrix === null || gameOverMsg.style.display === 'block') startGame(); 
      else {
        lastTime = performance.now();
        gameLoopId = requestAnimationFrame(gameLoop); 
      }
    }
  });
  
  async function handleLogout(e) {
    e.preventDefault();
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Logout Gagal:', error.message);
    }
  }

  const logoutBtn = document.getElementById('logoutLink');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  
  async function loadLeaderboard() {
    const container = document.getElementById('leaderboard-list');
    container.innerHTML = '<p class="muted" style="text-align: center;">Memuat papan peringkat...</p>';
    
    try {
      const result = await apiFetch('/api/game/leaderboard');
      if (result.status !== 'success' || !Array.isArray(result.data)) {
        throw new Error(result.message || 'Data tidak valid');
      }
      
      if (result.data.length === 0) {
        container.innerHTML = '<p class="muted" style="text-align: center;">Belum ada skor. Jadilah yang pertama!</p>';
        return;
      }
      
      let html = '';
      result.data.forEach((item, index) => {
        html += `
          <div class="leaderboard-item">
            <span class="rank">#${index + 1}</span>
            <span class="name">${Security.escapeOutput(item.name)}</span>
            <span class="score">${item.game_highscore}</span>
          </div>
        `;
      });
      container.innerHTML = html;
      
    } catch (error) {
      container.innerHTML = `<p class="muted" style="text-align: center; color: crimson;">Gagal memuat leaderboard.</p>`;
    }
  }
  
  loadLeaderboard();
  
  draw(); 
  nextPieceType = PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)];
  drawNextPiece();
});