import Phaser from 'phaser';
import { fiksForPikselratio } from '../fiks-for-pikselratio';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'preload-scene' });
  }

  preload() {
    console.log('preload-scene');

    this.load.spritesheet('hero', `/assets/hero-sprite@${fiksForPikselratio(1)}.png?v={VERSJON}`, {
      frameWidth: fiksForPikselratio(75),
      frameHeight: fiksForPikselratio(90),
      margin: 1,
      spacing: 2,
    });

    this.load.spritesheet('enemy', `/assets/enemy-sprite@${fiksForPikselratio(1)}.png?v={VERSJON}`, {
      frameWidth: fiksForPikselratio(40),
      frameHeight: fiksForPikselratio(80),
      margin: 1,
      spacing: 2,
    });

    this.load.image('tiles', `/assets/tiles-sprite@${fiksForPikselratio(1)}.png?v={VERSJON}`);

    this.load.tilemapTiledJSON('map', `assets/levels@${fiksForPikselratio(1)}.json?v={VERSJON}`);
  }

  create(): void {
    this.scene.launch('lost-scene');
    this.scene.pause('lost-scene');
    this.scene.start('main-scene');
    this.scene.bringToTop('main-scene');
  }
}
