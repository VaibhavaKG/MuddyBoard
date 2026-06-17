// modules/surprises.js
import { audio } from './audio.js';
import { animations } from './animations.js';
import { photos } from './photos.js';

class SurpriseSystem {
  constructor() {
    this.container = null;
    this.timer = null;
  }

  init(containerEl) {
    this.container = containerEl;
    this.scheduleNextSurprise();
  }

  scheduleNextSurprise() {
    if (this.timer) clearTimeout(this.timer);
    
    // Trigger every 90 to 180 seconds (1.5 to 3 minutes)
    const delay = (90 + Math.random() * 90) * 1000;
    this.timer = setTimeout(() => {
      this.triggerSurprise();
    }, delay);
  }

  triggerSurprise() {
    if (!this.container) return;

    const surprises = [
      this.flyingUnicorn.bind(this),
      this.balloonParade.bind(this),
      this.magicFairyVisit.bind(this),
      this.surprisePhotoCollage.bind(this),
      this.fireworkShow.bind(this)
    ];

    const surprise = surprises[Math.floor(Math.random() * surprises.length)];
    surprise();

    this.scheduleNextSurprise();
  }

  // 1. Flying Unicorn
  flyingUnicorn() {
    const el = document.createElement('div');
    el.className = 'surprise-element flying-unicorn';
    el.innerText = '🦄';
    el.style.fontSize = '80px';
    el.style.position = 'absolute';
    el.style.left = '-120px';
    el.style.top = `${100 + Math.random() * (window.innerHeight - 300)}px`;
    el.style.zIndex = '9';
    el.style.pointerEvents = 'auto';
    el.style.cursor = 'pointer';

    this.container.appendChild(el);
    audio.playChime();

    let posX = -120;
    const targetX = window.innerWidth + 120;
    const speed = 4 + Math.random() * 4;
    let frame = 0;

    const animate = () => {
      if (!el.parentNode) return;
      posX += speed;
      el.style.left = `${posX}px`;
      
      // Up and down bobbing
      const bobY = Math.sin(frame * 0.05) * 15;
      el.style.transform = `translate3d(0, ${bobY}px, 0)`;

      // Spawn magic dust trail
      if (frame % 3 === 0) {
        const rect = el.getBoundingClientRect();
        animations.playMagicDustTrail(rect.left + 20, rect.top + 40);
      }

      frame++;
      if (posX < targetX) {
        requestAnimationFrame(animate);
      } else {
        el.remove();
      }
    };

    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      audio.playLaughter();
      animations.playSparkleBurst(e.clientX, e.clientY);
      el.innerText = '🌈🦄';
      el.style.animation = 'spin 1s ease';
      setTimeout(() => { if (el.parentNode) el.innerText = '🦄'; }, 1000);
    });

    requestAnimationFrame(animate);
  }

  // 2. Balloon Parade
  balloonParade() {
    audio.playChime();
    const count = 10 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (!this.container) return;
        const x = (window.innerWidth / (count + 1)) * (i + 1) + (Math.random() * 40 - 20);
        
        const el = document.createElement('div');
        el.className = 'surprise-element parade-balloon';
        el.innerText = '🎈';
        el.style.fontSize = '55px';
        el.style.position = 'absolute';
        el.style.left = `${x}px`;
        el.style.bottom = `-100px`;
        el.style.zIndex = '9';
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
        el.style.animation = 'floatUpward 6s linear forwards';
        
        this.container.appendChild(el);

        el.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          audio.playPop();
          animations.playConfettiRain(e.clientX, e.clientY);
          el.remove();
        });

        setTimeout(() => el.remove(), 7000);
      }, i * 300);
    }
  }

  // 3. Magic Fairy Visit
  magicFairyVisit() {
    const el = document.createElement('div');
    el.className = 'surprise-element magic-fairy';
    el.innerText = '🧚';
    el.style.fontSize = '70px';
    el.style.position = 'absolute';
    el.style.right = '-100px';
    el.style.top = `${50 + Math.random() * (window.innerHeight - 250)}px`;
    el.style.zIndex = '9';
    el.style.pointerEvents = 'auto';
    el.style.cursor = 'pointer';

    this.container.appendChild(el);
    audio.playSparkle();

    let posX = window.innerWidth;
    const targetX = -120;
    const speed = 3 + Math.random() * 3;
    let frame = 0;

    const animate = () => {
      if (!el.parentNode) return;
      posX -= speed;
      el.style.left = `${posX}px`;
      
      const bobY = Math.sin(frame * 0.08) * 30; // wavy flight path
      el.style.transform = `translate3d(0, ${bobY}px, 0)`;

      if (frame % 4 === 0) {
        const rect = el.getBoundingClientRect();
        animations.playFireflies(rect.left + 35, rect.top + 35);
      }

      frame++;
      if (posX > targetX) {
        requestAnimationFrame(animate);
      } else {
        el.remove();
      }
    };

    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      audio.playChime();
      animations.playStarShower(e.clientX, e.clientY);
      el.style.animation = 'wiggle 0.2s 4 alternate';
    });

    requestAnimationFrame(animate);
  }

  // 4. Surprise Photo Collage
  surprisePhotoCollage() {
    audio.playCelebration();
    const collage = document.createElement('div');
    collage.className = 'surprise-element photo-collage-overlay';
    collage.style.position = 'absolute';
    collage.style.top = '50%';
    collage.style.left = '50%';
    collage.style.transform = 'translate(-50%, -50%)';
    collage.style.zIndex = '9';
    collage.style.pointerEvents = 'auto';
    
    this.container.appendChild(collage);

    const count = 5;
    const angleStep = (Math.PI * 2) / count;
    const radius = 180;
    const createdNodes = [];

    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const node = photos.createPhotoNode(140);
      node.style.position = 'absolute';
      node.style.left = `${x - 70}px`;
      node.style.top = `${y - 70}px`;
      node.style.transform = 'scale(0)';
      node.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      
      collage.appendChild(node);
      createdNodes.push(node);

      // Pop photo out
      setTimeout(() => {
        node.style.transform = 'scale(1)';
        animations.playSparkleBurst(window.innerWidth / 2 + x, window.innerHeight / 2 + y);
      }, i * 200);

      node.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        audio.playChime();
        animations.playHeartExplosion(e.clientX, e.clientY);
        node.style.transform = 'scale(1.2) rotate(10deg)';
        setTimeout(() => node.style.transform = 'scale(1)', 600);
      });
    }

    // Dismiss collage after 6 seconds
    setTimeout(() => {
      createdNodes.forEach(node => {
        node.style.transform = 'scale(0)';
      });
      setTimeout(() => collage.remove(), 700);
    }, 6000);
  }

  // 5. Firework Show
  fireworkShow() {
    audio.playCelebration();
    let count = 0;
    const runShow = () => {
      if (!this.container || count > 6) return;
      const x = 100 + Math.random() * (window.innerWidth - 200);
      const y = 100 + Math.random() * (window.innerHeight - 200);
      animations.playFireworkBurst(x, y);
      audio.playBell();
      count++;
      setTimeout(runShow, 600);
    };
    runShow();
  }
}

export const surpriseSystem = new SurpriseSystem();
