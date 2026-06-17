// modules/audio.js

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.effectsGain = null;
    this.musicInterval = null;
    this.currentPlaylist = null;
    this.volume = 0.5;
    this.musicVolume = 0.3;
    this.effectsVolume = 0.6;
    this.isMuted = false;
    this.musicStep = 0;
    this.userGestureUnlocked = false; // block creation until click gesture
  }

  init() {
    if (!this.userGestureUnlocked) return; // safety check
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.effectsGain = this.ctx.createGain();
    this.effectsGain.gain.setValueAtTime(this.effectsVolume, this.ctx.currentTime);
    this.effectsGain.connect(this.masterGain);
  }

  unlock() {
    this.userGestureUnlocked = true;
    this.ensureContext();
  }

  ensureContext() {
    if (!this.userGestureUnlocked) return;
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
  }

  mute(state) {
    this.isMuted = state;
    this.setVolume(this.volume);
  }

  // Helper to create basic ADSR envelope source
  createOsc(type, freq, duration, gainStart = 0.5) {
    if (!this.ctx) this.init();
    this.ensureContext();
    if (!this.ctx) return null;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(gainStart, this.ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.effectsGain);

    return { osc, gainNode };
  }

  // --- Sound Effects ---

  playPop() {
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Pitch drops rapidly from 600Hz to 150Hz
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.effectsGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  playChime() {
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const delay = idx * 0.05;
      const t = now + delay;
      
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      // Add high bell overtone
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.01, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.effectsGain);

      osc.start(t);
      osc2.start(t);
      osc.stop(t + 0.61);
      osc2.stop(t + 0.61);
    });
  }

  playBell() {
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscHarmonic = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t); // A5

    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(880 * 1.5, t); // Perfect fifth harmonic

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc.connect(gain);
    oscHarmonic.connect(gain);
    gain.connect(this.effectsGain);

    osc.start(t);
    oscHarmonic.start(t);
    osc.stop(t + 1.25);
    oscHarmonic.stop(t + 1.25);
  }

  playDrum() {
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Deep tom-tom style pitch drop
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.2);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.effectsGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  playXylophone(freq = 440) {
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const strikeNode = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    // Sharp mallet strike attack overtone
    strikeNode.type = 'sine';
    strikeNode.frequency.setValueAtTime(freq * 3.5, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    strikeNode.connect(gain);
    gain.connect(this.effectsGain);

    osc.start(t);
    strikeNode.start(t);
    osc.stop(t + 0.4);
    strikeNode.stop(t + 0.1);
  }

  playSparkle() {
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Series of 6 fast, high-pitched sine bells
    for (let i = 0; i < 6; i++) {
      const t = now + i * 0.04;
      const freq = 1200 + Math.random() * 800;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.effectsGain);

      osc.start(t);
      osc.stop(t + 0.16);
    }
  }

  playSplash() {
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.3; // 0.3 seconds buffer
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    // Filter white noise to make it splashy
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.25);
    filter.Q.setValueAtTime(1.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.effectsGain);

    noiseNode.start(t);
    noiseNode.stop(t + 0.3);
  }

  playLaughter() {
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // 5 laughing "hee-hee" pulses
    for (let i = 0; i < 5; i++) {
      const t = now + i * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      // Pitch goes up and down slightly like a giggle
      osc.frequency.setValueAtTime(330, t);
      osc.frequency.linearRampToValueAtTime(440, t + 0.05);
      osc.frequency.linearRampToValueAtTime(350, t + 0.1);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.11);

      osc.connect(gain);
      gain.connect(this.effectsGain);

      osc.start(t);
      osc.stop(t + 0.12);
    }
  }

  playCelebration() {
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // A triumphant major arpeggio
    const arpeggio = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4 to C6
    arpeggio.forEach((freq, idx) => {
      const t = now + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.effectsGain);

      osc.start(t);
      osc.stop(t + 0.42);
    });
  }

  // --- Animal Sounds Synthesis ---

  playAnimal(type) {
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    switch (type) {
      case 'dog': {
        // "Woof!": double rapid low pitch sweep
        const bark = (delay) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(180, t + delay);
          osc.frequency.exponentialRampToValueAtTime(70, t + delay + 0.12);
          gain.gain.setValueAtTime(0.3, t + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.14);
          osc.connect(gain);
          gain.connect(this.effectsGain);
          osc.start(t + delay);
          osc.stop(t + delay + 0.15);
        };
        bark(0);
        bark(0.14);
        break;
      }
      case 'cat': {
        // "Meow~": sweep upwards, then back down
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350, t);
        osc.frequency.linearRampToValueAtTime(550, t + 0.15);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.4);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        
        osc.connect(gain);
        gain.connect(this.effectsGain);
        osc.start(t);
        osc.stop(t + 0.41);
        break;
      }
      case 'cow': {
        // "Moo": Low modulated drone
        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, t);
        osc.frequency.linearRampToValueAtTime(75, t + 0.6);

        lfo.frequency.setValueAtTime(8, t); // 8 Hz vibrato
        lfoGain.gain.setValueAtTime(5, t);  // vibrato depth

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        // Filter out harsh high-end of sawtooth
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.1);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.75);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.effectsGain);

        lfo.start(t);
        osc.start(t);
        lfo.stop(t + 0.76);
        osc.stop(t + 0.76);
        break;
      }
      case 'elephant': {
        // "Trumpet!": High modulated screech
        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(450, t + 0.15);
        osc.frequency.linearRampToValueAtTime(350, t + 0.5);

        lfo.frequency.setValueAtTime(28, t); // Fast tremolo/vibrato
        lfoGain.gain.setValueAtTime(60, t);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, t);
        filter.Q.setValueAtTime(1, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.55);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.effectsGain);

        lfo.start(t);
        osc.start(t);
        lfo.stop(t + 0.56);
        osc.stop(t + 0.56);
        break;
      }
      case 'duck': {
        // "Quack!": short nasal buzz
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, t);
        osc.frequency.linearRampToValueAtTime(200, t + 0.15);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, t);
        filter.frequency.exponentialRampToValueAtTime(800, t + 0.15);
        filter.Q.setValueAtTime(2, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.effectsGain);

        osc.start(t);
        osc.stop(t + 0.17);
        break;
      }
      case 'lion': {
        // "Roar": noise filter sweep + low growl
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.linearRampToValueAtTime(60, t + 0.5);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150, t);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.effectsGain);

        osc.start(t);
        osc.stop(t + 0.65);
        break;
      }
      case 'rabbit': {
        // "Squeak": tiny short high sine sweeps
        const squeak = (delay) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, t + delay);
          osc.frequency.exponentialRampToValueAtTime(1800, t + delay + 0.05);
          gain.gain.setValueAtTime(0.08, t + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.06);
          osc.connect(gain);
          gain.connect(this.effectsGain);
          osc.start(t + delay);
          osc.stop(t + delay + 0.07);
        };
        squeak(0);
        squeak(0.08);
        break;
      }
      case 'monkey': {
        // "Oo-oo-ah-ah!" squeaky pulses
        const playOo = (delay, freq) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t + delay);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + delay + 0.08);
          gain.gain.setValueAtTime(0.12, t + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.09);
          osc.connect(gain);
          gain.connect(this.effectsGain);
          osc.start(t + delay);
          osc.stop(t + delay + 0.1);
        };
        playOo(0, 400);
        playOo(0.12, 400);
        playOo(0.24, 600);
        playOo(0.36, 600);
        break;
      }
      case 'panda': {
        // Cute sneeze/snort
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.linearRampToValueAtTime(220, t + 0.08);
        
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

        osc.connect(gain);
        gain.connect(this.effectsGain);
        osc.start(t);
        osc.stop(t + 0.13);
        break;
      }
      default:
        this.playChime();
        break;
    }
  }

  // --- Background Music Procedural Playlists ---

  startMusic(playlist) {
    this.ensureContext();
    if (!this.ctx) return;

    this.stopMusic();
    this.currentPlaylist = playlist;
    this.musicStep = 0;

    // Pentatonic scale degrees in C major (C4, D4, E4, G4, A4, C5, D5, E5, G5, A5)
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
    
    // Ambient Sleepy lullaby scale degrees (softer, lower notes)
    const sleepyScale = [196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

    let intervalMs = 400; // default tempo
    if (playlist === 'calm') intervalMs = 800;
    if (playlist === 'happy') intervalMs = 300;
    if (playlist === 'adventure') intervalMs = 250;
    if (playlist === 'sleepy') intervalMs = 1200;

    const playNextNote = () => {
      if (!this.ctx || this.isMuted) return;
      const t = this.ctx.currentTime;

      // Procedural note generator pattern mapping
      let freq = scale[0];
      let oscType = 'sine';
      let duration = 0.5;
      let gainVal = 0.05;

      switch (this.currentPlaylist) {
        case 'calm': {
          // Slow Music Box style (chimes on triangle wave)
          const melody = [5, 4, 2, 0, 7, 5, 2, 4];
          const index = melody[this.musicStep % melody.length];
          freq = scale[index];
          oscType = 'triangle';
          duration = 0.8;
          gainVal = 0.06;
          break;
        }
        case 'happy': {
          // Fast bouncy ukulele style (sine wave arpeggios, bouncing rhythms)
          const chords = [
            [0, 2, 4, 5], // C chord notes mapping
            [2, 4, 6, 7], // G chord notes mapping
            [4, 6, 7, 9], // Am chord notes mapping
            [1, 3, 5, 7]  // F chord notes mapping
          ];
          const chordIndex = Math.floor(this.musicStep / 8) % chords.length;
          const noteIndex = chords[chordIndex][this.musicStep % 4];
          freq = scale[noteIndex];
          oscType = 'sine';
          duration = 0.25;
          gainVal = 0.08;
          break;
        }
        case 'adventure': {
          // Playful orchestral chimes with rhythmic patterns
          const bassMelody = [0, 4, 3, 5, 1, 4, 2, 6];
          const leadMelody = [7, 8, 9, 8, 5, 7, 6, 5];
          if (this.musicStep % 4 === 0) {
            // Play a bass drum beats
            this.playProceduralDrum(t, 60, 0.12);
          }
          const index = this.musicStep % 8;
          freq = (this.musicStep % 2 === 0) ? scale[bassMelody[index]] : scale[leadMelody[index]];
          oscType = 'triangle';
          duration = 0.3;
          gainVal = 0.07;
          break;
        }
        case 'sleepy': {
          // Ambient pads & music box lullaby
          const sleepyMelody = [2, 4, 3, 1, 0, 2, 1, 0];
          const index = sleepyMelody[this.musicStep % sleepyMelody.length];
          freq = sleepyScale[index];
          oscType = 'sine';
          duration = 2.0; // Long release
          gainVal = 0.04;
          break;
        }
      }

      // Play the selected note
      const oscNode = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      oscNode.type = oscType;
      oscNode.frequency.setValueAtTime(freq, t);

      // Volume envelope fades in slightly then falls off
      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.linearRampToValueAtTime(gainVal, t + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      oscNode.connect(gainNode);
      gainNode.connect(this.musicGain);

      oscNode.start(t);
      oscNode.stop(t + duration + 0.1);

      // Music box overtone for Calm
      if (this.currentPlaylist === 'calm' && Math.random() > 0.5) {
        const oscOvertone = this.ctx.createOscillator();
        const gainOvertone = this.ctx.createGain();
        oscOvertone.type = 'sine';
        oscOvertone.frequency.setValueAtTime(freq * 2.01, t);
        gainOvertone.gain.setValueAtTime(0, t);
        gainOvertone.gain.linearRampToValueAtTime(gainVal * 0.4, t + 0.02);
        gainOvertone.gain.exponentialRampToValueAtTime(0.0001, t + duration * 0.6);
        oscOvertone.connect(gainOvertone);
        gainOvertone.connect(this.musicGain);
        oscOvertone.start(t);
        oscOvertone.stop(t + duration + 0.1);
      }

      this.musicStep++;
    };

    // Run the scheduler interval
    this.musicInterval = setInterval(playNextNote, intervalMs);
  }

  playProceduralDrum(time, startFreq, duration) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + duration);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration + 0.01);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.currentPlaylist = null;
  }
}

// Singleton pattern export
export const audio = new SoundEngine();
