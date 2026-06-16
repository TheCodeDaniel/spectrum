// All procedural texture generation — zero image files

export function generateAllTextures(scene) {
  genPlayer(scene);
  genAria(scene);
  genEnemies(scene);
  genUI(scene);
  genParticle(scene);
  genCheckpoint(scene);
  genLightGate(scene);
  genAllySpirit(scene);
  genPlatforms(scene);
  genBackgrounds(scene);
  genPortraits(scene);
  genScanlines(scene);
}

function px(g, color, x, y, w = 1, h = 1) {
  g.fillStyle(color);
  g.fillRect(x, y, w, h);
}

// ── Player (Alan) 16×24 ──────────────────────────────────────────────────────
function genPlayer(scene) {
  const g = scene.make.graphics({ add: false });

  // Hat brim + crown
  px(g, 0x2a2a3a, 2, 0, 12, 2);
  px(g, 0x3a3a4a, 3, 2, 10, 1);

  // Head / skin
  px(g, 0xc8a87a, 4, 3, 8, 5);
  // Eyes
  px(g, 0x111122, 5, 5, 2, 2);
  px(g, 0x111122, 9, 5, 2, 2);
  // Shine
  px(g, 0xffffff, 5, 5, 1, 1);
  px(g, 0xffffff, 9, 5, 1, 1);
  // Mouth subtle
  px(g, 0xa07050, 7, 7, 2, 1);

  // Jacket body (grey-blue)
  px(g, 0x4a5a7a, 3, 8, 10, 8);
  // Jacket lapels
  px(g, 0x5a6a8a, 6, 8, 1, 3);
  px(g, 0x5a6a8a, 9, 8, 1, 3);
  // Shirt/tie (accent — will be tinted via separate aura sprite)
  px(g, 0x888888, 7, 9, 2, 4);

  // Arms
  px(g, 0x4a5a7a, 1, 8, 2, 7);
  px(g, 0x4a5a7a, 13, 8, 2, 7);
  // Hands
  px(g, 0xc8a87a, 1, 14, 2, 2);
  px(g, 0xc8a87a, 13, 14, 2, 2);

  // Trousers
  px(g, 0x2e2e4e, 3, 16, 4, 7);
  px(g, 0x2e2e4e, 9, 16, 4, 7);
  // Belt
  px(g, 0x1a1a2a, 3, 15, 10, 1);

  // Shoes
  px(g, 0x1a1218, 2, 22, 5, 2);
  px(g, 0x1a1218, 9, 22, 5, 2);

  g.generateTexture('alan', 16, 24);
  g.clear();

  // Aura overlay — same canvas, just the accent glow pixels
  // This is a separate sprite under alan, tinted based on lightLevel
  px(g, 0xffffff, 0, 0, 16, 24);  // full white, will be masked
  // We use a circle aura instead — generated separately as 'alan-glow'
  g.clear();

  // Glow circle for Alan's aura (24x24, centered on 32x32 canvas)
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const dx = x - 16, dy = y - 16;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 16) {
        const alpha = Math.max(0, (16 - dist) / 16);
        g.fillStyle(0xffffff, alpha * 0.6);
        g.fillRect(x, y, 1, 1);
      }
    }
  }
  g.generateTexture('alan-glow', 32, 32);
  g.clear();

  // Alan walk frame 2 (legs slightly different)
  px(g, 0x2a2a3a, 2, 0, 12, 2);
  px(g, 0x3a3a4a, 3, 2, 10, 1);
  px(g, 0xc8a87a, 4, 3, 8, 5);
  px(g, 0x111122, 5, 5, 2, 2);
  px(g, 0x111122, 9, 5, 2, 2);
  px(g, 0xffffff, 5, 5, 1, 1);
  px(g, 0xffffff, 9, 5, 1, 1);
  px(g, 0xa07050, 7, 7, 2, 1);
  px(g, 0x4a5a7a, 3, 8, 10, 8);
  px(g, 0x5a6a8a, 6, 8, 1, 3);
  px(g, 0x5a6a8a, 9, 8, 1, 3);
  px(g, 0x888888, 7, 9, 2, 4);
  px(g, 0x4a5a7a, 1, 8, 2, 7);
  px(g, 0x4a5a7a, 13, 8, 2, 7);
  px(g, 0xc8a87a, 1, 14, 2, 2);
  px(g, 0xc8a87a, 13, 14, 2, 2);
  px(g, 0x1a1a2a, 3, 15, 10, 1);
  // Walk frame: opposite legs
  px(g, 0x2e2e4e, 3, 16, 4, 4);
  px(g, 0x2e2e4e, 9, 16, 4, 7);
  px(g, 0x2e2e4e, 4, 20, 3, 3);
  px(g, 0x1a1218, 3, 22, 5, 2);
  px(g, 0x1a1218, 9, 22, 5, 2);
  g.generateTexture('alan-walk', 16, 24);
  g.clear();

  g.destroy();
}

