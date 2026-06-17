// modules/modes/bubbles.js
import { audio } from '../audio.js';
import { animations } from '../animations.js';
import { photos } from '../photos.js';

export class BubblePopWorld {
  constructor() {
    this.container = null;
    this.spawnInterval = null;
    this.activeBubbles = [];
    this.maxBubbles = 25;
    this.interactionCallback = null;
  }

  init(containerEl, onInteraction) {
    this.container = containerEl;
    this.interactionCallback = onInteraction;
    this.activeBubbles = [];

    // Clear container
    this.container.innerHTML = '';

    // Periodically spawn bubbles
    this.spawnInterval = setInterval(() => {
      if (this.activeBubbles.length < this.maxBubbles) {
        this.spawnBubble();
      }
    }, 450);

    // Initial batch
    for (let i = 0; i < 8; i++) {
      this.spawnBubble(Math.random() * window.innerHeight * 0.7);
    }

    // Set background info
    this.container.className = 'sensory-world bubble-world';
  }

  spawnBubble(startY = null) {
    if (!this.container) return;

    const isPhotoBubble = Math.random() < 0.22 && photos.photos.length > 0;
    const size = 70 + Math.random() * 120; // 70px to 190px
    const x = Math.random() * (window.innerWidth - size);
    const y = startY !== null ? startY : window.innerHeight + 100;

    let bubbleEl;
    if (isPhotoBubble) {
      // Photo bubble!
      bubbleEl = photos.createPhotoNode(size);
      bubbleEl.classList.add('bubble-cell', 'photo-bubble');
      // Add glossy overlay effect to photo bubbles
      const gloss = document.createElement('div');
      gloss.className = 'bubble-gloss';
      bubbleEl.appendChild(gloss);
    } else {
      // Standard rainbow bubble
      bubbleEl = document.createElement('div');
      bubbleEl.className = 'bubble-cell standard-bubble';
      bubbleEl.style.width = `${size}px`;
      bubbleEl.style.height = `${size}px`;
      
      const gloss = document.createElement('div');
      gloss.className = 'bubble-gloss';
      bubbleEl.appendChild(gloss);
    }

    bubbleEl.style.position = 'absolute';
    bubbleEl.style.left = `${x}px`;
    bubbleEl.style.top = `${y}px`;
    
    // Assign random color hue variables for standard bubbles
    if (!isPhotoBubble) {
      const hue = Math.floor(Math.random() * 360);
      bubbleEl.style.setProperty('--bubble-hue', hue);
    }

    this.container.appendChild(bubbleEl);

    const speed = 1.2 + Math.random() * 2;
    const swayRange = 15 + Math.random() * 20;
    const swaySpeed = 0.01 + Math.random() * 0.02;
    let age = Math.random() * 100;

    const bubbleData = {
      el: bubbleEl,
      x: x,
      y: y,
      size: size,
      speed: speed,
      swayRange: swayRange,
      swaySpeed: swaySpeed,
      age: age,
      isPhoto: isPhotoBubble,
      alive: true
    };

    this.activeBubbles.push(bubbleData);

    // Interaction handler
    const popAction = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.popBubble(bubbleData, e.clientX || (e.touches && e.touches[0].clientX) || x + size/2, e.clientY || (e.touches && e.touches[0].clientY) || y + size/2);
    };

    bubbleEl.addEventListener('pointerdown', popAction);

