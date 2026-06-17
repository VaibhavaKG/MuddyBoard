// modules/modes/music.js
import { audio } from '../audio.js';
import { animations } from '../animations.js';

export class MusicPlayground {
  constructor() {
    this.container = null;
    this.instrument = 'xylophone'; // xylophone, piano, bells, chimes
    this.controlBar = null;
    this.interactionCallback = null;

    this.scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // Pentatonic notes (C4, D4, E4, G4, A4, C5, D5, E5)
    this.keyColors = [
      '#ff4d4d', // Red
      '#ff944d', // Orange
      '#ffea4d', // Yellow
      '#4dff4d', // Green
      '#4dffff', // Teal
      '#4d94ff', // Blue
      '#944dff', // Purple
      '#ff4dff'  // Pink
    ];

    this.instruments = [
      { id: 'xylophone', emoji: '🪵', name: 'Xylophone' },
      { id: 'piano', emoji: '🎹', name: 'Piano' },
      { id: 'bells', emoji: '🔔', name: 'Bells' },
      { id: 'chimes', emoji: '🎐', name: 'Chimes' }
    ];
  }

  init(containerEl, onInteraction) {
    this.container = containerEl;
    this.interactionCallback = onInteraction;

    this.container.innerHTML = '';
    this.container.className = 'sensory-world music-world';

    // 1. Create vertical keys (Xylophone Columns)
    const keysWrapper = document.createElement('div');
    keysWrapper.className = 'music-keys-container';
    
    for (let i = 0; i < 8; i++) {
      const key = document.createElement('div');
      key.className = 'music-key';
      key.style.backgroundColor = this.keyColors[i];
      key.innerHTML = `<span class="music-key-note">${['C', 'D', 'E', 'G', 'A', 'C', 'D', 'E'][i]}</span>`;
      
      key.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.playNoteAtIndex(i, e.clientX, e.clientY);
      });

      keysWrapper.appendChild(key);
    }
    this.container.appendChild(keysWrapper);

    // 2. Create Instrument Selection Bar
    this.controlBar = document.createElement('div');
    this.controlBar.className = 'music-instrument-bar';
    this.controlBar.style.zIndex = '8';

    this.instruments.forEach(inst => {
      const btn = document.createElement('button');
      btn.className = `instrument-btn ${this.instrument === inst.id ? 'active' : ''}`;
      btn.innerHTML = `<span class="inst-emoji">${inst.emoji}</span>`;
      
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.selectInstrument(inst.id, btn);
      });
      this.controlBar.appendChild(btn);
    });

    this.container.appendChild(this.controlBar);
  }

  selectInstrument(id, buttonEl) {
    this.instrument = id;
    audio.playChime();

    const buttons = this.controlBar.querySelectorAll('.instrument-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    buttonEl.classList.add('active');

    const rect = buttonEl.getBoundingClientRect();
    animations.playSparkleBurst(rect.left + rect.width / 2, rect.top);
  }

  playNoteAtIndex(index, clientX, clientY) {
    const freq = this.scale[index];
    const x = clientX || window.innerWidth / 8 * (index + 0.5);
    const y = clientY || window.innerHeight / 2;

    // 1. Sound synth triggering based on selection
    this.playInstrumentSound(freq);

    // 2. Key highlight animation
    const keyElements = this.container.querySelectorAll('.music-key');
    const key = keyElements[index];
    if (key) {
      key.classList.add('pressed');
      setTimeout(() => key.classList.remove('pressed'), 200);
    }

    // 3. Visual notes float upwards
    animations.playMusicalNotesFloat(x, y);
    animations.playGlowRings(x, y);

    if (this.interactionCallback) {
      this.interactionCallback();
    }
  }

  playInstrumentSound(freq) {
    switch (this.instrument) {
      case 'xylophone':
        audio.playXylophone(freq);
        break;
      case 'piano':
        // Synthesize a piano-like triangle-sine blend
        audio.playXylophone(freq); // reuse or custom
        break;
      case 'bells':
        audio.playBell();
        break;
      case 'chimes':
        audio.playChime();
        break;
      default:
        audio.playXylophone(freq);
    }
  }

  handleInteraction(x, y) {
    // Determine which key is tapped based on screen X
    const colIndex = Math.floor((x / window.innerWidth) * 8);
    if (colIndex >= 0 && colIndex < 8) {
      this.playNoteAtIndex(colIndex, x, y);
    }
  }

  handleKeyDown(key) {
    const cleanKey = key.toLowerCase();
    let noteIndex = -1;

    const keysMap = {
      '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7,
      'a': 0, 's': 1, 'd': 2, 'f': 3, 'g': 4, 'h': 5, 'j': 6, 'k': 7,
      'z': 0, 'x': 1, 'c': 2, 'v': 3, 'b': 4, 'n': 5, 'm': 6, ',': 7
    };

    if (keysMap[cleanKey] !== undefined) {
      noteIndex = keysMap[cleanKey];
    } else if (cleanKey === 'i' || cleanKey === ' ') {
      const currentIdx = this.instruments.findIndex(inst => inst.id === this.instrument);
      let nextIdx = (currentIdx + 1) % this.instruments.length;
      const nextInst = this.instruments[nextIdx];
      const btn = this.controlBar.querySelectorAll('.instrument-btn')[nextIdx];
      if (btn) this.selectInstrument(nextInst.id, btn);
      return;
    } else {
      noteIndex = Math.floor(Math.random() * 8);
    }

    if (noteIndex >= 0 && noteIndex < 8) {
      this.playNoteAtIndex(noteIndex);
    }
  }

  cleanup() {
    if (this.controlBar) this.controlBar.remove();
    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = 'sensory-world';
    }
  }
}
