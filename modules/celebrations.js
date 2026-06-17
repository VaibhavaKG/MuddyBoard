// modules/celebrations.js
import { audio } from './audio.js';
import { animations } from './animations.js';
import { photos } from './photos.js';

class CelebrationSystem {
  constructor() {
    this.container = null;
    this.isActive = false;
    this.celebrationCount = 0;
  }

  init(containerEl) {
    this.container = containerEl;
  }

  triggerCelebration() {
    if (this.isActive) return;
    this.isActive = true;
    this.celebrationCount++;

    const events = [
      this.giantRainbow.bind(this),
      this.balloonExplosion.bind(this),
      this.animalDanceParty.bind(this),
      this.starShower.bind(this),
      this.princessCastle.bind(this),
      this.photoParade.bind(this),
      this.photoFireworks.bind(this),
      this.bubbleStorm.bind(this),
      this.candyRain.bind(this),
      this.discoMode.bind(this)
    ];

    // Pick a random celebration event
    const event = events[Math.floor(Math.random() * events.length)];
    
    // Play a grand sound fanfare
    audio.playCelebration();

    // Run the chosen event
    event();

    // Reset lock after 8 seconds (celebration duration)
    setTimeout(() => {
      this.isActive = false;
      const overlay = document.getElementById('celebration-overlay');
      if (overlay) overlay.remove();
    }, 8000);
  }

  createOverlay(className = '') {
    const overlay = document.createElement('div');
    overlay.id = 'celebration-overlay';
    overlay.className = `celebration-overlay-card ${className}`;
    this.container.appendChild(overlay);
    return overlay;
  }

  // 1. Giant Rainbow
  giantRainbow() {
    const overlay = this.createOverlay('rainbow-celebration');
    overlay.innerHTML = `<div class="celebration-text">🌈 AMAZING! 🌈</div>`;
    
    let step = 0;
    const interval = setInterval(() => {
      if (!this.isActive) {
        clearInterval(interval);
        return;
      }
      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight * 0.8;
      animations.playRainbowArc(x, y);
      audio.playChime();
      step++;
      if (step > 6) clearInterval(interval);
    }, 800);
  }

