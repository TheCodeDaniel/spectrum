import { Player } from '../systems/player.js';
import { ShadowWisp, AllySpirit } from '../systems/enemies.js';
import { DialogueSystem } from '../systems/dialogue.js';
import { playZoneMusic, sfxCheckpoint, sfxGateOpen, setMuted, getMuted } from '../systems/audio.js';

const W = 480, H = 270;

export class ZoneBase extends Phaser.Scene {
  // Subclasses define:
  // static ZONE_NUM, WORLD_WIDTH, COLORS, PLATFORMS, ENEMIES, BOSS, CHECKPOINT, GATE, DIALOGUE

  constructor(key) { super(key); }

  create() {
    this.zoneNum = this.constructor.ZONE_NUM;
    const worldW = this.constructor.WORLD_WIDTH;

    // Physics world
    this.physics.world.gravity.y = 800;
    this.physics.world.setBounds(0, -100, worldW, H + 200);

    // ── Parallax backgrounds ─────────────────────────────────────────────────
    this._bgFar = this.add.tileSprite(0, 0, W, H, `bg-z${this.zoneNum}-far`)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(0);
    this._bgMid = this.add.tileSprite(0, 0, W, H, `bg-z${this.zoneNum}-mid`)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(1).setAlpha(0.7);

    // ── Ground color fill (below platforms) ─────────────────────────────────
    const floorG = this.add.graphics().setDepth(2);
    const c = this.constructor.COLORS;
    floorG.fillStyle(c.ground);
    floorG.fillRect(0, 252, worldW, 30);

    // ── Platforms ────────────────────────────────────────────────────────────
    this.platforms = this.physics.add.staticGroup();
    // Single graphics object for all platform visuals (efficient)
    const platGfx = this.add.graphics().setDepth(3);

    this.constructor.PLATFORMS.forEach(p => {
      const h = p.type === 'ground' ? 24 : 16;
      const cols = p.type === 'ground' ? c.ground : c.platform;
      const colT = p.type === 'ground' ? c.platformEdge : c.platformTop;

      // Draw visuals
      platGfx.fillStyle(colT);
      platGfx.fillRect(p.x, p.y, p.w, 2);
      platGfx.fillStyle(cols);
      platGfx.fillRect(p.x, p.y + 2, p.w, h - 2);

      // Physics body via staticGroup.create() with pixel texture
      const plat = this.platforms.create(p.x + p.w / 2, p.y + h / 2, 'pixel');
      plat.setAlpha(0);
      plat.setDisplaySize(p.w, h);
      plat.refreshBody();
    });

    // ── Checkpoint ───────────────────────────────────────────────────────────
    const cp = this.constructor.CHECKPOINT;
    this._checkpointActivated = false;
    this._checkpointSprite = this.add.image(cp.x, cp.y - 8, 'checkpoint')
      .setDepth(4).setScale(1.5);
    this._checkpointZone = this.add.zone(cp.x, cp.y - 4, 24, 40);
    this.physics.add.existing(this._checkpointZone, true);

    // ── Light Gate ────────────────────────────────────────────────────────────
    const gate = this.constructor.GATE;
    this._gateLocked = true;
    this._gateSprite = this.add.image(gate.x, gate.y, 'light-gate')
      .setDepth(4).setScale(1.5);
    this._gateZone = this.add.zone(gate.x, gate.y, 40, 72);
    this.physics.add.existing(this._gateZone, true);

    // ── Player ───────────────────────────────────────────────────────────────
    this.player = new Player(this, 50, 220);
    this.player.respawnX = 50;
    this.player.respawnY = 220;
    this.playerRef = this.player; // For enemy reference

    // ── Enemies ──────────────────────────────────────────────────────────────
    this._enemies = [];
    this._allies = [];
    this._boss = null;
    this._bossTriggered = false;
    this._bossDefeated = false;

    this.constructor.ENEMIES.forEach(e => {
      this._enemies.push(new ShadowWisp(this, e.x, e.y));
    });

    // Boss
    const b = this.constructor.BOSS;
    this._bossSpawnX = b.x;
    this._bossSpawnY = b.y;
    this._bossTriggerX = b.triggerX;

    // Zone 2: ally spirits
    if (this.zoneNum === 2 && this.constructor.ALLY_SPAWN) {
      this.constructor.ALLY_SPAWN.forEach(a => {
        this._allies.push(new AllySpirit(this, a.x, a.y));
      });
    }

    // ── Dialogue ─────────────────────────────────────────────────────────────
    this._dialogue = new DialogueSystem(this);
    this._dialogueTriggers = [];
    const dl = this.constructor.DIALOGUE;
    const dialogueData = [
      { x: 120, lines: dl.start, fired: false },
      { x: cp.x - 20, lines: dl.mid, fired: false },
      { x: b.triggerX - 100, lines: dl.boss, fired: false },
    ];
    this._dialogueTriggers = dialogueData;

    // ── UI ────────────────────────────────────────────────────────────────────
    this._createUI();

    // ── Camera ───────────────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, worldW, H);
    this.cameras.main.startFollow(this.player.sprite, true, 0.09, 0.09);

    // ── Keyboard ─────────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.W,
      dash: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      attack: Phaser.Input.Keyboard.KeyCodes.J,
      pause: Phaser.Input.Keyboard.KeyCodes.P,
      mute: Phaser.Input.Keyboard.KeyCodes.M,
    });
    // Also allow space for jump in cursors (already in cursors.space)

    this._paused = false;
    this._pausePanel = null;

    this.input.keyboard.on('keydown-P', () => this._togglePause());
    this.input.keyboard.on('keydown-M', () => {
      setMuted(!getMuted());
      this._updateMuteUI();
    });

    // ── Physics colliders ────────────────────────────────────────────────────
    this.physics.add.collider(this.player.sprite, this.platforms);
    // Wisps float (no gravity) so no platform colliders needed for them

    // ── Zone music ───────────────────────────────────────────────────────────
    playZoneMusic(this.zoneNum);

    // ── Scanlines overlay ────────────────────────────────────────────────────
    this.add.image(W / 2, H / 2, 'scanlines')
      .setScrollFactor(0).setDepth(300).setAlpha(0.35);

    // ── Zone header flash ────────────────────────────────────────────────────
    const zoneNames = ['', 'THE CIPHER HALLS', 'THE LONG NIGHT', 'THE TRANSMISSION'];
    const zoneHeader = this.add.text(W / 2, 30, `ZONE ${this.zoneNum} — ${zoneNames[this.zoneNum]}`, {
      fontFamily: 'monospace', fontSize: '7px', color: '#556677', resolution: 2,
    }).setScrollFactor(0).setDepth(201).setOrigin(0.5);
    this.tweens.add({
      targets: zoneHeader, alpha: 0, delay: 3000, duration: 1500, onComplete: () => zoneHeader.destroy(),
    });
  }

  _createUI() {
    // Health hearts
    this._heartImgs = [];
    for (let i = 0; i < 3; i++) {
      const h = this.add.image(14 + i * 14, 12, 'heart')
        .setScrollFactor(0).setDepth(200).setScale(1.5);
      this._heartImgs.push(h);
    }

    // Light meter bar
    const lbx = 10, lby = 24, lbw = 80, lbh = 5;
    this._lightBarBg = this.add.graphics().setScrollFactor(0).setDepth(200);
    this._lightBarBg.fillStyle(0x111122);
    this._lightBarBg.fillRect(lbx, lby, lbw, lbh);
    this._lightBarBg.lineStyle(1, 0x334455);
    this._lightBarBg.strokeRect(lbx, lby, lbw, lbh);

    this._lightBarFill = this.add.graphics().setScrollFactor(0).setDepth(201);
    this._lightLabel = this.add.text(lbx, lby - 8, 'LIGHT', {
      fontFamily: 'monospace', fontSize: '5px', color: '#445566', resolution: 2,
    }).setScrollFactor(0).setDepth(200);

    // Zone indicator
    this._zoneLabel = this.add.text(W - 8, 8, `ZONE ${this.zoneNum}`, {
      fontFamily: 'monospace', fontSize: '6px', color: '#334455', resolution: 2,
    }).setScrollFactor(0).setDepth(200).setOrigin(1, 0);

    // Mute hint
    this._muteTxt = this.add.text(W - 8, 18, getMuted() ? '♪ OFF' : '♪ ON', {
      fontFamily: 'monospace', fontSize: '5px', color: '#2a3a4a', resolution: 2,
    }).setScrollFactor(0).setDepth(200).setOrigin(1, 0);
  }

  _updateUI() {
    // Hearts
    for (let i = 0; i < 3; i++) {
      this._heartImgs[i].setTexture(i < this.player.health ? 'heart' : 'heart-empty');
    }

    // Light bar
    const pct = this.player.lightMeter / this.player.maxLight;
    const lbx = 10, lby = 24, lbw = 80, lbh = 5;
    this._lightBarFill.clear();
    const col = pct > 0.5 ? 0x44aaff : pct > 0.2 ? 0xffaa22 : 0xff3322;
    this._lightBarFill.fillStyle(col);
    this._lightBarFill.fillRect(lbx + 1, lby + 1, Math.max(0, (lbw - 2) * pct), lbh - 2);
  }

  _updateMuteUI() {
    this._muteTxt?.setText(getMuted() ? '♪ OFF' : '♪ ON');
  }

  _togglePause() {
    this._paused = !this._paused;
    if (this._paused) {
      this.physics.pause();
      if (!this._pausePanel) this._buildPausePanel();
      this._pausePanel.setVisible(true);
    } else {
      this.physics.resume();
      this._pausePanel?.setVisible(false);
    }
  }

  _buildPausePanel() {
    const container = this.add.container(W / 2, H / 2).setScrollFactor(0).setDepth(500);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRoundedRect(-80, -50, 160, 110, 6);
    bg.lineStyle(1, 0x334455);
    bg.strokeRoundedRect(-80, -50, 160, 110, 6);

    const title = this.add.text(0, -35, 'PAUSED', {
      fontFamily: 'monospace', fontSize: '10px', color: '#88aacc', resolution: 2,
    }).setOrigin(0.5);

    const resume = this.add.text(0, -8, '[ P ] Resume', {
      fontFamily: 'monospace', fontSize: '7px', color: '#667788', resolution: 2,
    }).setOrigin(0.5);

    const muteLabel = this.add.text(0, 8, getMuted() ? '[ M ] Unmute' : '[ M ] Mute', {
      fontFamily: 'monospace', fontSize: '7px', color: '#667788', resolution: 2,
    }).setOrigin(0.5);

    const restart = this.add.text(0, 28, '[ R ] Restart Zone', {
      fontFamily: 'monospace', fontSize: '7px', color: '#667788', resolution: 2,
    }).setOrigin(0.5);

    const menu = this.add.text(0, 44, '[ ESC ] Title', {
      fontFamily: 'monospace', fontSize: '7px', color: '#667788', resolution: 2,
    }).setOrigin(0.5);

    container.add([bg, title, resume, muteLabel, restart, menu]);
    this._pausePanel = container;

    this.input.keyboard.on('keydown-R', () => {
      this._paused = false;
      this._pausePanel.setVisible(false);
      this.physics.resume();
      this.scene.restart();
    });
    this.input.keyboard.on('keydown-ESC', () => {
      this._paused = false;
      this.physics.resume();
      this.scene.start('Title');
    });
    this.input.keyboard.on('keydown-M', () => {
      muteLabel.setText(getMuted() ? '[ M ] Unmute' : '[ M ] Mute');
    });
  }

  update(time, delta) {
    if (this._paused) return;
    if (this._dialogue.active) {
      this._dialogue.update(delta);
      // Still allow minimal input but pause physics action
      return;
    }

    // ── Player ───────────────────────────────────────────────────────────────
    this.player.update(time, delta, this.cursors, this.wasd);

    // Player dead & fall
    if (this.player.sprite.y > H + 60) {
      this.player.die();
    }

    // ── Parallax ─────────────────────────────────────────────────────────────
    const camX = this.cameras.main.scrollX;
    this._bgFar.tilePositionX = camX * 0.08;
    this._bgMid.tilePositionX = camX * 0.3;

    // ── Enemies ──────────────────────────────────────────────────────────────
    this._enemies.forEach(e => {
      if (!e.alive) return;
      e.update(delta, this.player.sprite.x, this.player.sprite.y);
      // Player contact damage
      if (!this.player.dead && this.player.iframes <= 0) {
        const d = Phaser.Math.Distance.Between(
          this.player.sprite.x, this.player.sprite.y, e.sprite.x, e.sprite.y);
        if (d < (e.isBoss ? 20 : 12)) {
          if (this.player.takeDamage(1)) {
            this.cameras.main.shake(120, 0.01);
          }
        }
      }
      // Player attack connects
      if (this.player.isAttacking && !this.player.attackConnected) {
        const d = Phaser.Math.Distance.Between(
          this.player.hitbox.x, this.player.hitbox.y, e.sprite.x, e.sprite.y);
        if (d < (e.isBoss ? 30 : 18)) {
          if (e.hit(1)) {
            this.player.refillLight(30);
            this.player.attackConnected = true;
          } else {
            this.player.attackConnected = true;
          }
        }
      }
    });

    // Boss
    if (this._boss && this._boss.alive) {
      this._boss.update(delta, this.player.sprite.x, this.player.sprite.y);
      if (!this.player.dead && this.player.iframes <= 0) {
        const d = Phaser.Math.Distance.Between(
          this.player.sprite.x, this.player.sprite.y,
          this._boss.sprite.x, this._boss.sprite.y);
        if (d < 22) {
          if (this.player.takeDamage(1)) this.cameras.main.shake(150, 0.012);
        }
      }
      if (this.player.isAttacking && !this.player.attackConnected) {
        const d = Phaser.Math.Distance.Between(
          this.player.hitbox.x, this.player.hitbox.y,
          this._boss.sprite.x, this._boss.sprite.y);
        if (d < 30) {
          this.player.attackConnected = true;
          const dead = this._boss.hit(1);
          if (dead) {
            this.player.refillLight(60);
            this._onBossDefeated();
          }
        }
      }
    }

    // Boss trigger
    if (!this._bossTriggered && this.player.sprite.x > this._bossTriggerX) {
      this._bossTriggered = true;
      this._boss = new ShadowWisp(this, this._bossSpawnX, this._bossSpawnY, true);
    }

    // ── Allies ───────────────────────────────────────────────────────────────
    this._allies.forEach(a => {
      a.update(delta, this.player.sprite.x, this.player.sprite.y, this._enemies);
    });

    // ── Checkpoint ───────────────────────────────────────────────────────────
    if (!this._checkpointActivated) {
      const d = Phaser.Math.Distance.Between(
        this.player.sprite.x, this.player.sprite.y,
        this._checkpointSprite.x, this._checkpointSprite.y);
      if (d < 30) {
        this._checkpointActivated = true;
        this._checkpointSprite.setTexture('checkpoint-active');
        this.player.setCheckpoint(this._checkpointSprite.x, this._checkpointSprite.y + 20);
        this.player.refillLight(50);
        sfxCheckpoint();
        this.cameras.main.flash(200, 0, 80, 160);
        this.registry.set('playerHealth', this.player.health);
      }
    }

    // ── Gate ─────────────────────────────────────────────────────────────────
    if (!this._gateLocked && !this._zoneComplete) {
      const d = Phaser.Math.Distance.Between(
        this.player.sprite.x, this.player.sprite.y,
        this._gateSprite.x, this._gateSprite.y);
      if (d < 40) {
        this._zoneComplete = true;
        this._onZoneComplete();
      }
    }

    // ── Dialogue triggers ─────────────────────────────────────────────────────
    this._dialogueTriggers.forEach(t => {
      if (!t.fired && this.player.sprite.x > t.x) {
        t.fired = true;
        this._dialogue.show(t.lines, () => {});
      }
    });

    // ── UI ───────────────────────────────────────────────────────────────────
    this._updateUI();
  }

  _onBossDefeated() {
    this._bossDefeated = true;
    this.cameras.main.flash(400, 255, 220, 0);
    this.cameras.main.shake(300, 0.015);

    // Unlock gate after short delay with dialogue
    this.time.delayedCall(1000, () => {
      this._gateLocked = false;
      this._gateSprite.setTexture('light-gate-open');
      sfxGateOpen();
      // Flash gate area
      this.cameras.main.flash(300, 255, 200, 0);

      // Final zone dialogue
      const dl = this.constructor.DIALOGUE;
      if (dl.clear) {
        this.time.delayedCall(600, () => {
          this._dialogue.show(dl.clear, () => {});
        });
      }
    });
  }

  _onZoneComplete() {
    const nextZone = this.zoneNum + 1;
    const lightLevel = Math.min(3, this.zoneNum);
    this.registry.set('lightLevel', lightLevel);
    this.registry.set('playerHealth', this.player.health);

    this.cameras.main.fade(1200, 255, 240, 180);
    this.time.delayedCall(1200, () => {
      if (nextZone <= 3) {
        this.scene.start(`Zone${nextZone}`);
      } else {
        this.scene.start('Ending');
      }
    });
  }

  shutdown() {
    this._dialogue?.destroy();
    this.player?.destroy();
    this._enemies.forEach(e => e.destroy());
    this._allies.forEach(a => a.destroy());
    this._boss?.destroy();
    this.input.keyboard.removeAllListeners();
    this.input.removeAllListeners();
  }
}
