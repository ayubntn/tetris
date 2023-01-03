class Shape {
	constructor(game, config) {
        this.config = config;

		const type = SHAPE_TYPES[0];

		let shape = game.physics.add.group();
		const adjust = config.blockHalfSize;
		shape.create(config.halfWidth, config.blockSize * -1 - config.blockHalfSize, "axis");
		type.blocks.forEach((block) => {
			const x = config.blockSize * block.x + config.halfWidth - adjust;
			const y = config.blockSize * block.y - type.rows * config.blockSize;
			shape.create(x, y, type.name);
		});

		this.physicsGroup = shape;
	}

    getPhysicsGroup() {
        return this.physicsGroup;
    }

    getBlocks() {
        return this.physicsGroup.getChildren();
    }

	rotate() {
		let axis = this.getBlocks()[0];
		this.physicsGroup.rotateAround(axis, 90 * (Math.PI / 180) * -1);
	}

	adjustX() {
		this.getBlocks().forEach((block) => {
			if (block.texture.key != 'axis') {
				let x = this._approximation(block.x);
				block.setX(x);
			}
		});
	}

	collided() {
		let touching = false;
		this.getBlocks().forEach((block) => {
			if (block.body.touching.down || block.body.y >= this.config.height - this.config.blockSize) {
				touching = true;
			}
		});
		return touching;
	}

	setVelocityY(velocity) {
		this.physicsGroup.setVelocityY(velocity);
	}

	moveLeft() {
		const leftLimit = this.config.blockHalfSize;
		if (leftLimit < this.getMinX()) {
			this.physicsGroup.incX(this.config.blockSize * -1);
		}
	}

	moveRight() {
		const rightLimit = this.config.width - this.config.blockHalfSize;
		if (rightLimit > this.getMaxX()) {
			this.physicsGroup.incX(this.config.blockSize);
		}
	}

	getMinX() {
		let minX = 99999;
		this.getBlocks().forEach((block) => {
			minX = block.x < minX ? block.x : minX;
		});
		return minX;
	}

	getMaxX() {
		let maxX = 0;
		this.getBlocks().forEach((block) => {
			maxX = block.x > maxX ? block.x : maxX;
		});
		return maxX;
	}

    getMinY() {
        let minY = 99999;
        this.getBlocks().forEach((block) => {
			minY = block.y < minY ? block.y : minY;
		});
		return minY;
    }

	_approximation(value) {
		let diff = [];
		let index = 0;

		this.config.blockSteps.forEach((val, i) => {
			diff[i] = Math.abs(value - val);
			index = diff[index] < diff[i] ? index : i;
		});
		return this.config.blockSteps[index];
	}
}
