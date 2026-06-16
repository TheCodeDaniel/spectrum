import { ZoneBase } from './ZoneBase.js';
import { DIALOGUE } from '../data/dialogue.js';

export class Zone1 extends ZoneBase {
  constructor() { super('Zone1'); }
  static ZONE_NUM = 1;
  static WORLD_WIDTH = 4800;
  static COLORS = {
    ground: 0x1e2d44,
    platform: 0x3a5a7e,
    platformEdge: 0x5a8aae,
    platformTop: 0x6aaace,
  };

  static PLATFORMS = [
    // Ground segments
    { x: 0,    y: 245, w: 480, h: 25, type: 'ground' },
    { x: 540,  y: 245, w: 220, h: 25, type: 'ground' },
    { x: 830,  y: 245, w: 280, h: 25, type: 'ground' },
    { x: 1200, y: 245, w: 380, h: 25, type: 'ground' },
    { x: 1680, y: 245, w: 480, h: 25, type: 'ground' },
    { x: 2260, y: 245, w: 580, h: 25, type: 'ground' }, // checkpoint area
    { x: 2960, y: 245, w: 380, h: 25, type: 'ground' },
    { x: 3450, y: 245, w: 340, h: 25, type: 'ground' },
    { x: 3900, y: 245, w: 900, h: 25, type: 'ground' }, // boss + gate
    // Floating platforms
    { x: 462,  y: 208, w: 100, h: 16 },
    { x: 610,  y: 194, w: 80,  h: 16 },
    { x: 768,  y: 205, w: 80,  h: 16 },
    { x: 1115, y: 205, w: 100, h: 16 },
    { x: 1580, y: 205, w: 100, h: 16 },
    { x: 1700, y: 188, w: 80,  h: 16 },
    { x: 1920, y: 195, w: 100, h: 16 },
    { x: 2070, y: 210, w: 80,  h: 16 },
    { x: 2900, y: 200, w: 80,  h: 16 },
    { x: 3100, y: 190, w: 80,  h: 16 },
    { x: 3340, y: 202, w: 80,  h: 16 },
    { x: 3800, y: 195, w: 100, h: 16 },
    // High platforms
    { x: 660,  y: 160, w: 80, h: 16 },
    { x: 1360, y: 158, w: 90, h: 16 },
    { x: 2000, y: 155, w: 80, h: 16 },
    { x: 3200, y: 152, w: 90, h: 16 },
  ];

  static ENEMIES = [
    { x: 640,  y: 230 },
    { x: 920,  y: 230 },
    { x: 1080, y: 230 },
    { x: 1440, y: 230 },
    { x: 1800, y: 230 },
    { x: 2000, y: 230 },
    { x: 2380, y: 230 },
    { x: 2600, y: 230 },
    { x: 2800, y: 230 },
    { x: 3150, y: 230 },
    { x: 3600, y: 230 },
    { x: 3800, y: 230 },
  ];

  static BOSS = { x: 4280, y: 220, triggerX: 4000 };
  static CHECKPOINT = { x: 2450, y: 245 };
  static GATE = { x: 4680, y: 222 };
  static DIALOGUE = DIALOGUE.zone1;
}
