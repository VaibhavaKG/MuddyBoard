# MuddyBoard 🌟 Toddler Sensory Playground

A premium-quality interactive sensory playground built entirely in HTML, CSS, and vanilla ES modules. Designed specifically for toddlers aged 1–4, it runs offline, requires no backend database or login, and is completely free of advertisements.

---

## 🚀 Key Features

* **11 Immersive Play Worlds**: Bubble Pop World, Animal World, Magic Paint, Music Playground, Fireworks World, Ocean World, Space World, Vehicle World, Photo Puzzle, Memory Match, and slideshow.
* **Balanced Personalized Photo Engine**: Floating photo bubbles, balloons, slides, memory cards, and celebrations showing custom images from a local folder.
* **Zero Harsh Sounds**: Procedural Web Audio API sound synthesizer engine mimics instruments, bells, bubbles, chimes, and animal noises softly.
* **Interactive Mascots & Surprises**: Spontaneous waves, dances, flying unicorns, marching balloon parades, and fairy dust trails.
* **Math-Secured Parent Panel**: Customize play modes, volume levels, child lock toggles, celebration frequency, visual themes, and screensaver inactivity times.
* **PWA (Progressive Web App)**: Installable directly onto Android/iOS tablets or phones and plays fully offline.

---

## 📁 Project Structure

```text
MuddyBoard/
│
├── photos/                  ← Drop JPG/PNG photos here
│   ├── photos.json          ← Shuffled photo manifest
│   └── (user photos)
│
├── assets/                  ← App icons
│   ├── icon-192.png
│   └── icon-512.png
│
├── modules/                 ← Core ES classes
│   ├── audio.js             ← Web Audio synthesizer & playlists
│   ├── photos.js            ← Photo balance & fallback selector
│   ├── animations.js        ← 100+ combined particle visual effects
│   ├── parent.js            ← Math quiz & setting panel logic
│   ├── celebrations.js      ← Special celebration triggers
│   ├── surprises.js         ← Twinkling shooting star overlays
│   ├── themes.js            ← CSS Variable manager (10 themes)
│   └── modes/               ← Independent play world modules
│
├── index.html               ← SPA Shell
├── style.css                ← Layout & CSS keyframe engine
├── script.js                ← Main lifecycle orchestrator
├── manifest.json            ← PWA configurations
├── service-worker.js        ← Offline cache-first sw
├── generate-photos.ps1      ← PowerShell image manifest updates
└── README.md
```

---

## 📸 How to Load Custom Photos

The web browser cannot automatically read local filesystem directories for privacy security. Follow these steps to register your photos:

1. Create a folder named `photos` (if not already present).
2. Paste your toddler's photos (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`) into the `photos/` folder (supports up to 50 photos).
3. **Update the Manifest**:
   - **Windows**: Right-click `generate-photos.ps1` and select **Run with PowerShell**.
   - This automatically creates/updates `photos/photos.json` with a list of your files.
4. Refresh or reload MuddyBoard in your browser. The app will immediately integrate your images into bubbles, balloons, confetti, puzzles, memory match, and slideshows!

> [!TIP]
> **No Custom Photos? No Problem!**
> If no photos are added or `photos.json` is empty, MuddyBoard automatically displays a set of 16 beautifully designed high-contrast vector animal/toy emoji cards as placeholders.

---

## 🔒 Accessing Parent Settings

To prevent toddlers from escaping the play modes or changing settings:

1. **Long-press** the top-left corner of the screen for **5 seconds**.
2. A verification card will slide in showing a simple math quiz (e.g., `8 + 9 = ?`).
3. Solve the quiz to unlock the parent settings panel.
4. **Settings Available**:
   - Toggle play modes directly.
   - Adjust master volume.
   - Turn background music on/off or change playlist (*Calm*, *Happy*, *Adventure*, *Sleepy*).
   - Set screensaver inactivity timer (slideshow triggers automatically).
   - Adjust celebration frequency (from 10 to 50 clicks).
   - **Child Lock**: When enabled, the bottom nav bar slides off-screen, preventing accidental mode switches.
   - Choose a theme or toggle *Auto-Rotate Themes* (changes theme color palettes every 5 minutes).

---

## 🚀 How to Run Locally

Because the application uses modern JavaScript ES Modules, web browsers block them from executing when double-clicking the `index.html` file directly due to CORS security restrictions on the `file://` protocol. 

You must serve the directory over a local web server (which serves via the `http://` protocol).

### Option A: Using Windows PowerShell (Zero Installations!)
1. Right-click the file [run-server.ps1](file:///c:/Users/Dell/OneDrive/Desktop/KG/MuddyBoard/run-server.ps1) in the project root and select **Run with PowerShell**.
2. This runs a native Windows web server on port 3000 and automatically opens your web browser to `http://localhost:3000`.

### Option B: Using Node/npm (If installed)
1. Open a terminal in the folder and run:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:3000`.

---

## 🌐 Free Deployment via GitHub Pages

Since the app requires no server-side backend, you can host it for free on GitHub Pages:

1. Upload the project folder to a public GitHub repository.
2. Go to **Settings > Pages** on your GitHub repository.
3. Under **Build and deployment**, select the source branch (usually `main`) and folder (`/root`), then click **Save**.
4. Within minutes, your site will be live at `https://<username>.github.io/<repository-name>/`.
5. Open the URL on a tablet/phone, select "Add to Home Screen" or "Install App", and run it fullscreen offline!
