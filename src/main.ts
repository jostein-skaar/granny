import './style.css';

import { registerSW } from 'virtual:pwa-register';

import Phaser from 'phaser';

import { createGameConfig } from './game/config';
import { MainScene } from './game/main-scene';
import { getResults, timeInMsAsString } from './game/results';
import { Result } from './game/result.model';

const urlParams = new URLSearchParams(window.location.search);
const twoPlayers = urlParams.get('spillere') === '2' ? true : false;

let currentResultPlayer1: Result;
let currentResultPlayer2: Result;
if (twoPlayers) {
  printResults();
  const gameSinglePlayer = document.querySelector<HTMLDivElement>('#gameSinglePlayer')!;
  gameSinglePlayer.style.display = 'none';
  const twoPlayerGameContainer = document.querySelector<HTMLDivElement>('.two-player-game-container')!;
  twoPlayerGameContainer.style.display = 'flex';
}

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
  var player1Ready: boolean;
  var player2Ready: boolean;
}
globalThis.pixelRatio = pixelRatio;
globalThis.player1Ready = false;
globalThis.player2Ready = false;

if (twoPlayers) {
  const gameConfig1 = createGameConfig('gamePlayer1', 400, 700, Phaser.Scale.ScaleModes.NONE, Phaser.Scale.NO_CENTER, pixelRatio, isDebug);
  new Phaser.Game({
    ...gameConfig1,
    callbacks: {
      postBoot: (game) => {
        (game.scene.getScene('main-scene') as MainScene).playerNumber = 1;
        (game.scene.getScene('main-scene') as MainScene).twoPlayers = twoPlayers;
        (game.scene.getScene('main-scene') as MainScene).finishCallback = printResults;
        (game.scene.getScene('lost-scene') as MainScene).playerNumber = 1;
        (game.scene.getScene('lost-scene') as MainScene).twoPlayers = twoPlayers;
      },
    },
  });
  const gameConfig2 = createGameConfig('gamePlayer2', 400, 700, Phaser.Scale.ScaleModes.NONE, Phaser.Scale.NO_CENTER, pixelRatio, isDebug);
  new Phaser.Game({
    ...gameConfig2,
    callbacks: {
      postBoot: (game) => {
        (game.scene.getScene('main-scene') as MainScene).playerNumber = 2;
        (game.scene.getScene('main-scene') as MainScene).twoPlayers = twoPlayers;
        (game.scene.getScene('main-scene') as MainScene).finishCallback = printResults;
        (game.scene.getScene('lost-scene') as MainScene).playerNumber = 2;
        (game.scene.getScene('lost-scene') as MainScene).twoPlayers = twoPlayers;
      },
    },
  });
} else {
  const width = 400;
  const maxWantedHeight = 800;
  let height = maxWantedHeight;

  let scaleModePhaser = Phaser.Scale.ScaleModes.NONE;
  if (window.innerWidth < width) {
    scaleModePhaser = Phaser.Scale.ScaleModes.FIT;
    const scaleRatio = window.innerWidth / width;
    // console.log('scaleRatio', scaleRatio);
    // Compensate scale ratio to be able to fill height of screen when FIT is used.
    height = Math.min(window.innerHeight / scaleRatio, maxWantedHeight);
  } else {
    height = Math.min(window.innerHeight, maxWantedHeight);
  }

  // console.log(width, height, scaleModePhaser);

  const gameConfig = createGameConfig('gameSinglePlayer', width, height, scaleModePhaser, Phaser.Scale.NO_CENTER, pixelRatio, isDebug);
  new Phaser.Game(gameConfig);
}

window.onload = () => {
  const loader = document.querySelector<HTMLDivElement>('#loader')!;
  const content = document.querySelector<HTMLDivElement>('#content')!;
  loader.style.display = 'none';
  content.style.display = 'block';
};

function printResults(resultPlayer1?: Result, resultPlayer2?: Result) {
  if (resultPlayer1 !== undefined) {
    currentResultPlayer1 = resultPlayer1;
  }
  if (resultPlayer2 !== undefined) {
    currentResultPlayer2 = resultPlayer2;
  }
  const resultContainer = document.querySelector<HTMLDivElement>('#results ol')!;
  resultContainer.innerHTML = '';
  const resultList = getResults();
  for (const result of resultList) {
    const resultLi = document.createElement('li');
    if (result.timeInMs === currentResultPlayer1?.timeInMs) {
      resultLi.className = 'current-player';
    }
    if (result.timeInMs === currentResultPlayer2?.timeInMs) {
      resultLi.className = 'current-player';
    }

    resultLi.innerText = `${timeInMsAsString(result.timeInMs)}`;
    resultContainer.appendChild(resultLi);
  }
}

registerSW({
  onOfflineReady() {
    console.log('onOfflineReady2');
  },
  onRegistered(r) {
    r &&
      setInterval(() => {
        console.log('Før sw update');
        r.update().then(() => {
          console.log('update.then()');
        });
      }, 1 * 60 * 1000);
  },
});
