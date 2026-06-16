import { sfxDialogue } from './audio.js';

const BOX_Y = 226;
const BOX_W = 430;
const BOX_H = 60;
const PORTRAIT_W = 36;
const PORTRAIT_H = 42;
const TYPEWRITER_MS = 28;

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

    // Container anchored to camera
    const cx = 240, cy = BOX_Y;

    this.panel = scene.add.graphics()
      .setScrollFactor(0).setDepth(200).setVisible(false);

    this.portrait = scene.add.image(26, cy + 4, 'portrait-alan')
      .setScrollFactor(0).setDepth(201).setVisible(false)
      .setDisplaySize(PORTRAIT_W, PORTRAIT_H);

    this.speakerBg = scene.add.graphics()
      .setScrollFactor(0).setDepth(201).setVisible(false);

    this.speakerTxt = scene.add.text(50, cy - 16, '', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#88ccff',
      resolution: 2,
    }).setScrollFactor(0).setDepth(202).setVisible(false);

    this.bodyTxt = scene.add.text(50, cy + 2, '', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#ffffff',
      resolution: 2,
      wordWrap: { width: BOX_W - 60 },
    }).setScrollFactor(0).setDepth(202).setVisible(false);

    this.promptTxt = scene.add.text(cx + BOX_W / 2 - 40, cy + BOX_H - 12, '[SPACE]', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#556677',
      resolution: 2,
    }).setScrollFactor(0).setDepth(202).setVisible(false);

    // Input handlers
    scene.input.keyboard.on('keydown-SPACE', () => this.advance());
    scene.input.on('pointerdown', () => this.advance());
  }

  show(lines, onDone) {
    this.active = true;
    this._lines = lines;
    this._idx = 0;
    this._onDone = onDone;
    this._showLine();
  }

  _showLine() {
    const line = this._lines[this._idx];
    if (!line) { this.hide(); return; }

    // Panel background
    this.panel.clear();
    this.panel.fillStyle(0x050915, 0.92);
    this.panel.fillRoundedRect(8, BOX_Y - 24, BOX_W + 4, BOX_H + 20, 4);
    this.panel.lineStyle(1, 0x334455, 1);
    this.panel.strokeRoundedRect(8, BOX_Y - 24, BOX_W + 4, BOX_H + 20, 4);
    this.panel.setVisible(true);

    // Speaker label background
    this.speakerBg.clear();
    const isAria = line.speaker === 'ARIA';
    this.speakerBg.fillStyle(isAria ? 0x220044 : 0x0a1a2a, 0.95);
    this.speakerBg.fillRect(8, BOX_Y - 26, 100, 12);
    this.speakerBg.setVisible(true);

    // Portrait
    const portraitKey = isAria ? 'portrait-aria' : 'portrait-alan';
    this.portrait.setTexture(portraitKey);
    this.portrait.setVisible(true);

    // Speaker name color
    const nameColor = isAria ? '#aa66ff' : '#88aaee';
    this.speakerTxt.setStyle({ color: nameColor });
    this.speakerTxt.setText(line.speaker);
    this.speakerTxt.setVisible(true);

    this.bodyTxt.setText('');
    this.bodyTxt.setVisible(true);
    this.promptTxt.setVisible(false);

    this._fullText = line.text;
    this._typed = 0;
    this._typing = true;
    this._typeTimer = 0;
    sfxDialogue();
  }

  update(delta) {
    if (!this.active) return;

    if (this._typing) {
      this._typeTimer += delta;
      const charsToShow = Math.floor(this._typeTimer / TYPEWRITER_MS);
      if (charsToShow > this._typed) {
        this._typed = Math.min(charsToShow, this._fullText.length);
        this.bodyTxt.setText(this._fullText.slice(0, this._typed));
        if (this._typed >= this._fullText.length) {
          this._typing = false;
          this.promptTxt.setVisible(true);
        }
      }
    }

    // Prompt blink
    if (!this._typing && this.promptTxt.visible) {
      const blink = Math.sin(this.scene.time.now * 0.008) > 0;
      this.promptTxt.setVisible(blink);
    }
  }

  advance() {
    if (!this.active) return;
    if (this._typing) {
      // Skip typewriter
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
    this.speakerBg.setVisible(false);
    this.speakerTxt.setVisible(false);
    this.bodyTxt.setVisible(false);
    this.promptTxt.setVisible(false);
    if (this._onDone) {
      const cb = this._onDone;
      this._onDone = null;
      cb();
    }
  }

  destroy() {
    this.panel.destroy();
    this.portrait.destroy();
    this.speakerBg.destroy();
    this.speakerTxt.destroy();
    this.bodyTxt.destroy();
    this.promptTxt.destroy();
  }
}