// ── ARIA companion cube 12×12 ─────────────────────────────────────────────────
function genAria(scene) {
  const g = scene.make.graphics({ add: false });

  // Top face (lighter)
  px(g, 0x9955ee, 2, 0, 8, 3);
  px(g, 0xaa66ff, 3, 0, 6, 2);

  // Front face
  px(g, 0x6633cc, 0, 3, 12, 8);
  // Logic gate pattern — XOR shape
  px(g, 0x22ffcc, 2, 5, 2, 2);
  px(g, 0x22ffcc, 8, 5, 2, 2);
  px(g, 0x22ffcc, 5, 4, 2, 1);
  px(g, 0x22ffcc, 4, 7, 4, 1);
  // Side shadow
  px(g, 0x441188, 10, 3, 2, 8);

  // Highlight corner
  px(g, 0xcc99ff, 1, 4, 1, 3);

  g.generateTexture('aria', 12, 12);
  g.clear();

  // ARIA glow (soft disc)
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      const dx = x - 10, dy = y - 10;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 10) {
        const a = (10 - dist) / 10;
        g.fillStyle(0xaa66ff, a * 0.5);
        g.fillRect(x, y, 1, 1);
      }
    }
  }
  g.generateTexture('aria-glow', 20, 20);
  g.clear();

  g.destroy();
}

// ── Enemies ────────────────────────────────────────────────────────────────────
function genEnemies(scene) {
  const g = scene.make.graphics({ add: false });

  // Shadow Wisp 14×14 — dark amorphous blob
  for (let y = 0; y < 14; y++) {
    for (let x = 0; x < 14; x++) {
      const dx = x - 7, dy = y - 7;
      const dist = Math.sqrt(dx * dx + dy * dy * 1.3);
      if (dist < 6.5) {
        const inner = dist < 4;
        g.fillStyle(inner ? 0x1a0033 : 0x330055, 1);
        g.fillRect(x, y, 1, 1);
      }
    }
  }
  // Eye glints
  px(g, 0xff0088, 4, 5, 2, 2);
  px(g, 0xff0088, 8, 5, 2, 2);
  px(g, 0xff66bb, 4, 5, 1, 1);
  px(g, 0xff66bb, 8, 5, 1, 1);
  g.generateTexture('wisp', 14, 14);
  g.clear();

  // Boss Wisp 28×28 — larger, more menacing
  for (let y = 0; y < 28; y++) {
    for (let x = 0; x < 28; x++) {
      const dx = x - 14, dy = y - 14;
      const dist = Math.sqrt(dx * dx + dy * dy * 1.2);
      if (dist < 13) {
        const inner = dist < 9;
        g.fillStyle(inner ? 0x0a0020 : 0x220044, 1);
        g.fillRect(x, y, 1, 1);
      }
    }
  }
  // Boss eyes
  px(g, 0xff0044, 8, 10, 4, 4);
  px(g, 0xff0044, 16, 10, 4, 4);
  px(g, 0xff6688, 8, 10, 2, 2);
  px(g, 0xff6688, 16, 10, 2, 2);
  // Boss crown spikes
  px(g, 0x440066, 10, 0, 3, 4);
  px(g, 0x440066, 15, 1, 3, 3);
  px(g, 0x440066, 5, 2, 3, 2);
  g.generateTexture('boss-wisp', 28, 28);
  g.clear();

  g.destroy();
}

