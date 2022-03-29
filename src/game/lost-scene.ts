import { fiksForPikselratio } from '../fiks-for-pikselratio';

export class LostScene extends Phaser.Scene {
  bredde!: number;
  hoyde!: number;
  timeInMs!: number;
  scoreText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'lost-scene' });
  }

  init() {
    console.log('lost-scene: init');
    this.bredde = this.game.scale.gameSize.width;
    this.hoyde = this.game.scale.gameSize.height;
  }

  create() {
    console.log('lost-scene: create');

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

    // setTimeout(() => {
    //   this.input.once('pointerdown', () => {
    //     this.scene.start('main-scene', {});
    //   });
    // }, 500);

    this.events.on('resume', (_: any, data: any) => {
      console.log('lost-scene: resume');

      this.timeInMs = data.timeInMs;
      this.updateText();

      setTimeout(() => {
        this.scene.pause();
        this.scene.bringToTop('main-scene');
        this.scene.resume('main-scene');
      }, 2000);
    });
  }

  private updateText() {
    this.scoreText.setText(
      `Du klarte det på ${(this.timeInMs / 1000).toFixed(2)} sekunder\n(Ta spaken fram og tilbake\nfor å prøve igjen)`
    );
  }
}
