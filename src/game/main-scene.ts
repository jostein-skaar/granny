import Phaser from 'phaser';
import { fiksForPikselratio, fiksForPikselratioInverted } from '../fiks-for-pikselratio';

export class MainScene extends Phaser.Scene {
  gameWidth!: number;
  gameHeight!: number;
  map!: Phaser.Tilemaps.Tilemap;
  hero!: Phaser.Physics.Matter.Sprite;
  isPaused: boolean = false;
  isFinished: boolean = false;
  countdownText!: Phaser.GameObjects.Text;
  startTimeInMs = 0;
  currentTimeInMs = 0;
  timeSinceHeroCollidedInMs = 0;
  playerNumber!: number;
  twoPlayers!: boolean;
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

    const enemyTilset = this.map.tilesets.find((x) => x.name.startsWith('enemy-sprite'));
    const enemyTilsetProperties: any = { ...enemyTilset?.tileProperties };
    const enemyFirstGid = enemyTilset?.firstgid!;
    enemyLayer.objects.forEach((object: any) => {
      const spriteIndex = object.gid - enemyFirstGid;

      const objectWidth = object.width;
      const objectHeight = object.height;
      const objectRealHeight = fiksForPikselratio(enemyTilsetProperties[spriteIndex]?.height as number);

      const enemy: Phaser.Physics.Matter.Sprite = this.matter.add.sprite(0, 0, 'enemy', spriteIndex, {
        shape: { type: 'rectangle', width: objectWidth, height: objectRealHeight },
        render: { sprite: { xOffset: 0, yOffset: (1 - objectRealHeight / objectHeight) / 2 } },
        density: fiksForPikselratioInverted(0.2),
        label: 'enemy',
      });
      // console.log('enemy', enemy.body.mass);
      enemy.setPosition(object.x + enemy.width / 2, object.y - enemy.height / 2);
      this.enemyPositions.push({ x: enemy.x, y: enemy.y, enemy });
    });

    this.finishLineText = this.add.text(this.gameWidth / 2, fiksForPikselratio(10), 'Mål', {
      fontSize: `${fiksForPikselratio(150)}px`,
      color: '#333',
    });
    this.finishLineText.setOrigin(0.5, 0);

    this.hero = this.matter.add.sprite(0, 0, 'hero');
    this.hero.setBody({ type: 'rectangle', width: this.hero.width * 0.8, height: this.hero.height * 0.8 }, { label: 'hero' });
    this.hero.setFixedRotation();

    this.hero.setDensity(fiksForPikselratioInverted(0.001));
    // console.log('hero', this.hero.body.mass);

    this.hero.setInteractive({ draggable: true });
    this.hero.on('drag', (_pointer: any, dragX: number) => {
      this.hero.setX(dragX);
    });

    this.hero.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('hero', { frames: [0, 1] }),
      frameRate: 6,
    });

    this.matter.world.on('collisionstart', (_event: any, _bodyA: any, _bodyB: any) => {
      // if (bodyA.label === 'hero' || bodyB.label === 'hero') {
      this.timeSinceHeroCollidedInMs = this.time.now;
      // console.log(bodyA.label, bodyB.label, this.timeSinceHeroCollidedInMs);
      // }
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
    const currentSpeed = -2 + (-1 * (time - this.timeSinceHeroCollidedInMs)) / 1000;
    // console.log(this.hero.body.velocity.y);
    // console.log('currentSpeed', currentSpeed);
    this.hero.setVelocity(0, fiksForPikselratio(currentSpeed));
    // this.hero.setVelocity(0, fiksForPikselratio(-3));

    this.updateText();

    if (this.hero.y < fiksForPikselratio(100)) {
      this.finish();
    }

    this.constrainHeroX();
  }

  private prepareNewGame() {
    this.hero.setPosition(this.gameWidth / 2, this.map.heightInPixels - this.hero.height / 2 - fiksForPikselratio(50));

    this.resetEnemyPositions();

    this.isFinished = false;
    this.isPaused = true;

    if (this.twoPlayers) {
      if (!globalThis.player1Ready || !globalThis.player2Ready) {
        this.finish();
        return;
      }
    }

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
      const enemy: Phaser.Physics.Matter.Sprite = positionInfo.enemy;
      enemy.setPosition(positionInfo.x, positionInfo.y);
      enemy.setAngularVelocity(0);
      enemy.setVelocity(0, 0);
      enemy.setAngle(0);
    }
  }

  private constrainHeroX() {
    let x = this.hero.x;
    if (x < this.hero.width / 2) {
      x = this.hero.width / 2;
      this.hero.setX(x);
    } else if (x > this.gameWidth - this.hero.width / 2) {
      x = this.gameWidth - this.hero.width / 2;
      this.hero.setX(x);
    }
  }
}
