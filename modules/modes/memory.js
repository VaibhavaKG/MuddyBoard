// modules/modes/memory.js
import { audio } from "../audio.js";
import { animations } from "../animations.js";
import { photos } from "../photos.js";

export class MemoryMatch {
  constructor() {
    this.container = null;
    this.interactionCallback = null;
    this.gridSize = 4; // 4 cards (2 pairs) or 6 cards (3 pairs)
    this.cards = [];
    this.flippedCards = [];
    this.matchesFound = 0;
    this.gridEl = null;
    this.isChecking = false;

    this.gridSelector = null;
  }

  init(containerEl, onInteraction) {
    this.container = containerEl;
    this.interactionCallback = onInteraction;
    this.cards = [];
    this.flippedCards = [];
    this.matchesFound = 0;
    this.isChecking = false;

    this.container.innerHTML = "";
    this.container.className = "sensory-world memory-world";

    this.gridSize = 4;

    // 2. Setup Board
    this.startNewGame();
  }

  startNewGame() {
    if (this.gridEl) this.gridEl.remove();

    this.cards = [];
    this.flippedCards = [];
    this.matchesFound = 0;
    this.isChecking = false;

    // Pick photos needed for pairs
    const pairsCount = this.gridSize / 2;
    const selectedPhotos = [];

    for (let i = 0; i < pairsCount; i++) {
      selectedPhotos.push(photos.getNextPhoto());
    }

    // Duplicate list to make pairs
    const rawDeck = [...selectedPhotos, ...selectedPhotos];

    // Fisher-Yates Shuffle
    for (let i = rawDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rawDeck[i], rawDeck[j]] = [rawDeck[j], rawDeck[i]];
    }

    // Create Grid container
    this.gridEl = document.createElement("div");
    this.gridEl.className = "memory-grid";

    // Set responsive grid columns
    const cols = this.gridSize === 4 ? 2 : 3;
    this.gridEl.style.gridTemplateColumns = `repeat(${cols}, 140px)`;

    this.boardCenterWrapper = document.createElement("div");
    this.boardCenterWrapper.className = "memory-board-center";
    this.boardCenterWrapper.appendChild(this.gridEl);
    this.container.appendChild(this.boardCenterWrapper);

    // Render cards
    rawDeck.forEach((photoUrl, index) => {
      const cardContainer = document.createElement("div");
      cardContainer.className = "memory-card-container";

      cardContainer.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-face card-back">⭐</div>
          <div class="memory-card-face card-front">
            <img src="${photoUrl}" draggable="false" />
          </div>
        </div>
      `;

      this.gridEl.appendChild(cardContainer);

      const cardData = {
        el: cardContainer,
        photo: photoUrl,
        isFlipped: false,
        isMatched: false,
      };

      this.cards.push(cardData);

      // Event listener for card flips
      cardContainer.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.flipCard(cardData);
      });
    });
  }

  flipCard(card) {
    if (this.isChecking || card.isFlipped || card.isMatched) return;

    card.isFlipped = true;
    card.el.classList.add("flipped");
    audio.playPop();

    this.flippedCards.push(card);

    const rect = card.el.getBoundingClientRect();
    animations.playMagicDustTrail(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );

    if (this.flippedCards.length === 2) {
      this.isChecking = true;
      setTimeout(() => {
        this.checkMatch();
      }, 1000); // 1s reveal delay before evaluating
    }

    if (this.interactionCallback) {
      this.interactionCallback();
    }
  }

  checkMatch() {
    const [card1, card2] = this.flippedCards;

    const rect1 = card1.el.getBoundingClientRect();
    const rect2 = card2.el.getBoundingClientRect();
    const c1x = rect1.left + rect1.width / 2;
    const c1y = rect1.top + rect1.height / 2;
    const c2x = rect2.left + rect2.width / 2;
    const c2y = rect2.top + rect2.height / 2;

    if (card1.photo === card2.photo) {
      // It's a MATCH!
      card1.isMatched = true;
      card2.isMatched = true;
      card1.el.classList.add("matched");
      card2.el.classList.add("matched");

      // Sparkles and Chime rewards
      audio.playChime();
      animations.playSparkleBurst(c1x, c1y);
      animations.playSparkleBurst(c2x, c2y);
      animations.playHeartExplosion((c1x + c2x) / 2, (c1y + c2y) / 2);

      this.matchesFound++;

      if (this.matchesFound === this.gridSize / 2) {
        this.completeGame();
      }
    } else {
      // No match
      card1.isFlipped = false;
      card2.isFlipped = false;
      card1.el.classList.remove("flipped");
      card2.el.classList.remove("flipped");

      card1.el.classList.add("shake");
      card2.el.classList.add("shake");
      setTimeout(() => {
        card1.el.classList.remove("shake");
        card2.el.classList.remove("shake");
      }, 500);

      // Play minor buzzer error drum sound
      audio.playDrum();
    }

    this.flippedCards = [];
    this.isChecking = false;
  }

  completeGame() {
    // Reward full celebration
    audio.playCelebration();

    setTimeout(() => {
      const rect = this.gridEl.getBoundingClientRect();
      animations.playConfettiRain(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );
    }, 400);

    // Swap difficulty size continuously
    this.gridSize = this.gridSize === 4 ? 6 : 4;

    // Auto reset deck in 3.5s
    setTimeout(() => {
      if (this.container && this.matchesFound === this.gridSize / 2) {
        this.startNewGame();
      }
    }, 3500);
  }

  handleInteraction() {
    // nothing special needed on bg touch in memory game
  }

  cleanup() {
    if (this.gridEl) this.gridEl.remove();
    if (this.gridSelector) this.gridSelector.remove();
    this.cards.forEach((c) => c.el.remove());
    this.cards = [];
    if (this.container) {
      this.container.innerHTML = "";
      this.container.className = "sensory-world";
    }
  }
}
