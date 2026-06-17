// modules/mascots.js
import { audio } from './audio.js';
import { animations } from './animations.js';
import { photos } from './photos.js';

class MascotSystem {
  constructor() {
    this.container = null;
    this.mascots = [
      { emoji: '🐰', name: 'Bini the Bunny', sound: 'rabbit', color: '#ffb3d9' },
      { emoji: '🐼', name: 'Po the Panda', sound: 'panda', color: '#ffffff' },
      { emoji: '🐻', name: 'Bubba the Bear', sound: 'dog', color: '#dfc0a5' }, // friendly growl/woof
      { emoji: '🦕', name: 'Dino the Dinosaur', sound: 'cow', color: '#b3ffb3' }, // funny low drone
      { emoji: '🦄', name: 'Sparkles the Unicorn', sound: 'rabbit', color: '#e6ccff' }
    ];
    this.activeMascot = null;
    this.spawnTimer = null;
  }

  init(containerEl) {
    this.container = containerEl;
    this.scheduleNextSpawn();
  }

  scheduleNextSpawn() {
    if (this.spawnTimer) clearTimeout(this.spawnTimer);
    
    // Spawn every 1 to 3 minutes
    const delay = (60 + Math.random() * 120) * 1000;
    this.spawnTimer = setTimeout(() => {
      this.spawnMascot();
    }, delay);
  }

  spawnMascot() {
    if (this.activeMascot || !this.container) return;

    const mascot = this.mascots[Math.floor(Math.random() * this.mascots.length)];
    const el = document.createElement('div');
    el.className = 'sensory-mascot-container';
    
    // Select a random side of the screen: bottom-left, bottom-right, left, right
    const positions = ['bottom-left', 'bottom-right', 'left-mid', 'right-mid'];
    const pos = positions[Math.floor(Math.random() * positions.length)];
    el.classList.add(`mascot-pos-${pos}`);

    el.innerHTML = `
      <div class="mascot-speech-bubble">Tap Me!</div>
      <div class="mascot-avatar" style="background-color: ${mascot.color}">${mascot.emoji}</div>
    `;

    this.container.appendChild(el);
    this.activeMascot = el;

    // Trigger slide-in
    setTimeout(() => {
      el.classList.add('visible');
    }, 100);

    // Setup tap interaction
    const avatar = el.querySelector('.mascot-avatar');
    avatar.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.interactWithMascot(mascot, el);
    });

    // Auto-remove after 15 seconds if ignored
    this.autoRemoveTimeout = setTimeout(() => {
      this.dismissMascot();
    }, 15000);
  }

  interactWithMascot(mascot, el) {
    // Prevent double triggers
    if (el.classList.contains('interacting')) return;
    el.classList.add('interacting');
    
    if (this.autoRemoveTimeout) clearTimeout(this.autoRemoveTimeout);

    // Play mascot voice synthesizer sound
    audio.playAnimal(mascot.sound);
    audio.playLaughter();

    // Trigger high-energy dance CSS animation
    const avatar = el.querySelector('.mascot-avatar');
    avatar.style.animation = 'wiggle 0.3s infinite alternate, jump 0.5s ease 2';

    // Update speech bubble to something cute!
    const bubble = el.querySelector('.mascot-speech-bubble');
    const greetings = ['Yay! 🎉', 'Hello! ❤️', 'Wheee! 🌈', 'Dance! 💃', 'Love you! 🥰'];
    bubble.innerText = greetings[Math.floor(Math.random() * greetings.length)];
    bubble.style.opacity = '1';

    // Interactive Photo Event: The mascot throws photo balloons!
    const rect = avatar.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top;

    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.spawnMascotPhotoBalloon(startX, startY);
      }, i * 250);
    }

    // Burst sparkles around the mascot
    animations.playSparkleBurst(startX, startY);

    // Dismiss mascot after interaction completes (3.5 seconds)
    setTimeout(() => {
      this.dismissMascot();
    }, 3500);
  }

  spawnMascotPhotoBalloon(x, y) {
    // Create a floating photo bubble starting from the mascot's position
    const bubbleNode = photos.createPhotoNode(100);
    bubbleNode.style.position = 'absolute';
    bubbleNode.style.left = `${x - 50}px`;
    bubbleNode.style.top = `${y - 50}px`;
    bubbleNode.style.zIndex = '8';
    bubbleNode.style.cursor = 'pointer';

    // Add iris border reflection
    bubbleNode.style.borderRadius = '50%';
    bubbleNode.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.6)';

    this.container.appendChild(bubbleNode);

    let posX = x - 50;
    let posY = y - 50;
    let vx = (Math.random() * 4 - 2);
    let vy = -(2 + Math.random() * 4); // shoot up!
    let life = 0;

    const animateBubble = () => {
      if (!bubbleNode.parentNode) return;
      life++;
      if (life > 250 || posY < -120) {
        bubbleNode.remove();
        return;
      }

      // Sine wave swaying drift
      vx += Math.sin(life * 0.05) * 0.1;
      posX += vx;
      posY += vy;

      bubbleNode.style.transform = `translate3d(${posX - (x - 50)}px, ${posY - (y - 50)}px, 0)`;
      requestAnimationFrame(animateBubble);
    };

    // Pop interaction
    bubbleNode.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      audio.playPop();
      animations.playSparkleBurst(posX + 50, posY + 50);
      animations.playConfettiRain(posX + 50, posY + 50);
      bubbleNode.remove();
    });

    requestAnimationFrame(animateBubble);
  }

  dismissMascot() {
    if (!this.activeMascot) return;
    const el = this.activeMascot;
    el.classList.remove('visible');
    
    setTimeout(() => {
      el.remove();
      if (this.activeMascot === el) {
        this.activeMascot = null;
      }
      this.scheduleNextSpawn();
    }, 800);
  }

  // Parents can trigger a mascot manually from settings if they want
  triggerManualMascot() {
    this.dismissMascot();
    setTimeout(() => this.spawnMascot(), 500);
  }
}

export const mascots = new MascotSystem();
