import { initAudio, playTitleMusic, setMuted, getMuted } from '../systems/audio.js';

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
    // Draw pixel-style letters
    this._drawLogo(W / 2, 80);

    // Tagline
    this.add.text(W / 2, 118, 'Carry the light forward.', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#7a9ab8',
      resolution: 2,
    }).setOrigin(0.5);

    // Year / context
    this.add.text(W / 2, 132, '1952  ·  A tribute to Alan Turing', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#445566',
      resolution: 2,
    }).setOrigin(0.5);

    // ARIA companion draw
    const aria = this.add.image(W / 2, 158, 'aria').setScale(2);
    this.tweens.add({
      targets: aria, y: 162, duration: 1200,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    const ariaGlow = this.add.image(W / 2, 158, 'aria-glow').setScale(2)
      .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.5);
    this.tweens.add({
      targets: ariaGlow, alpha: 0.8, duration: 1000,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Start button
    const startBg = this.add.graphics();
    startBg.fillStyle(0x112233, 0.9);
    startBg.fillRoundedRect(W / 2 - 60, 182, 120, 20, 4);
    startBg.lineStyle(1, 0x3a6a9a);
    startBg.strokeRoundedRect(W / 2 - 60, 182, 120, 20, 4);

    const startTxt = this.add.text(W / 2, 192, '[ PRESS SPACE TO BEGIN ]', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#88ccff',
      resolution: 2,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startTxt, alpha: 0.3, duration: 700,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Controls hint
    this.add.text(W / 2, 218, 'A/D Move  ·  W/Space Jump  ·  Shift Dash  ·  J Attack', {
      fontFamily: 'monospace', fontSize: '5px', color: '#334455', resolution: 2,
    }).setOrigin(0.5);

    this.add.text(W / 2, 227, 'P Pause  ·  M Mute', {
      fontFamily: 'monospace', fontSize: '5px', color: '#334455', resolution: 2,
    }).setOrigin(0.5);

    // Mute toggle text
    const muteTxt = this.add.text(W - 10, 10, getMuted() ? '♪ OFF' : '♪ ON', {
      fontFamily: 'monospace', fontSize: '6px', color: '#445566', resolution: 2,
    }).setOrigin(1, 0);

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
    this.input.once('pointerdown', start);

    this.input.keyboard.on('keydown-M', () => {
      setMuted(!getMuted());
      muteTxt.setText(getMuted() ? '♪ OFF' : '♪ ON');
    });
  }

  _drawLogo(cx, cy) {
    // "SPECTRUM" in chunky pixel text
    const text = this.add.text(cx, cy, 'SPECTRUM', {
      fontFamily: 'monospace',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ffffff',
      resolution: 2,
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Rainbow tint sweep
    let hue = 0;
    this.time.addEvent({
      delay: 40,
      loop: true,
      callback: () => {
        hue = (hue + 2) % 360;
        const rgb = Phaser.Display.Color.HSVToRGB(hue / 360, 0.7, 1);
        text.setTint(Phaser.Display.Color.GetColor(rgb.r, rgb.g, rgb.b));
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
