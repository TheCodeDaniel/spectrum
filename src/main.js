import Phaser from 'phaser';
import { Boot } from './scenes/Boot.js';
import { Title } from './scenes/Title.js';
import { Zone1 } from './scenes/Zone1.js';
import { Zone2 } from './scenes/Zone2.js';
import { Zone3 } from './scenes/Zone3.js';
import { Ending } from './scenes/Ending.js';

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 270,
  backgroundColor: '#000000',
  parent: 'game-container',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 480,
    height: 270,
  },
  dom: {
    createContainer: true,
  },
  input: {
    gamepad: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false,
    },
  },
  scene: [Boot, Title, Zone1, Zone2, Zone3, Ending],
};

const game = new Phaser.Game(config);
export default game;
