function createMain() {
    let baseSpeed = 30;
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
        console.log(speed + (Tetris.speedLevel * 30));
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
            speed = (baseSpeed * 4 < 200 ? 200 : baseSpeed * 4);
        } else {
            isKeyDown = false;
            speed = baseSpeed;
        }
    }
}