// ── Ally Spirit (Zone 2) 10×10 ───────────────────────────────────────────────
function genAllySpirit(scene) {
  const g = scene.make.graphics({ add: false });
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const dx = x - 5, dy = y - 5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 4.5) {
        const a = (4.5 - dist) / 4.5;
        g.fillStyle(0xffdd44, a);
        g.fillRect(x, y, 1, 1);
      }
    }
  }
  px(g, 0xffffff, 3, 3, 1, 1);
  px(g, 0xffffff, 6, 3, 1, 1);
  g.generateTexture('ally', 10, 10);
  g.clear();

  // Ally glow
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const dx = x - 8, dy = y - 8;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 8) {
        g.fillStyle(0xffdd44, (8 - dist) / 8 * 0.4);
        g.fillRect(x, y, 1, 1);
      }
    }
  }
  g.generateTexture('ally-glow', 16, 16);
  g.clear();

  g.destroy();
}

// ── UI elements ────────────────────────────────────────────────────────────────
function genUI(scene) {
  const g = scene.make.graphics({ add: false });

  // Heart 9×8
  const heartPixels = [
    '011 011',
    '111 111',
    '1111111',
    '1111111',
    ' 11111 ',
    '  111  ',
    '   1   ',
  ];
  heartPixels.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c === '1') {
        g.fillStyle(0xff3366);
        g.fillRect(x, y, 1, 1);
      }
    });
  });
  g.generateTexture('heart', 9, 8);
  g.clear();

  // Empty heart
  const emptyPixels = [
    '011 011',
    '111 111',
    '1111111',
    '1111111',
    ' 11111 ',
    '  111  ',
    '   1   ',
  ];
  emptyPixels.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c === '1') {
        g.fillStyle(0x442233);
        g.fillRect(x, y, 1, 1);
      }
    });
  });
  g.generateTexture('heart-empty', 9, 8);
  g.clear();

  g.destroy();
}

// ── Particle & utility ────────────────────────────────────────────────────────
function genParticle(scene) {
  const g = scene.make.graphics({ add: false });
  g.fillStyle(0xffffff);
  g.fillRect(0, 0, 4, 4);
  g.generateTexture('particle', 4, 4);
  g.clear();
  // 1×1 white pixel used for scalable platform bodies
  g.fillRect(0, 0, 1, 1);
  g.generateTexture('pixel', 1, 1);
  g.destroy();
}

// ── Checkpoint orb 16×16 ─────────────────────────────────────────────────────
function genCheckpoint(scene) {
  const g = scene.make.graphics({ add: false });
  // Pole
  px(g, 0x888888, 7, 0, 2, 16);
  // Orb (inactive = grey)
  for (let y = 2; y < 10; y++) {
    for (let x = 3; x < 13; x++) {
      const dx = x - 8, dy = y - 6;
      if (dx * dx + dy * dy < 16) {
        g.fillStyle(0x555577);
        g.fillRect(x, y, 1, 1);
      }
    }
  }
  g.generateTexture('checkpoint', 16, 16);
  g.clear();

  // Active checkpoint
  px(g, 0x888888, 7, 0, 2, 16);
  for (let y = 2; y < 10; y++) {
    for (let x = 3; x < 13; x++) {
      const dx = x - 8, dy = y - 6;
      if (dx * dx + dy * dy < 16) {
        g.fillStyle(0x88aaff);
        g.fillRect(x, y, 1, 1);
      }
    }
  }
  px(g, 0xffffff, 6, 4, 2, 2);
  g.generateTexture('checkpoint-active', 16, 16);
  g.clear();

  g.destroy();
}

