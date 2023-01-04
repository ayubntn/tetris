class Tetris {
    static score = 0;
	static speedLevel = 1;

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
		}

		function create() {
			board = new Board(this, config);
			makeAxisGraphics(this);
			this.add.grid(config.width / 2, config.height / 2, config.width, config.height, config.blockSize, config.blockSize, 0x000000, 0, 0x000000, 0.1);
			cursors = this.input.keyboard.createCursorKeys();
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

			if (status != "start") {
				return;
			}

			if (!shape) {
				shape = new Shape(this, config);
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
				Tetris.score += board.deleteCompLine();
				shape = null;

				Tetris.speedLevel = Math.floor(Tetris.score / 10) + 1;
			}
		}

		function makeAxisGraphics(game) {
			let graphics = game.make.graphics();
			graphics.fillStyle(0x000000, 1.0);
			graphics.fillPoint(config.blockSize, config.blockSize, 1);
			graphics.generateTexture("axis", 1, 1);
			return graphics;
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
			height: 200,
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
			backgroundColor: 0xcccccc,
		};
		let game = new Phaser.Game(phaserConfig);
		let scoreText;
		let speedText;
	
		function preload() {
		
		}

		function create() {
			scoreText = this.add.text(16, 16, "スコア: 0", { fontSize: "16px", fill: "#000" });
			speedText = this.add.text(16, 40, "スピードレベル: 1", { fontSize: "16px", fill: "#000" });
		}

		function update() {
			scoreText.setText("スコア: " + Tetris.score * 10);
			speedText.setText("スピードレベル: " + Tetris.speedLevel);
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
}
