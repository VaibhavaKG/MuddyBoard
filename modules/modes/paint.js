// modules/modes/paint.js
import { audio } from '../audio.js';
import { animations } from '../animations.js';

export class MagicPaint {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.brushType = 'rainbow'; // rainbow, sparkle, neon, star, heart
    this.hue = 0;
    this.fadeInterval = null;
    this.brushContainer = null;
    this.interactionCallback = null;
    
    this.brushes = [
      { id: 'rainbow', emoji: '🌈', name: 'Rainbow' },
      { id: 'sparkle', emoji: '✨', name: 'Sparkles' },
      { id: 'neon', emoji: '💡', name: 'Neon Glow' },
      { id: 'star', emoji: '⭐', name: 'Stars' },
      { id: 'heart', emoji: '❤️', name: 'Hearts' }
    ];
  }

  init(containerEl, onInteraction) {
    this.container = containerEl;
    this.interactionCallback = onInteraction;

    this.container.innerHTML = '';
    this.container.className = 'sensory-world paint-world';

    // 1. Create drawing Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'paint-canvas';
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '5';
    this.canvas.style.touchAction = 'none';
    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Set initial background for drawing canvas context
    this.clearCanvasWithThemeBg();

    // 2. Create Brush Control Bar at the bottom
    this.brushContainer = document.createElement('div');
    this.brushContainer.className = 'paint-brush-bar';
    this.brushContainer.style.zIndex = '8'; // below parent menu but clickable

    this.brushes.forEach(b => {
      const btn = document.createElement('button');
      btn.className = `brush-select-btn ${this.brushType === b.id ? 'active' : ''}`;
      btn.innerHTML = `<span class="brush-emoji">${b.emoji}</span>`;
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.selectBrush(b.id, btn);
      });
      this.brushContainer.appendChild(btn);
    });

    this.container.appendChild(this.brushContainer);

    // 3. Setup drawing listeners
    this.setupDrawingEvents();

    // 4. Slow canvas auto-clear loop (fades paint trails gradually)
    this.fadeInterval = setInterval(() => {
      this.fadeCanvasTrails();
    }, 1500);

    window.addEventListener('resize', this.handleResize.bind(this));
  }

  clearCanvasWithThemeBg() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.fillStyle = '#14142b'; // Dark background works best for neon paints!
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  selectBrush(type, buttonEl) {
    this.brushType = type;
    audio.playXylophone(600);
    
    const buttons = this.brushContainer.querySelectorAll('.brush-select-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    buttonEl.classList.add('active');

    // Mini animation reward
    const rect = buttonEl.getBoundingClientRect();
    animations.playSparkleBurst(rect.left + rect.width / 2, rect.top);
  }

  setupDrawingEvents() {
    const startDraw = (x, y) => {
      this.isDrawing = true;
      this.lastX = x;
      this.lastY = y;
      
      // Play start sound
      audio.playChime();

      // Trigger initial particle
      this.drawBrushStroke(x, y);
    };

    const drawMove = (x, y) => {
      if (!this.isDrawing) return;
      this.drawBrushStroke(x, y);
      this.lastX = x;
      this.lastY = y;
    };

    const stopDraw = () => {
      this.isDrawing = false;
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      startDraw(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      e.preventDefault();
      drawMove(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('pointerup', stopDraw);
    this.canvas.addEventListener('pointercancel', stopDraw);
    this.canvas.addEventListener('pointerleave', stopDraw);
  }

  drawBrushStroke(x, y) {
    if (!this.ctx) return;

    // Increment color hue loop
    this.hue = (this.hue + 2) % 360;
    
    this.ctx.beginPath();
    
    // Choose paint style
    switch (this.brushType) {
      case 'rainbow': {
        this.ctx.strokeStyle = `hsl(${this.hue}, 100%, 65%)`;
        this.ctx.lineWidth = 35;
        this.ctx.shadowBlur = 0;
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        break;
      }
      case 'sparkle': {
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 15;
        this.ctx.shadowBlur = 0;
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();

        // Emit visual sparkles along the trail
        if (Math.random() < 0.45) {
          animations.playSparkleBurst(x, y);
          audio.playSparkle();
        }
        break;
      }
      case 'neon': {
        const neonColor = `hsl(${this.hue}, 100%, 55%)`;
        this.ctx.strokeStyle = neonColor;
        this.ctx.lineWidth = 25;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = neonColor;
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        
        // Reset shadow for performance
        this.ctx.shadowBlur = 0;
        break;
      }
      case 'star': {
        // Draw star emojis along path
        if (Math.hypot(x - this.lastX, y - this.lastY) > 25) {
          animations.spawnDOMParticle(x, y, {
            text: '⭐',
            size: 20 + Math.random() * 20,
            speed: 1 + Math.random() * 2,
            gravity: 0.05,
            life: 30
          });
          audio.playXylophone(500 + Math.random() * 200);
        }
        break;
      }
      case 'heart': {
        if (Math.hypot(x - this.lastX, y - this.lastY) > 25) {
          animations.spawnDOMParticle(x, y, {
            text: Math.random() > 0.5 ? '💖' : '❤️',
            size: 20 + Math.random() * 20,
            speed: 1 + Math.random() * 2,
            gravity: 0.02,
            life: 35
          });
          audio.playBell();
        }
        break;
      }
    }

    if (Math.random() < 0.05 && this.interactionCallback) {
      this.interactionCallback();
    }
  }

  fadeCanvasTrails() {
    if (!this.ctx || !this.canvas) return;

    // Draws a highly transparent dark fill over drawing canvas,
    // creating a trailing fade-out effect for past brushstrokes.
    this.ctx.fillStyle = 'rgba(20, 20, 43, 0.06)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  handleResize() {
    if (!this.canvas || !this.ctx) return;
    
    // Save current canvas contents
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(this.canvas, 0, 0);

    // Resize main canvas
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Redraw contents
    this.clearCanvasWithThemeBg();
    this.ctx.drawImage(tempCanvas, 0, 0);
  }

  handleInteraction(x, y) {
    // If drawing event is triggered elsewhere, support it
    this.drawBrushStroke(x, y);
  }

  handleKeyDown(key) {
    if (!this.ctx || !this.canvas) return;

    const x = Math.random() * (this.canvas.width - 250) + 125;
    const y = Math.random() * (this.canvas.height - 250) + 125;

    audio.playSplash();

    this.hue = (this.hue + 25) % 360;
    const color = `hsl(${this.hue}, 100%, 65%)`;
    
    this.ctx.fillStyle = color;
    this.ctx.font = '900 130px Nunito, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    this.ctx.shadowBlur = 35;
    this.ctx.shadowColor = color;
    
    this.ctx.fillText(key.toUpperCase(), x, y);
    
    this.ctx.shadowBlur = 0;

    for (let i = 0; i < 6; i++) {
      animations.spawnDOMParticle(x, y, {
        text: key,
        size: 20 + Math.random() * 20,
        speed: 2 + Math.random() * 4,
        gravity: 0.05,
        life: 40 + Math.random() * 20
      });
    }
    animations.playSparkleBurst(x, y);

    if (this.interactionCallback) {
      this.interactionCallback();
    }
  }

  cleanup() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    window.removeEventListener('resize', this.handleResize);
    
    if (this.canvas) this.canvas.remove();
    if (this.brushContainer) this.brushContainer.remove();
    
    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = 'sensory-world';
    }
  }
}
