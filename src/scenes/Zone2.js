import { ZoneBase } from './ZoneBase.js';
import { DIALOGUE } from '../data/dialogue.js';

export class Zone2 extends ZoneBase {
  constructor() { super('Zone2'); }
  static ZONE_NUM = 2;
  static WORLD_WIDTH = 5760;
  static COLORS = {
    ground: 0x140820,
    platform: 0x4a2a7e,
    platformEdge: 0x6a3aae,
    platformTop: 0x8a5ace,
  };

  static PLATFORMS = [
    // Ground
    { x: 0,    y: 245, w: 500, h: 25, type: 'ground' },
    { x: 600,  y: 245, w: 300, h: 25, type: 'ground' },
    { x: 1050, y: 245, w: 400, h: 25, type: 'ground' },
    { x: 1600, y: 245, w: 460, h: 25, type: 'ground' },
    { x: 2220, y: 245, w: 460, h: 25, type: 'ground' },
    { x: 2900, y: 245, w: 580, h: 25, type: 'ground' }, // checkpoint + ally spawn
    { x: 3640, y: 245, w: 380, h: 25, type: 'ground' },
    { x: 4120, y: 245, w: 360, h: 25, type: 'ground' },
    { x: 4640, y: 245, w: 360, h: 25, type: 'ground' },
    { x: 5100, y: 245, w: 660, h: 25, type: 'ground' }, // boss + gate
    // Floating
    { x: 458,  y: 206, w: 100, h: 16 },
    { x: 548,  y: 192, w: 80,  h: 16 },
    { x: 860,  y: 206, w: 100, h: 16 },
    { x: 960,  y: 192, w: 80,  h: 16 },
    { x: 1040, y: 206, w: 80,  h: 16 },
    { x: 1490, y: 202, w: 80,  h: 16 },
    { x: 1565, y: 188, w: 80,  h: 16 },
    { x: 2090, y: 200, w: 80,  h: 16 },
    { x: 2180, y: 186, w: 80,  h: 16 },
    { x: 2270, y: 200, w: 80,  h: 16 },
    { x: 2720, y: 198, w: 100, h: 16 },
    { x: 2825, y: 186, w: 100, h: 16 },
    { x: 2920, y: 200, w: 80,  h: 16 },
    { x: 3530, y: 200, w: 100, h: 16 },
    { x: 3630, y: 185, w: 80,  h: 16 },
    { x: 4010, y: 200, w: 100, h: 16 },
    { x: 4105, y: 186, w: 80,  h: 16 },
    { x: 4530, y: 200, w: 100, h: 16 },
    { x: 4625, y: 186, w: 80,  h: 16 },
    // High
    { x: 660,  y: 150, w: 80, h: 16 },
    { x: 1160, y: 148, w: 80, h: 16 },
    { x: 2340, y: 145, w: 80, h: 16 },
    { x: 3050, y: 148, w: 80, h: 16 },
    { x: 4240, y: 145, w: 80, h: 16 },
  ];

  static ENEMIES = [
    { x: 660,  y: 230 },
    { x: 900,  y: 230 },
    { x: 1180, y: 230 },
    { x: 1480, y: 230 },
    { x: 1720, y: 230 },
    { x: 1960, y: 230 },
    { x: 2350, y: 230 },
    { x: 2560, y: 230 },
    { x: 3200, y: 230 },
    { x: 3420, y: 230 },
    { x: 3840, y: 230 },
    { x: 4060, y: 230 },
    { x: 4440, y: 230 },
    { x: 4700, y: 230 },
    { x: 4960, y: 230 },
  ];

  static BOSS = { x: 5430, y: 220, triggerX: 5120 };
  static CHECKPOINT = { x: 2980, y: 245 };
  static GATE = { x: 5700, y: 222 };
  static DIALOGUE = DIALOGUE.zone2;

  static ALLY_SPAWN = [
    { x: 3060, y: 210 },
    { x: 3100, y: 200 },
    { x: 3080, y: 220 },
  ];
}
