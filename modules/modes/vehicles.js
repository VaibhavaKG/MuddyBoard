// modules/modes/vehicles.js
import { audio } from '../audio.js';
import { animations } from '../animations.js';

export class VehicleWorld {
  constructor() {
    this.container = null;
    this.activeVehicles = [];
    this.spawnInterval = null;
    this.maxVehicles = 6;
    this.interactionCallback = null;

    this.vehicles = [
      { emoji: '✈️', name: 'airplane', lane: 'sky', size: 90 },
      { emoji: '🚁', name: 'helicopter', lane: 'sky', size: 85 },
      { emoji: '🚒', name: 'fire-truck', lane: 'road', size: 100 },
      { emoji: '🏎️', name: 'race-car', lane: 'road', size: 95 },
      { emoji: '🚜', name: 'excavator', lane: 'road', size: 95 },
      { emoji: '🚂', name: 'train', lane: 'track', size: 105 }
    ];
  }

  init(containerEl, onInteraction) {
    this.container = containerEl;
    this.interactionCallback = onInteraction;
    this.activeVehicles = [];

    this.container.innerHTML = '';
    this.container.className = 'sensory-world vehicle-world';

    // Spawn lane backdrops for visual richness
    const skyLane = document.createElement('div');
    skyLane.className = 'vehicle-lane lane-sky';
    skyLane.style.height = '33%';

    const roadLane = document.createElement('div');
    roadLane.className = 'vehicle-lane lane-road';
    roadLane.style.height = '34%';

    const trackLane = document.createElement('div');
    trackLane.className = 'vehicle-lane lane-track';
    trackLane.style.height = '33%';

    this.container.appendChild(skyLane);
    this.container.appendChild(roadLane);
    this.container.appendChild(trackLane);

    // Periodically spawn vehicles
    this.spawnInterval = setInterval(() => {
      if (this.activeVehicles.length < this.maxVehicles) {
        this.spawnVehicle();
      }
    }, 2000);

    // Initial batch
    for (let i = 0; i < 3; i++) {
      this.spawnVehicle(true);
    }
  }

