class Tetris {
	static run() {
		let speed = 100;
		let isKeyDown = false;
		let status = "ready";
		let cursors;
		let config = new TetrisConfig(15, 10, 40);
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

			shape.setVelocityY(speed);
			cursorOperation();
			// 回転により微妙にX軸がずれるので補正
			shape.adjustX();

			if (shape.collided()) {
				if (shape.getMinY() <= 0) {
					this.physics.pause();
				}
				board.stack(shape);
				board.deleteCompLine();
				shape = null;
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
			} else {
				isKeyDown = false;
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
}
