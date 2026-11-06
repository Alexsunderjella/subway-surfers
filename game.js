/**
 * Subway Surfers Web - Core Game Engine & Controller
 * Integrates Three.js, Game Loop, Physics, Camera, HUD, and Input Controls.
 */

class SubwaySurfersGame {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.state = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'

    // Scores & Progression
    this.score = 0;
    this.coins = 0;
    this.highScore = parseInt(localStorage.getItem('subway_surfers_high_score') || '0', 10);
    this.speed = CONSTANTS.INITIAL_SPEED;
    this.distance = 0;
    this.multiplier = 1;

    // Active Powerups: { id: durationLeft }
    this.activePowerups = {};

    // Camera follow parameters
    this.cameraOffset = new THREE.Vector3(0, 3.8, 7.5);
    this.cameraShake = 0;

    // Clock & Delta
    this.clock = new THREE.Clock();

    // Setup Three.js
    this.initThree();

    // Setup Modules
    this.world = new WorldManager(this.scene);
    this.player = new Player(this.scene);
    this.obstacles = new ObstacleManager(this.scene);

    // Setup Jetpack Particle System
    this.initParticles();

    // Setup Controls & UI Events
    this.initInputs();
    this.initUI();

    // Initial render
    this.updateHUD();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(62, aspect, 0.1, 400);
    this.camera.position.set(0, 4.5, 8);
    this.camera.lookAt(0, 1.5, -10);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Resize Handler
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  initParticles() {
    this.particleCount = 50;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100; // Offscreen initially
      positions[i * 3 + 2] = 0;

      // Orange to yellow flame gradient
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = Math.random() * 0.7 + 0.3;
      colors[i * 3 + 2] = 0.05;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.particleSystem = new THREE.Points(geo, mat);
    this.scene.add(this.particleSystem);

    this.particlesData = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particlesData.push({
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 5 - 2,
        vz: Math.random() * 4 + 2,
        life: 0,
        maxLife: 0.4
      });
    }
  }

  updateParticles(dt) {
    const positions = this.particleSystem.geometry.attributes.position.array;
    const isJetpackActive = !!this.activePowerups['jetpack'];

    for (let i = 0; i < this.particleCount; i++) {
      const p = this.particlesData[i];
      p.life -= dt;

      if (p.life <= 0 && isJetpackActive) {
        // Spawn particle at player's jetpack exhaust nozzles
        const side = Math.random() > 0.5 ? -0.22 : 0.22;
        positions[i * 3] = this.player.x + side;
        positions[i * 3 + 1] = this.player.y + 0.8;
        positions[i * 3 + 2] = this.player.z + 0.4;

        p.vx = (Math.random() - 0.5) * 0.8;
        p.vy = -Math.random() * 6 - 3;
        p.vz = Math.random() * 5 + 4;
        p.life = Math.random() * 0.3 + 0.15;
        p.maxLife = p.life;
      } else if (p.life > 0) {
        positions[i * 3] += p.vx * dt;
        positions[i * 3 + 1] += p.vy * dt;
        positions[i * 3 + 2] += p.vz * dt;
      } else {
        positions[i * 3 + 1] = -100; // Hide
      }
    }

    this.particleSystem.geometry.attributes.position.needsUpdate = true;
  }

  // --- INPUT HANDLING (KEYBOARD & TOUCH SWIPES) ---

  initInputs() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (this.state === 'MENU' && (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp')) {
        this.startGame();
        return;
      }

      if (this.state === 'GAMEOVER' && e.code === 'Space') {
        this.restartGame();
        return;
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        this.togglePause();
        return;
      }

      if (this.state !== 'PLAYING') return;

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.player.moveLeft();
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.player.moveRight();
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          this.player.jump();
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.player.slide();
          break;
      }
    });

    // Touch Swipe Controls for Mobile & Tablet
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    window.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const deltaTime = Date.now() - touchStartTime;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (this.state === 'MENU') {
        this.startGame();
        return;
      }

      if (this.state === 'GAMEOVER') {
        this.restartGame();
        return;
      }

      if (this.state !== 'PLAYING') return;

      // Minimum swipe threshold
      if (Math.max(absX, absY) > 28 && deltaTime < 600) {
        if (absX > absY) {
          // Horizontal Swipe
          if (deltaX > 0) this.player.moveRight();
          else this.player.moveLeft();
        } else {
          // Vertical Swipe
          if (deltaY < 0) this.player.jump();
          else this.player.slide();
        }
      }
    }, { passive: true });
  }

  initUI() {
    // DOM Elements
    this.dom = {
      score: document.getElementById('hud-score'),
      coins: document.getElementById('hud-coins'),
      highScore: document.getElementById('hud-highscore'),
      multiplier: document.getElementById('hud-multiplier'),
      powerupsContainer: document.getElementById('hud-powerups'),

      menuScreen: document.getElementById('menu-screen'),
      gameoverScreen: document.getElementById('gameover-screen'),
      pauseScreen: document.getElementById('pause-screen'),

      btnPlay: document.getElementById('btn-play'),
      btnRestart: document.getElementById('btn-restart'),
      btnResume: document.getElementById('btn-resume'),
      btnPause: document.getElementById('btn-pause'),
      btnSound: document.getElementById('btn-sound'),

      finalScore: document.getElementById('final-score'),
      finalCoins: document.getElementById('final-coins'),
      finalHighscore: document.getElementById('final-highscore'),
      newBestBadge: document.getElementById('new-best-badge')
    };

    // UI Click Events
    if (this.dom.btnPlay) this.dom.btnPlay.addEventListener('click', () => this.startGame());
    if (this.dom.btnRestart) this.dom.btnRestart.addEventListener('click', () => this.restartGame());
    if (this.dom.btnResume) this.dom.btnResume.addEventListener('click', () => this.togglePause());
    if (this.dom.btnPause) this.dom.btnPause.addEventListener('click', () => this.togglePause());

    if (this.dom.btnSound) {
      this.dom.btnSound.addEventListener('click', () => {
        const isMuted = window.soundEngine.toggleMute();
        this.dom.btnSound.textContent = isMuted ? '🔇' : '🔊';
        this.dom.btnSound.classList.toggle('muted', isMuted);
      });
      // Initial sound button state
      const isMuted = window.soundEngine.isMuted;
      this.dom.btnSound.textContent = isMuted ? '🔇' : '🔊';
      this.dom.btnSound.classList.toggle('muted', isMuted);
    }
  }

  // --- GAME STATE FLOW ---

  startGame() {
    this.state = 'PLAYING';
    this.dom.menuScreen.classList.add('hidden');
    this.dom.gameoverScreen.classList.add('hidden');
    this.dom.pauseScreen.classList.add('hidden');
    window.soundEngine.startBGM();
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.dom.pauseScreen.classList.remove('hidden');
      window.soundEngine.stopBGM();
      window.soundEngine.stopJetpackSound();
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.dom.pauseScreen.classList.add('hidden');
      this.clock.getDelta(); // Discard paused delta
      window.soundEngine.startBGM();
      if (this.activePowerups['jetpack']) {
        window.soundEngine.startJetpackSound();
      }
    }
  }

  gameOver() {
    this.state = 'GAMEOVER';
    this.player.crash();
    this.cameraShake = 0.45;
    window.soundEngine.stopBGM();

    const isNewBest = this.score > this.highScore;
    if (isNewBest) {
      this.highScore = Math.floor(this.score);
      localStorage.setItem('subway_surfers_high_score', this.highScore.toString());
    }

    setTimeout(() => {
      this.dom.finalScore.textContent = Math.floor(this.score).toLocaleString();
      this.dom.finalCoins.textContent = this.coins.toLocaleString();
      this.dom.finalHighscore.textContent = this.highScore.toLocaleString();

      if (isNewBest) {
        this.dom.newBestBadge.classList.remove('hidden');
      } else {
        this.dom.newBestBadge.classList.add('hidden');
      }

      this.dom.gameoverScreen.classList.remove('hidden');
    }, 750);
  }

  restartGame() {
    this.score = 0;
    this.coins = 0;
    this.distance = 0;
    this.speed = CONSTANTS.INITIAL_SPEED;
    this.multiplier = 1;
    this.activePowerups = {};
    this.cameraShake = 0;

    this.world.reset();
    this.player.reset();
    this.obstacles.reset();

    this.dom.powerupsContainer.innerHTML = '';
    this.updateHUD();

    this.startGame();
  }

  // --- POWERUP ACTIVATION & TIMERS ---

  activatePowerup(pw) {
    window.soundEngine.playPowerup();
    this.activePowerups[pw.id] = pw.duration;

    if (pw.id === 'sneakers') {
      this.player.setSuperSneakers(true);
    } else if (pw.id === 'jetpack') {
      this.player.setJetpack(true);
    } else if (pw.id === 'multiplier') {
      this.multiplier = 2;
    }

    this.renderPowerupUI();
  }

  updatePowerups(dt) {
    let changed = false;

    for (const id in this.activePowerups) {
      this.activePowerups[id] -= dt;

      if (this.activePowerups[id] <= 0) {
        delete this.activePowerups[id];
        changed = true;

        if (id === 'sneakers') this.player.setSuperSneakers(false);
        if (id === 'jetpack') this.player.setJetpack(false);
        if (id === 'multiplier') this.multiplier = 1;
      }
    }

    if (changed) {
      this.renderPowerupUI();
    } else {
      // Update timer progress bars
      for (const id in this.activePowerups) {
        const bar = document.getElementById(`powerup-bar-${id}`);
        if (bar) {
          const cfg = CONSTANTS.POWERUPS[id.toUpperCase()];
          const pct = Math.max(0, (this.activePowerups[id] / cfg.duration) * 100);
          bar.style.width = `${pct}%`;
        }
      }
    }
  }

  renderPowerupUI() {
    this.dom.powerupsContainer.innerHTML = '';
    for (const id in this.activePowerups) {
      const cfg = CONSTANTS.POWERUPS[id.toUpperCase()];
      if (!cfg) continue;

      const item = document.createElement('div');
      item.className = 'powerup-timer-badge';
      item.innerHTML = `
        <span class="icon">${cfg.icon}</span>
        <div class="bar-wrap">
          <div id="powerup-bar-${id}" class="bar-fill" style="background-color: #${cfg.color.toString(16).padStart(6, '0')}"></div>
        </div>
      `;
      this.dom.powerupsContainer.appendChild(item);
    }
  }

  // --- MAIN LOOP ---

  animate() {
    requestAnimationFrame(this.animate);

    const dt = Math.min(this.clock.getDelta(), 0.1); // Clamp delta

    if (this.state === 'PLAYING') {
      // 1. Ramp Speed gently with distance
      this.speed = Math.min(
        CONSTANTS.MAX_SPEED,
        CONSTANTS.INITIAL_SPEED + (this.distance / 100) * CONSTANTS.SPEED_INCREMENT
      );

      // 2. Advance Distance & Score
      this.distance += this.speed * dt;
      this.score += this.speed * 0.8 * this.multiplier * dt;

      // 3. Update Powerup Timers
      this.updatePowerups(dt);

      // 4. Query current ground/roof height below player
      const currentRoofY = this.obstacles.getRoofYAt(this.player.x, this.player.z, this.player.y);

      // 5. Update Player Physics & Animations
      this.player.update(dt, this.speed, currentRoofY);

      // 6. Update World Track Chunks
      this.world.update(this.player.z);

      // 7. Update Obstacles, Trains, Coins & Magnet Attraction
      const hasMagnet = !!this.activePowerups['magnet'];
      this.obstacles.update(dt, this.player.z, this.player.y, hasMagnet, this.player.x);

      // 8. Check Coin Pickups
      this.obstacles.checkCoinPickups(this.player, () => {
        this.coins++;
        this.score += 25 * this.multiplier;
        window.soundEngine.playCoin();
      });

      // 9. Check Powerup Pickups
      this.obstacles.checkPowerupPickups(this.player, (pw) => {
        this.activatePowerup(pw);
      });

      // 10. Check Lethal Obstacle Collisions (only if not flying with jetpack)
      if (!this.activePowerups['jetpack'] && this.obstacles.checkObstacleCollision(this.player)) {
        this.gameOver();
      }

      // 11. Update HUD
      this.updateHUD();
    } else if (this.state === 'GAMEOVER') {
      this.player.update(dt, this.speed, 0);
    }

    // 12. Update Jetpack Particle Exhaust
    this.updateParticles(dt);

    // 13. Camera Dynamic Follow & Shake
    this.updateCamera(dt);

    // 14. Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  updateCamera(dt) {
    const targetCamX = this.player.x * 0.55;
    const targetCamY = Math.max(3.6, this.player.y * 0.45 + 3.6);
    const targetCamZ = this.player.z + this.cameraOffset.z;

    // Smooth camera tracking
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, dt * 10);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, dt * 10);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, dt * 14);

    // Camera Shake on crash
    if (this.cameraShake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake * 1.5;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake * 1.5;
      this.cameraShake = Math.max(0, this.cameraShake - dt * 1.2);
    }

    // Camera LookAt
    const lookTarget = new THREE.Vector3(
      this.player.x * 0.25,
      this.player.y * 0.35 + 1.6,
      this.player.z - 12
    );
    this.camera.lookAt(lookTarget);

    // Dynamic FOV for speed sensation
    const speedRatio = (this.speed - CONSTANTS.INITIAL_SPEED) / (CONSTANTS.MAX_SPEED - CONSTANTS.INITIAL_SPEED);
    const targetFOV = 62 + speedRatio * 10;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, dt * 4);
    this.camera.updateProjectionMatrix();
  }

  updateHUD() {
    this.dom.score.textContent = Math.floor(this.score).toString().padStart(6, '0');
    this.dom.coins.textContent = this.coins.toString();
    this.dom.highScore.textContent = this.highScore.toString().padStart(6, '0');
    this.dom.multiplier.textContent = `${this.multiplier}X`;

    if (this.multiplier > 1) {
      this.dom.multiplier.classList.add('boosted');
    } else {
      this.dom.multiplier.classList.remove('boosted');
    }
  }
}

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.subwayGame = new SubwaySurfersGame();
});