    // Frame update loop
    const update = () => {
      if (!bubbleData.alive || !this.container) return;

      bubbleData.y -= bubbleData.speed;
      bubbleData.age += bubbleData.swaySpeed;
      const currentX = bubbleData.x + Math.sin(bubbleData.age) * bubbleData.swayRange;

      bubbleEl.style.transform = `translate3d(${currentX - bubbleData.x}px, 0, 0)`;
      bubbleEl.style.top = `${bubbleData.y}px`;

      // Remove if floats off screen top
      if (bubbleData.y < -size) {
        this.removeBubble(bubbleData);
      } else {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }

  popBubble(bubble, clickX, clickY) {
    if (!bubble.alive) return;
    bubble.alive = false;
    bubble.el.classList.add('popping');

    // Pop sound
    audio.playPop();

    // Trigger visual confetti/sparkles
    animations.playSparkleBurst(clickX, clickY);
    if (bubble.isPhoto) {
      animations.playConfettiRain(clickX, clickY);
      animations.playHeartExplosion(clickX, clickY);
    } else {
      animations.playBubbleStorm(clickX, clickY);
    }

    // Trigger parent celebrate increments
    if (this.interactionCallback) {
      this.interactionCallback();
    }

    // Chain reaction: check other bubbles nearby
    setTimeout(() => {
      const center1X = bubble.x + bubble.size / 2;
      const center1Y = bubble.y + bubble.size / 2;

      this.activeBubbles.forEach(other => {
        if (other === bubble || !other.alive) return;
        const center2X = other.x + other.size / 2;
        const center2Y = other.y + other.size / 2;

        const dist = Math.hypot(center2X - center1X, center2Y - center1Y);
        // If overlapping / very close, pop it!
        if (dist < (bubble.size / 2 + other.size / 2 + 15)) {
          setTimeout(() => {
            this.popBubble(other, center2X, center2Y);
          }, 150 + Math.random() * 150); // slight cascade delay
        }
      });

      bubble.el.remove();
      this.activeBubbles = this.activeBubbles.filter(b => b !== bubble);
    }, 120);
  }

  removeBubble(bubble) {
    bubble.alive = false;
    bubble.el.remove();
    this.activeBubbles = this.activeBubbles.filter(b => b !== bubble);
  }

  // Handle screen touches for drag trails (Bubble trails)
  handleInteraction(x, y) {
    if (!this.container) return;
    
    // Spawn tiny bubble particles representing trails
    const size = 20 + Math.random() * 25;
    const trailBubble = document.createElement('div');
    trailBubble.className = 'bubble-trail-particle';
    trailBubble.style.position = 'absolute';
    trailBubble.style.left = `${x - size / 2}px`;
    trailBubble.style.top = `${y - size / 2}px`;
    trailBubble.style.width = `${size}px`;
    trailBubble.style.height = `${size}px`;

    this.container.appendChild(trailBubble);

    // Animate up and fade out
    let posY = y - size / 2;
    let posX = x - size / 2;
    let alpha = 1;
    const speedX = Math.random() * 2 - 1;
    const speedY = -(1 + Math.random() * 2);

    const animateTrail = () => {
      if (!trailBubble.parentNode) return;
      posY += speedY;
      posX += speedX;
      alpha -= 0.03;

      trailBubble.style.top = `${posY}px`;
      trailBubble.style.left = `${posX}px`;
      trailBubble.style.opacity = alpha;

      if (alpha > 0) {
        requestAnimationFrame(animateTrail);
      } else {
        trailBubble.remove();
      }
    };
    
    requestAnimationFrame(animateTrail);
    
    // Procedural sound
    if (Math.random() < 0.15) {
      audio.playXylophone(400 + Math.random() * 600);
    }
  }

  handleKeyDown(key) {
    if (!this.container) return;
    const size = 100 + Math.random() * 60;
    const x = Math.random() * (window.innerWidth - size);
    const y = window.innerHeight + 100;

    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'bubble-cell standard-bubble keyboard-bubble';
    bubbleEl.style.width = `${size}px`;
    bubbleEl.style.height = `${size}px`;
    bubbleEl.style.position = 'absolute';
    bubbleEl.style.left = `${x}px`;
    bubbleEl.style.top = `${y}px`;
    
    bubbleEl.innerHTML = `<span class="bubble-key-text" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Nunito',sans-serif;font-size:${size * 0.4}px;font-weight:900;color:white;pointer-events:none;text-shadow:0 2px 4px rgba(0,0,0,0.3);">${key}</span>`;

    const gloss = document.createElement('div');
    gloss.className = 'bubble-gloss';
    bubbleEl.appendChild(gloss);

    const hue = Math.floor(Math.random() * 360);
    bubbleEl.style.setProperty('--bubble-hue', hue);

    this.container.appendChild(bubbleEl);

    audio.playChime();

    const speed = 2 + Math.random() * 2;
    const swayRange = 20 + Math.random() * 20;
    const swaySpeed = 0.015 + Math.random() * 0.015;
    let age = Math.random() * 100;

    const bubbleData = {
      el: bubbleEl,
      x: x,
      y: y,
      size: size,
      speed: speed,
      swayRange: swayRange,
      swaySpeed: swaySpeed,
      age: age,
      isPhoto: false,
      alive: true
    };

    this.activeBubbles.push(bubbleData);

    const popAction = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.popBubble(bubbleData, e.clientX || x + size/2, e.clientY || y + size/2);
    };

    bubbleEl.addEventListener('pointerdown', popAction);

    const update = () => {
      if (!bubbleData.alive || !this.container) return;

      bubbleData.y -= bubbleData.speed;
      bubbleData.age += bubbleData.swaySpeed;
      const currentX = bubbleData.x + Math.sin(bubbleData.age) * bubbleData.swayRange;

      bubbleEl.style.transform = `translate3d(${currentX - bubbleData.x}px, 0, 0)`;
      bubbleEl.style.top = `${bubbleData.y}px`;

      if (bubbleData.y < -size) {
        this.removeBubble(bubbleData);
      } else {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);

    animations.spawnDOMParticle(x + size/2, window.innerHeight - 50, {
      text: key,
      size: 30,
      speed: 3,
      gravity: 0.05,
      life: 40
    });
  }

  cleanup() {
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
    this.activeBubbles.forEach(b => {
      b.alive = false;
      b.el.remove();
    });
    this.activeBubbles = [];
    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = 'sensory-world';
    }
  }
}