  spawnVehicle(randomizeX = false) {
    if (!this.container) return;

    const data = this.vehicles[Math.floor(Math.random() * this.vehicles.length)];
    const direction = Math.random() > 0.5 ? 1 : -1; // 1: left-to-right, -1: right-to-left
    const size = data.size;

    const startX = direction === 1
      ? (randomizeX ? Math.random() * window.innerWidth : -size - 50)
      : (randomizeX ? Math.random() * window.innerWidth : window.innerWidth + size + 50);

    // Determine Y coordinate based on designated lane
    let startY = 50;
    if (data.lane === 'sky') {
      startY = 30 + Math.random() * (window.innerHeight * 0.22);
    } else if (data.lane === 'road') {
      startY = window.innerHeight * 0.33 + 20 + Math.random() * (window.innerHeight * 0.18);
    } else if (data.lane === 'track') {
      startY = window.innerHeight * 0.66 + 30;
    }

    const el = document.createElement('div');
    el.className = 'vehicle-object';
    el.innerText = data.emoji;
    el.style.fontSize = `${size}px`;
    el.style.position = 'absolute';
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.zIndex = '6';
    el.style.cursor = 'pointer';

    // Flip emojis physically if traveling left
    if (direction === -1) {
      el.style.transform = 'scaleX(-1)';
    }

    this.container.appendChild(el);

    const speed = 1.5 + Math.random() * 2.0;
    const vehicleData = {
      el: el,
      type: data.name,
      lane: data.lane,
      x: startX,
      y: startY,
      size: size,
      direction: direction,
      speed: speed,
      isAccelerating: false,
      alive: true
    };

    this.activeVehicles.push(vehicleData);

    // Click/Touch interaction
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.interactWithVehicle(vehicleData, e.clientX, e.clientY);
    });

    // Drive loop
    const drive = () => {
      if (!vehicleData.alive || !this.container) return;

      const currentSpeed = vehicleData.isAccelerating ? vehicleData.speed * 4.0 : vehicleData.speed;
      vehicleData.x += vehicleData.direction * currentSpeed;

      el.style.left = `${vehicleData.x}px`;
      
      // Floating/weaving bobbing for sky vehicles
      if (vehicleData.lane === 'sky') {
        const bobY = Math.sin(vehicleData.x * 0.02) * 4;
        el.style.transform = `${vehicleData.direction === -1 ? 'scaleX(-1)' : ''} translate3d(0, ${bobY}px, 0)`;
      }

      // Exhaust clouds when speeding up
      if (vehicleData.isAccelerating && Math.random() < 0.35) {
        const exhaustX = vehicleData.direction === 1 ? vehicleData.x : vehicleData.x + size;
        animations.playCloudFloat(exhaustX, vehicleData.y + size * 0.7);
      }

      // Out of bounds check
      const outLeft = vehicleData.direction === -1 && vehicleData.x < -size - 100;
      const outRight = vehicleData.direction === 1 && vehicleData.x > window.innerWidth + size + 100;

      if (outLeft || outRight) {
        this.removeVehicle(vehicleData);
      } else {
        requestAnimationFrame(drive);
      }
    };

    requestAnimationFrame(drive);
  }

  interactWithVehicle(vehicle, clickX, clickY) {
    if (vehicle.isAccelerating) return;
    vehicle.isAccelerating = true;

    // 1. Play vehicle synthesized sound effects
    this.playVehicleSound(vehicle.type);

    // 2. Sparkles explosion
    animations.playSparkleBurst(clickX, clickY);
    animations.playGlowRings(clickX, clickY);

    // 3. Shake/Wiggle animation
    vehicle.el.classList.add('rumble-active');

    if (this.interactionCallback) {
      this.interactionCallback();
    }

    setTimeout(() => {
      if (vehicle.alive) {
        vehicle.isAccelerating = false;
        vehicle.el.classList.remove('rumble-active');
      }
    }, 1500);
  }

  playVehicleSound(type) {
    if (!audio.ctx) return;
    const t = audio.ctx.currentTime;

    switch (type) {
      case 'fire-truck': {
        // Siren sound: oscillating pitches
        const osc = audio.ctx.createOscillator();
        const gain = audio.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.linearRampToValueAtTime(700, t + 0.3);
        osc.frequency.linearRampToValueAtTime(400, t + 0.6);
        osc.frequency.linearRampToValueAtTime(700, t + 0.9);
        osc.frequency.linearRampToValueAtTime(400, t + 1.2);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.3);

        osc.connect(gain);
        gain.connect(audio.effectsGain);
        osc.start(t);
        osc.stop(t + 1.35);
        break;
      }
      case 'race-car': {
        // Engine rev: sweep upward rapidly
        const osc = audio.ctx.createOscillator();
        const gain = audio.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.5);
        osc.frequency.linearRampToValueAtTime(200, t + 0.9);

        const filter = audio.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audio.effectsGain);
        osc.start(t);
        osc.stop(t + 0.95);
        break;
      }
      case 'train': {
        // Choo choo train whistle
        const whistle = (delay) => {
          const osc1 = audio.ctx.createOscillator();
          const osc2 = audio.ctx.createOscillator();
          const gain = audio.ctx.createGain();
          
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(587.33, t + delay); // D5
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(698.46, t + delay); // F5 (nice whistle chord)

          gain.gain.setValueAtTime(0.12, t + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.35);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(audio.effectsGain);
          
          osc1.start(t + delay);
          osc2.start(t + delay);
          osc1.stop(t + delay + 0.4);
          osc2.stop(t + delay + 0.4);
        };
        whistle(0);
        whistle(0.4);
        break;
      }
      case 'helicopter': {
        // Rotor blades whop whop
        audio.playDrum();
        setTimeout(() => audio.playDrum(), 150);
        setTimeout(() => audio.playDrum(), 300);
        setTimeout(() => audio.playDrum(), 450);
        break;
      }
      case 'excavator': {
        // Honk honk
        const honk = (delay) => {
          const osc = audio.ctx.createOscillator();
          const gain = audio.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, t + delay);
          
          const filter = audio.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(350, t + delay);

          gain.gain.setValueAtTime(0.25, t + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.2);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(audio.effectsGain);
          
          osc.start(t + delay);
          osc.stop(t + delay + 0.22);
        };
        honk(0);
        honk(0.25);
        break;
      }
      default:
        audio.playChime();
    }
  }

  removeVehicle(vehicle) {
    vehicle.alive = false;
    vehicle.el.remove();
    this.activeVehicles = this.activeVehicles.filter(v => v !== vehicle);
  }

  handleInteraction(x, y) {
    // Tap blank background spawns simple exhaust clouds
    if (!this.container) return;
    animations.playCloudFloat(x, y);
    audio.playPop();
  }

  handleKeyDown(key) {
    if (!this.container) return;

    if (this.activeVehicles.length > 0) {
      const randVeh = this.activeVehicles[Math.floor(Math.random() * this.activeVehicles.length)];
      const rect = randVeh.el.getBoundingClientRect();
      this.interactWithVehicle(randVeh, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    const keyVeh = document.createElement('div');
    keyVeh.className = 'keyboard-vehicle';
    keyVeh.style.position = 'absolute';
    keyVeh.style.display = 'flex';
    keyVeh.style.alignItems = 'center';
    keyVeh.style.gap = '5px';
    keyVeh.style.zIndex = '7';
    keyVeh.style.cursor = 'pointer';

    const emojis = ['🚗', '🚙', '🚌', '🏎️', '🚓', '🚑', '🚒'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    const emojiEl = document.createElement('span');
    emojiEl.innerText = emoji;
    emojiEl.style.fontSize = '80px';

    const cargoEl = document.createElement('span');
    cargoEl.innerText = key.toUpperCase();
    cargoEl.style.background = '#ff4d94';
    cargoEl.style.color = '#ffffff';
    cargoEl.style.fontFamily = "'Nunito', sans-serif";
    cargoEl.style.fontWeight = '900';
    cargoEl.style.fontSize = '28px';
    cargoEl.style.padding = '8px 14px';
    cargoEl.style.borderRadius = '12px';
    cargoEl.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    cargoEl.style.border = '2px solid #ffffff';

    const direction = Math.random() > 0.5 ? 1 : -1;
    if (direction === 1) {
      keyVeh.appendChild(emojiEl);
      keyVeh.appendChild(cargoEl);
    } else {
      keyVeh.appendChild(cargoEl);
      keyVeh.appendChild(emojiEl);
      emojiEl.style.transform = 'scaleX(-1)';
    }

    const startX = direction === 1 ? -150 : window.innerWidth + 150;
    const startY = window.innerHeight * 0.33 + 50 + Math.random() * 50;

    keyVeh.style.left = `${startX}px`;
    keyVeh.style.top = `${startY}px`;

    this.container.appendChild(keyVeh);

    this.playVehicleSound('race-car');

    let currentX = startX;
    const speed = 4 + Math.random() * 3;
    let isAccelerating = false;

    const driveKeyVeh = () => {
      if (!keyVeh.parentNode || !this.container) return;
      currentX += direction * (isAccelerating ? speed * 2 : speed);
      keyVeh.style.left = `${currentX}px`;

      if (isAccelerating && Math.random() < 0.35) {
        animations.playCloudFloat(direction === 1 ? currentX : currentX + 100, startY + 50);
      }

      const outLeft = direction === -1 && currentX < -200;
      const outRight = direction === 1 && currentX > window.innerWidth + 200;

      if (outLeft || outRight) {
        keyVeh.remove();
      } else {
        requestAnimationFrame(driveKeyVeh);
      }
    };

    keyVeh.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      isAccelerating = true;
      audio.playChime();
      animations.playSparkleBurst(e.clientX || currentX + 60, e.clientY || startY + 40);
      setTimeout(() => {
        isAccelerating = false;
      }, 1000);
    });

    requestAnimationFrame(driveKeyVeh);
  }

  cleanup() {
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
    this.activeVehicles.forEach(v => {
      v.alive = false;
      v.el.remove();
    });
    this.activeVehicles = [];
    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = 'sensory-world';
    }
  }
}