  // 2. Balloon Explosion
  balloonExplosion() {
    const overlay = this.createOverlay();
    overlay.innerHTML = `<div class="celebration-text">🎈 POP PARTY! 🎈</div>`;
    
    const colors = ['#ff4d4d', '#4d94ff', '#ff944d', '#4dff4d', '#ff4d94', '#944dff', '#ffff4d'];
    let count = 0;
    const interval = setInterval(() => {
      if (!this.isActive) {
        clearInterval(interval);
        return;
      }
      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight;
      
      const el = document.createElement('div');
      el.className = 'celebration-balloon';
      el.style.left = `${x}px`;
      el.style.bottom = `-100px`;
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.innerText = Math.random() > 0.4 ? '🎈' : '🌟';
      el.style.fontSize = '48px';
      
      overlay.appendChild(el);
      
      // Tap balloon to pop during celebration
      el.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        audio.playPop();
        animations.playConfettiRain(x, y - 200);
        el.remove();
      });

      // Auto pop after a delay
      setTimeout(() => {
        if (el.parentNode) {
          audio.playPop();
          animations.playConfettiRain(x, window.innerHeight * 0.4);
          el.remove();
        }
      }, 1500 + Math.random() * 2000);

      count++;
      if (count > 25) clearInterval(interval);
    }, 200);
  }

  // 3. Animal Dance Party
  animalDanceParty() {
    const overlay = this.createOverlay();
    overlay.innerHTML = `<div class="celebration-text">🦁 DANCE PARTY! 🐼</div>`;
    const animals = ['🐶', '🐱', '🦁', '🐼', '🐰', '🦖', '🐒', '🐮', '🐘'];
    
    animals.forEach((animal, index) => {
      const el = document.createElement('div');
      el.className = 'dancing-animal';
      el.innerText = animal;
      el.style.left = `${10 + index * 10}%`;
      el.style.bottom = `${10 + Math.random() * 20}%`;
      el.style.animationDelay = `${index * 0.15}s`;
      overlay.appendChild(el);

      el.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        audio.playAnimal(
          ['dog', 'cat', 'lion', 'panda', 'rabbit', 'monkey', 'cow', 'elephant'][index % 8] || 'dog'
        );
        el.style.transform = 'scale(1.5) rotate(360deg)';
        setTimeout(() => el.style.transform = '', 600);
      });
    });
  }

  // 4. Star Shower
  starShower() {
    const overlay = this.createOverlay();
    overlay.innerHTML = `<div class="celebration-text">⭐ STAR SHOWER ⭐</div>`;
    
    let count = 0;
    const interval = setInterval(() => {
      if (!this.isActive) {
        clearInterval(interval);
        return;
      }
      const x = Math.random() * window.innerWidth;
      animations.playStarShower(x, 50);
      audio.playSparkle();
      count++;
      if (count > 15) clearInterval(interval);
    }, 450);
  }

  // 5. Princess Castle Animation
  princessCastle() {
    const overlay = this.createOverlay('castle-celebration');
    overlay.innerHTML = `
      <div class="celebration-text">👑 MAGIC CASTLE 👑</div>
      <div class="giant-castle">🏰</div>
    `;
    
    let count = 0;
    const interval = setInterval(() => {
      if (!this.isActive) {
        clearInterval(interval);
        return;
      }
      const x = window.innerWidth / 2 + (Math.random() * 200 - 100);
      const y = window.innerHeight / 2 + (Math.random() * 150 - 75);
      animations.playSparkleBurst(x, y);
      audio.playChime();
      count++;
      if (count > 12) clearInterval(interval);
    }, 500);
  }

  // 6. Floating Photo Parade
  photoParade() {
    const overlay = this.createOverlay();
    overlay.innerHTML = `<div class="celebration-text">🖼️ PHOTO PARADE! 🖼️</div>`;
    
    let count = 0;
    const interval = setInterval(() => {
      if (!this.isActive) {
        clearInterval(interval);
        return;
      }
      const y = 100 + Math.random() * (window.innerHeight - 300);
      const photoNode = photos.createPhotoNode(140);
      photoNode.className = 'parade-photo sensory-photo-container';
      photoNode.style.position = 'absolute';
      photoNode.style.top = `${y}px`;
      photoNode.style.left = `-160px`;
      photoNode.style.animation = 'paradeDrift 7s linear forwards';
      overlay.appendChild(photoNode);

      photoNode.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        audio.playChime();
        animations.playSparkleBurst(e.clientX, e.clientY);
        photoNode.style.transform = 'scale(1.3) rotate(15deg)';
        setTimeout(() => photoNode.style.transform = '', 800);
      });

      count++;
      if (count > 8) clearInterval(interval);
    }, 800);
  }

  // 7. Photo Fireworks
  photoFireworks() {
    const overlay = this.createOverlay();
    overlay.innerHTML = `<div class="celebration-text">🎆 PHOTO FIREWORKS! 🎆</div>`;
    
    let count = 0;
    const interval = setInterval(() => {
      if (!this.isActive) {
        clearInterval(interval);
        return;
      }
      const x = 150 + Math.random() * (window.innerWidth - 300);
      const y = 150 + Math.random() * (window.innerHeight - 300);

      // Trigger standard firework visual
      animations.playFireworkBurst(x, y);
      audio.playBell();

      // Spawn a photo bubble floating out of the explosion center
      const photoBubble = photos.createPhotoNode(130);
      photoBubble.style.position = 'absolute';
      photoBubble.style.left = `${x - 65}px`;
      photoBubble.style.top = `${y - 65}px`;
      photoBubble.style.transform = 'scale(0)';
      photoBubble.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      overlay.appendChild(photoBubble);

      setTimeout(() => {
        photoBubble.style.transform = 'scale(1)';
      }, 50);

      photoBubble.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        audio.playPop();
        animations.playConfettiRain(x, y);
        photoBubble.remove();
      });

      count++;
      if (count > 6) clearInterval(interval);
    }, 1000);
  }

  // 8. Bubble Storm
  bubbleStorm() {
    const overlay = this.createOverlay();
    overlay.innerHTML = `<div class="celebration-text">🫧 BUBBLE STORM! 🫧</div>`;
    
    let count = 0;
    const interval = setInterval(() => {
      if (!this.isActive) {
        clearInterval(interval);
        return;
      }
      // Spawns bubble particles from bottom
      const x = Math.random() * window.innerWidth;
      animations.playBubbleStorm(x, window.innerHeight - 50);
      audio.playSplash();
      count++;
      if (count > 12) clearInterval(interval);
    }, 400);
  }

  // 9. Candy Rain
  candyRain() {
    const overlay = this.createOverlay();
    overlay.innerHTML = `<div class="celebration-text">🍬 CANDY RAIN! 🍭</div>`;
    
    let count = 0;
    const interval = setInterval(() => {
      if (!this.isActive) {
        clearInterval(interval);
        return;
      }
      const x = Math.random() * window.innerWidth;
      animations.playCandyBurst(x, 100);
      audio.playSparkle();
      count++;
      if (count > 12) clearInterval(interval);
    }, 500);
  }

  // 10. Disco Mode
  discoMode() {
    const overlay = this.createOverlay('disco-celebration');
    overlay.innerHTML = `<div class="celebration-text" style="color: #fff; text-shadow: 0 0 20px #ff00ff;">🕺 DISCO TIME! 💃</div>`;
    
    // Quick flashing visual effect in background handled by class disco-celebration in CSS
    let count = 0;
    const interval = setInterval(() => {
      if (!this.isActive) {
        clearInterval(interval);
        return;
      }
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      animations.playGlowRings(x, y);
      audio.playDrum();
      count++;
      if (count > 15) clearInterval(interval);
    }, 350);
  }
}

export const celebrations = new CelebrationSystem();
