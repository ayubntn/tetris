function createSide() {
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