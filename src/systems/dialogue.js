import { sfxDialogue } from './audio.js';
import { uiText } from './ui.js';

// Layout constants (game units, 480×270 space)
const BOX_X = 4;
const BOX_Y = 188;           // starts here, leaves ~82px at bottom
const BOX_W = 472;
const BOX_H = 80;
const PORTRAIT_W = 42;
const PORTRAIT_H = 56;
const PORTRAIT_X = 12;
const TEXT_X = PORTRAIT_X + PORTRAIT_W + 8;  // 62
const TYPEWRITER_MS = 22;

export class DialogueSystem {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this._lines = [];
    this._idx = 0;
    this._onDone = null;
    this._typing = false;
    this._typed = 0;
    this._typeTimer = 0;
    this._fullText = '';
    this._didPausePhysics = false;
    this._prevPadA = false;

    // ── Panel ────────────────────────────────────────────────────────────────
    this.panel = scene.add.graphics()
      .setScrollFactor(0).setDepth(200).setVisible(false);

    // ── Portrait ─────────────────────────────────────────────────────────────
    this.portrait = scene.add.image(
      PORTRAIT_X + PORTRAIT_W / 2,
      BOX_Y + BOX_H / 2 + 2,
      'portrait-alan'
    ).setScrollFactor(0).setDepth(202).setVisible(false)
      .setDisplaySize(PORTRAIT_W, PORTRAIT_H);

    // ── Speaker name ─────────────────────────────────────────────────────────
    this.speakerTxt = uiText(scene, TEXT_X, BOX_Y + 10, '', {
      size: 9, weight: 700, color: '#88ccff', align: 'left', spacing: 1,
      origin: { x: 0, y: 0 }, depth: 203, glow: 4,
    }).setVisible(false);

    // ── Body text ─────────────────────────────────────────────────────────────
    this.bodyTxt = uiText(scene, TEXT_X, BOX_Y + 26, '', {
      size: 8, weight: 400, color: '#e8f0f8', align: 'left',
      width: BOX_W - TEXT_X - 12, lineHeight: 1.5,
      origin: { x: 0, y: 0 }, depth: 203,
    }).setVisible(false);

    // ── Prompt ────────────────────────────────────────────────────────────────
    this.promptTxt = uiText(scene, BOX_X + BOX_W - 14, BOX_Y + BOX_H - 12, '▶ SPACE', {
      size: 7, weight: 700, color: '#5a7aa0', align: 'right', spacing: 1,
      origin: { x: 1, y: 0 }, depth: 203,
    }).setVisible(false);

    // ── Input ─────────────────────────────────────────────────────────────────
    scene.input.keyboard.on('keydown-SPACE', () => this.advance());
    scene.input.keyboard.on('keydown-ENTER', () => this.advance());
    scene.input.on('pointerdown', () => this.advance());
  }

  show(lines, onDone) {
    if (this.active) return;
    this.active = true;
    this._lines = lines;
    this._idx = 0;
    this._onDone = onDone;

    // Pause physics while dialogue plays (unless game-pause already did it)
    if (!this.scene._paused) {
      this.scene.physics.pause();
      this._didPausePhysics = true;
    }

    this._showLine();
  }

  _showLine() {
    const line = this._lines[this._idx];
    if (!line) { this.hide(); return; }

    const isAria = line.speaker === 'ARIA';

    // Draw panel
    this.panel.clear();
    // Dark backdrop
    this.panel.fillStyle(0x020c18, 0.94);
    this.panel.fillRoundedRect(BOX_X, BOX_Y, BOX_W, BOX_H, 5);
    // Border
    this.panel.lineStyle(1, isAria ? 0x5533aa : 0x1a3a55, 1);
    this.panel.strokeRoundedRect(BOX_X, BOX_Y, BOX_W, BOX_H, 5);
    // Portrait background
    this.panel.fillStyle(isAria ? 0x100020 : 0x081422, 1);
    this.panel.fillRect(BOX_X + 1, BOX_Y + 1, PORTRAIT_W + (PORTRAIT_X - BOX_X) * 2 + 4, BOX_H - 2);
    // Thin divider between portrait and text
    this.panel.lineStyle(1, isAria ? 0x442288 : 0x1a3a55, 0.7);
    this.panel.strokeLineShape(new Phaser.Geom.Line(
      TEXT_X - 4, BOX_Y + 4, TEXT_X - 4, BOX_Y + BOX_H - 4
    ));
    this.panel.setVisible(true);

    // Portrait
    this.portrait.setTexture(isAria ? 'portrait-aria' : 'portrait-alan');
    this.portrait.setPosition(PORTRAIT_X + PORTRAIT_W / 2, BOX_Y + BOX_H / 2);
    this.portrait.setVisible(true);

    // Speaker
    const nameColor = isAria ? '#bb77ff' : '#88bbee';
    this.speakerTxt.node.style.color = nameColor;
    this.speakerTxt.node.style.textShadow = `0 0 4px ${nameColor}`;
    this.speakerTxt.setText(line.speaker);
    this.speakerTxt.setVisible(true);

    // Body — clear and start typewriter
    this.bodyTxt.setText('');
    this.bodyTxt.setVisible(true);
    this.promptTxt.setVisible(false);

    this._fullText = line.text;
    this._typed = 0;
    this._typing = true;
    this._typeTimer = 0;
    sfxDialogue();
  }

  update(delta, pad) {
    if (!this.active) return;

    // Gamepad advance — A/Cross or D-pad down
    const padA = pad?.A?.pressed || pad?.buttons?.[0]?.pressed;
    if (padA && !this._prevPadA) this.advance();
    this._prevPadA = !!padA;

    if (this._typing) {
      this._typeTimer += delta;
      const toShow = Math.floor(this._typeTimer / TYPEWRITER_MS);
      if (toShow > this._typed) {
        this._typed = Math.min(toShow, this._fullText.length);
        this.bodyTxt.setText(this._fullText.slice(0, this._typed));
        if (this._typed >= this._fullText.length) {
          this._typing = false;
          this.promptTxt.setVisible(true);
        }
      }
      return;
    }

    // Prompt blink when done typing
    const blink = Math.floor(this.scene.time.now / 500) % 2 === 0;
    this.promptTxt.setVisible(blink);
  }

  advance() {
    if (!this.active) return;
    if (this._typing) {
      this._typing = false;
      this._typed = this._fullText.length;
      this.bodyTxt.setText(this._fullText);
      this.promptTxt.setVisible(true);
      return;
    }
    sfxDialogue();
    this._idx++;
    if (this._idx >= this._lines.length) {
      this.hide();
    } else {
      this._showLine();
    }
  }

  hide() {
    this.active = false;
    this.panel.setVisible(false);
    this.portrait.setVisible(false);
    this.speakerTxt.setVisible(false);
    this.bodyTxt.setVisible(false);
    this.promptTxt.setVisible(false);

    // Resume physics only if we were the ones who paused it
    if (this._didPausePhysics) {
      this._didPausePhysics = false;
      if (!this.scene._paused) {
        this.scene.physics.resume();
      }
    }

    if (this._onDone) {
      const cb = this._onDone;
      this._onDone = null;
      cb();
    }
  }

  destroy() {
    this.panel.destroy();
    this.portrait.destroy();
    this.speakerTxt.destroy();
    this.bodyTxt.destroy();
    this.promptTxt.destroy();
  }
}
