// script.js
import { audio } from './modules/audio.js';
import { photos } from './modules/photos.js';
import { animations } from './modules/animations.js';
import { celebrations } from './modules/celebrations.js';
import { mascots } from './modules/mascots.js';
import { surpriseSystem } from './modules/surprises.js';
import { themes } from './modules/themes.js';
import { parentControls } from './modules/parent.js';

// Mode classes imports
import { BubblePopWorld } from './modules/modes/bubbles.js';
import { AnimalWorld } from './modules/modes/animals.js';
import { MagicPaint } from './modules/modes/paint.js';
import { MusicPlayground } from './modules/modes/music.js';
import { FireworksWorld } from './modules/modes/fireworks.js';
import { OceanWorld } from './modules/modes/ocean.js';
import { SpaceWorld } from './modules/modes/space.js';
import { VehicleWorld } from './modules/modes/vehicles.js';
import { PhotoPuzzle } from './modules/modes/puzzle.js';
import { MemoryMatch } from './modules/modes/memory.js';
import { SlideshowMode } from './modules/modes/slideshow.js';

class PlaygroundOrchestrator {
  constructor() {
    this.container = null;
    
    // Map play modes to their class instances
    this.modes = {
      bubbles: new BubblePopWorld(),
      animals: new AnimalWorld(),
      paint: new MagicPaint(),
      music: new MusicPlayground(),
      fireworks: new FireworksWorld(),
      ocean: new OceanWorld(),
      space: new SpaceWorld(),
      vehicles: new VehicleWorld(),
      puzzle: new PhotoPuzzle(),
      memory: new MemoryMatch(),
      slideshow: new SlideshowMode()
    };

    this.activeModeId = 'bubbles';
    this.previousModeId = 'bubbles';
    this.activeModeInstance = null;

    // Celebration counts
    this.interactionCount = 0;

    // Idle screensaver tracker
    this.lastInteractionTime = Date.now();
    this.idleCheckInterval = null;
  }

