// modules/modes/puzzle.js
import { audio } from "../audio.js";
import { animations } from "../animations.js";
import { photos } from "../photos.js";

export class PhotoPuzzle {
  constructor() {
    this.container = null;
    this.interactionCallback = null;

    this.difficulty = 4; // 2, 4, or 6 pieces
    this.currentPhoto = "";
    this.pieces = [];
    this.slots = [];

    this.puzzleCompleted = false;
    this.autoSolveTimer = null;
    this.boardEl = null;

    // Difficulty selector buttons
    this.diffBar = null;
  }

  init(containerEl, onInteraction) {
    this.container = containerEl;
    this.interactionCallback = onInteraction;
    this.pieces = [];
    this.slots = [];
    this.puzzleCompleted = false;

    this.container.innerHTML = "";
    this.container.className = "sensory-world puzzle-world";

    // Start with default difficulty
    this.difficulty = 4;

    // 2. Load the puzzle
    this.startNewPuzzle();
  }

  startNewPuzzle() {
    // Cleanup previous puzzle nodes if any
    if (this.boardEl) this.boardEl.remove();
    this.resetAutoSolveTimer();

    this.puzzleCompleted = false;
    this.pieces = [];
    this.slots = [];

    // Get a fresh photo
    this.currentPhoto = photos.getNextPhoto();

    // Create puzzle board
    this.boardEl = document.createElement("div");
    this.boardEl.className = "puzzle-board";
    this.container.appendChild(this.boardEl);

    // Set grid columns and rows based on difficulty
    let cols = 2,
      rows = 1; // 2 pieces
    if (this.difficulty === 4) {
      cols = 2;
      rows = 2;
    } else if (this.difficulty === 6) {
      cols = 3;
      rows = 2;
    }

    const boardWidth = 400;
    const boardHeight = 300;

    // 1. Create Slot Targets
    const targetBoard = document.createElement("div");
    targetBoard.className = "puzzle-targets-board";
    targetBoard.style.width = `${boardWidth}px`;
    targetBoard.style.height = `${boardHeight}px`;
    targetBoard.style.display = "grid";
    targetBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    targetBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    this.boardEl.appendChild(targetBoard);

    const pieceWidth = boardWidth / cols;
    const pieceHeight = boardHeight / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Create target slot
        const slot = document.createElement("div");
        slot.className = "puzzle-slot-target";
        slot.style.border = "2px dashed rgba(255, 255, 255, 0.4)";
        slot.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
        targetBoard.appendChild(slot);

        const slotRect = slot.getBoundingClientRect();

        // Save target coords relative to board
        this.slots.push({
          row: r,
          col: c,
          el: slot,
          filled: false,
        });

        // 2. Create draggable Piece
        const piece = document.createElement("div");
        piece.className = "puzzle-piece";
        piece.style.width = `${pieceWidth}px`;
        piece.style.height = `${pieceHeight}px`;
        piece.style.backgroundImage = `url(${this.currentPhoto})`;
        piece.style.backgroundSize = `${boardWidth}px ${boardHeight}px`;

        // Calculate background position offset
        const bgX = -c * pieceWidth;
        const bgY = -r * pieceHeight;
        piece.style.backgroundPosition = `${bgX}px ${bgY}px`;
        piece.style.borderRadius = "6px";
        piece.style.boxShadow = "0 6px 12px rgba(0,0,0,0.3)";

        // Position piece randomly around the board
        const randomX = Math.random() * (window.innerWidth - pieceWidth - 100);
        // Put pieces in a container at the side/bottom
        const randomY =
          Math.random() * (window.innerHeight - pieceHeight - 150) + 50;

        piece.style.position = "absolute";
        piece.style.left = `${randomX}px`;
        piece.style.top = `${randomY}px`;
        piece.style.zIndex = "6";

        this.container.appendChild(piece);

        const pieceData = {
          el: piece,
          row: r,
          col: c,
          targetSlot: slot,
          width: pieceWidth,
          height: pieceHeight,
          solved: false,
        };

        this.pieces.push(pieceData);

        // Setup drag events
        this.setupPieceDrag(pieceData);
      }
    }

    // Start auto solve assistance countdown
    this.scheduleAutoSolve();
  }

  setupPieceDrag(piece) {
    let active = false;
    let startX = 0,
      startY = 0;
    let originalLeft = 0,
      originalTop = 0;

    const dragStart = (e) => {
      if (piece.solved || this.puzzleCompleted) return;
      active = true;
      piece.el.style.zIndex = "7"; // Bring to top
      piece.el.classList.add("dragging");

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      startX = clientX;
      startY = clientY;

      originalLeft = parseFloat(piece.el.style.left);
      originalTop = parseFloat(piece.el.style.top);

      audio.playPop();
      this.resetAutoSolveTimer();
    };

    const dragMove = (e) => {
      if (!active) return;

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      const dx = clientX - startX;
      const dy = clientY - startY;

      piece.el.style.left = `${originalLeft + dx}px`;
      piece.el.style.top = `${originalTop + dy}px`;

      // Sparkle trails
      if (Math.random() < 0.2) {
        animations.playMagicDustTrail(clientX, clientY);
      }
    };

    const dragEnd = () => {
      if (!active) return;
      active = false;
      piece.el.classList.remove("dragging");
      piece.el.style.zIndex = "6";

      // Verify snapping distance (within 50px of target slot center)
      const pieceRect = piece.el.getBoundingClientRect();
      const targetRect = piece.targetSlot.getBoundingClientRect();

      const px = pieceRect.left + pieceRect.width / 2;
      const py = pieceRect.top + pieceRect.height / 2;
      const tx = targetRect.left + targetRect.width / 2;
      const ty = targetRect.top + targetRect.height / 2;

      const dist = Math.hypot(tx - px, ty - py);

      if (dist < 60) {
        // Snap!
        this.snapPieceToTarget(piece, targetRect);
      } else {
        // Play bounce back chime/wobble
        audio.playDrum();
      }

      this.scheduleAutoSolve();
    };

    piece.el.addEventListener("pointerdown", dragStart);
    piece.el.addEventListener("pointermove", dragMove);
    piece.el.addEventListener("pointerup", dragEnd);
    piece.el.addEventListener("pointercancel", dragEnd);
  }

  snapPieceToTarget(piece, targetRect) {
    piece.solved = true;
    piece.el.style.zIndex = "5";
    piece.el.classList.add("snapped");

    // absolute positioning matching the slot bounding box
    const containerRect = this.container.getBoundingClientRect();
    const snapX = targetRect.left - containerRect.left;
    const snapY = targetRect.top - containerRect.top;

    piece.el.style.left = `${snapX}px`;
    piece.el.style.top = `${snapY}px`;
    piece.el.style.boxShadow = "none";

    audio.playChime();

    // Sparkle reward at snap point
    animations.playSparkleBurst(
      targetRect.left + targetRect.width / 2,
      targetRect.top + targetRect.height / 2,
    );

    if (this.interactionCallback) {
      this.interactionCallback();
    }

    // Verify if puzzle is fully solved
    const allSolved = this.pieces.every((p) => p.solved);
    if (allSolved) {
      this.completePuzzle();
    }
  }

  completePuzzle() {
    this.puzzleCompleted = true;
    this.resetAutoSolveTimer();

    // Reward celebration
    audio.playCelebration();

    const boardRect = this.boardEl.getBoundingClientRect();
    animations.playConfettiRain(
      boardRect.left + boardRect.width / 2,
      boardRect.top + boardRect.height / 2,
    );
    animations.playHeartExplosion(
      boardRect.left + boardRect.width / 2,
      boardRect.top + boardRect.height / 2,
    );

    // Flash grid borders away to reveal the solid unified photo
    this.pieces.forEach((p) => {
      p.el.style.border = "none";
      p.el.style.boxShadow = "0 8px 20px rgba(0,0,0,0.25)";
      p.el.style.transform = "scale(1.05)";
    });

    // Cycle difficulty for continuous engagement variety
    if (this.difficulty === 2) this.difficulty = 4;
    else if (this.difficulty === 4) this.difficulty = 6;
    else this.difficulty = 2;

    // Auto-advance to next puzzle in 3.5s
    setTimeout(() => {
      if (this.container && this.puzzleCompleted) {
        this.pieces.forEach((p) => p.el.remove());
        this.startNewPuzzle();
      }
    }, 3500);
  }

  scheduleAutoSolve() {
    this.resetAutoSolveTimer();
    // Auto-complete assistance triggers after 25s of inactivity
    this.autoSolveTimer = setTimeout(() => {
      this.provideSolveAssistance();
    }, 25000);
  }

  provideSolveAssistance() {
    // Find the first unsolved piece
    const unsolvedPiece = this.pieces.find((p) => !p.solved);
    if (!unsolvedPiece) return;

    const targetRect = unsolvedPiece.targetSlot.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    const startX = parseFloat(unsolvedPiece.el.style.left);
    const startY = parseFloat(unsolvedPiece.el.style.top);

    const endX = targetRect.left - containerRect.left;
    const endY = targetRect.top - containerRect.top;

    // Slide/animate piece to target position smoothly
    let progress = 0;
    const duration = 40; // frames

    const slide = () => {
      if (!this.container || unsolvedPiece.solved) return;
      progress++;
      const ratio = progress / duration;
      // Ease out cubic
      const ease = 1 - Math.pow(1 - ratio, 3);

      const curX = startX + (endX - startX) * ease;
      const curY = startY + (endY - startY) * ease;

      unsolvedPiece.el.style.left = `${curX}px`;
      unsolvedPiece.el.style.top = `${curY}px`;

      // Sparkles follow piece slide
      if (progress % 4 === 0) {
        animations.playMagicDustTrail(
          curX + unsolvedPiece.width / 2,
          curY + unsolvedPiece.height / 2,
        );
      }

      if (progress < duration) {
        requestAnimationFrame(slide);
      } else {
        this.snapPieceToTarget(unsolvedPiece, targetRect);
      }
    };

    requestAnimationFrame(slide);
  }

  resetAutoSolveTimer() {
    if (this.autoSolveTimer) {
      clearTimeout(this.autoSolveTimer);
      this.autoSolveTimer = null;
    }
  }

  handleInteraction() {
    this.resetAutoSolveTimer();
    this.scheduleAutoSolve();
  }

  cleanup() {
    this.resetAutoSolveTimer();
    if (this.boardEl) this.boardEl.remove();
    if (this.diffBar) this.diffBar.remove();
    this.pieces.forEach((p) => p.el.remove());
    this.pieces = [];
    if (this.container) {
      this.container.innerHTML = "";
      this.container.className = "sensory-world";
    }
  }
}