// ── Light Gate 32×48 ─────────────────────────────────────────────────────────
function genLightGate(scene) {
  const g = scene.make.graphics({ add: false });
  // Frame
  px(g, 0x888855, 0, 0, 4, 48);  // left pillar
  px(g, 0x888855, 28, 0, 4, 48); // right pillar
  px(g, 0x888855, 0, 0, 32, 4);  // top bar
  // Gate bars (closed)
  for (let i = 0; i < 6; i++) {
    px(g, 0x666644, 5 + i * 4, 4, 2, 44);
  }
  // Glow on bars
  px(g, 0xffffaa, 5, 0, 22, 2);
  g.generateTexture('light-gate', 32, 48);
  g.clear();

  // Open gate (just the frame, no bars)
  px(g, 0xccaa33, 0, 0, 4, 48);
  px(g, 0xccaa33, 28, 0, 4, 48);
  px(g, 0xccaa33, 0, 0, 32, 4);
  // Golden light fill
  for (let y = 4; y < 48; y++) {
    const a = 0.15 + (y / 48) * 0.1;
    g.fillStyle(0xffee88, a);
    g.fillRect(4, y, 24, 1);
  }
  px(g, 0xffff99, 4, 2, 24, 3);
  g.generateTexture('light-gate-open', 32, 48);
  g.clear();

  g.destroy();
}

// ── Zone platforms (64×16 tile) ───────────────────────────────────────────────
function genPlatforms(scene) {
  const zones = [
    { key: 'platform-z1', top: 0x5a7a9e, mid: 0x3a5a7e, bot: 0x2a3a5e, edge: 0x7aabce },
    { key: 'platform-z2', top: 0x6a3a9e, mid: 0x4a2a7e, bot: 0x2a1a4e, edge: 0x8a5aee },
    { key: 'platform-z3', top: 0xc8a030, mid: 0x9a7820, bot: 0x6a5010, edge: 0xffe060 },
  ];

  zones.forEach(({ key, top, mid, bot, edge }) => {
    const g = scene.make.graphics({ add: false });
    // Top highlight row
    px(g, edge, 0, 0, 64, 2);
    // Main body
    px(g, top, 0, 2, 64, 6);
    px(g, mid, 0, 8, 64, 5);
    px(g, bot, 0, 13, 64, 3);
    // Pixel noise / texture detail
    for (let i = 0; i < 8; i++) {
      const xi = (i * 8 + 3) % 64;
      px(g, top, xi, 3, 2, 1);
    }
    g.generateTexture(key, 64, 16);
    g.clear();
    g.destroy();
  });

  // Ground tile variants (same as platform but thicker, 64×24)
  const gzones = [
    { key: 'ground-z1', top: 0x3a5a7e, mid: 0x2a3a5e, bot: 0x1a2a3e, edge: 0x5a8aae },
    { key: 'ground-z2', top: 0x4a2a7e, mid: 0x2a1a5e, bot: 0x1a0a3e, edge: 0x6a4abe },
    { key: 'ground-z3', top: 0xa07820, mid: 0x7a5810, bot: 0x4a3808, edge: 0xc8a030 },
  ];

  gzones.forEach(({ key, top, mid, bot, edge }) => {
    const g = scene.make.graphics({ add: false });
    px(g, edge, 0, 0, 64, 2);
    px(g, top, 0, 2, 64, 8);
    px(g, mid, 0, 10, 64, 8);
    px(g, bot, 0, 18, 64, 6);
    for (let i = 0; i < 8; i++) {
      const xi = (i * 8 + 2) % 64;
      px(g, top, xi, 4, 3, 2);
    }
    g.generateTexture(key, 64, 24);
    g.clear();
    g.destroy();
  });
}

// ── Parallax backgrounds ───────────────────────────────────────────────────────
function genBackgrounds(scene) {
  // Zone 1: Cold blue/grey — Cipher Halls
  genBgZone(scene, 1, {
    sky: 0x080e1c, stars: 0x7ab3d4, pillars: 0x1a2a45, pillarHi: 0x2a3a60
  });

  // Zone 2: Deep indigo — The Long Night
  genBgZone(scene, 2, {
    sky: 0x060010, stars: 0x8855ff, pillars: 0x180830, pillarHi: 0x28124a
  });

  // Zone 3: Warm gold — The Transmission
  genBgZone(scene, 3, {
    sky: 0x100800, stars: 0xffe066, pillars: 0x301800, pillarHi: 0x4a2800
  });
}

