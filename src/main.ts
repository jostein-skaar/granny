import './style.css';

import Phaser from 'phaser';

import { createGameConfig } from './game/config';

let isDebug = true;

if (import.meta.env.PROD) {
  isDebug = false;
}

let pixelRatio = window.devicePixelRatio;
if (pixelRatio !== 1 && pixelRatio !== 2 && pixelRatio !== 3) {
  pixelRatio = 1;
}
pixelRatio = 1;

declare global {
  var pixelRatio: number;
}
globalThis.pixelRatio = pixelRatio;

const gameConfig = createGameConfig(800, 600, Phaser.Scale.ScaleModes.NONE, Phaser.Scale.NO_CENTER, pixelRatio, isDebug);
new Phaser.Game(gameConfig);

window.onload = () => {
  const loader = document.querySelector<HTMLDivElement>('#loader')!;
  const content = document.querySelector<HTMLDivElement>('#content')!;

  loader.style.display = 'none';
  content.style.display = 'block';
};
