class TetrisConfig {
    constructor(row, col, blockSize) {
        this.row = row;
		this.col = col;
		this.blockSize = blockSize;
		this.width = this.blockSize * this.col;
		this.height = this.blockSize * this.row;
		this.blockHalfSize = this.blockSize / 2;
		this.halfWidth = this.width / 2;
		this.blockSteps = [this.blockHalfSize];
		for (let i = 1; i < this.col; i++) {
			this.blockSteps.push(this.blockSize * i + this.blockHalfSize);
		}
    }

    center() {
        return this.width / 2;
    }
}