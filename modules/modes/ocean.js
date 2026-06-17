// modules/modes/ocean.js
import { audio } from '../audio.js';
import { animations } from '../animations.js';

export class OceanWorld {
  constructor() {
    this.container = null;
    this.activeCreatures = [];
    this.spawnInterval = null;
    this.maxCreatures = 8;
    this.interactionCallback = null;
    
    this.creatures = [
      { emoji: '🐠', name: 'tropical-fish', size: 70 },
      { emoji: '🐟', name: 'blue-fish', size: 75 },
      { emoji: '🐡', name: 'puffer', size: 80 },
      { emoji: '🐬', name: 'dolphin', size: 130 },
      { emoji: '🐢', name: 'turtle', size: 90 },
      { emoji: '🐙', name: 'octopus', size: 85 },
      { emoji: '🐳', name: 'whale', size: 160 }
    ];
  }

  init(containerEl, onInteraction) {
    this.container = containerEl;
    this.interactionCallback = onInteraction;
    this.activeCreatures = [];

    this.container.innerHTML = '';
    this.container.className = 'sensory-world ocean-world';

    // Add animated seaweeds SVG
    const seaweedLeft = document.createElement('div');
    seaweedLeft.className = 'seaweed seaweed-left';
    seaweedLeft.innerHTML = `
      <svg viewBox="0 0 100 200" width="120" height="250">
        <path d="M50,200 Q40,150 60,100 T40,20 Q60,10 50,0" fill="none" stroke="#2ed573" stroke-width="12" stroke-linecap="round"/>
        <path d="M20,200 Q35,140 20,80 T35,30" fill="none" stroke="#26af5f" stroke-width="8" stroke-linecap="round"/>
      </svg>
    `;
    const seaweedRight = document.createElement('div');
    seaweedRight.className = 'seaweed seaweed-right';
    seaweedRight.innerHTML = `
      <svg viewBox="0 0 100 200" width="120" height="250">
        <path d="M50,200 Q60,150 40,100 T60,20 Q40,10 50,0" fill="none" stroke="#2ed573" stroke-width="12" stroke-linecap="round"/>
        <path d="M80,200 Q65,140 80,80 T65,30" fill="none" stroke="#26af5f" stroke-width="8" stroke-linecap="round"/>
      </svg>
    `;
    this.container.appendChild(seaweedLeft);
    this.container.appendChild(seaweedRight);

    // Periodically spawn creatures
    this.spawnInterval = setInterval(() => {
      if (this.activeCreatures.length < this.maxCreatures) {
        this.spawnCreature();
      }
    }, 1500);

    // Initial batch
    for (let i = 0; i < 4; i++) {
      this.spawnCreature(true);
    }
  }

