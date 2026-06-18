import { generateAllTextures } from '../systems/artgen.js';

export class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }

  async create() {
    // Set shared registry defaults
    this.registry.set('lightLevel', 0);
    this.registry.set('playerHealth', 3);

    // Ensure the Orbitron UI font is loaded before scenes draw their text
    try {
      await Promise.all([
        document.fonts.load('400 16px "Orbitron"'),
        document.fonts.load('700 16px "Orbitron"'),
      ]);
      await document.fonts.ready;
    } catch (_) {}

    // Generate ALL procedural textures here once
    generateAllTextures(this);

    this.scene.start('Title');
  }
}
