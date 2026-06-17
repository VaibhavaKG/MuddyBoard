// modules/modes/slideshow.js
import { audio } from '../audio.js';
import { animations } from '../animations.js';
import { photos } from '../photos.js';

export class SlideshowMode {
  constructor() {
    this.container = null;
    this.slideInterval = null;
    this.cloudInterval = null;
    this.currentSlideEl = null;
    this.nextSlideEl = null;
    
    this.exitCallback = null;
  }

  init(containerEl, onInteraction, onExitSlideshow) {
    this.container = containerEl;
    // Tapping on slideshow exits it
    this.exitCallback = onExitSlideshow;

    this.container.innerHTML = '';
    this.container.className = 'sensory-world slideshow-world';

    // 1. Force play Calm sleepy background playlist
    audio.startMusic('sleepy');

    // 2. Load initial slides
    this.showNextSlide();

    // 3. Set slide timer (every 8 seconds load next photo)
    this.slideInterval = setInterval(() => {
      this.showNextSlide();
    }, 8000);

    // 4. Periodically float clouds and stars
    this.spawnSlideshowOverlays();
    this.cloudInterval = setInterval(() => {
      this.spawnSlideshowOverlays();
    }, 4000);

    // 5. Exit slideshow handler on tapping background
    this.container.addEventListener('pointerdown', this.handleExit.bind(this));

    // 6. Floating exit instructions banner
    const exitHint = document.createElement('div');
    exitHint.className = 'slideshow-exit-hint';
    exitHint.innerText = '⌨️ Press ESC or Tap to Play! 🌟';
    this.container.appendChild(exitHint);
  }

  showNextSlide() {
    if (!this.container) return;

    const imgUrl = photos.getNextPhoto();
    
    // Create new slide container
    const slide = document.createElement('div');
    slide.className = 'slideshow-slide';
    
    const img = document.createElement('img');
    img.src = imgUrl;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    slide.appendChild(img);

    // Pick a random Ken Burns animation subclass
    const animationsPreset = ['ken-burns-1', 'ken-burns-2', 'ken-burns-3', 'ken-burns-4'];
    const chosenAnim = animationsPreset[Math.floor(Math.random() * animationsPreset.length)];
    slide.classList.add(chosenAnim);

    this.container.appendChild(slide);

    if (this.currentSlideEl) {
      const prevSlide = this.currentSlideEl;
      // Crossfade: fade out previous slide
      prevSlide.style.opacity = '0';
      setTimeout(() => {
        prevSlide.remove();
      }, 2000);
    }

    this.currentSlideEl = slide;
  }

  spawnSlideshowOverlays() {
    if (!this.container) return;

    // Spawn 1-2 slow clouds and stars
    const yCloud = 50 + Math.random() * 200;
    animations.spawnDOMParticle(-150, yCloud, {
      text: Math.random() > 0.5 ? '☁️' : '🎈',
      size: 60 + Math.random() * 40,
      angle: 0, // float straight right
      speed: 0.5 + Math.random() * 0.5,
      gravity: 0,
      friction: 1.0,
      life: 300 // long life
    });

    const xStar = Math.random() * window.innerWidth;
    animations.spawnDOMParticle(xStar, -50, {
      text: '⭐',
      size: 15 + Math.random() * 15,
      angle: Math.PI * 0.5, // float straight down
      speed: 0.3 + Math.random() * 0.4,
      gravity: 0.005,
      friction: 1.0,
      life: 250
    });
  }

  handleExit(e) {
    e.preventDefault();
    e.stopPropagation();

    // Fade out music slightly or let orchestrator reset music playlist
    audio.playChime();
    animations.playSparkleBurst(e.clientX, e.clientY);

    // Call exit trigger to switch back to previous play mode
    if (this.exitCallback) {
      this.exitCallback();
    }
  }

  handleInteraction(x, y) {
    // Falls back to direct tap handler above
  }

  cleanup() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
    if (this.cloudInterval) {
      clearInterval(this.cloudInterval);
      this.cloudInterval = null;
    }
    if (this.container) {
      this.container.removeEventListener('pointerdown', this.handleExit);
      this.container.innerHTML = '';
      this.container.className = 'sensory-world';
    }
    this.currentSlideEl = null;
  }
}