  spawnCreature(randomizeX = false) {
    if (!this.container) return;

    const data = this.creatures[Math.floor(Math.random() * this.creatures.length)];
    const direction = Math.random() > 0.5 ? 1 : -1; // 1: left-to-right, -1: right-to-left
    
    const size = data.size;
    const startX = direction === 1 
      ? (randomizeX ? Math.random() * window.innerWidth : -size - 50)
      : (randomizeX ? Math.random() * window.innerWidth : window.innerWidth + size + 50);
      
    const startY = 100 + Math.random() * (window.innerHeight - 250);

    const el = document.createElement('div');
    el.className = 'ocean-creature';
    el.innerText = data.emoji;
    el.style.fontSize = `${size}px`;
    el.style.position = 'absolute';
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.zIndex = '6';
    el.style.cursor = 'pointer';

    // Flip emoji image if swimming left
    if (direction === -1) {
      el.style.transform = 'scaleX(-1)';
    }

    this.container.appendChild(el);

    const speed = 1.0 + Math.random() * 1.5;
    const creatureData = {
      el: el,
      x: startX,
      y: startY,
      size: size,
      direction: direction,
      speed: speed,
      isDarting: false,
      alive: true
    };

    this.activeCreatures.push(creatureData);

    // Touch listener
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.interactWithCreature(creatureData, e.clientX, e.clientY);
    });

    // Animate swim loop
    const swim = () => {
      if (!creatureData.alive || !this.container) return;

      const currentSpeed = creatureData.isDarting ? creatureData.speed * 4.5 : creatureData.speed;
      creatureData.x += creatureData.direction * currentSpeed;
      
      // Floating/weaving bobbing
      const bobY = Math.sin(creatureData.x * 0.01) * 2;
      el.style.left = `${creatureData.x}px`;
      el.style.transform = `${creatureData.direction === -1 ? 'scaleX(-1)' : ''} translate3d(0, ${bobY}px, 0)`;

      // Out of bounds check
      const outLeft = creatureData.direction === -1 && creatureData.x < -size - 100;
      const outRight = creatureData.direction === 1 && creatureData.x > window.innerWidth + size + 100;

      if (outLeft || outRight) {
        this.removeCreature(creatureData);
      } else {
        requestAnimationFrame(swim);
      }
    };

    requestAnimationFrame(swim);
  }

  interactWithCreature(creature, clickX, clickY) {
    if (creature.isDarting) return;
    creature.isDarting = true;

    // 1. Play splash sound
    audio.playSplash();

    // 2. Trigger bubble bursts
    animations.playBubbleStorm(clickX, clickY);
    animations.playSparkleBurst(clickX, clickY);

    // 3. Make creature wiggle and dart away
    creature.el.classList.add('wiggling');

    if (this.interactionCallback) {
      this.interactionCallback();
    }

    // Reset darting speed after 1.5s
    setTimeout(() => {
      if (creature.alive) {
        creature.isDarting = false;
        creature.el.classList.remove('wiggling');
      }
    }, 1500);
  }

  removeCreature(creature) {
    creature.alive = false;
    creature.el.remove();
    this.activeCreatures = this.activeCreatures.filter(c => c !== creature);
  }

  handleInteraction(x, y) {
    // Spawns bubble trails on blank background tap
    if (!this.container) return;
    animations.playBubbleStorm(x, y);
    audio.playPop();
  }

  handleKeyDown(key) {
    if (!this.container) return;

    if (this.activeCreatures.length > 0) {
      const randCreature = this.activeCreatures[Math.floor(Math.random() * this.activeCreatures.length)];
      const rect = randCreature.el.getBoundingClientRect();
      this.interactWithCreature(randCreature, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    const size = 80 + Math.random() * 40;
    const x = Math.random() * (window.innerWidth - size);
    const y = window.innerHeight + 50;

    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'ocean-key-bubble';
    bubbleEl.style.position = 'absolute';
    bubbleEl.style.left = `${x}px`;
    bubbleEl.style.top = `${y}px`;
    bubbleEl.style.width = `${size}px`;
    bubbleEl.style.height = `${size}px`;
    bubbleEl.style.borderRadius = '50%';
    bubbleEl.style.border = '2px solid rgba(255,255,255,0.7)';
    bubbleEl.style.background = 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), rgba(0,200,255,0.1) 70%, rgba(0,150,255,0.3))';
    bubbleEl.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15), inset 0 -3px 6px rgba(0,0,0,0.2)';
    bubbleEl.style.display = 'flex';
    bubbleEl.style.alignItems = 'center';
    bubbleEl.style.justifyContent = 'center';
    bubbleEl.style.fontFamily = "'Nunito', sans-serif";
    bubbleEl.style.fontWeight = '900';
    bubbleEl.style.fontSize = `${size * 0.45}px`;
    bubbleEl.style.color = '#ffffff';
    bubbleEl.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
    bubbleEl.style.zIndex = '7';
    bubbleEl.style.cursor = 'pointer';
    bubbleEl.innerText = key.toUpperCase();

    this.container.appendChild(bubbleEl);

    const speed = 1.5 + Math.random() * 2;
    let currentY = y;
    let age = Math.random() * 100;
    const swayRange = 15 + Math.random() * 15;

    const floatUp = () => {
      if (!bubbleEl.parentNode || !this.container) return;
      currentY -= speed;
      age += 0.02;
      const currentX = x + Math.sin(age) * swayRange;
      bubbleEl.style.top = `${currentY}px`;
      bubbleEl.style.left = `${currentX}px`;

      if (currentY < -size) {
        bubbleEl.remove();
      } else {
        requestAnimationFrame(floatUp);
      }
    };

    bubbleEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      audio.playPop();
      animations.playBubbleStorm(e.clientX || x + size/2, e.clientY || currentY + size/2);
      bubbleEl.remove();
    });

    requestAnimationFrame(floatUp);
  }

  cleanup() {
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
    this.activeCreatures.forEach(c => {
      c.alive = false;
      c.el.remove();
    });
    this.activeCreatures = [];
    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = 'sensory-world';
    }
  }
}