  async init() {
    this.container = document.getElementById('sensory-container');

    // 1. Register Service Worker for PWA offline capability
    this.registerServiceWorker();

    // 2. Load Photos & Initialize Systems
    await photos.loadPhotos();
    animations.init(document.getElementById('app-viewport'));
    mascots.init(document.getElementById('mascot-container'));
    surpriseSystem.init(document.getElementById('app-viewport'));
    celebrations.init(document.getElementById('app-viewport'));

    // 3. Load Parent Preferences
    parentControls.loadSettings();
    parentControls.setupParentTrigger(document.getElementById('parent-trigger'));
    this.activeModeId = parentControls.settings.mode;

    // Handle updates from Parent Settings panel changes
    parentControls.registerCallback((newSettings) => {
      this.handleSettingsUpdate(newSettings);
    });

    // 4. Wire Navigation Bar Buttons
    this.setupNavbar();

    // Wire Info modal button triggers
    this.setupInfoModal();

    // 5. Welcome Overlay Audio Unlocker click
    const welcome = document.getElementById('welcome-overlay');
    const playBtn = document.getElementById('welcome-play-btn');

    const startApp = () => {
      audio.unlock(); // sets user gesture unlock flag and initializes ctx
      welcome.style.transition = 'opacity 0.6s ease';
      welcome.style.opacity = '0';
      setTimeout(() => {
        welcome.remove();
        this.switchMode(this.activeModeId);
        this.startInactivityTracker();
      }, 600);

      // Play soft initial chime
      audio.playChime();
    };

    // Toddler-friendly: Tap anywhere on the splash screen to start
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startApp();
    });
    welcome.addEventListener('click', startApp);
    welcome.addEventListener('touchend', (e) => {
      e.preventDefault();
      startApp();
    });

    // 6. Window-level activity trackers to wake screensaver or reset idle timer
    this.setupActivityResetListeners();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
          .then(reg => console.log('ServiceWorker registration successful:', reg.scope))
          .catch(err => console.warn('ServiceWorker registration failed:', err));
      });
    }
  }

  setupNavbar() {
    const nav = document.getElementById('mode-selector');
    const buttons = nav.querySelectorAll('.nav-btn');

    buttons.forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        // Stop bubbling so we don't trigger background animations
        e.stopPropagation();
        e.preventDefault();

        // If parent locked screen, buttons are unclickable
        if (parentControls.settings.childLock) return;

        const targetMode = btn.dataset.mode;
        this.switchMode(targetMode);
        
        // Save to parent settings so it saves state
        parentControls.settings.mode = targetMode;
        parentControls.saveSettings();
      });
    });
  }

  switchMode(modeId) {
    if (this.activeModeInstance) {
      this.activeModeInstance.cleanup();
    }

    console.log(`Switching mode: ${this.activeModeId} -> ${modeId}`);
    
    // Remember previous mode to return from slideshow screensaver
    if (this.activeModeId !== 'slideshow') {
      this.previousModeId = this.activeModeId;
    }

    this.activeModeId = modeId;
    this.activeModeInstance = this.modes[modeId];

    // Mark current navbar button as active
    const nav = document.getElementById('mode-selector');
    if (nav) {
      nav.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.mode === modeId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Initialize mode
    if (this.activeModeInstance) {
      if (modeId === 'slideshow') {
        // Slideshow has third argument: callback to exit slideshow
        this.activeModeInstance.init(
          this.container,
          () => this.incrementInteraction(),
          () => this.exitSlideshowScreensaver()
        );
      } else {
        this.activeModeInstance.init(
          this.container,
          () => this.incrementInteraction()
        );
      }
    }

    // Restart/sync background music based on theme/playlist
    if (parentControls.settings.musicEnabled) {
      // Slideshow forces sleepy music
      if (modeId === 'slideshow') {
        audio.startMusic('sleepy');
      } else {
        audio.startMusic(parentControls.settings.playlist);
      }
    }
  }

  incrementInteraction() {
    this.resetActivityTimer();
    this.interactionCount++;

    const limit = parentControls.settings.celebrationFreq;
    if (this.interactionCount >= limit) {
      this.interactionCount = 0;
      celebrations.triggerCelebration();
    }
  }

  // --- Inactivity Screensaver Tracker ---

  startInactivityTracker() {
    this.resetActivityTimer();
    
    this.idleCheckInterval = setInterval(() => {
      // If already in screensaver, do nothing
      if (this.activeModeId === 'slideshow') return;

      const idleDuration = Date.now() - this.lastInteractionTime;
      const limitMs = parentControls.settings.slideshowIdleTime * 1000;

      if (idleDuration >= limitMs) {
        console.log(`Inactivity detected for ${parentControls.settings.slideshowIdleTime}s. Starting screensaver.`);
        this.switchMode('slideshow');
      }
    }, 1000);
  }

  resetActivityTimer() {
    this.lastInteractionTime = Date.now();
  }

  setupInfoModal() {
    const trigger = document.getElementById('info-trigger');
    const overlay = document.getElementById('info-overlay');
    const closeBtn = document.getElementById('info-close-btn');
    const okBtn = document.getElementById('info-ok-btn');

    if (!trigger || !overlay) return;

    const openModal = (e) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      audio.playChime();
      overlay.style.display = 'flex';
      overlay.offsetHeight; // force reflow
      overlay.classList.add('open');
    };

    const closeModal = (e) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      audio.playChime();
      overlay.classList.remove('open');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 400);
    };

    trigger.addEventListener('pointerdown', openModal);
    closeBtn.addEventListener('pointerdown', closeModal);
    okBtn.addEventListener('pointerdown', closeModal);
  }

  setupActivityResetListeners() {
    const handleActivity = (e) => {
      this.resetActivityTimer();

      // If slide screensaver is running, tapping anywhere wakes it up (handled inside slideshow.js, but also here as fallback)
      if (this.activeModeId === 'slideshow') {
        this.exitSlideshowScreensaver();
      } else {
        // Tapping empty areas triggers background animation of active mode
        if (e.target.id === 'sensory-container' || e.target.classList.contains('sensory-world') || e.target.classList.contains('vehicle-lane')) {
          if (this.activeModeInstance && this.activeModeInstance.handleInteraction) {
            this.activeModeInstance.handleInteraction(e.clientX || (e.touches && e.touches[0].clientX), e.clientY || (e.touches && e.touches[0].clientY));
            this.incrementInteraction();
          }
        }
      }
    };

    const handleKeyDown = (e) => {
      // Ignore keys when typing in math input, text fields, etc.
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT')) {
        return;
      }

      this.resetActivityTimer();

      // If screensaver is running, any key exits it
      if (this.activeModeId === 'slideshow') {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.exitSlideshowScreensaver();
          return;
        }
      }

      const key = e.key;

      // Filter out modifier keys, function keys, and navigation keys
      if (
        key === 'Escape' ||
        (key.startsWith('F') && key.length > 1 && !isNaN(key.slice(1))) || // F1-F12
        ['Control', 'Alt', 'Shift', 'Meta', 'AltGraph', 'Tab', 'CapsLock', 'ScrollLock', 'NumLock', 'Pause', 'Break', 'Insert', 'Delete', 'PrintScreen', 'Help', 'Home', 'End', 'PageUp', 'PageDown'].includes(key)
      ) {
        return;
      }

      // Preserve browser shortcuts (e.g. Ctrl+R, F5, Ctrl+Shift+I)
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      // If screensaver is running, exit it
      if (this.activeModeId === 'slideshow') {
        this.exitSlideshowScreensaver();
        return;
      }

      // Delegate keyboard keydown events to the active play world if supported
      if (this.activeModeInstance && typeof this.activeModeInstance.handleKeyDown === 'function') {
        this.activeModeInstance.handleKeyDown(key, e);
      } else {
        this.defaultKeyDownAction(key);
      }

      this.incrementInteraction();
    };

    window.addEventListener('mousedown', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
  }

  defaultKeyDownAction(key) {
    // Spawn floating bouncing key particle in the sensory container
    const x = Math.random() * (window.innerWidth - 200) + 100;
    const y = Math.random() * (window.innerHeight - 200) + 100;

    // Play procedural note depending on character code
    const charCode = key.charCodeAt(0) || 65;
    const freq = 260 + ((charCode % 24) * 22.5); // Map charCode to a nice musical range
    audio.playXylophone(freq);

    const colors = ['#ff4d4d', '#ff944d', '#ffea4d', '#4dff4d', '#4dffff', '#4d94ff', '#944dff', '#ff4dff'];
    const color = colors[charCode % colors.length];

    animations.spawnDOMParticle(x, y, {
      text: key,
      size: 40 + Math.random() * 30,
      speed: 3 + Math.random() * 4,
      gravity: 0.08,
      friction: 0.96,
      spin: Math.random() * 10 - 5,
      life: 60 + Math.random() * 40,
      color: color
    });

    animations.playSparkleBurst(x, y);
  }

  exitSlideshowScreensaver() {
    console.log("Waking up from screensaver!");
    this.switchMode(this.previousModeId);
  }

  handleSettingsUpdate(newSettings) {
    // Switch mode if parent manually selected a different mode from settings grid
    if (newSettings.mode !== this.activeModeId) {
      this.switchMode(newSettings.mode);
    }
  }
}

// Instantiate and start once page completes loading
window.addEventListener('DOMContentLoaded', () => {
  const orchestrator = new PlaygroundOrchestrator();
  orchestrator.init();
});
