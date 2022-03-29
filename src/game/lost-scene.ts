import { fiksForPikselratio } from '../fiks-for-pikselratio';

export class LostScene extends Phaser.Scene {
  bredde!: number;
  hoyde!: number;
  timeInMs!: number;

  constructor() {
    super({ key: 'lost-scene' });
  }

  init(data: any) {
    this.bredde = this.game.scale.gameSize.width;
    this.hoyde = this.game.scale.gameSize.height;
    this.timeInMs = data.timeInMs;
  }

  create() {
    const tekst = `Du klarte det på ${this.timeInMs / 1000} sekunder\n(Ta spaken fram og tilbake\nfor å prøve igjen)`;
    this.add
      .text(this.bredde / 2, this.hoyde / 2, tekst, {
        fontFamily: 'arial',
        fontSize: `${fiksForPikselratio(20)}px`,
        color: '#fff',
        align: 'center',
        backgroundColor: '#f3dd71',
        padding: { x: fiksForPikselratio(15), y: fiksForPikselratio(15) },
      })
      .setOrigin(0.5, 0.5);

    // setTimeout(() => {
    //   this.input.once('pointerdown', () => {
    //     this.scene.start('main-scene', {});
    //   });
    // }, 500);

    setTimeout(() => {
      this.scene.start('main-scene', {});
    }, 4000);
  }
}
