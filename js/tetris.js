class Tetris {
	static score = 0;
	static speedLevel = 1;
	static shapeTypeQueue = new ShapeTypeQueue();

	static run() {
		createMain();
		createSide();
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
