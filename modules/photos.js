// modules/photos.js

class PhotoEngine {
  constructor() {
    this.photos = [];
    this.queue = [];
    this.fallbackIcons = [
      { emoji: '🧸', bg: '#ff75a0', label: 'Teddy Bear' },
      { emoji: '🦖', bg: '#6decb9', label: 'Dino' },
      { emoji: '🦄', bg: '#c996ff', label: 'Unicorn' },
      { emoji: '🚀', bg: '#4da6ff', label: 'Rocket' },
      { emoji: '🚗', bg: '#ffaa4d', label: 'Car' },
      { emoji: '🐠', bg: '#4dd2ff', label: 'Fish' },
      { emoji: '🍦', bg: '#ff85e3', label: 'Ice Cream' },
      { emoji: '🌻', bg: '#ffd633', label: 'Sunflower' },
      { emoji: '🌈', bg: '#ff96d5', label: 'Rainbow' },
      { emoji: '🎈', bg: '#ff6666', label: 'Balloon' },
      { emoji: '🐼', bg: '#e6e6e6', label: 'Panda' },
      { emoji: '🐰', bg: '#f9d2e2', label: 'Bunny' },
      { emoji: '🐶', bg: '#dfc0a5', label: 'Puppy' },
      { emoji: '🐱', bg: '#ffe596', label: 'Kitten' },
      { emoji: '🦁', bg: '#ffd280', label: 'Lion' },
      { emoji: '🍎', bg: '#ff6c5c', label: 'Apple' }
    ];
  }

  async loadPhotos() {
    try {
      const response = await fetch('./photos/photos.json');
      if (response.ok) {
        const files = await response.json();
        if (Array.isArray(files) && files.length > 0) {
          // Prepend the path to the photo files
          this.photos = files.map(file => `photos/${file}`);
          console.log(`Loaded ${this.photos.length} personal photos successfully.`);
        } else {
          this.loadFallbacks();
        }
      } else {
        this.loadFallbacks();
      }
    } catch (e) {
      console.warn("Failed to fetch photos.json, using vector emoji fallbacks.", e);
      this.loadFallbacks();
    }
    this.refillQueue();
  }

  loadFallbacks() {
    // We convert fallback icons to inline SVGs so they behave like images!
    this.photos = this.fallbackIcons.map(icon => this.createSvgDataUri(icon.emoji, icon.bg));
    console.log(`Initialized ${this.photos.length} visual fallback objects.`);
  }

  createSvgDataUri(emoji, bg) {
    // Generate a beautiful circular card with a centered emoji
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <defs>
        <radialGradient id="grad-${emoji.codePointAt(0)}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${bg}" stop-opacity="1" />
          <stop offset="100%" stop-color="${this.adjustColor(bg, -20)}" stop-opacity="1" />
        </radialGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#grad-${emoji.codePointAt(0)})" stroke="#ffffff" stroke-width="4" filter="url(#shadow)" />
      <text x="50%" y="54%" font-family="system-ui, sans-serif" font-size="44" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // Helper to adjust color hex value for gradients
  adjustColor(hex, percent) {
    let num = parseInt(hex.replace("#",""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = (num >> 8 & 0x00FF) + amt,
    B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<0?0:R:255)*0x10000 + (G<255?G<0?0:G:255)*0x100 + (B<255?B<0?0:B:255)).toString(16).slice(1);
  }

  refillQueue() {
    this.queue = [...this.photos];
    // Fisher-Yates Shuffle
    for (let i = this.queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
    }
  }

  getNextPhoto() {
    if (this.queue.length === 0) {
      this.refillQueue();
    }
    // Just in case photos list was completely empty
    if (this.queue.length === 0) {
      return this.createSvgDataUri('🌟', '#ffd700');
    }
    return this.queue.pop();
  }

  /**
   * Helper to create a premium photo container node with interactive animations.
   * @param {number} size - width/height in px
   * @returns {HTMLElement}
   */
  createPhotoNode(size = 120) {
    const wrapper = document.createElement('div');
    wrapper.className = 'sensory-photo-container';
    wrapper.style.width = `${size}px`;
    wrapper.style.height = `${size}px`;
    wrapper.style.borderRadius = '50%';
    wrapper.style.overflow = 'hidden';
    wrapper.style.border = '5px solid #ffffff';
    wrapper.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
    wrapper.style.background = '#ffffff';
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'center';
    wrapper.style.alignItems = 'center';
    wrapper.style.userSelect = 'none';
    wrapper.style.pointerEvents = 'auto';

    const img = document.createElement('img');
    img.src = this.getNextPhoto();
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.userSelect = 'none';
    img.draggable = false;

    // Soft loading fade
    img.style.opacity = '0';
    img.onload = () => {
      img.style.transition = 'opacity 0.3s ease';
      img.style.opacity = '1';
    };

    wrapper.appendChild(img);
    return wrapper;
  }
}

export const photos = new PhotoEngine();
