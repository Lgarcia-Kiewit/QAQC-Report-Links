(function () {
  const trigger = document.querySelector("[data-game-open]");
  if (!trigger) {
    return;
  }

  const overlay = buildOverlay();
  const closeButton = overlay.querySelector("[data-game-close]");
  const canvas = overlay.querySelector("[data-game-canvas]");
  const context = canvas.getContext("2d");
  const logoImage = new Image();
  logoImage.src = "assets/ct-logo.png";

  let game = null;
  let animationFrame = null;

  document.body.appendChild(overlay);

  trigger.addEventListener("click", openGame);

  closeButton.addEventListener("click", closeGame);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeGame();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isGameOpen()) {
      closeGame();
      return;
    }

    if ((event.code === "Space" || event.key === "ArrowUp") && isGameOpen()) {
      event.preventDefault();
      flap();
    }
  });

  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    flap();
  });

  function buildOverlay() {
    const section = document.createElement("section");
    section.className = "game-overlay";
    section.dataset.gameOverlay = "";
    section.setAttribute("aria-hidden", "true");
    section.innerHTML = `
      <div class="game-panel" role="dialog" aria-modal="true" aria-labelledby="game-title">
        <header class="game-header">
          <div>
            <p class="eyebrow">Logo Mode</p>
            <h2 id="game-title">CT Flap</h2>
          </div>
          <button class="game-close" type="button" data-game-close aria-label="Close game">Close</button>
        </header>
        <canvas class="game-canvas" data-game-canvas width="720" height="420" tabindex="0">
          CT Flap needs a browser that supports canvas.
        </canvas>
        <p class="game-help">Click, tap, or press Space to flap. Avoid the pipes. Press Escape to close.</p>
      </div>
    `;
    return section;
  }

  function openGame() {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-game-open");
    resetGame();
    canvas.focus();
    animationFrame = window.requestAnimationFrame(tick);
  }

  function closeGame() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-game-open");

    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  function isGameOpen() {
    return overlay.classList.contains("is-open");
  }

  function resetGame() {
    const scale = canvas.width / 720;
    game = {
      started: false,
      ended: false,
      score: 0,
      frame: 0,
      bird: {
        x: 150 * scale,
        y: canvas.height * 0.45,
        size: 42 * scale,
        velocity: 0,
      },
      pipes: [],
      gravity: 0.38 * scale,
      lift: -7.4 * scale,
      speed: 2.55 * scale,
      gap: 138 * scale,
      pipeWidth: 58 * scale,
    };
    drawGame();
  }

  function flap() {
    if (!game) {
      return;
    }

    if (game.ended) {
      resetGame();
    }

    game.started = true;
    game.bird.velocity = game.lift;
  }

  function tick() {
    if (!isGameOpen() || !game) {
      return;
    }

    updateGame();
    drawGame();
    animationFrame = window.requestAnimationFrame(tick);
  }

  function updateGame() {
    if (!game.started || game.ended) {
      return;
    }

    game.frame += 1;
    game.bird.velocity += game.gravity;
    game.bird.y += game.bird.velocity;

    if (game.frame % 92 === 1) {
      addPipe();
    }

    for (const pipe of game.pipes) {
      pipe.x -= game.speed;

      if (!pipe.scored && pipe.x + game.pipeWidth < game.bird.x) {
        pipe.scored = true;
        game.score += 1;
      }
    }

    game.pipes = game.pipes.filter((pipe) => pipe.x + game.pipeWidth > -10);

    if (game.bird.y - game.bird.size / 2 < 0 || game.bird.y + game.bird.size / 2 > canvas.height) {
      game.ended = true;
    }

    if (game.pipes.some((pipe) => hitsPipe(pipe))) {
      game.ended = true;
    }
  }

  function addPipe() {
    const margin = 54;
    const minTop = margin;
    const maxTop = canvas.height - margin - game.gap;
    const topHeight = minTop + Math.random() * Math.max(20, maxTop - minTop);
    game.pipes.push({
      x: canvas.width + game.pipeWidth,
      topHeight,
      bottomY: topHeight + game.gap,
      scored: false,
    });
  }

  function hitsPipe(pipe) {
    const half = game.bird.size * 0.38;
    const birdLeft = game.bird.x - half;
    const birdRight = game.bird.x + half;
    const birdTop = game.bird.y - half;
    const birdBottom = game.bird.y + half;
    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + game.pipeWidth;
    const overlapsX = birdRight > pipeLeft && birdLeft < pipeRight;
    const hitsTop = birdTop < pipe.topHeight;
    const hitsBottom = birdBottom > pipe.bottomY;

    return overlapsX && (hitsTop || hitsBottom);
  }

  function drawGame() {
    if (!game) {
      return;
    }

    const { width, height } = canvas;
    context.clearRect(0, 0, width, height);
    drawBackground(width, height);
    drawPipes(height);
    drawBird();
    drawScore(width);
    drawMessage(width, height);
  }

  function drawBackground(width, height) {
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#111c2b");
    gradient.addColorStop(0.58, "#0f1724");
    gradient.addColorStop(1, "#070b12");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(255,255,255,0.05)";
    context.lineWidth = 1;
    for (let x = (game.frame * -0.35) % 44; x < width; x += 44) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
  }

  function drawPipes(height) {
    context.fillStyle = "#f5c518";
    context.strokeStyle = "#d9a90d";
    context.lineWidth = 3;

    for (const pipe of game.pipes) {
      drawPipe(pipe.x, 0, game.pipeWidth, pipe.topHeight);
      drawPipe(pipe.x, pipe.bottomY, game.pipeWidth, height - pipe.bottomY);
    }
  }

  function drawPipe(x, y, width, height) {
    context.fillRect(x, y, width, height);
    context.strokeRect(x, y, width, height);
  }

  function drawBird() {
    const { x, y, size } = game.bird;

    context.save();
    context.translate(x, y);
    context.rotate(Math.max(-0.45, Math.min(0.65, game.bird.velocity / 12)));

    if (logoImage.complete && logoImage.naturalWidth) {
      context.drawImage(logoImage, -size / 2, -size / 2, size, size);
    } else {
      context.fillStyle = "#1e3a8a";
      context.beginPath();
      context.arc(0, 0, size * 0.45, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  }

  function drawScore(width) {
    context.fillStyle = "#f8fafc";
    context.font = "800 28px Segoe UI, sans-serif";
    context.textAlign = "center";
    context.fillText(String(game.score), width / 2, 44);
  }

  function drawMessage(width, height) {
    if (game.started && !game.ended) {
      return;
    }

    context.fillStyle = "rgba(7, 11, 18, 0.72)";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#f8fafc";
    context.textAlign = "center";
    context.font = "800 24px Segoe UI, sans-serif";
    context.fillText(game.ended ? "Game Over" : "Click, Tap, or Space", width / 2, height / 2 - 12);
    context.font = "600 14px Segoe UI, sans-serif";
    context.fillStyle = "#a8b3c4";
    context.fillText(game.ended ? "Click to restart" : "Keep the CT logo between the pipes", width / 2, height / 2 + 18);
  }
})();
