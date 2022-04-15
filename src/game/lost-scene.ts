import { fiksForPikselratio } from '../fiks-for-pikselratio';
import { timeInMsAsString } from './results';

export class LostScene extends Phaser.Scene {
  bredde!: number;
  hoyde!: number;
  timeInMs!: number;
  scoreText!: Phaser.GameObjects.Text;
  playerNumber!: number;
  twoPlayers!: boolean;
  playerIsReady = false;
  hasBeenLeft = false;
  hasBeenRight = false;

  constructor() {
    super({ key: 'lost-scene' });
  }

  init() {
    // console.log('lost-scene: init');
    this.bredde = this.game.scale.gameSize.width;
    this.hoyde = this.game.scale.gameSize.height;
  }

  create() {
    // console.log('lost-scene: create');

    this.scoreText = this.add
      .text(this.bredde / 2, this.hoyde / 2, '', {
        fontFamily: 'arial',
        fontSize: `${fiksForPikselratio(20)}px`,
        color: '#333',
        align: 'center',
        backgroundColor: '#f3dd71',
        padding: { x: fiksForPikselratio(15), y: fiksForPikselratio(15) },
      })
      .setOrigin(0.5, 0.5);

    this.events.on('resume', (_: any, data: any) => {
      // console.log('lost-scene: resume');

      this.playerIsReady = false;
      this.hasBeenLeft = false;
      this.hasBeenRight = false;
      globalThis.player1Ready = false;
      globalThis.player2Ready = false;
      this.timeInMs = data.timeInMs;
      this.updateText();

      // If no gampad, click to be ready.
      setTimeout(() => {
        this.input.once('pointerdown', () => {
          if (this.twoPlayers) {
            this.hasBeenLeft = true;
            this.hasBeenRight = true;
          } else {
            this.startAgain();
          }
        });
      }, 500);
    });
  }

  update() {
    if (this.input.gamepad.total > 0) {
      const axisIndex = this.playerNumber === 1 ? 0 : 1;
      const value = this.input.gamepad.pad1.axes[axisIndex].value;
      // Value is from -1 to 1.
      if (value < -0.8) {
        this.hasBeenLeft = true;
      } else if (value > 0.8) {
        this.hasBeenRight = true;
      }
    }

    if (this.hasBeenLeft && this.hasBeenRight) {
      if (this.playerNumber === 1) {
        globalThis.player1Ready = true;
      } else if (this.playerNumber === 2) {
        globalThis.player2Ready = true;
      }
      this.playerIsReady = true;
      this.updateText();
    }

    if (globalThis.player1Ready && globalThis.player2Ready) {
      this.startAgain();
    }
  }

  private updateText() {
    if (this.twoPlayers) {
      if (this.playerIsReady) {
        if (this.timeInMs === 0) {
          this.scoreText.setText(`Venter på at motstander\nogså skal bli klar`);
        } else {
          this.scoreText.setText(
            `Du klarte det på ${timeInMsAsString(this.timeInMs)} sekunder\n\nVenter på at motstander\nogså skal bli klar`
          );
        }
      } else {
        if (this.timeInMs === 0) {
          this.scoreText.setText(`Er du klar?\n\nFlytt spaken fram og tilbake\nnår du er klar`);
        } else {
          this.scoreText.setText(
            `Du klarte det på ${timeInMsAsString(this.timeInMs)} sekunder\n\nFlytt spaken fram og tilbake\nnår du er klar`
          );
        }
      }
    } else {
      this.scoreText.setText(`Du klarte det på ${timeInMsAsString(this.timeInMs)} sekunder\n\nTrykk for å prøve igjen`);
    }
  }

  private startAgain() {
    this.scene.pause();
    this.scene.bringToTop('main-scene');
    this.scene.resume('main-scene');
  }
}
