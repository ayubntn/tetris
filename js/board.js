class Board {
	constructor(game, config) {
		this.config = config;

		this._blankRow = [];
		for (let i = 0; i < this.config.col; i++) {
			this._blankRow[i] = null;
		}
		this.stackedBlocks = [];
		for (let i = 0; i < this.config.row; i++) {
			this.stackedBlocks.push(this._blankRow.concat());
		}

		this.staticBlocks = game.physics.add.staticGroup();
	}

	getStaticBlocks() {
		return this.staticBlocks;
	}

	stack(shape) {
		shape.getBlocks().forEach((block) => {
			block.disableBody(true, true);
			if (block.texture.key != "axis") {
				let y = Tetris.approximation(this.config.blockSteps, block.y);
				let fellBlock = this.staticBlocks.create(block.x, y, block.texture.key);
				const rowIdx = Math.trunc(fellBlock.y / this.config.blockSize);
				const colIdx = Math.trunc(fellBlock.body.x / this.config.blockSize);
				this.stackedBlocks[rowIdx][colIdx] = fellBlock;
				this._stackedBlocksLog();
			}
		});
	}

	deleteCompLine() {
		let completedRowIndex = [];

		// 揃った行を消す
		for (let [i, row] of this.stackedBlocks.entries()) {
			let rowCompleted = row.every((elem) => elem != null);
			if (rowCompleted) {
				completedRowIndex.push(i);
				for (let sprite of row) {
					sprite.disableBody(true, true);
				}
			}
		}

		// 行が空いた場合、ブロックを下に落とす
		for (let compRowIdx of completedRowIndex) {
			for (let row = 0; row <= compRowIdx; row++) {
				for (let col = 0; col < this.config.col; col++) {
					let sprite = this.stackedBlocks[row][col];
					if (sprite != null) {
						sprite.setY(sprite.y + this.config.blockSize);
						sprite.refreshBody();
					}
				}
			}
		}

		// blocks二次元配列 空いた行を詰める
		this.stackedBlocks = this.stackedBlocks.filter((row, i) => {
			return !completedRowIndex.includes(i);
		});

		// blocks二次元配列 詰めた分、空行を上に足す
		for (let i of completedRowIndex) {
			this.stackedBlocks.unshift(this._blankRow.concat());
		}
	}

	_stackedBlocksLog() {
		for (let [i, row] of this.stackedBlocks.entries()) {
			let str = `[${i}]`;
			for (let block of row) {
				if (block != null) {
					str += "o ";
				} else {
					str += "x ";
				}
			}
			console.log(str);
		}
	}
}
