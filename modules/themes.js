// modules/themes.js

class ThemeEngine {
  constructor() {
    this.currentTheme = 'rainbow';
    this.rotationInterval = null;
    this.isRotating = false;
    this.rotationMinutes = 5;

    this.themes = {
      rainbow: {
        '--theme-bg-gradient': 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 50%, #70a1ff 100%)',
        '--theme-primary': '#ff4757',
        '--theme-secondary': '#2e86de',
        '--theme-accent': '#ffa502',
        '--theme-text': '#ffffff',
        '--theme-panel-bg': 'rgba(255, 255, 255, 0.9)',
        '--theme-bubble-border': 'rgba(255, 255, 255, 0.6)'
      },
      princess: {
        '--theme-bg-gradient': 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
        '--theme-primary': '#ff85a3',
        '--theme-secondary': '#b39ddb',
        '--theme-accent': '#ffd700',
        '--theme-text': '#4a148c',
        '--theme-panel-bg': 'rgba(253, 240, 245, 0.9)',
        '--theme-bubble-border': 'rgba(255, 182, 193, 0.7)'
      },
      ocean: {
        '--theme-bg-gradient': 'linear-gradient(180deg, #00c6ff 0%, #0072ff 100%)',
        '--theme-primary': '#00d2ff',
        '--theme-secondary': '#0052d4',
        '--theme-accent': '#39ffd0',
        '--theme-text': '#ffffff',
        '--theme-panel-bg': 'rgba(224, 247, 250, 0.9)',
        '--theme-bubble-border': 'rgba(255, 255, 255, 0.5)'
      },
      jungle: {
        '--theme-bg-gradient': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        '--theme-primary': '#2ed573',
        '--theme-secondary': '#1e3799',
        '--theme-accent': '#f1c40f',
        '--theme-text': '#ffffff',
        '--theme-panel-bg': 'rgba(232, 245, 233, 0.9)',
        '--theme-bubble-border': 'rgba(255, 255, 255, 0.6)'
      },
      space: {
        '--theme-bg-gradient': 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        '--theme-primary': '#9b59b6',
        '--theme-secondary': '#2980b9',
        '--theme-accent': '#00ffcc',
        '--theme-text': '#ffffff',
        '--theme-panel-bg': 'rgba(32, 58, 67, 0.9)',
        '--theme-bubble-border': 'rgba(0, 255, 204, 0.4)'
      },
      candyland: {
        '--theme-bg-gradient': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
        '--theme-primary': '#ff6b81',
        '--theme-secondary': '#a8e6cf',
        '--theme-accent': '#ffd3b6',
        '--theme-text': '#6c5ce7',
        '--theme-panel-bg': 'rgba(255, 240, 245, 0.9)',
        '--theme-bubble-border': 'rgba(255, 255, 255, 0.7)'
      },
      winter: {
        '--theme-bg-gradient': 'linear-gradient(135deg, #e6f7ff 0%, #aec8ff 100%)',
        '--theme-primary': '#4a90e2',
        '--theme-secondary': '#3b5998',
        '--theme-accent': '#ffffff',
        '--theme-text': '#2c3e50',
        '--theme-panel-bg': 'rgba(240, 248, 255, 0.9)',
        '--theme-bubble-border': 'rgba(255, 255, 255, 0.8)'
      },
      spring: {
        '--theme-bg-gradient': 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
        '--theme-primary': '#78e08f',
        '--theme-secondary': '#fa8231',
        '--theme-accent': '#fff200',
        '--theme-text': '#2f3542',
        '--theme-panel-bg': 'rgba(245, 247, 250, 0.9)',
        '--theme-bubble-border': 'rgba(255, 255, 255, 0.6)'
      },
      summer: {
        '--theme-bg-gradient': 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        '--theme-primary': '#ff7f50',
        '--theme-secondary': '#1e90ff',
        '--theme-accent': '#ffd700',
        '--theme-text': '#ffffff',
        '--theme-panel-bg': 'rgba(255, 248, 224, 0.9)',
        '--theme-bubble-border': 'rgba(255, 255, 255, 0.7)'
      },
      nightsky: {
        '--theme-bg-gradient': 'linear-gradient(180deg, #05051a 0%, #1a1a3a 100%)',
        '--theme-primary': '#f1c40f',
        '--theme-secondary': '#8e44ad',
        '--theme-accent': '#f39c12',
        '--theme-text': '#ecf0f1',
        '--theme-panel-bg': 'rgba(20, 20, 40, 0.9)',
        '--theme-bubble-border': 'rgba(241, 196, 15, 0.3)'
      }
    };
  }

  setTheme(themeName) {
    if (!this.themes[themeName]) return;
    this.currentTheme = themeName;
    const themeData = this.themes[themeName];
    const root = document.documentElement;
    
    // Apply variables to root style
    Object.keys(themeData).forEach(variable => {
      root.style.setProperty(variable, themeData[variable]);
    });

    // Notify document body of theme change for CSS selectors
    document.body.className = `theme-${themeName}`;
    console.log(`Theme set to: ${themeName}`);
  }

  startAutoRotation(minutes = 5) {
    this.stopAutoRotation();
    this.isRotating = true;
    this.rotationMinutes = minutes;
    
    const themeKeys = Object.keys(this.themes);
    
    this.rotationInterval = setInterval(() => {
      let nextIdx = themeKeys.indexOf(this.currentTheme) + 1;
      if (nextIdx >= themeKeys.length) nextIdx = 0;
      this.setTheme(themeKeys[nextIdx]);
    }, minutes * 60 * 1000);
    
    console.log(`Auto-rotating themes every ${minutes} minutes.`);
  }

  stopAutoRotation() {
    this.isRotating = false;
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }
  }
}

export const themes = new ThemeEngine();
