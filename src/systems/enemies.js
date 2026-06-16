import { sfxEnemyDie, sfxHit } from './audio.js';

const WISP_SPEED = 55;
const BOSS_SPEED = 75;
const ALLY_SPEED = 65;

// ── Shadow Wisp ───────────────────────────────────────────────────────────────
export class ShadowWisp {
  constructor(scene, x, y, isBoss = false) {
    this.scene = scene;
    this.isBoss = isBoss;
    this.maxHp = isBoss ? 10 : 2;
    this.hp = this.maxHp;
    this.hitCooldown = 0;
    this.alive = true;

    const tex = isBoss ? 'boss-wisp' : 'wisp';
    this.sprite = scene.physics.add.sprite(x, y, tex);
    this.sprite.setDepth(8);
    this.sprite.body.setSize(isBoss ? 22 : 10, isBoss ? 22 : 10);
    this.sprite.body.allowGravity = false;
    this._floatTimer = Math.random() * Math.PI * 2;
    this._baseY = y;
    this._chargeTimer = 0;
    this._charging = false;
    this._chargeCooldown = isBoss ? 3000 : Infinity;
    this.hitStreak = 0;
  }

  update(delta, playerX, playerY) {
    if (!this.alive) return;
    this.hitCooldown = Math.max(0, this.hitCooldown - delta);
    this._floatTimer += delta * 0.003;
    this._chargeCooldown = Math.max(0, this._chargeCooldown - delta);

    const dx = playerX - this.sprite.x;
    const dy = playerY - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (this.isBoss && this._chargeCooldown <= 0 && dist < 200 && !this._charging) {
      // Start charge
      this._charging = true;
      this._chargeTimer = 800;
      this._chargeCooldown = 3500;
      const spd = BOSS_SPEED * 2.5;
      this.sprite.setVelocityX((dx / dist) * spd);
      this.sprite.setVelocityY((dy / dist) * spd);
    }

    if (this._charging) {
      this._chargeTimer -= delta;
      if (this._chargeTimer <= 0) {
        this._charging = false;
        this.sprite.setVelocity(0, 0);
      }
    } else {
      // Normal drift toward player
      const speed = this.isBoss ? BOSS_SPEED : WISP_SPEED;
      if (dist > 15) {
        this.sprite.setVelocityX((dx / dist) * speed);
        // Slight vertical float
        const floatY = Math.sin(this._floatTimer) * 20;
        const targetVY = (dy > 30 ? (dy / dist) * speed * 0.5 : 0) + floatY;
        this.sprite.setVelocityY(Phaser.Math.Linear(this.sprite.body.velocity.y, targetVY, 0.08));
      } else {
        this.sprite.setVelocity(0, 0);
      }
    }

    // Pulse scale
    const pulse = 1 + Math.sin(this._floatTimer * 2) * 0.04;
    this.sprite.setScale(pulse);

    // Boss: tint pulses red when low hp
    if (this.isBoss && this.hp <= 4) {
      const t = (Math.sin(this._floatTimer * 4) + 1) / 2;
      const red = Phaser.Display.Color.Interpolate.ColorWithColor(
        { r: 0x33, g: 0x00, b: 0x55 },
        { r: 0xff, g: 0x00, b: 0x44 },
        100, t * 100
      );
      this.sprite.setTint(Phaser.Display.Color.GetColor(red.r, red.g, red.b));
    }
  }

  hit(damage = 1) {
    if (!this.alive || this.hitCooldown > 0) return false;
    this.hp -= damage;
    this.hitCooldown = 300;
    sfxHit();

    // Flash white
    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (this.alive && this.sprite.active) this.sprite.clearTint();
    });

    // Hit-stop
    this.scene.physics.pause();
    this.scene.time.delayedCall(40, () => this.scene.physics.resume());

    // Screenshake on boss hit
    if (this.isBoss) {
      this.scene.cameras.main.shake(80, 0.006);
    }

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    // Knockback
    const px = this.scene.playerRef?.sprite.x ?? this.sprite.x;
    const dir = this.sprite.x > px ? 1 : -1;
    this.sprite.setVelocityX(dir * 120);
    return false;
  }

  die() {
    if (!this.alive) return;
    this.alive = false;
    sfxEnemyDie();

    const zone = this.scene.zoneNum || 1;
    const colors = [0x5533aa, 0x441188, 0xcc8800];
    const count = this.isBoss ? 20 : 8;
    const emitter = this.scene.add.particles(
      this.sprite.x, this.sprite.y, 'particle', {
        speed: { min: this.isBoss ? 80 : 50, max: this.isBoss ? 200 : 130 },
        angle: { min: 0, max: 360 },
        scale: { start: this.isBoss ? 3 : 2, end: 0 },
        lifespan: this.isBoss ? 800 : 500,
        quantity: count,
        tint: colors[zone - 1],
        stopAfter: count,
      }
    );

    if (this.isBoss) {
      this.scene.cameras.main.shake(250, 0.018);
    }

    this.sprite.destroy();
    this.scene.time.delayedCall(900, () => emitter.destroy());
  }

  destroy() {
    if (this.sprite.active) this.sprite.destroy();
  }
}

// ── Ally Spirit (Zone 2) ──────────────────────────────────────────────────────
export class AllySpirit {
  constructor(scene, x, y) {
    this.scene = scene;
    this.alive = true;
    this._floatTimer = Math.random() * Math.PI * 2;
    this._attackCooldown = 0;
    this._targetEnemy = null;

    this.sprite = scene.physics.add.sprite(x, y, 'ally');
    this.sprite.setDepth(7);
    this.sprite.body.allowGravity = false;

    this.glow = scene.add.image(x, y, 'ally-glow');
    this.glow.setDepth(6);
    this.glow.setBlendMode(Phaser.BlendModes.ADD);
    this.glow.setAlpha(0.6);
  }

  update(delta, playerX, playerY, enemies) {
    if (!this.alive) return;
    this._floatTimer += delta * 0.002;
    this._attackCooldown = Math.max(0, this._attackCooldown - delta);

    // Only activate when player is nearby
    if (Math.abs(playerX - this.sprite.x) > 400) return;

    // Follow player loosely
    const tx = playerX + Math.cos(this._floatTimer) * 30 - 25;
    const ty = playerY - 25 + Math.sin(this._floatTimer * 0.7) * 15;
    this.sprite.setVelocityX((tx - this.sprite.x) * 3);
    this.sprite.setVelocityY((ty - this.sprite.y) * 3);

    this.glow.setPosition(this.sprite.x, this.sprite.y);

    // Find nearest enemy and attack
    if (this._attackCooldown <= 0) {
      let nearest = null;
      let nearDist = 120;
      enemies.forEach(e => {
        if (!e.alive) return;
        const d = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, e.sprite.x, e.sprite.y);
        if (d < nearDist) { nearDist = d; nearest = e; }
      });
      if (nearest) {
        this._attackCooldown = 1500;
        nearest.hit(1);
        // Show attack line
        const line = this.scene.add.graphics();
        line.lineStyle(1, 0xffdd44, 0.8);
        line.strokeLineShape(new Phaser.Geom.Line(
          this.sprite.x, this.sprite.y, nearest.sprite.x, nearest.sprite.y
        ));
        this.scene.time.delayedCall(120, () => line.destroy());
      }
    }
  }

  destroy() {
    if (this.sprite.active) this.sprite.destroy();
    if (this.glow.active) this.glow.destroy();
  }
}
