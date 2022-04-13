import Phaser from 'phaser';
import { fiksForPikselratio } from '../fiks-for-pikselratio';

export class MainScene extends Phaser.Scene {
  gameWidth!: number;
  gameHeight!: number;
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
  finishLineText!: Phaser.GameObjects.Text;
  enemyPositions: any[] = [];

  constructor() {
    super('main-scene');
  }

  init(_data: any): void {
    this.gameWidth = this.game.scale.gameSize.width;
    this.gameHeight = this.game.scale.gameSize.height;

    console.log('main-scene: init');
  }

  create(): void {
    console.log('main-scene: create');

    this.events.on('resume', () => {
      console.log('main-scene: resume');
      this.prepareNewGame();
    });

    this.map = this.make.tilemap({ key: 'map' });
    const tiles = this.map.addTilesetImage(`tiles-sprite@${fiksForPikselratio(1)}`, 'tiles');
    this.map.createLayer('level', [tiles]);

    const enemyLayer = this.map.getObjectLayer('enemy');

    this.enemyGroup = this.physics.add.group({
      allowGravity: false,
      immovable: false,
    });

    const enemyFirstGid = this.map.tilesets.find((x) => x.name.startsWith('enemy-sprite'))?.firstgid!;
    enemyLayer.objects.forEach((o: any) => {
      // const index = Phaser.Math.Between(0, 5);
      const spriteIndex = o.gid - enemyFirstGid;
      const enemy: Phaser.Physics.Arcade.Sprite = this.enemyGroup.create(0, 0, 'enemy', spriteIndex);
      enemy.setPosition(o.x + enemy.width / 2, o.y - enemy.height / 2);
      enemy.setSize(enemy.width, fiksForPikselratio(20));
      enemy.setOffset(0, enemy.height - fiksForPikselratio(20));
      enemy.setMaxVelocity(0, 0);
      this.enemyPositions.push({ x: enemy.x, y: enemy.y, enemy });
    });

    this.finishLineText = this.add.text(this.gameWidth / 2, fiksForPikselratio(10), 'Mål', {
      fontSize: `${fiksForPikselratio(150)}px`,
      color: '#333',
    });
    this.finishLineText.setOrigin(0.5, 0);

    this.hero = this.physics.add.sprite(0, 0, 'hero');
    this.hero.setInteractive({ draggable: true });
    this.hero.on('drag', (_pointer: any, dragX: number) => {
      let x = dragX;
      if (x < this.hero.width / 2) {
        x = this.hero.width / 2;
      } else if (x > this.gameWidth - this.hero.width / 2) {
        x = this.gameWidth - this.hero.width / 2;
      }
      this.hero.setX(x);
    });

    this.hero.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('hero', { frames: [0, 1] }),
      frameRate: 6,
    });

    this.input.on('pointerdown', () => {});

    this.physics.add.collider(this.hero, this.enemyGroup, (_hero, _enemy) => {
      // console.log('hit', _enemy);
    });

    this.timeText = this.add.text(fiksForPikselratio(16), fiksForPikselratio(16), '', {
      fontSize: `${fiksForPikselratio(24)}px`,
      color: '#000',
      backgroundColor: '#ccc',
      padding: { x: fiksForPikselratio(5), y: fiksForPikselratio(5) },
    });
    this.timeText.setScrollFactor(0, 0);

    this.countdownText = this.add
      .text(this.gameWidth / 2, this.map.heightInPixels - this.gameHeight / 2, '', {
        fontFamily: 'Helvetica ',
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

    this.prepareNewGame();

    this.cameras.main.startFollow(this.hero);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.setFollowOffset(0, fiksForPikselratio(100));
  }

  update(time: number): void {
    if (this.input.gamepad.total > 0) {
      this.hero.setX(this.getXValueFromGamePad());
    }

    if (this.isPaused) {
      this.hero.setVelocityY(0);
      return;
    }
    this.hero.play('walk', true);

    this.currentTimeInMs = time - this.startTimeInMs;
    this.currentSpeed = -100 + (-10 * this.currentTimeInMs) / 1000;
    this.hero.setVelocityY(fiksForPikselratio(this.currentSpeed));

    this.updateText();

    if (this.hero.y < fiksForPikselratio(100)) {
      this.finish();
    }
  }

  private prepareNewGame() {
    this.hero.setPosition(this.gameWidth / 2, this.map.heightInPixels - this.hero.height / 2 - fiksForPikselratio(50));
    // this.hero.setPosition(this.bredde / 2, this.hero.height + fiksForPikselratio(250));
    this.resetEnemyPositions();

    this.isFinished = false;
    this.isPaused = true;
    this.currentSpeed = 0;

    let countdownCounter = 3;
    if (countdownCounter > 0) {
      this.countdownText.setVisible(true);
      this.countdownText.setText(countdownCounter.toString());
      const countdownIntervalId = setInterval(() => {
        countdownCounter--;
        this.countdownText.setText(countdownCounter.toString());
        // console.log(countdownCounter);
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
  }

  private startGame() {
    this.isPaused = false;
    this.currentSpeed = -100;
    this.startTimeInMs = this.time.now;
    this.currentTimeInMs = 0;
    this.updateText();
    this.timeText.setVisible(true);
  }

  private finish() {
    if (this.isFinished) {
      return;
    }
    this.isFinished = true;
    this.timeText.setVisible(false);
    this.scene.pause();
    // this.scene.launch('lost-scene', { timeInMs: this.currentTimeInMs });
    this.scene.bringToTop('lost-scene');
    this.scene.resume('lost-scene', { timeInMs: this.currentTimeInMs });
  }

  private updateText() {
    this.timeText.setText('Tid: ' + (this.currentTimeInMs / 1000).toFixed(2));
  }

  private getXValueFromGamePad(): number {
    const axisIndex = this.playerNumber === 1 ? 0 : 1;
    // Value is from -1 to 1. Need to add 1 and divide with 2 to normalize it between 0 and 1.
    const value = (this.input.gamepad.pad1.axes[axisIndex].value + 1) / 2;
    return Math.round(value * (400 - this.hero.width) + this.hero.width / 2);
  }

  private resetEnemyPositions() {
    for (const positionInfo of this.enemyPositions) {
      positionInfo.enemy.setPosition(positionInfo.x, positionInfo.y);
    }
  }
}
