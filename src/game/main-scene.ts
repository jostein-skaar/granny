import Phaser from 'phaser';
import { fiksForPikselratio } from '../fiks-for-pikselratio';

export class MainScene extends Phaser.Scene {
  bredde!: number;
  hoyde!: number;
  map!: Phaser.Tilemaps.Tilemap;
  hero!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  presentsGroup!: Phaser.Physics.Arcade.Group;
  enemyGroup!: Phaser.Physics.Arcade.Group;
  isPaused: boolean = false;
  isFinished: boolean = false;
  countdownText!: Phaser.GameObjects.Text;
  startTimeInMs = 0;
  currentTimeInMs = 0;
  currentSpeed = 0;
  playerNumber!: number;
  timeText!: Phaser.GameObjects.Text;

  constructor() {
    super('main-scene');
  }

  init(_data: any): void {
    this.bredde = this.game.scale.gameSize.width;
    this.hoyde = this.game.scale.gameSize.height;

    console.log('playerNumber', this.playerNumber);
  }

  create(): void {
    this.map = this.make.tilemap({ key: 'map' });
    const tiles = this.map.addTilesetImage(`tiles-sprite@${fiksForPikselratio(1)}`, 'tiles');
    this.map.createLayer('level', [tiles]);

    this.enemyGroup = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    this.hero = this.physics.add.sprite(0, 0, 'hero');
    this.hero.setPosition(this.bredde / 2, this.map.heightInPixels - this.hero.height / 2 - fiksForPikselratio(50));

    this.hero.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('hero', { frames: [0, 1] }),
      frameRate: 6,
    });

    this.input.on('pointerdown', () => {});

    this.physics.add.overlap(this.hero, this.enemyGroup, (_hero, _enemy) => {
      this.finish();
    });

    this.timeText = this.add.text(fiksForPikselratio(16), fiksForPikselratio(16), '', {
      fontSize: `${fiksForPikselratio(24)}px`,
      color: '#000',
      backgroundColor: '#ccc',
      padding: { x: fiksForPikselratio(5), y: fiksForPikselratio(5) },
    });
    this.timeText.setScrollFactor(0, 0);

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

    let countdownCounter = 0;
    if (countdownCounter > 0) {
      this.isPaused = true;
      this.physics.pause();

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
    } else {
      this.countdownText.setVisible(false);
      this.startGame();
    }

    this.isFinished = false;

    this.cameras.main.startFollow(this.hero);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.setFollowOffset(0, fiksForPikselratio(100));
  }

  update(time: number): void {
    this.currentTimeInMs = time - this.startTimeInMs;
    this.currentSpeed = -100 + (-10 * this.currentTimeInMs) / 1000;
    this.hero.setVelocityY(fiksForPikselratio(this.currentSpeed));

    this.updateText();

    // Animasjoner.
    if (!this.isPaused) {
      this.hero.play('walk', true);
    }

    if (this.input.gamepad.total > 0) {
      this.hero.setX(this.getXValue());
      // console.log(this.mapAxisValue(this.input.gamepad.pad1.axes[1].value));
    }

    if (this.hero.y < fiksForPikselratio(100)) {
      this.finish();
    }
  }

  private startGame() {
    this.isPaused = false;
    this.physics.resume();
    this.currentSpeed = -100;
    this.startTimeInMs = this.time.now;
  }

  private finish() {
    if (this.isFinished) {
      return;
    }
    this.isFinished = true;
    this.scene.pause();
    this.hero.setTint(0xff0000);
    this.cameras.main.setBackgroundColor(0xbababa);
    this.cameras.main.setAlpha(0.5);

    this.scene.launch('lost-scene', { timeInMs: this.currentTimeInMs });
  }

  private updateText() {
    let text = 'Tid: ';
    text += '' + this.currentTimeInMs / 1000;
    this.timeText.setText(text);
  }

  private getXValue(): number {
    const axisIndex = this.playerNumber === 1 ? 0 : 1;
    // Value is from -1 to 1. Need to add 1 and divide with 2 to normalize it between 0 and 1.
    const value = (this.input.gamepad.pad1.axes[axisIndex].value + 1) / 2;
    return Math.round(value * (400 - this.hero.width) + this.hero.width / 2);
  }
}
