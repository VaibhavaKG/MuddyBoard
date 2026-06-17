// modules/modes/space.js
import { audio } from '../audio.js';
import { animations } from '../animations.js';

export class SpaceWorld {
  constructor() {
    this.container = null;
    this.spawnInterval = null;
    this.activeObjects = [];
    this.maxObjects = 7;
    this.interactionCallback = null;
    
    this.items = [
      { emoji: '🚀', name: 'rocket', size: 90 },
      { emoji: '🪐', name: 'saturn', size: 100 },
      { emoji: '🧑‍🚀', name: 'astronaut', size: 85 },
      { emoji: '🌍', name: 'earth', size: 90 },
      { emoji: '🛸', name: 'ufo', size: 95 },
      { emoji: '☄️', name: 'comet', size: 80 }
    ];
  }

  init(containerEl, onInteraction) {
    this.container = containerEl;
    this.interactionCallback = onInteraction;
    this.activeObjects = [];

    this.container.innerHTML = '';
    this.container.className = 'sensory-world space-world';

    // Spawn initial twinkles (twinkling star backdrops)
    for (let i = 0; i < 25; i++) {
      const star = document.createElement('div');
      star.className = 'twinkle-star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      this.container.appendChild(star);
    }

    // Periodically spawn space objects
    this.spawnInterval = setInterval(() => {
      if (this.activeObjects.length < this.maxObjects) {
        this.spawnSpaceObject();
      }
    }, 1800);

    // Initial batch
    for (let i = 0; i < 3; i++) {
      this.spawnSpaceObject(true);
    }
  }

  spawnSpaceObject(randomizeX = false) {
    if (!this.container) return;

    const data = this.items[Math.floor(Math.random() * this.items.length)];
    const size = data.size;
    const startX = randomizeX ? Math.random() * (window.innerWidth - size) : -size - 50;
    const startY = 100 + Math.random() * (window.innerHeight - 250);

    const el = document.createElement('div');
    el.className = 'space-object';
    el.innerText = data.emoji;
    el.style.fontSize = `${size}px`;
    el.style.position = 'absolute';
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.zIndex = '6';
    el.style.cursor = 'pointer';

    this.container.appendChild(el);

    const speedX = 0.6 + Math.random() * 1.0;
    const speedY = Math.random() * 0.4 - 0.2;
    const rotateSpeed = Math.random() * 2 - 1;

    const objData = {
      el: el,
      type: data.name,
      x: startX,
      y: startY,
      size: size,
      vx: speedX,
      vy: speedY,
      vr: rotateSpeed,
      rotation: 0,
      isTriggered: false,
      alive: true
    };

    this.activeObjects.push(objData);

    // Click/Touch interaction
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.interactWithObject(objData, e.clientX, e.clientY);
    });

    // Space float loop
    const float = () => {
      if (!objData.alive || !this.container) return;

      const multiplier = objData.isTriggered ? 5.5 : 1.0;
      objData.x += objData.vx * multiplier;
      objData.y += objData.vy * multiplier;
      objData.rotation += objData.vr * (objData.isTriggered ? 6 : 1);

      el.style.left = `${objData.x}px`;
      el.style.top = `${objData.y}px`;
      el.style.transform = `rotate(${objData.rotation}deg)`;

      // Rocket flame trail when flying fast
      if (objData.type === 'rocket' && objData.isTriggered && Math.random() < 0.4) {
        animations.playMagicDustTrail(objData.x, objData.y + size / 2);
      }

      // Out of bounds check
      if (objData.x > window.innerWidth + size + 100 || objData.y < -size - 100 || objData.y > window.innerHeight + size + 100) {
        this.removeObject(objData);
      } else {
        requestAnimationFrame(float);
      }
    };

    requestAnimationFrame(float);
  }

  interactWithObject(obj, clickX, clickY) {
    if (obj.isTriggered) return;
    obj.isTriggered = true;

    // 1. Play sounds
    if (obj.type === 'rocket' || obj.type === 'ufo') {
      audio.playChime();
    } else {
      audio.playBell();
    }

    // 2. Trigger particle comets
    animations.playStarShower(clickX, clickY);
    animations.playGlowRings(clickX, clickY);

    // 3. Custom wiggles/speeds
    obj.el.classList.add('thruster-active');

    if (this.interactionCallback) {
      this.interactionCallback();
    }

    // Reset speeds
    setTimeout(() => {
      if (obj.alive) {
        obj.isTriggered = false;
        obj.el.classList.remove('thruster-active');
      }
    }, 1800);
  }

  removeObject(obj) {
    obj.alive = false;
    obj.el.remove();
    this.activeObjects = this.activeObjects.filter(o => o !== obj);
  }

  handleInteraction(x, y) {
    // Taps space background spawns shooting stars
    if (!this.container) return;
    animations.playShootingStars(x, y);
    audio.playSparkle();
  }

  handleKeyDown(key) {
    if (!this.container) return;

    if (this.activeObjects.length > 0) {
      const randObj = this.activeObjects[Math.floor(Math.random() * this.activeObjects.length)];
      const rect = randObj.el.getBoundingClientRect();
      this.interactWithObject(randObj, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    const startX = -100;
    const startY = 100 + Math.random() * (window.innerHeight - 300);
    const targetX = window.innerWidth + 100;
    const targetY = startY + (Math.random() * 200 - 100);

    const cometEl = document.createElement('div');
    cometEl.className = 'space-key-comet';
    cometEl.style.position = 'absolute';
    cometEl.style.left = `${startX}px`;
    cometEl.style.top = `${startY}px`;
    cometEl.style.fontFamily = "'Nunito', sans-serif";
    cometEl.style.fontWeight = '900';
    cometEl.style.fontSize = '80px';
    cometEl.style.color = '#ffd700';
    cometEl.style.textShadow = '0 0 20px #ffea00, 0 0 40px #ffaa00';
    cometEl.style.zIndex = '7';
    cometEl.style.cursor = 'pointer';
    cometEl.innerText = `💫${key.toUpperCase()}`;

    this.container.appendChild(cometEl);

    audio.playSparkle();

    const duration = 60;
    const stepX = (targetX - startX) / duration;
    const stepY = (targetY - startY) / duration;
    let frame = 0;
    let currentX = startX;
    let currentY = startY;

    const animateComet = () => {
      if (!cometEl.parentNode || !this.container) return;
      currentX += stepX;
      currentY += stepY;
      cometEl.style.left = `${currentX}px`;
      cometEl.style.top = `${currentY}px`;
      cometEl.style.transform = `rotate(${frame * 3}deg)`;

      if (frame % 3 === 0) {
        animations.playMagicDustTrail(currentX + 40, currentY + 40);
      }

      frame++;
      if (frame < duration) {
        requestAnimationFrame(animateComet);
      } else {
        cometEl.remove();
      }
    };

    cometEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      audio.playBell();
      animations.playStarShower(currentX + 40, currentY + 40);
      cometEl.remove();
    });

    requestAnimationFrame(animateComet);
  }

  cleanup() {
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
    this.activeObjects.forEach(o => {
      o.alive = false;
      o.el.remove();
    });
    this.activeObjects = [];
    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = 'sensory-world';
    }
  }
}
