import { initAudio, playTitleMusic, setMuted, getMuted } from '../systems/audio.js';
import { uiText } from '../systems/ui.js';

export class Title extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    const W = 480, H = 270;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x020612, 0x020612, 0x060e24, 0x060e24, 1);
    bg.fillRect(0, 0, W, H);

    // Stars
    const rng = mulberry(99999);
    for (let i = 0; i < 120; i++) {
      const sx = rng() * W, sy = rng() * H;
      const bright = rng() > 0.75;
      const star = this.add.rectangle(sx, sy, bright ? 2 : 1, bright ? 2 : 1,
        bright ? 0xffffff : 0x5577aa, bright ? 0.9 : 0.5);
      if (bright) {
        this.tweens.add({
          targets: star, alpha: 0.2, duration: 800 + rng() * 1200,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
      }
    }

    // ── SPECTRUM logo ──────────────────────────────────────────────────────
    this._drawLogo(W / 2, 72);

    // Tagline
    uiText(this, W / 2, 110, 'Carry the light forward.', {
      size: 9, color: '#8ab0d0', weight: 400, spacing: 1, glow: 6,
    });

    // Year / context
    uiText(this, W / 2, 126, '1952  ·  A tribute to Alan Turing', {
      size: 7, color: '#5a7088', weight: 400, spacing: 0.5,
    });

    // ARIA companion
    const aria = this.add.image(W / 2, 156, 'aria').setScale(2);
    this.tweens.add({
      targets: aria, y: 161, duration: 1200,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    const ariaGlow = this.add.image(W / 2, 156, 'aria-glow').setScale(2.5)
      .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.5);
    this.tweens.add({
      targets: ariaGlow, alpha: 0.8, duration: 1000,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Start button
    const startBg = this.add.graphics();
    startBg.fillStyle(0x0a1a2e, 0.92);
    startBg.fillRoundedRect(W / 2 - 80, 178, 160, 22, 4);
    startBg.lineStyle(1, 0x2a5a8a);
    startBg.strokeRoundedRect(W / 2 - 80, 178, 160, 22, 4);

    const startTxt = uiText(this, W / 2, 189, 'PRESS SPACE TO BEGIN', {
      size: 8, color: '#7ab8ee', weight: 700, spacing: 2, glow: 5,
    });

    this.tweens.add({
      targets: startTxt, alpha: 0.3, duration: 650,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Controls reference
    uiText(this, W / 2, 214, 'A/D Move    W / Space Jump    Shift Dash    J Attack', {
      size: 7, color: '#46586a', weight: 400, spacing: 0.5,
    });

    uiText(this, W / 2, 227, 'Gamepad:  Stick Move  ·  A Jump  ·  X Attack  ·  R1 Dash  ·  Start Pause', {
      size: 6, color: '#36465a', weight: 400, spacing: 0.5,
    });

    uiText(this, W / 2, 239, 'P = Pause      M = Mute', {
      size: 6, color: '#36465a', weight: 400, spacing: 0.5,
    });

    // Mute toggle
    const muteTxt = uiText(this, W - 10, 9, getMuted() ? '♪ OFF' : '♪ ON', {
      size: 7, color: '#46586a', weight: 700, origin: { x: 1, y: 0 },
    });

    // Scanlines
    this.add.image(W / 2, H / 2, 'scanlines')
      .setAlpha(0.4).setScrollFactor(0).setDepth(100);

    // ── Input ────────────────────────────────────────────────────────────────
    const start = async () => {
      await initAudio();
      playTitleMusic();
      this.scene.start('Zone1');
    };

    this.input.keyboard.once('keydown-SPACE', start);
    this.input.keyboard.once('keydown-ENTER', start);
    this.input.once('pointerdown', start);

    // Gamepad start — poll since gamepad connect fires async
    this._waitingForStart = true;
    this.events.on('update', () => {
      if (!this._waitingForStart) return;
      const pad = this.input.gamepad?.getPad(0);
      if (pad?.A?.justPressed || pad?.start?.justPressed || pad?.buttons?.[0]?.justPressed) {
        this._waitingForStart = false;
        start();
      }
    });

    this.input.keyboard.on('keydown-M', () => {
      setMuted(!getMuted());
      muteTxt.setText(getMuted() ? '♪ OFF' : '♪ ON');
    });
  }

  _drawLogo(cx, cy) {
    const logo = uiText(this, cx, cy, 'SPECTRUM', {
      size: 28, weight: 700, spacing: 5, color: '#ffffff', glow: 9, depth: 260,
    });

    let hue = 0;
    this.time.addEvent({
      delay: 40,
      loop: true,
      callback: () => {
        hue = (hue + 2) % 360;
        const rgb = Phaser.Display.Color.HSVToRGB(hue / 360, 0.6, 1);
        const hex = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        logo.node.style.color = hex;
        logo.node.style.textShadow = `0 0 9px ${hex}`;
      },
    });
  }
}

function mulberry(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
