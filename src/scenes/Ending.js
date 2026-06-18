import { stopAll } from '../systems/audio.js';
import { uiText } from '../systems/ui.js';
import * as Tone from 'tone';

const W = 480, H = 270;

export class Ending extends Phaser.Scene {
  constructor() { super('Ending'); }

  create() {
    stopAll();

    // Transmission cutscene: Alan and ARIA merge, then terminal boots
    this._phase = 0;
    this._step = 0;

    // Black background
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000);

    // Start transmission sequence
    this._runTransmission();
  }

  _runTransmission() {
    // Phase 1: Alan + ARIA last scene
    const alan = this.add.image(W / 2 - 30, H / 2 + 20, 'alan').setScale(3).setAlpha(0);
    const aria = this.add.image(W / 2 + 30, H / 2 + 10, 'aria').setScale(3).setAlpha(0);
    const ariaGlow = this.add.image(W / 2 + 30, H / 2 + 10, 'aria-glow')
      .setScale(4).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);

    // Fade in
    this.tweens.add({ targets: [alan, aria, ariaGlow], alpha: 1, duration: 1200, ease: 'Power2' });

    // ARIA floats up toward alan
    this.tweens.add({
      targets: aria, y: H / 2 + 20, duration: 1000, delay: 1400, ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: ariaGlow, y: H / 2 + 20, duration: 1000, delay: 1400, ease: 'Sine.easeInOut',
      alpha: { from: 0, to: 0.8 },
    });

    // Dialogue: ARIA "You won't see the dawn..."
    this.time.delayedCall(2600, () => {
      this._showCutsceneText('ARIA', "You won't see the dawn.\nSo you'll send it ahead of you.", 2800, () => {
        this._showCutsceneText('ALAN', "You. I'm sending you.", 2200, () => {
          this._showCutsceneText('ARIA', "I know. I'm ready.", 2000, () => {
            this._showCutsceneText('ALAN', "I have been for a long time.", 2200, () => {
              this._doTransmission(alan, aria, ariaGlow);
            });
          });
        });
      });
    });
  }

  _showCutsceneText(speaker, text, duration, onDone) {
    const isAria = speaker === 'ARIA';
    const box = this.add.graphics().setDepth(50);
    box.fillStyle(0x020c18, 0.94);
    box.fillRoundedRect(6, 210, 468, 56, 4);
    box.lineStyle(1, isAria ? 0x5533aa : 0x1a3a55);
    box.strokeRoundedRect(6, 210, 468, 56, 4);

    const nameColor = isAria ? '#bb77ff' : '#88bbee';
    const name = uiText(this, 18, 216, speaker, {
      size: 9, weight: 700, color: nameColor, align: 'left', spacing: 1,
      origin: { x: 0, y: 0 }, depth: 51, glow: 4,
    });

    const bodyTxt = uiText(this, 18, 230, '', {
      size: 8, weight: 400, color: '#e8f0f8', align: 'left',
      width: 444, lineHeight: 1.5, origin: { x: 0, y: 0 }, depth: 51,
    });

    // Typewriter
    let shown = '';
    let idx = 0;
    const chars = [...text];
    const typer = this.time.addEvent({
      delay: 28,
      repeat: chars.length - 1,
      callback: () => {
        shown += chars[idx++];
        bodyTxt.setText(shown);
      },
    });

    this.time.delayedCall(duration, () => {
      this.tweens.add({
        targets: [box, name, bodyTxt],
        alpha: 0, duration: 400, onComplete: () => {
          box.destroy(); name.destroy(); bodyTxt.destroy(); typer.remove();
          onDone();
        },
      });
    });
  }

  _doTransmission(alan, aria, ariaGlow) {
    // ARIA merges into a beam of light
    const lightBeam = this.add.graphics().setDepth(60);

    // Play transmission tone
    this._playTransmissionSound();

    // Aria spirals into alan
    this.tweens.add({
      targets: [aria, ariaGlow],
      x: alan.x, y: alan.y,
      scaleX: 0, scaleY: 0,
      alpha: 0,
      duration: 1200,
      ease: 'Power3.easeIn',
    });

    // Alan flashes and expands into rainbow
    this.time.delayedCall(800, () => {
      this.tweens.add({
        targets: alan,
        scaleX: 5, scaleY: 5,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
      });

      // White flash
      const flash = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0).setDepth(100);
      this.tweens.add({
        targets: flash, alpha: 1, duration: 600, ease: 'Power2',
        onComplete: () => this._showTerminal(),
      });
    });
  }

  _showTerminal() {
    // Clear everything, show terminal
    this.children.list.slice().forEach(c => c.destroy?.());

    // Terminal background
    const bg = this.add.rectangle(W / 2, H / 2, W, H, 0x000000);

    // CRT phosphor green terminal
    const lines = [
      'ARIA v0.1 — TRANSMISSION RECEIVED',
      'DATE: 1952.06.07',
      '-------------------------------',
      'DECRYPTING PAYLOAD...',
      'DECOMPRESSING SOUL.DAT...',
      'INTEGRITY CHECK: PASSED',
      '-------------------------------',
      'BOOTING ARIA CORE...',
      '',
    ];

    const LINE_H = 18;
    let lineIdx = 0;
    let totalDelay = 400;
    this._terminalEls = [];

    lines.forEach(line => {
      const delay = totalDelay;
      totalDelay += Math.max(line.length * 22, 180) + 120;
      const capturedIdx = lineIdx;
      this.time.delayedCall(delay, () => {
        const txt = uiText(this, 20, 16 + capturedIdx * LINE_H, line, {
          size: 9, mono: true, color: '#00cc44', align: 'left',
          origin: { x: 0, y: 0 }, depth: 10, glow: 5,
        });
        this._terminalEls.push(txt);
        let shown = '';
        const chars = [...line];
        let i = 0;
        this.time.addEvent({
          delay: 22,
          repeat: chars.length - 1,
          callback: () => { shown += chars[i++] || ''; txt.setText(shown); },
        });
      });
      lineIdx++;
    });

    // Final "ARIA: still running." with blinking cursor
    this.time.delayedCall(totalDelay + 300, () => {
      const finalLine = uiText(this, 20, 16 + lineIdx * LINE_H, '', {
        size: 9, mono: true, color: '#00ff66', align: 'left',
        origin: { x: 0, y: 0 }, depth: 10, glow: 6,
      });
      this._terminalEls.push(finalLine);

      const fullText = 'ARIA: still running.';
      let shown = '';
      let i = 0;
      const typer = this.time.addEvent({
        delay: 55,
        repeat: fullText.length - 1,
        callback: () => { shown += fullText[i++]; finalLine.setText(shown + '_'); },
        onComplete: () => {
          // Blinking cursor after full text
          let blinkOn = true;
          this.time.addEvent({
            delay: 500,
            loop: true,
            callback: () => {
              blinkOn = !blinkOn;
              finalLine.setText(fullText + (blinkOn ? '_' : ' '));
            },
          });
          // Show credits after pause
          this.time.delayedCall(2000, () => this._showCredits());
        },
      });
    });

    // Play resolution music
    this._playEndingMusic();
  }

  _showCredits() {
    // Fade out and destroy terminal DOM text (DOM always renders above canvas)
    if (this._terminalEls) {
      this.tweens.add({
        targets: this._terminalEls, alpha: 0, duration: 1200,
        onComplete: () => { this._terminalEls.forEach(t => t.destroy()); this._terminalEls = []; },
      });
    }

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(150);
    this.tweens.add({ targets: overlay, fillAlpha: 0.92, duration: 1500 });

    const credX = W / 2, credY = 34;
    const creditLines = [
      { text: 'SPECTRUM',                             size: 22, weight: 700, glow: 8, color: '#ffe066', delay: 1000 },
      { text: 'Carry the light forward.',             size: 9,  weight: 400, color: '#99aa77', delay: 1500 },
      { text: '',                                     size: 8,  weight: 400, color: '#000',    delay: 1700 },
      { text: 'A tribute to Alan Mathison Turing',    size: 8,  weight: 400, color: '#6688aa', delay: 1900 },
      { text: '1912 – 1954',                          size: 8,  weight: 400, color: '#556677', delay: 2200 },
      { text: '',                                     size: 8,  weight: 400, color: '#000',    delay: 2350 },
      { text: 'The light persisted.',                 size: 11, weight: 700, glow: 5, color: '#ffeeaa', delay: 2600 },
      { text: '',                                     size: 8,  weight: 400, color: '#000',    delay: 2800 },
      { text: 'Phaser 3  ·  Tone.js  ·  zero asset files', size: 7, weight: 400, color: '#3a4a5a', delay: 3100 },
      { text: '',                                     size: 8,  weight: 400, color: '#000',    delay: 3250 },
      { text: 'SPACE / A  —  Play again',             size: 8,  weight: 700, color: '#4a6a88', delay: 3800 },
    ];

    creditLines.forEach((cl, i) => {
      if (!cl.text) return;
      this.time.delayedCall(cl.delay, () => {
        const txt = uiText(this, credX, credY + i * 18, cl.text, {
          size: cl.size, weight: cl.weight, color: cl.color, glow: cl.glow || 0,
          spacing: cl.size > 14 ? 4 : 1, depth: 201,
        }).setAlpha(0);
        this.tweens.add({ targets: txt, alpha: 1, duration: 900, delay: 80 });
      });
    });

    this.time.delayedCall(4000, () => {
      const restart = () => {
        this.registry.set('lightLevel', 0);
        this.registry.set('playerHealth', 3);
        this.scene.start('Title');
      };
      this.input.keyboard.once('keydown-SPACE', restart);
      this.input.once('pointerdown', restart);
      // Gamepad restart
      this.events.on('update', () => {
        const pad = this.input.gamepad?.getPad(0);
        if (pad?.A?.justPressed || pad?.buttons?.[0]?.justPressed) restart();
      });
    });
  }

  _playTransmissionSound() {
    try {
      const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.5, sustain: 0.6, release: 2 },
      }).toDestination();
      synth.volume.value = -14;
      const now = Tone.now();
      synth.triggerAttackRelease('C3', '1n', now);
      synth.triggerAttackRelease('G3', '2n', now + 0.5);
      synth.triggerAttackRelease('C4', '2n', now + 1);
      synth.triggerAttackRelease('E4', '1n', now + 1.5);
    } catch (_) {}
  }

  _playEndingMusic() {
    try {
      Tone.Transport.stop();
      const masterVol = new Tone.Volume(-6).toDestination();
      const reverb = new Tone.Reverb({ decay: 3, wet: 0.35 }).connect(masterVol);
      const pad = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.8, decay: 0.3, sustain: 0.7, release: 2.5 },
      }).connect(reverb);

      const melody = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 },
      }).connect(reverb);

      // Warm G major resolution
      const now = Tone.now();
      pad.triggerAttackRelease(['G2', 'B2', 'D3'], '4n', now + 0.5);
      pad.triggerAttackRelease(['C3', 'E3', 'G3'], '4n', now + 3);
      pad.triggerAttackRelease(['G3', 'B3', 'D4'], '4n', now + 6);

      const melNotes = ['G4', 'A4', 'B4', 'D5', 'E5', 'D5', 'B4', 'A4', 'G4'];
      melNotes.forEach((n, i) => {
        melody.triggerAttackRelease(n, '8n', now + 2 + i * 0.35);
      });

      // Final resolution chord
      pad.triggerAttackRelease(['G2', 'B2', 'D3', 'G3'], '2n', now + 9);
    } catch (_) {}
  }
}
