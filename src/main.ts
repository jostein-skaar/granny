import './style.css';

import Phaser from 'phaser';

import { createGameConfig } from './game/config';
import { MainScene } from './game/main-scene';

let isDebug = true;

if (import.meta.env.PROD) {
  isDebug = false;
}

let pixelRatio = window.devicePixelRatio;
if (pixelRatio !== 1 && pixelRatio !== 2 && pixelRatio !== 3) {
  pixelRatio = 1;
}
// pixelRatio = 1;

declare global {
  var pixelRatio: number;
}
globalThis.pixelRatio = pixelRatio;

const gameConfig = createGameConfig(400, 600, Phaser.Scale.ScaleModes.NONE, Phaser.Scale.NO_CENTER, pixelRatio, isDebug);
new Phaser.Game({
  ...gameConfig,
  callbacks: {
    postBoot: (game) => {
      (game.scene.getScene('main-scene') as MainScene).playerNumber = 1;
    },
  },
});
new Phaser.Game({
  ...gameConfig,
  callbacks: {
    postBoot: (game) => {
      (game.scene.getScene('main-scene') as MainScene).playerNumber = 2;
    },
  },
});

window.onload = () => {
  const loader = document.querySelector<HTMLDivElement>('#loader')!;
  const content = document.querySelector<HTMLDivElement>('#content')!;

  loader.style.display = 'none';
  content.style.display = 'block';
};
