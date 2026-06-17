// modules/parent.js
import { audio } from './audio.js';
import { themes } from './themes.js';
import { animations } from './animations.js';

class ParentControls {
  constructor() {
    this.settings = {
      mode: 'bubbles',
      volume: 0.5,
      musicEnabled: true,
      playlist: 'calm',
      celebrationFreq: 25,
      childLock: false,
      theme: 'rainbow',
      themeRotate: true,
      slideshowIdleTime: 90,
      reducedMotion: false
    };
    
    this.longPressTimer = null;
    this.onSettingsChangeCallbacks = [];
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('muddyboard_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (e) {
      console.warn("LocalStorage access failed or blocked. Using default memory settings.", e);
    }
    this.applySettings();
  }

  saveSettings() {
    try {
      localStorage.setItem('muddyboard_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn("LocalStorage save failed:", e);
    }
    this.applySettings();
    this.triggerCallbacks();
  }

  applySettings() {
    // 1. Audio Volumes
    audio.setVolume(this.settings.volume);
    if (this.settings.musicEnabled) {
      audio.startMusic(this.settings.playlist);
    } else {
      audio.stopMusic();
    }

    // 2. Themes
    themes.setTheme(this.settings.theme);
    if (this.settings.themeRotate) {
      themes.startAutoRotation(5);
    } else {
      themes.stopAutoRotation();
    }

    // 3. Motion Accessibility
    animations.setReducedMotion(this.settings.reducedMotion);

    // 4. Update UI lock state
    const nav = document.getElementById('mode-selector');
    if (nav) {
      if (this.settings.childLock) {
        nav.classList.add('locked');
      } else {
        nav.classList.remove('locked');
      }
    }
  }

  registerCallback(cb) {
    this.onSettingsChangeCallbacks.push(cb);
  }

  triggerCallbacks() {
    this.onSettingsChangeCallbacks.forEach(cb => cb(this.settings));
  }

  setupParentTrigger(triggerEl) {
    if (!triggerEl) return;

    // Detect 5-second long press
    const startPress = (e) => {
      // Prevent zooming/default bubble tap
      e.stopPropagation();
      
      triggerEl.classList.add('pressing');
      this.longPressTimer = setTimeout(() => {
        triggerEl.classList.remove('pressing');
        this.askSecurityQuestion();
      }, 5000);
    };

    const cancelPress = () => {
      triggerEl.classList.remove('pressing');
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
    };

    triggerEl.addEventListener('mousedown', startPress);
    triggerEl.addEventListener('mouseup', cancelPress);
    triggerEl.addEventListener('mouseleave', cancelPress);

    triggerEl.addEventListener('touchstart', startPress, { passive: true });
    triggerEl.addEventListener('touchend', cancelPress, { passive: true });
    triggerEl.addEventListener('touchcancel', cancelPress, { passive: true });
  }

  askSecurityQuestion() {
    // Generate simple arithmetic challenge
    const num1 = Math.floor(Math.random() * 8) + 6; // 6 to 13
    const num2 = Math.floor(Math.random() * 7) + 3; // 3 to 9
    const correctAnswer = num1 + num2;

    const overlay = document.createElement('div');
    overlay.className = 'parent-quiz-overlay';
    overlay.innerHTML = `
      <div class="parent-quiz-card">
        <h3>🔒 Parent Verification</h3>
        <p>Please solve to open settings:</p>
        <div class="quiz-question">${num1} + ${num2} = ?</div>
        <input type="number" id="quiz-answer" autofocus placeholder="Answer" />
        <div class="quiz-buttons">
          <button id="quiz-cancel" class="quiz-btn secondary">Go Back</button>
          <button id="quiz-submit" class="quiz-btn primary">Unlock</button>
        </div>
        <p class="quiz-tip">Tip: Hold corner for 5s again anytime if locked.</p>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = document.getElementById('quiz-answer');
    const submitBtn = document.getElementById('quiz-submit');
    const cancelBtn = document.getElementById('quiz-cancel');

    const checkAnswer = () => {
      const ans = parseInt(input.value, 10);
      if (ans === correctAnswer) {
        overlay.remove();
        this.showParentMenu();
      } else {
        input.classList.add('error');
        input.value = '';
        setTimeout(() => input.classList.remove('error'), 500);
        // Play funny error chime
        audio.playDrum();
      }
    };

    submitBtn.addEventListener('click', checkAnswer);
    cancelBtn.addEventListener('click', () => overlay.remove());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') checkAnswer();
    });
  }

  showParentMenu() {
    // If settings panel is already open, skip
    if (document.getElementById('parent-settings-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'parent-settings-panel';
    panel.className = 'parent-panel-overlay';

    const modes = [
      { id: 'bubbles', emoji: '🫧', name: 'Bubble Pop' },
      { id: 'animals', emoji: '🐶', name: 'Animal World' },
      { id: 'paint', emoji: '🎨', name: 'Magic Paint' },
      { id: 'music', emoji: '🎹', name: 'Music World' },
      { id: 'fireworks', emoji: '🎆', name: 'Fireworks' },
      { id: 'ocean', emoji: '🐠', name: 'Ocean World' },
      { id: 'space', emoji: '🚀', name: 'Space World' },
      { id: 'vehicles', emoji: '🚒', name: 'Vehicle World' },
      { id: 'puzzle', emoji: '🧩', name: 'Photo Puzzle' },
      { id: 'memory', emoji: '🃏', name: 'Memory Match' },
      { id: 'slideshow', emoji: '🖼️', name: 'Slideshow' }
    ];

    const themeOptions = [
      { id: 'rainbow', name: 'Rainbow 🌈' },
      { id: 'princess', name: 'Princess 👑' },
      { id: 'ocean', name: 'Ocean 🌊' },
      { id: 'jungle', name: 'Jungle 🌴' },
      { id: 'space', name: 'Space 🌌' },
      { id: 'candyland', name: 'Candyland 🍬' },
      { id: 'winter', name: 'Winter ❄️' },
      { id: 'spring', name: 'Spring 🌱' },
      { id: 'summer', name: 'Summer ☀️' },
      { id: 'nightsky', name: 'Night Sky 🌃' }
    ];

    const playlistOptions = [
      { id: 'calm', name: 'Calm Piano 🎹' },
      { id: 'happy', name: 'Happy Ukulele 🪕' },
      { id: 'adventure', name: 'Adventure Orch 🎺' },
      { id: 'sleepy', name: 'Sleepy Lullaby 💤' }
    ];

    panel.innerHTML = `
      <div class="parent-panel-card">
        <div class="parent-panel-header">
          <h2>⚙️ Parent Settings</h2>
          <button id="panel-close" class="panel-close-btn">&times;</button>
        </div>
        <div class="parent-panel-body">
          <!-- Play Mode Selector -->
          <div class="setting-group">
            <label>Select Active Play Mode</label>
            <div class="modes-grid">
              ${modes.map(m => `
                <button class="mode-btn-option ${this.settings.mode === m.id ? 'active' : ''}" data-mode="${m.id}">
                  <span class="btn-emoji">${m.emoji}</span>
                  <span class="btn-text">${m.name}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Volume & Music -->
          <div class="setting-row">
            <div class="setting-item">
              <label for="set-volume">Master Volume: <span id="vol-lbl">${Math.round(this.settings.volume * 100)}%</span></label>
              <input type="range" id="set-volume" min="0" max="1" step="0.05" value="${this.settings.volume}" />
            </div>
            <div class="setting-item">
              <label for="set-music-toggle">Background Music</label>
              <div class="toggle-container">
                <input type="checkbox" id="set-music-toggle" ${this.settings.musicEnabled ? 'checked' : ''} />
                <span class="toggle-slider"></span>
              </div>
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-item">
              <label for="set-playlist">Background Playlist</label>
              <select id="set-playlist">
                ${playlistOptions.map(p => `<option value="${p.id}" ${this.settings.playlist === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
              </select>
            </div>
            <div class="setting-item">
              <label for="set-theme">Visual Theme</label>
              <select id="set-theme">
                ${themeOptions.map(t => `<option value="${t.id}" ${this.settings.theme === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Celebration & Locks -->
          <div class="setting-row">
            <div class="setting-item">
              <label for="set-celeb">Celebration Freq: <span id="celeb-lbl">${this.settings.celebrationFreq} clicks</span></label>
              <input type="range" id="set-celeb" min="10" max="50" step="5" value="${this.settings.celebrationFreq}" />
            </div>
            <div class="setting-item">
              <label for="set-child-lock">Child Mode Lock (Hide navigation)</label>
              <div class="toggle-container">
                <input type="checkbox" id="set-child-lock" ${this.settings.childLock ? 'checked' : ''} />
                <span class="toggle-slider"></span>
              </div>
            </div>
          </div>

          <!-- Auto rotation & reduced motion -->
          <div class="setting-row">
            <div class="setting-item">
              <label for="set-theme-rotate">Auto-Rotate Themes</label>
              <div class="toggle-container">
                <input type="checkbox" id="set-theme-rotate" ${this.settings.themeRotate ? 'checked' : ''} />
                <span class="toggle-slider"></span>
              </div>
            </div>
            <div class="setting-item">
              <label for="set-reduced-motion">Reduced Motion (Acessibility)</label>
              <div class="toggle-container">
                <input type="checkbox" id="set-reduced-motion" ${this.settings.reducedMotion ? 'checked' : ''} />
                <span class="toggle-slider"></span>
              </div>
            </div>
          </div>

          <!-- Slideshow time -->
          <div class="setting-row">
            <div class="setting-item">
              <label for="set-slideshow">Slideshow Inactivity Timer</label>
              <select id="set-slideshow">
                <option value="30" ${this.settings.slideshowIdleTime === 30 ? 'selected' : ''}>30 Seconds</option>
                <option value="60" ${this.settings.slideshowIdleTime === 60 ? 'selected' : ''}>1 Minute</option>
                <option value="90" ${this.settings.slideshowIdleTime === 90 ? 'selected' : ''}>1.5 Minutes</option>
                <option value="120" ${this.settings.slideshowIdleTime === 120 ? 'selected' : ''}>2 Minutes</option>
                <option value="300" ${this.settings.slideshowIdleTime === 300 ? 'selected' : ''}>5 Minutes</option>
              </select>
            </div>
            <div class="setting-item" style="display:flex; align-items:flex-end;">
              <button id="set-reset" class="quiz-btn danger" style="width:100%;">Reset to Default</button>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Wire up panel listeners
    const closeBtn = document.getElementById('panel-close');
    closeBtn.addEventListener('click', () => panel.remove());

    // Mode Selector options click
    const modeButtons = panel.querySelectorAll('.mode-btn-option');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.settings.mode = btn.dataset.mode;
        this.saveSettings();
      });
    });

    // Inputs change listeners
    const volInput = document.getElementById('set-volume');
    const volLbl = document.getElementById('vol-lbl');
    volInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.settings.volume = val;
      volLbl.innerText = `${Math.round(val * 100)}%`;
      this.saveSettings();
    });

    const musicToggle = document.getElementById('set-music-toggle');
    musicToggle.addEventListener('change', (e) => {
      this.settings.musicEnabled = e.target.checked;
      this.saveSettings();
    });

    const playlistSelect = document.getElementById('set-playlist');
    playlistSelect.addEventListener('change', (e) => {
      this.settings.playlist = e.target.value;
      this.saveSettings();
    });

    const themeSelect = document.getElementById('set-theme');
    themeSelect.addEventListener('change', (e) => {
      this.settings.theme = e.target.value;
      this.saveSettings();
    });

    const celebInput = document.getElementById('set-celeb');
    const celebLbl = document.getElementById('celeb-lbl');
    celebInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.settings.celebrationFreq = val;
      celebLbl.innerText = `${val} clicks`;
      this.saveSettings();
    });

    const childLockToggle = document.getElementById('set-child-lock');
    childLockToggle.addEventListener('change', (e) => {
      this.settings.childLock = e.target.checked;
      this.saveSettings();
    });

    const themeRotateToggle = document.getElementById('set-theme-rotate');
    themeRotateToggle.addEventListener('change', (e) => {
      this.settings.themeRotate = e.target.checked;
      this.saveSettings();
    });

    const motionToggle = document.getElementById('set-reduced-motion');
    motionToggle.addEventListener('change', (e) => {
      this.settings.reducedMotion = e.target.checked;
      this.saveSettings();
    });

    const slideshowSelect = document.getElementById('set-slideshow');
    slideshowSelect.addEventListener('change', (e) => {
      this.settings.slideshowIdleTime = parseInt(e.target.value, 10);
      this.saveSettings();
    });

    const resetBtn = document.getElementById('set-reset');
    resetBtn.addEventListener('click', () => {
      if (confirm("Reset all settings to original defaults?")) {
        this.settings = {
          mode: 'bubbles',
          volume: 0.5,
          musicEnabled: true,
          playlist: 'calm',
          celebrationFreq: 25,
          childLock: false,
          theme: 'rainbow',
          themeRotate: true,
          slideshowIdleTime: 90,
          reducedMotion: false
        };
        this.saveSettings();
        panel.remove();
        this.showParentMenu(); // redraw
      }
    });
  }
}

export const parentControls = new ParentControls();
