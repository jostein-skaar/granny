import Phaser from 'phaser';
import { fiksForPikselratio } from '../fiks-for-pikselratio';

export class MainScene extends Phaser.Scene {
  bredde!: number;
  hoyde!: number;
  hero!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  presentsGroup!: Phaser.Physics.Arcade.Group;
  enemyGroup!: Phaser.Physics.Arcade.Group;
  isPaused: boolean = false;
  isDead: boolean = false;
  countdownText!: Phaser.GameObjects.Text;

  constructor() {
    super('main-scene');
  }

  init(_data: any): void {
    this.bredde = this.game.scale.gameSize.width;
    this.hoyde = this.game.scale.gameSize.height;
  }

  create(): void {
    this.enemyGroup = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    this.hero = this.physics.add.sprite(0, 0, 'hero');
    this.hero.setPosition(this.bredde / 2, this.hoyde / 2);

    this.hero.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('hero', { frames: [0, 1] }),
      frameRate: 6,
    });

    this.input.on('pointerdown', () => {});

    this.physics.add.overlap(this.hero, this.enemyGroup, (_hero, _enemy) => {
      this.lose();
    });

    this.countdownText = this.add
      .text(this.bredde / 2, this.hoyde / 2, '', {
        fontSize: `${fiksForPikselratio(200)}px`,
        color: '#f3dd71',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: this.countdownText,
      // x: this.bredde,
      scale: 1.4,
      ease: 'Power0',
      duration: 250,
      yoyo: true,
      repeat: -1,
    });
    let countdownCounter = 3;
    this.countdownText.setText(countdownCounter.toString());
    const countdownIntervalId = setInterval(() => {
      countdownCounter--;
      this.countdownText.setText(countdownCounter.toString());
      console.log(countdownCounter);
      if (countdownCounter <= 0) {
        this.countdownText.setVisible(false);
        this.startGame();
        clearInterval(countdownIntervalId);
      }
    }, 1000);

    this.isDead = false;
    this.isPaused = true;
    this.physics.pause();
  }

  update(): void {
    // Animasjoner.
    if (!this.isPaused) {
      this.hero.play('walk', true);
    }
  }

  private startGame() {
    this.isPaused = false;
    this.physics.resume();
  }

  private lose() {
    if (this.isDead) {
      return;
    }
    this.isDead = true;
    this.scene.pause();
    this.hero.setTint(0xff0000);
    this.cameras.main.setBackgroundColor(0xbababa);
    this.cameras.main.setAlpha(0.5);

    this.scene.launch('lost-scene', {});
  }
}
