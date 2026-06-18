import { sfxJump, sfxDash, sfxHit } from './audio.js';

const SPEED = 160;
const JUMP_VEL = -370;
const DASH_VEL = 280;
const DASH_DURATION = 140;
const DASH_COOLDOWN = 600;
const COYOTE_MS = 100;
const ATTACK_DURATION = 280;
const ATTACK_RANGE = 38;
const IFRAMES_DAMAGE = 900;
const IFRAMES_DASH = 200;

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.health = scene.registry.get('playerHealth') ?? 3;
    this.maxHealth = 3;
    this.lightMeter = 100;
    this.maxLight = 100;
    this.facingRight = true;
    this.isAttacking = false;
    this.attackConnected = false;
    this.isDashing = false;
    this.iframes = 0;
    this.coyoteTime = 0;
    this.wasOnGround = false;
    this.jumpHeld = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.dead = false;
    this.respawnX = x;
    this.respawnY = y;

    // Physics sprite
    this.sprite = scene.physics.add.sprite(x, y, 'alan');
    this.sprite.setCollideWorldBounds(false);
    this.sprite.body.setSize(10, 20);
    this.sprite.body.setOffset(3, 2);
    this.sprite.setDepth(10);

    // Glow aura (behind player)
    this.glow = scene.add.image(x, y, 'alan-glow');
    this.glow.setDepth(9);
    this.glow.setBlendMode(Phaser.BlendModes.ADD);
    this.glow.setAlpha(0.5);

    // Attack hitbox (invisible, static body)
    this.hitbox = scene.add.rectangle(x, y, ATTACK_RANGE * 2, 20, 0xffffff, 0);
    scene.physics.add.existing(this.hitbox, true);
    this.hitbox.setActive(false);

    this._walkFrame = 0;
    this._walkTimer = 0;
  }

  setCheckpoint(x, y) {
    this.respawnX = x;
    this.respawnY = y;
  }

  getGlowColor(lightLevel) {
    const colors = [
      0x888888, // grey
      0x4499ff, // blue (zone 1 cleared)
      0xaa44ff, // violet (zone 2 cleared)
      0xffffff, // white/rainbow (zone 3)
    ];
    return colors[Math.min(lightLevel, 3)];
  }

  takeDamage(amount = 1) {
    if (this.iframes > 0 || this.dead) return false;
    this.health -= amount;
    this.iframes = IFRAMES_DAMAGE;
    sfxHit();
    // Flash effect
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: 60,
      yoyo: true,
      repeat: 4,
    });
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
    return true;
  }

  die() {
    this.dead = true;
    this.sprite.setVelocity(0, 0);
    this.scene.cameras.main.shake(300, 0.015);
    this.scene.time.delayedCall(800, () => this.respawn());
  }

  respawn() {
    this.dead = false;
    this.health = this.maxHealth;
    this.lightMeter = 60;
    this.iframes = 500;
    this.sprite.setPosition(this.respawnX, this.respawnY - 10);
    this.sprite.setVelocity(0, 0);
    this.sprite.setAlpha(1);
  }

  update(time, delta, cursors, wasd, pad) {
    if (this.dead) return;

    const dt = delta / 1000;
    const onGround = this.sprite.body.blocked.down;

    // Gamepad helpers (standard mapping: PS4/PS5/Xbox all use HID standard)
    const gpLeft  = pad && (pad.leftStick?.x < -0.25 || pad.left?.pressed  || pad.buttons?.[14]?.pressed);
    const gpRight = pad && (pad.leftStick?.x >  0.25 || pad.right?.pressed || pad.buttons?.[15]?.pressed);
    const gpJumpJust = pad && (
      pad.A?.justPressed || pad.buttons?.[0]?.justPressed ||
      pad.up?.justPressed || pad.buttons?.[12]?.justPressed
    );
    const gpJumpHeld = pad && (
      pad.A?.pressed || pad.buttons?.[0]?.pressed ||
      pad.up?.pressed || pad.buttons?.[12]?.pressed
    );
    const gpDashJust = pad && (
      pad.R1?.justPressed || pad.buttons?.[5]?.justPressed ||
      pad.B?.justPressed  || pad.buttons?.[1]?.justPressed
    );
    const gpAttackJust = pad && (
      pad.X?.justPressed || pad.buttons?.[2]?.justPressed
    );

    // Coyote time
    if (onGround) {
      this.coyoteTime = COYOTE_MS;
    } else {
      this.coyoteTime = Math.max(0, this.coyoteTime - delta);
    }

    // Iframes countdown
    this.iframes = Math.max(0, this.iframes - delta);
    this.dashCooldown = Math.max(0, this.dashCooldown - delta);

    // Light meter drains slowly; dark means danger
    this.lightMeter = Math.max(0, this.lightMeter - 3 * dt);
    if (this.lightMeter <= 0) {
      // Darkness damage — slow, 1 hp every 2s
      this._darkDmgTimer = (this._darkDmgTimer || 0) + delta;
      if (this._darkDmgTimer > 2000) {
        this._darkDmgTimer = 0;
        this.takeDamage(1);
      }
    } else {
      this._darkDmgTimer = 0;
    }

    // ── Dash ────────────────────────────────────────────────────────────────
    if (this.isDashing) {
      this.dashTimer -= delta;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.sprite.body.setGravityY(0);
      }
    }

    const dashKey = wasd.dash;
    if ((Phaser.Input.Keyboard.JustDown(dashKey) || gpDashJust) && this.dashCooldown <= 0 && !this.isDashing) {
      this.isDashing = true;
      this.dashTimer = DASH_DURATION;
      this.dashCooldown = DASH_COOLDOWN;
      this.iframes = Math.max(this.iframes, IFRAMES_DASH);
      const dir = this.facingRight ? 1 : -1;
      this.sprite.setVelocityX(dir * DASH_VEL);
      this.sprite.body.setGravityY(-800); // negate gravity during dash
      sfxDash();
      // Dash particle trail
      this._spawnDashParticles();
    }

    // ── Horizontal movement ──────────────────────────────────────────────────
    if (!this.isDashing) {
      const left  = cursors.left.isDown  || wasd.left.isDown  || gpLeft;
      const right = cursors.right.isDown || wasd.right.isDown || gpRight;

      if (left) {
        this.sprite.setVelocityX(-SPEED);
        this.facingRight = false;
        this.sprite.setFlipX(true);
      } else if (right) {
        this.sprite.setVelocityX(SPEED);
        this.facingRight = true;
        this.sprite.setFlipX(false);
      } else {
        this.sprite.setVelocityX(this.sprite.body.velocity.x * 0.75);
      }
    }

    // ── Jump ────────────────────────────────────────────────────────────────
    const jumpDown = Phaser.Input.Keyboard.JustDown(cursors.up) ||
      Phaser.Input.Keyboard.JustDown(wasd.jump) ||
      Phaser.Input.Keyboard.JustDown(cursors.space) ||
      gpJumpJust;
    const jumpHeld = cursors.up.isDown || wasd.jump.isDown || cursors.space.isDown || gpJumpHeld;

    if (jumpDown && this.coyoteTime > 0) {
      this.sprite.setVelocityY(JUMP_VEL);
      this.coyoteTime = 0;
      this.jumpHeld = true;
      sfxJump();
    }

    // Variable height — cut jump short if key released
    if (this.jumpHeld && !jumpHeld) {
      this.jumpHeld = false;
      if (this.sprite.body.velocity.y < -80) {
        this.sprite.setVelocityY(this.sprite.body.velocity.y * 0.55);
      }
    }
    if (onGround) this.jumpHeld = false;

    // ── Attack ──────────────────────────────────────────────────────────────
    const atkKey = wasd.attack;
    if ((Phaser.Input.Keyboard.JustDown(atkKey) || gpAttackJust) && !this.isAttacking) {
      this.isAttacking = true;
      this.attackConnected = false;
      const dir = this.facingRight ? 1 : -1;
      const hx = this.sprite.x + dir * (ATTACK_RANGE / 2 + 8);
      // Position hitbox (game object position used for distance checks)
      this.hitbox.setPosition(hx, this.sprite.y);
      this.hitbox.setActive(true);

      // Visible slash arc
      const slash = this.scene.add.graphics().setDepth(20);
      slash.lineStyle(2, 0xffffff, 0.9);
      slash.strokeLineShape(new Phaser.Geom.Line(
        this.sprite.x + dir * 6,  this.sprite.y - 14,
        this.sprite.x + dir * 36, this.sprite.y + 10
      ));
      slash.lineStyle(1, 0xaaddff, 0.6);
      slash.strokeLineShape(new Phaser.Geom.Line(
        this.sprite.x + dir * 8,  this.sprite.y - 10,
        this.sprite.x + dir * 32, this.sprite.y + 14
      ));
      this.scene.tweens.add({ targets: slash, alpha: 0, duration: 160,
        onComplete: () => slash.destroy() });

      this.scene.time.delayedCall(ATTACK_DURATION, () => {
        this.isAttacking = false;
        this.hitbox.setActive(false);
      });
    }

    // ── Visual update ────────────────────────────────────────────────────────
    const lightLevel = this.scene.registry.get('lightLevel') || 0;
    const color = this.getGlowColor(lightLevel);
    this.glow.setTint(color);
    this.glow.setPosition(this.sprite.x, this.sprite.y);

    // Pulse glow based on light meter
    const pulse = 0.3 + (this.lightMeter / this.maxLight) * 0.5;
    this.glow.setAlpha(pulse + Math.sin(time * 0.003) * 0.05);

    // Rainbow aura when light level = 3
    if (lightLevel >= 3) {
      const hue = (time * 0.2) % 360;
      const rgb = Phaser.Display.Color.HSVToRGB(hue / 360, 1, 1);
      this.glow.setTint(Phaser.Display.Color.GetColor(rgb.r, rgb.g, rgb.b));
    }

    // Walk animation
    if (!this.isDashing && (Math.abs(this.sprite.body.velocity.x) > 20)) {
      this._walkTimer += delta;
      if (this._walkTimer > 120) {
        this._walkTimer = 0;
        this._walkFrame = 1 - this._walkFrame;
        this.sprite.setTexture(this._walkFrame === 0 ? 'alan' : 'alan-walk');
      }
    } else {
      this.sprite.setTexture('alan');
    }

    // World bounds — left edge
    if (this.sprite.x < 10) this.sprite.setX(10);
  }

  refillLight(amount) {
    this.lightMeter = Math.min(this.maxLight, this.lightMeter + amount);
  }

  heal(amount = 1) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  _spawnDashParticles() {
    const zone = this.scene.zoneNum || 1;
    const colors = [0x7ab3d4, 0x8a5aee, 0xffe060];
    const color = colors[zone - 1];
    const emitter = this.scene.add.particles(
      this.sprite.x, this.sprite.y, 'particle', {
        speed: { min: 30, max: 80 },
        lifespan: 250,
        quantity: 5,
        tint: color,
        scale: { start: 1.5, end: 0 },
        stopAfter: 5,
      }
    );
    this.scene.time.delayedCall(400, () => emitter.destroy());
  }

  destroy() {
    this.sprite.destroy();
    this.glow.destroy();
    this.hitbox.destroy();
  }
}
