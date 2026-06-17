// modules/modes/animals.js
import { audio } from '../audio.js';
import { animations } from '../animations.js';

export class AnimalWorld {
  constructor() {
    this.container = null;
    this.animals = [
      { id: 'dog', emoji: '🐶', color: '#ffb366', particle: '🦴' },
      { id: 'cat', emoji: '🐱', color: '#ffe680', particle: '🐟' },
      { id: 'cow', emoji: '🐮', color: '#e6ccb3', particle: '🌾' },
      { id: 'elephant', emoji: '🐘', color: '#b3d9ff', particle: '💧' },
      { id: 'duck', emoji: '🦆', color: '#ff9999', particle: '🌊' },
      { id: 'lion', emoji: '🦁', color: '#ffcc66', particle: '👑' },
      { id: 'rabbit', emoji: '🐰', color: '#ffccff', particle: '🥕' },
      { id: 'monkey', emoji: '🐒', color: '#cc9966', particle: '🍌' },
      { id: 'panda', emoji: '🐼', color: '#ffffff', particle: '🎋' }
    ];
    this.activeCards = [];
    this.interactionCallback = null;
  }

  init(containerEl, onInteraction) {
    this.container = containerEl;
    this.interactionCallback = onInteraction;
    this.activeCards = [];

    // Clear container
    this.container.innerHTML = '';
    this.container.className = 'sensory-world animal-world';

    // Render animals inside a fluid flex grid or random bouncy absolute layout
    this.animals.forEach((animal, index) => {
      this.spawnAnimalCard(animal, index);
    });
  }

  spawnAnimalCard(animal, index) {
    if (!this.container) return;

    const el = document.createElement('div');
    el.className = 'animal-card';
    el.style.backgroundColor = animal.color;
    
    // Position randomly on screen but well-spaced
    const columns = 3;
    const row = Math.floor(index / columns);
    const col = index % columns;

    const widthPercent = 100 / columns;
    const heightPercent = 100 / Math.ceil(this.animals.length / columns);
    
    el.style.left = `${col * widthPercent + 3 + Math.random() * 8}%`;
    el.style.top = `${row * heightPercent + 5 + Math.random() * 8}%`;

    el.innerHTML = `
      <div class="animal-emoji">${animal.emoji}</div>
      <div class="animal-glow"></div>
    `;

    this.container.appendChild(el);

    // Bouncy idle animation delays
    el.style.animationDelay = `${index * 0.2}s`;

    const cardData = {
      el: el,
      animal: animal,
      isInteracting: false
    };

    this.activeCards.push(cardData);

    // Setup Touch / Tap triggers
    const triggerInteraction = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.interactWithAnimal(cardData, e.clientX || (e.touches && e.touches[0].clientX), e.clientY || (e.touches && e.touches[0].clientY));
    };

    el.addEventListener('pointerdown', triggerInteraction);
  }

  interactWithAnimal(card, x, y) {
    if (card.isInteracting) return;
    card.isInteracting = true;

    const el = card.el;
    const animal = card.animal;

    // 1. Play animal sound synthesizer
    audio.playAnimal(animal.id);

    // 2. Wiggle, jump, spin animations
    el.classList.add('active-jump');
    
    // Spawn food/symbol particles matching this animal
    const rect = el.getBoundingClientRect();
    const px = x || rect.left + rect.width / 2;
    const py = y || rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
      animations.spawnDOMParticle(px, py, {
        text: animal.particle,
        size: 20 + Math.random() * 20,
        speed: 3 + Math.random() * 6,
        gravity: 0.1,
        friction: 0.96,
        life: 50 + Math.random() * 30
      });
    }
    
    // Extra sparkles
    animations.playSparkleBurst(px, py);

    // Call celebration callback
    if (this.interactionCallback) {
      this.interactionCallback();
    }

    // Reset interaction lock and animation classes after completion
    setTimeout(() => {
      el.classList.remove('active-jump');
      card.isInteracting = false;
    }, 1200);
  }

  handleInteraction(x, y) {
    // Tapping on empty background spawns random animal footprints or flowers
    if (!this.container) return;
    
    const elements = ['🐾', '🌸', '🍃', '⭐'];
    const text = elements[Math.floor(Math.random() * elements.length)];

    animations.spawnDOMParticle(x, y, {
      text: text,
      size: 24 + Math.random() * 16,
      speed: 1 + Math.random() * 3,
      gravity: 0.05,
      life: 40 + Math.random() * 20
    });

    audio.playXylophone(300 + Math.random() * 500);
  }

  handleKeyDown(key) {
    if (!this.activeCards || this.activeCards.length === 0) return;
    
    let matchedCard = null;
    const cleanKey = key.toLowerCase();

    const mapping = {
      'd': 'dog',
      'c': 'cat',
      'o': 'cow',
      'w': 'cow',
      'e': 'elephant',
      'u': 'duck',
      'k': 'duck',
      'l': 'lion',
      'r': 'rabbit',
      'm': 'monkey',
      'p': 'panda'
    };

    if (cleanKey >= '1' && cleanKey <= '9') {
      const index = parseInt(cleanKey, 10) - 1;
      if (index >= 0 && index < this.activeCards.length) {
        matchedCard = this.activeCards[index];
      }
    } else if (mapping[cleanKey]) {
      matchedCard = this.activeCards.find(c => c.animal.id === mapping[cleanKey]);
    }

    if (!matchedCard) {
      matchedCard = this.activeCards[Math.floor(Math.random() * this.activeCards.length)];
    }

    if (matchedCard) {
      const rect = matchedCard.el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      this.interactWithAnimal(matchedCard, x, y);
    }
  }

  cleanup() {
    this.activeCards.forEach(c => c.el.remove());
    this.activeCards = [];
    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = 'sensory-world';
    }
  }
}
