// modules/animations.js

class AnimationLibrary {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.activeFireworks = [];
    this.isReducedMotion = false;
  }

  init(containerElement) {
    this.container = containerElement;
    
    // Create dedicated canvas for overlay effects (e.g. fireworks, drawing)
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'sensory-effects-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '10';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Check reduced motion preference
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Start requestAnimationFrame loop for canvas animations
    this.animate();
  }

  resizeCanvas() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  setReducedMotion(state) {
    this.isReducedMotion = state;
  }

  // Master method to spawn DOM-based floating particles
  spawnDOMParticle(x, y, config = {}) {
    if (this.isReducedMotion) return;

    const el = document.createElement('div');
    el.className = `sensory-particle ${config.className || ''}`;
    el.style.position = 'absolute';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.pointerEvents = 'none';
    el.style.userSelect = 'none';

    // Content: text/emoji, SVG, or custom markup
    if (config.text) {
      el.innerText = config.text;
      el.style.fontSize = `${config.size || 24}px`;
    } else if (config.html) {
      el.innerHTML = config.html;
    } else {
      // Default: simple colored circle
      el.style.width = `${config.size || 15}px`;
      el.style.height = `${config.size || 15}px`;
      el.style.borderRadius = '50%';
      el.style.backgroundColor = config.color || '#ff75a0';
    }

    // Physics / Motion settings
    const angle = config.angle !== undefined ? config.angle : Math.random() * Math.PI * 2;
    const speed = config.speed !== undefined ? config.speed : 1 + Math.random() * 5;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const gravity = config.gravity !== undefined ? config.gravity : 0.1;
    const friction = config.friction || 0.98;
    const spin = config.spin || (Math.random() * 10 - 5);
    const lifeMax = config.life || 50 + Math.random() * 50;

    let posX = x;
    let posY = y;
    let velX = vx;
    let velY = vy;
    let currentSpin = 0;
    let life = 0;

    this.container.appendChild(el);

    const update = () => {
      life++;
      if (life >= lifeMax) {
        el.remove();
        return;
      }

      velX *= friction;
      velY *= friction;
      velY += gravity;
      posX += velX;
      posY += velY;
      currentSpin += spin;

      el.style.transform = `translate3d(${posX - x}px, ${posY - y}px, 0) rotate(${currentSpin}deg)`;
      el.style.opacity = 1 - (life / lifeMax);

      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }

  // --- 20+ Core Animation Presets (combining to 100+ variations) ---

  playSparkleBurst(x, y) {
    const sparkleEmojis = ['✨', '⭐', '🌟', '💫', '💎'];
    const count = 12 + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i++) {
      this.spawnDOMParticle(x, y, {
        text: sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)],
        size: 16 + Math.random() * 20,
        speed: 2 + Math.random() * 6,
        gravity: 0.05,
        friction: 0.96,
        spin: Math.random() * 8 - 4,
        life: 40 + Math.random() * 30
      });
    }
  }

  playConfettiRain(x, y) {
    const colors = ['#ffd700', '#ff69b4', '#00ffff', '#32cd32', '#ff4500', '#9370db', '#ff1493', '#40e0d0'];
    const count = 30 + Math.floor(Math.random() * 20);
    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 8 + Math.random() * 12;
      const html = `<div style="width: ${size}px; height: ${size * (0.5 + Math.random())}px; background: ${color}; border-radius: ${Math.random() > 0.5 ? '2px' : '50%'};"></div>`;
      
      this.spawnDOMParticle(x, y, {
        html: html,
        angle: Math.PI * 1.5 + (Math.random() * 0.8 - 0.4), // Shoot upwards slightly
        speed: 4 + Math.random() * 8,
        gravity: 0.15,
        friction: 0.97,
        spin: Math.random() * 20 - 10,
        life: 80 + Math.random() * 50
      });
    }
  }

  playHeartExplosion(x, y) {
    const hearts = ['❤️', '💖', '💝', '💗', '💓', '💕', '💟', '😍'];
    const count = 15 + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i++) {
      this.spawnDOMParticle(x, y, {
        text: hearts[Math.floor(Math.random() * hearts.length)],
        size: 20 + Math.random() * 24,
        speed: 3 + Math.random() * 5,
        gravity: 0.02,
        friction: 0.95,
        spin: Math.random() * 6 - 3,
        life: 50 + Math.random() * 40
      });
    }
  }

  playStarShower(x, y) {
    const stars = ['⭐', '🌟', '✨', '🟡', '🧡'];
    const count = 20 + Math.floor(Math.random() * 15);
    for (let i = 0; i < count; i++) {
      this.spawnDOMParticle(x, y, {
        text: stars[Math.floor(Math.random() * stars.length)],
        size: 18 + Math.random() * 22,
        angle: Math.PI * 1.5 + (Math.random() * Math.PI), // upwards arc
        speed: 5 + Math.random() * 7,
        gravity: 0.18,
        friction: 0.96,
        life: 60 + Math.random() * 40
      });
    }
  }

  playBalloonRelease(x, y) {
    const balloons = ['🎈', '🎈', '🎈', '🎈'];
    const count = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      this.spawnDOMParticle(x, y, {
        text: balloons[Math.floor(Math.random() * balloons.length)],
        size: 30 + Math.random() * 20,
        angle: Math.PI * 1.5 + (Math.random() * 0.6 - 0.3), // straight up-ish
        speed: 2 + Math.random() * 4,
        gravity: -0.05, // floats up!
        friction: 0.98,
        spin: Math.random() * 4 - 2,
        life: 120 + Math.random() * 60
      });
    }
  }

  playButterflySwarm(x, y) {
    const butterflies = ['🦋', '🦋', '🦋'];
    const count = 6 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      this.spawnDOMParticle(x, y, {
        text: butterflies[Math.floor(Math.random() * butterflies.length)],
        size: 24 + Math.random() * 16,
        angle: Math.random() * Math.PI * 2,
        speed: 1.5 + Math.random() * 3,
        gravity: -0.01, // slow lift
        friction: 0.97,
        spin: Math.random() * 12 - 6,
        life: 100 + Math.random() * 50
      });
    }
  }

  playRainbowArc(x, y) {
    // Canvas-based arc rainbow expansion
    const rainbow = {
      x, y,
      radius: 5,
      maxRadius: 100 + Math.random() * 100,
      width: 15 + Math.random() * 20,
      opacity: 1,
      update() {
        this.radius += 4;
        if (this.radius > this.maxRadius) {
          this.opacity -= 0.05;
        }
        return this.opacity > 0;
      },
      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        const colors = ['#ff4d4d', '#ff944d', '#ffff4d', '#4dff4d', '#4d94ff', '#944dff'];
        colors.forEach((color, i) => {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius + i * (this.width / 6), Math.PI, 0, false);
          ctx.strokeStyle = color;
          ctx.lineWidth = this.width / 6;
          ctx.stroke();
        });
        ctx.restore();
      }
    };
    this.activeFireworks.push(rainbow);
  }

  playCloudFloat(x, y) {
    const clouds = ['☁️', '🌤️', '💨'];
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      this.spawnDOMParticle(x, y, {
        text: clouds[Math.floor(Math.random() * clouds.length)],
        size: 40 + Math.random() * 30,
        angle: Math.PI + (Math.random() * 0.4 - 0.2), // slow left/right
        speed: 0.8 + Math.random() * 1.5,
        gravity: 0,
        friction: 0.99,
        life: 150 + Math.random() * 100
      });
    }
  }

  playSnowStorm(x, y) {
    const snowflakes = ['❄️', '❄️', '⚪', '✨'];
    const count = 15 + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i++) {
      this.spawnDOMParticle(x, y, {
        text: snowflakes[Math.floor(Math.random() * snowflakes.length)],
        size: 12 + Math.random() * 18,
        angle: Math.PI * 0.5 + (Math.random() * 0.5 - 0.25), // down
        speed: 1 + Math.random() * 3,
        gravity: 0.03, // gentle falling
        friction: 0.98,
        spin: Math.random() * 4 - 2,
        life: 100 + Math.random() * 50
      });
    }
  }

  playFireflies(x, y) {
    const count = 8 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const size = 6 + Math.random() * 10;
      const html = `<div style="width: ${size}px; height: ${size}px; background: #ccff33; border-radius: 50%; box-shadow: 0 0 10px #ccff33, 0 0 20px #ccff33;"></div>`;
      
      this.spawnDOMParticle(x, y, {
        html: html,
        angle: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
        gravity: -0.005, // very light drift
        friction: 0.98,
        life: 120 + Math.random() * 60
      });
    }
  }

  playGlowRings(x, y) {
    const colors = ['#ff3399', '#33ccff', '#33ff99', '#ffff33', '#cc33ff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const ring = {
      x, y,
      radius: 0,
      maxRadius: 80 + Math.random() * 60,
      opacity: 1,
      update() {
        this.radius += 5;
        this.opacity = 1 - (this.radius / this.maxRadius);
        return this.radius < this.maxRadius;
      },
      draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 6 * this.opacity;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.stroke();
        ctx.restore();
      }
    };
    this.activeFireworks.push(ring);
  }

  playMagicDustTrail(x, y) {
    // Small continuous sparkles for drawing/drag trails
    const colors = ['#fff', '#ffd700', '#ffb3d9', '#b3e6ff', '#b3ffb3'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    this.spawnDOMParticle(x, y, {
      color: color,
      size: 4 + Math.random() * 8,
      speed: 0.5 + Math.random() * 2,
      gravity: 0.02,
      friction: 0.95,
      life: 20 + Math.random() * 20
    });
  }

  playCandyBurst(x, y) {
    const candies = ['🍬', '🍭', '🍩', '🍪', '🧁', '🍫'];
    const count = 10 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) {
      this.spawnDOMParticle(x, y, {
        text: candies[Math.floor(Math.random() * candies.length)],
        size: 22 + Math.random() * 18,
        speed: 3 + Math.random() * 6,
        gravity: 0.15,
        friction: 0.96,
        spin: Math.random() * 12 - 6,
        life: 60 + Math.random() * 40
      });
    }
  }

  playMusicalNotesFloat(x, y) {
    const notes = ['🎵', '🎶', '♩', '♪', '🎸', '🎹', '🔔'];
    const count = 6 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      this.spawnDOMParticle(x, y, {
        text: notes[Math.floor(Math.random() * notes.length)],
        size: 20 + Math.random() * 20,
        angle: Math.PI * 1.5 + (Math.random() * 1.0 - 0.5), // Float upwards
        speed: 2 + Math.random() * 4,
        gravity: -0.03, // slow float up
        friction: 0.98,
        spin: Math.random() * 8 - 4,
        life: 80 + Math.random() * 40
      });
    }
  }

  playEmojiStorm(x, y) {
    const emojis = ['🎈', '🌈', '🦄', '🎉', '🌟', '🍭', '🐱', '🦖', '🚗', '🐠', '🦋', '🌸', '🌞'];
    const count = 25 + Math.floor(Math.random() * 15);
    for (let i = 0; i < count; i++) {
      this.spawnDOMParticle(x, y, {
        text: emojis[Math.floor(Math.random() * emojis.length)],
        size: 24 + Math.random() * 24,
        speed: 4 + Math.random() * 8,
        gravity: 0.08,
        friction: 0.96,
        spin: Math.random() * 14 - 7,
        life: 70 + Math.random() * 50
      });
    }
  }

  playBubbleStorm(x, y) {
    const count = 20 + Math.floor(Math.random() * 15);
    for (let i = 0; i < count; i++) {
      const size = 15 + Math.random() * 40;
      // Iridescent bubbles using CSS
      const html = `<div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7) 0%, rgba(255,182,193,0.3) 50%, rgba(135,206,250,0.4) 80%, rgba(255,255,255,0) 100%);
        border: 1px solid rgba(255,255,255,0.6);
        box-shadow: inset -3px -3px 8px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05);
      "></div>`;

      this.spawnDOMParticle(x, y, {
        html: html,
        angle: Math.random() * Math.PI * 2,
        speed: 2 + Math.random() * 5,
        gravity: -0.02, // rise slowly
        friction: 0.97,
        life: 80 + Math.random() * 60
      });
    }
  }

  playShootingStars(x, y) {
    const count = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const angle = Math.PI * 0.1 + Math.random() * 0.2; // sweep right-down
      this.spawnDOMParticle(x, y, {
        text: '💫',
        size: 28 + Math.random() * 15,
        angle: angle,
        speed: 8 + Math.random() * 8,
        gravity: 0,
        friction: 0.99,
        spin: 10,
        life: 60 + Math.random() * 40
      });
    }
  }

  playFlowerBloom(x, y) {
    const flowers = ['🌸', '🌺', '🌹', '🌻', '🌼', '🌷'];
    const count = 12 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) {
      this.spawnDOMParticle(x, y, {
        text: flowers[Math.floor(Math.random() * flowers.length)],
        size: 22 + Math.random() * 20,
        speed: 1 + Math.random() * 4,
        gravity: 0.04,
        friction: 0.94,
        spin: Math.random() * 6 - 3,
        life: 50 + Math.random() * 40
      });
    }
  }

  playFireworkBurst(x, y, color = null) {
    const colors = [
      '#ff2a6d', '#05d9e8', '#01012b', '#f5a623', 
      '#7ed321', '#b8e986', '#f8e71c', '#bd10e0', '#9013fe'
    ];
    const finalColor = color || colors[Math.floor(Math.random() * colors.length)];
    const sparkCount = 40 + Math.floor(Math.random() * 30);
    
    // Play sound from context if triggered from main script (handled there or here)
    const sparks = [];
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: 0.015 + Math.random() * 0.02,
        size: 2 + Math.random() * 4
      });
    }

    const firework = {
      sparks,
      color: finalColor,
      update() {
        let alive = false;
        this.sparks.forEach(s => {
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.12; // gravity
          s.vx *= 0.97; // friction
          s.vy *= 0.97;
          s.alpha -= s.decay;
          if (s.alpha > 0) alive = true;
        });
        return alive;
      },
      draw(ctx) {
        ctx.save();
        this.sparks.forEach(s => {
          if (s.alpha <= 0) return;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.globalAlpha = s.alpha;
          // Outer bloom glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = this.color;
          ctx.fill();
        });
        ctx.restore();
      }
    };

    this.activeFireworks.push(firework);
  }

  playRibbonFloat(x, y) {
    const ribbons = ['🎀', '🎗️', '🎨', '🎪'];
    const count = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      this.spawnDOMParticle(x, y, {
        text: ribbons[Math.floor(Math.random() * ribbons.length)],
        size: 28 + Math.random() * 16,
        angle: Math.PI * 1.5 + (Math.random() * 0.8 - 0.4),
        speed: 2 + Math.random() * 4,
        gravity: -0.02,
        friction: 0.98,
        life: 100 + Math.random() * 50
      });
    }
  }

  // Draw loop for canvas animations (runs at 60fps)
  animate() {
    if (this.ctx && this.canvas) {
      // Clear canvas with trace/trails effect (slight transparent black/clear)
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Filter out completed canvas animations
      this.activeFireworks = this.activeFireworks.filter(fw => {
        const isAlive = fw.update();
        if (isAlive) {
          fw.draw(this.ctx);
        }
        return isAlive;
      });
    }
    requestAnimationFrame(() => this.animate());
  }

  // Dynamic combinations: Generates a completely random blended effect!
  playRandomCombinedEffect(x, y) {
    const effects = [
      () => this.playSparkleBurst(x, y),
      () => this.playConfettiRain(x, y),
      () => this.playHeartExplosion(x, y),
      () => this.playStarShower(x, y),
      () => this.playBalloonRelease(x, y),
      () => this.playButterflySwarm(x, y),
      () => this.playRainbowArc(x, y),
      () => this.playCloudFloat(x, y),
      () => this.playSnowStorm(x, y),
      () => this.playFireflies(x, y),
      () => this.playGlowRings(x, y),
      () => this.playCandyBurst(x, y),
      () => this.playMusicalNotesFloat(x, y),
      () => this.playEmojiStorm(x, y),
      () => this.playBubbleStorm(x, y),
      () => this.playShootingStars(x, y),
      () => this.playFlowerBloom(x, y),
      () => this.playFireworkBurst(x, y),
      () => this.playRibbonFloat(x, y)
    ];

    // Select 2 or 3 random effects to trigger simultaneously for endless surprise
    const effectCount = Math.random() > 0.5 ? 2 : 3;
    const chosen = [];
    while (chosen.length < effectCount) {
      const idx = Math.floor(Math.random() * effects.length);
      if (!chosen.includes(idx)) {
        chosen.push(idx);
        effects[idx]();
      }
    }
  }
}

export const animations = new AnimationLibrary();
