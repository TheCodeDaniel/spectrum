import { ZoneBase } from './ZoneBase.js';
import { DIALOGUE } from '../data/dialogue.js';

export class Zone3 extends ZoneBase {
  static ZONE_NUM = 3;
  static WORLD_WIDTH = 5280;
  static COLORS = {
    ground: 0x201000,
    platform: 0xb08020,
    platformEdge: 0xe0b840,
    platformTop: 0xffe060,
  };

  static PLATFORMS = [
    // Ground
    { x: 0,    y: 245, w: 480, h: 25, type: 'ground' },
    { x: 560,  y: 245, w: 280, h: 25, type: 'ground' },
    { x: 940,  y: 245, w: 340, h: 25, type: 'ground' },
    { x: 1400, y: 245, w: 420, h: 25, type: 'ground' },
    { x: 1960, y: 245, w: 440, h: 25, type: 'ground' },
    { x: 2560, y: 245, w: 480, h: 25, type: 'ground' }, // checkpoint
    { x: 3200, y: 245, w: 380, h: 25, type: 'ground' },
    { x: 3740, y: 245, w: 340, h: 25, type: 'ground' },
    { x: 4240, y: 245, w: 340, h: 25, type: 'ground' },
    { x: 4740, y: 245, w: 540, h: 25, type: 'ground' }, // final boss
    // Ascending platforms — zone 3 has a climactic rise in the middle
    { x: 480,  y: 206, w: 100, h: 16 },
    { x: 572,  y: 190, w: 80,  h: 16 },
    { x: 860,  y: 200, w: 100, h: 16 },
    { x: 1050, y: 185, w: 80,  h: 16 },
    { x: 1310, y: 198, w: 100, h: 16 },
    { x: 1835, y: 200, w: 100, h: 16 },
    { x: 1920, y: 182, w: 80,  h: 16 },
    { x: 2100, y: 170, w: 80,  h: 16 }, // ascending
    { x: 2220, y: 155, w: 80,  h: 16 },
    { x: 2340, y: 140, w: 100, h: 16 }, // high point
    { x: 2460, y: 155, w: 80,  h: 16 },
    { x: 2560, y: 170, w: 80,  h: 16 },
    { x: 2680, y: 188, w: 80,  h: 16 },
    { x: 3110, y: 200, w: 100, h: 16 },
    { x: 3615, y: 198, w: 100, h: 16 },
    { x: 3710, y: 183, w: 80,  h: 16 },
    { x: 4130, y: 198, w: 100, h: 16 },
    { x: 4225, y: 183, w: 80,  h: 16 },
    { x: 4630, y: 198, w: 100, h: 16 },
    { x: 4725, y: 183, w: 80,  h: 16 },
    // High
    { x: 640,  y: 150, w: 80, h: 16 },
    { x: 1150, y: 148, w: 80, h: 16 },
    { x: 2000, y: 138, w: 80, h: 16 },
    { x: 3300, y: 145, w: 80, h: 16 },
  ];

  static ENEMIES = [
    { x: 620,  y: 230 },
    { x: 980,  y: 230 },
    { x: 1200, y: 230 },
    { x: 1500, y: 230 },
    { x: 1800, y: 230 },
    { x: 2060, y: 230 },
    { x: 2300, y: 215 },
    { x: 2400, y: 215 },
    { x: 2700, y: 230 },
    { x: 2900, y: 230 },
    { x: 3280, y: 230 },
    { x: 3500, y: 230 },
    { x: 3820, y: 230 },
    { x: 4060, y: 230 },
    { x: 4340, y: 230 },
    { x: 4580, y: 230 },
    { x: 4820, y: 230 },
  ];

  static BOSS = { x: 5060, y: 220, triggerX: 4780 };
  static CHECKPOINT = { x: 2620, y: 245 };
  static GATE = { x: 5220, y: 222 };
  static DIALOGUE = DIALOGUE.zone3;
}
