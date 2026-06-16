import { generateAllTextures } from '../systems/artgen.js';

export class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    // Set shared registry defaults
    this.registry.set('lightLevel', 0);
    this.registry.set('playerHealth', 3);

    // Generate ALL procedural textures here once
    generateAllTextures(this);

    this.scene.start('Title');
  }
}
