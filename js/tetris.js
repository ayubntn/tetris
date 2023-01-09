class Tetris {
	static score = 0;
	static speedLevel = 1;
	static shapeTypeQueue = new ShapeTypeQueue();

	static run() {
		let baseSpeed = 50;
		let speed = baseSpeed;
		let isKeyDown = false;
		let status = "ready";
		let cursors;
		let config = new TetrisConfig(18, 10, 40);
		let phaserConfig = {
			type: Phaser.AUTO,
			width: config.width,
			height: config.height,
			physics: {
				default: "arcade",
				arcade: {
					debug: false,
				},
			},
			scene: {
				preload: preload,
				create: create,
				update: update,
			},
			backgroundColor: 0xffffff,
		};
		let game = new Phaser.Game(phaserConfig);
		let board;
		let shape;

		function preload() {
			this.load.image("type0", "images/block0.png");
			this.load.image("type1", "images/block1.png");
			this.load.image("type2", "images/block2.png");
			this.load.image("type3", "images/block3.png");
			this.load.image("type4", "images/block4.png");
			this.load.image("type5", "images/block5.png");
			this.load.spritesheet('lightImage', 'images/pipo-btleffect008.png', { frameWidth: 120, frameHeight: 120 });
		}

		function create() {
			board = new Board(this, config);
			Tetris.makeAxisGraphics(this, config);
			this.add.grid(config.width / 2, config.height / 2, config.width, config.height, config.blockSize, config.blockSize, 0x000000, 0, 0x000000, 0.1);
			cursors = this.input.keyboard.createCursorKeys();

			this.anims.create({
				key: 'light',
				frames: this.anims.generateFrameNumbers('lightImage', { start: 0, end: 8 }),
				frameRate: 10,
				repeat: 1
			});
		}

		function update() {
			if (status == "ready" || status == "pause") {
				if (cursors.space.isDown) {
					status = "start";
					this.physics.resume();
				}
			} else if (status == "start") {
				if (cursors.shift.isDown) {
					status = "pause";
					this.physics.pause();
				}
			}

			if (status != "start" || board.considering) {
				return;
			}

			if (!shape) {
				shape = new Shape(this, config, Tetris.shapeTypeQueue.shift());
				this.physics.add.collider(shape.getPhysicsGroup(), board.getStaticBlocks());
			}

			shape.setVelocityY(speed * Tetris.speedLevel);
			cursorOperation();
			// 回転により微妙にX軸がずれるので補正
			shape.adjustX();

			if (shape.collided()) {
				if (shape.getMinY() <= 0) {
					this.physics.pause();
				}
				board.stack(shape);
				Tetris.score += board.deleteCompLine(() => {
					shape = null;
					Tetris.speedLevel = Math.floor(Tetris.score / 10) + 1;
				});
			}
		}

		function cursorOperation() {
			if (cursors.left.isDown) {
				if (!isKeyDown) {
					shape.moveLeft();
					isKeyDown = true;
				}
			} else if (cursors.right.isDown) {
				if (!isKeyDown) {
					shape.moveRight();
					isKeyDown = true;
				}
			} else if (cursors.up.isDown) {
				if (!isKeyDown) {
					isKeyDown = true;
					shape.rotate();
				}
			} else if (cursors.down.isDown) {
				speed = baseSpeed * 4;
			} else {
				isKeyDown = false;
				speed = baseSpeed;
			}
		}
	}

	static side() {
		let phaserConfig = {
			type: Phaser.AUTO,
			width: 200,
			height: 720,
			physics: {
				default: "arcade",
				arcade: {
					debug: false,
				},
			},
			scene: {
				preload: preload,
				create: create,
				update: update,
			},
			backgroundColor: 0xdddddd,
		};
		let game = new Phaser.Game(phaserConfig);
		let scoreText;
		let speedText;
		let config;
		let shiftCount = 0;
		let nextShapes = [];

		function preload() {
			this.load.image("type0", "images/block0.png");
			this.load.image("type1", "images/block1.png");
			this.load.image("type2", "images/block2.png");
			this.load.image("type3", "images/block3.png");
			this.load.image("type4", "images/block4.png");
			this.load.image("type5", "images/block5.png");
			this.load.image("key_operation", "images/key_operation.png");
		}

		function create() {
			this.add.image(100, 550, "key_operation");
			this.add.text(16, 16, "テトリス", { fontSize: "40px", fill: "#000" });
			const textStyle = { fontSize: "16px", fill: "#000" };
			scoreText = this.add.text(16, 100, "スコア: 0", textStyle);
			speedText = this.add.text(16, 140, "スピードレベル: 1", textStyle);
			this.add.text(16, 200, "つぎ１", textStyle);
			this.add.text(16, 270, "つぎ２", textStyle);
			this.add.text(16, 340, "つぎ３", textStyle);
			config = new TetrisConfig(4, 4, 15);
			Tetris.makeAxisGraphics(this, config);

			Tetris.shapeTypeQueue.types.forEach((type, i) => {
				let shape = new Shape(this, config, type);
				shape.incPoint(70, 150 + 70 * (i + 1))
				nextShapes.push(shape);
			});
		}

		function update() {
			scoreText.setText("スコア: " + Tetris.score * 10);
			speedText.setText("スピードレベル: " + Tetris.speedLevel);

			if (Tetris.shapeTypeQueue.shiftCount > shiftCount) {
				nextShapes.forEach((shape) => {
					shape.disable();
				});
				nextShapes = [];
				Tetris.shapeTypeQueue.types.forEach((type, i) => {
					let shape = new Shape(this, config, type);
					shape.incPoint(70, 150 + 70 * (i + 1))
					nextShapes.push(shape);
				});
				shiftCount = Tetris.shapeTypeQueue.shiftCount;
			}
		}
	}

	static approximation(blockSteps, value) {
		let diff = [];
		let index = 0;

		blockSteps.forEach((val, i) => {
			diff[i] = Math.abs(value - val);
			index = diff[index] < diff[i] ? index : i;
		});
		return blockSteps[index];
	}

	static makeAxisGraphics(game, config) {
		let graphics = game.make.graphics();
		graphics.fillStyle(0x000000, 1.0);
		graphics.fillPoint(config.blockSize, config.blockSize, 1);
		graphics.generateTexture("axis", 1, 1);
		return graphics;
	}
}
