import { fiksForPikselratio } from '../fiks-for-pikselratio';

export class LostScene extends Phaser.Scene {
  bredde!: number;
  hoyde!: number;

  constructor() {
    super({ key: 'lost-scene' });
  }

  init(_data: any) {
    this.bredde = this.game.scale.gameSize.width;
    this.hoyde = this.game.scale.gameSize.height;
  }

  create() {
    const tekst = `Du klarte XXX\nTrykk for å prøve igjen\n(Vent for å gå til meny)`;
    this.add
      .text(this.bredde / 2, this.hoyde / 2, tekst, {
        fontFamily: 'arial',
        fontSize: `${fiksForPikselratio(20)}px`,
        color: '#fff',
        align: 'center',
        backgroundColor: '#b3000c',
        padding: { x: fiksForPikselratio(15), y: fiksForPikselratio(15) },
      })
      .setOrigin(0.5, 0.5);

    setTimeout(() => {
      this.input.once('pointerdown', () => {
        this.scene.start('main-scene', {});
      });
    }, 500);
  }
}
