// modules/modes/fireworks.js
import { audio } from '../audio.js';
import { animations } from '../animations.js';

export class FireworksWorld {
  constructor() {
    this.container = null;
    this.interactionCallback = null;
  }

  init(containerEl, onInteraction) {
    this.container = containerEl;
    this.interactionCallback = onInteraction;

    this.container.innerHTML = '';
    this.container.className = 'sensory-world fireworks-world';

    // Sparkle overlay instructions
    const hint = document.createElement('div');
    hint.className = 'world-hint';
    hint.innerText = 'Tap to Sparkle! 🎆';
    this.container.appendChild(hint);

    setTimeout(() => {
      if (hint.parentNode) hint.style.opacity = '0';
    }, 3000);
  }

  launchFirework(x, y) {
    if (!this.container) return;

    // 1. Play launching swoosh sound
    audio.playChime();

    // 2. Animate rocket rising from screen bottom to tap point
    const rocket = document.createElement('div');
    rocket.className = 'firework-rocket';
    rocket.innerText = '🚀';
    rocket.style.position = 'absolute';
    rocket.style.left = `${x}px`;
    rocket.style.bottom = '0px';
    rocket.style.fontSize = '30px';
    rocket.style.zIndex = '6';

    this.container.appendChild(rocket);

    const startY = window.innerHeight;
    const targetY = y;
    let currentY = startY;
    const duration = 25; // frames
    const stepY = (startY - targetY) / duration;
    let frame = 0;

    const animateRocket = () => {
      if (!rocket.parentNode) return;
      currentY -= stepY;
      rocket.style.top = `${currentY}px`;
      
      // Spawn trail sparkles
      if (frame % 3 === 0) {
        animations.playMagicDustTrail(x + 15, currentY + 30);
      }

      frame++;
      if (frame < duration) {
        requestAnimationFrame(animateRocket);
      } else {
        rocket.remove();
        this.explodeFirework(x, y);
      }
    };

    requestAnimationFrame(animateRocket);
  }

  explodeFirework(x, y) {
    // Select a random firework type: hearts, stars, smiley faces, rainbows, butterflies, flowers
    const types = ['stars', 'hearts', 'smileys', 'rainbows', 'butterflies', 'flowers', 'random'];
    const chosen = types[Math.floor(Math.random() * types.length)];
    
    // Play boom sound
    audio.playBell();
    audio.playPop();

    switch (chosen) {
      case 'stars':
        animations.playStarShower(x, y);
        animations.playFireworkBurst(x, y, '#ffd700');
        break;
      case 'hearts':
        animations.playHeartExplosion(x, y);
        animations.playFireworkBurst(x, y, '#ff4d94');
        break;
      case 'smileys':
        // Spawn smiley face emojis explosion
        for (let i = 0; i < 15; i++) {
          animations.spawnDOMParticle(x, y, {
            text: ['😊', '🥰', '🤪', '😎', '😆', '🥳'][Math.floor(Math.random() * 6)],
            size: 26 + Math.random() * 20,
            speed: 3 + Math.random() * 6,
            gravity: 0.08,
            friction: 0.96,
            life: 60
          });
        }
        animations.playFireworkBurst(x, y, '#00ffff');
        break;
      case 'rainbows':
        animations.playRainbowArc(x, y);
        animations.playConfettiRain(x, y);
        break;
      case 'butterflies':
        animations.playButterflySwarm(x, y);
        animations.playFireworkBurst(x, y, '#cc99ff');
        break;
      case 'flowers':
        animations.playFlowerBloom(x, y);
        animations.playFireworkBurst(x, y, '#ff85e3');
        break;
      default:
        animations.playRandomCombinedEffect(x, y);
        break;
    }

    if (this.interactionCallback) {
      this.interactionCallback();
    }
  }

  handleInteraction(x, y) {
    this.launchFirework(x, y);
  }

  handleKeyDown(key) {
    if (!this.container) return;
    const x = Math.random() * (window.innerWidth - 300) + 150;
    const y = 100 + Math.random() * (window.innerHeight - 350);

    audio.playChime();

    const rocket = document.createElement('div');
    rocket.className = 'firework-rocket';
    rocket.innerText = '🚀';
    rocket.style.position = 'absolute';
    rocket.style.left = `${x}px`;
    rocket.style.bottom = '0px';
    rocket.style.fontSize = '30px';
    rocket.style.zIndex = '6';

    this.container.appendChild(rocket);

    const startY = window.innerHeight;
    const targetY = y;
    let currentY = startY;
    const duration = 25; // frames
    const stepY = (startY - targetY) / duration;
    let frame = 0;

    const animateRocket = () => {
      if (!rocket.parentNode) return;
      currentY -= stepY;
      rocket.style.top = `${currentY}px`;
      
      if (frame % 3 === 0) {
        animations.playMagicDustTrail(x + 15, currentY + 30);
      }

      frame++;
      if (frame < duration) {
        requestAnimationFrame(animateRocket);
      } else {
        rocket.remove();
        this.explodeFireworkWithKey(x, y, key);
      }
    };

    requestAnimationFrame(animateRocket);
  }

  explodeFireworkWithKey(x, y, key) {
    this.explodeFirework(x, y);

    const colors = ['#ffd700', '#ff4d94', '#00ffff', '#cc99ff', '#ff85e3', '#ff3333', '#33ff33'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    for (let i = 0; i < 15; i++) {
      animations.spawnDOMParticle(x, y, {
        text: key.toUpperCase(),
        size: 32 + Math.random() * 28,
        speed: 4 + Math.random() * 8,
        gravity: 0.07,
        friction: 0.95,
        life: 55 + Math.random() * 30,
        color: color
      });
    }
  }

  cleanup() {
    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = 'sensory-world';
    }
  }
}