function genBgZone(scene, z, { sky, stars, pillars, pillarHi }) {
  // Far layer 480×270
  const gf = scene.make.graphics({ add: false });
  gf.fillStyle(sky);
  gf.fillRect(0, 0, 480, 270);
  // Stars / ambient particles
  const rng = mulberry32(z * 12345);
  for (let i = 0; i < 80; i++) {
    const sx = Math.floor(rng() * 480);
    const sy = Math.floor(rng() * 200);
    const bright = rng() > 0.8;
    gf.fillStyle(stars, bright ? 0.9 : 0.4);
    gf.fillRect(sx, sy, bright ? 2 : 1, bright ? 2 : 1);
  }
  gf.generateTexture(`bg-z${z}-far`, 480, 270);
  gf.destroy();

  // Mid layer 480×270 — architectural silhouettes / pillars
  const gm = scene.make.graphics({ add: false });
  gm.fillStyle(0x000000, 0); // transparent base
  // Draw some background pillars
  for (let i = 0; i < 6; i++) {
    const px2 = i * 90 - 20;
    const ph = 80 + (i % 3) * 30;
    const py = 270 - ph;
    gm.fillStyle(pillars);
    gm.fillRect(px2, py, 25, ph);
    gm.fillStyle(pillarHi);
    gm.fillRect(px2, py, 3, ph);
    gm.fillRect(px2, py, 25, 3);
    // Arch top
    gm.fillStyle(pillars);
    gm.fillRect(px2 - 5, py, 35, 8);
  }
  gm.generateTexture(`bg-z${z}-mid`, 480, 270);
  gm.destroy();
}

// ── Dialogue portraits 32×36 ─────────────────────────────────────────────────
function genPortraits(scene) {
  // Alan portrait
  const ga = scene.make.graphics({ add: false });
  px(ga, 0x1a1a2a, 0, 0, 32, 36);
  px(ga, 0x2a2a3a, 4, 2, 10, 2); // hat
  px(ga, 0x3a3a4a, 5, 4, 8, 1);
  px(ga, 0xc8a87a, 5, 5, 8, 7); // face
  px(ga, 0x111122, 6, 7, 2, 2); // eyes
  px(ga, 0x111122, 10, 7, 2, 2);
  px(ga, 0xffffff, 6, 7, 1, 1);
  px(ga, 0xffffff, 10, 7, 1, 1);
  px(ga, 0xa07050, 8, 10, 2, 1); // mouth
  px(ga, 0x4a5a7a, 3, 12, 12, 10); // jacket
  px(ga, 0x888888, 7, 13, 2, 6); // tie
  ga.generateTexture('portrait-alan', 32, 36);
  ga.destroy();

  // ARIA portrait
  const gr = scene.make.graphics({ add: false });
  px(gr, 0x0a0020, 0, 0, 32, 36);
  // Cube centered
  px(gr, 0x9955ee, 8, 6, 16, 5); // top
  px(gr, 0x6633cc, 4, 11, 24, 16); // front
  px(gr, 0x22ffcc, 8, 15, 4, 3); // gates
  px(gr, 0x22ffcc, 16, 15, 4, 3);
  px(gr, 0x22ffcc, 12, 19, 4, 2);
  px(gr, 0x441188, 22, 11, 6, 16); // side
  // Glow hint
  for (let i = 0; i < 32; i++) {
    gr.fillStyle(0xaa66ff, 0.05);
    gr.fillRect(0, 0, 32, 36);
  }
  gr.generateTexture('portrait-aria', 32, 36);
  gr.destroy();
}

// ── CRT Scanlines overlay 480×270 ─────────────────────────────────────────────
function genScanlines(scene) {
  const g = scene.make.graphics({ add: false });
  for (let y = 0; y < 270; y += 2) {
    g.fillStyle(0x000000, 0.12);
    g.fillRect(0, y, 480, 1);
  }
  g.generateTexture('scanlines', 480, 270);
  g.destroy();
}

// Simple seedable RNG for deterministic procedural art
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
