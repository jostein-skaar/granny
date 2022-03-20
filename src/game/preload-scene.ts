import Phaser from 'phaser';
import { fiksForPikselratio } from '../fiks-for-pikselratio';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'preload-scene' });
  }

  preload() {
    console.log('preload-scene');

    this.load.spritesheet('hero', `/assets/hero-sprite@${fiksForPikselratio(1)}.png?v={VERSJON}`, {
      frameWidth: fiksForPikselratio(50),
      frameHeight: fiksForPikselratio(75),
      margin: 1,
      spacing: 2,
    });

    this.load.spritesheet('enemy', `/assets/enemy-sprite@${fiksForPikselratio(1)}.png?v={VERSJON}`, {
      frameWidth: fiksForPikselratio(32),
      frameHeight: fiksForPikselratio(32),
      margin: 1,
      spacing: 2,
    });
  }

  create(): void {
    this.scene.start('main-scene');
  }
}
