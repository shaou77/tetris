class Tetris {
    constructor() {
        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPiece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.blockSize = 30;
        this.cols = this.canvas.width / this.blockSize;
        this.rows = this.canvas.height / this.blockSize;
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        this.currentPiece = null;
        this.nextPiece = null;
        this.dropInterval = 1000;
        this.dropCounter = 0;
        this.lastTime = 0;

        this.pieces = [
            [[1, 1, 1, 1]], // I
            [[1, 1, 1], [0, 1, 0]], // T
            [[1, 1, 1], [1, 0, 0]], // L
            [[1, 1, 1], [0, 0, 1]], // J
            [[1, 1], [1, 1]], // O
            [[1, 1, 0], [0, 1, 1]], // Z
            [[0, 1, 1], [1, 1, 0]] // S
        ];

        this.colors = [
            '#4FC3F7', // I - 浅蓝色
            '#FFB74D', // T - 柔和橙色
            '#AED581', // L - 柔和绿色
            '#9575CD', // J - 柔和紫色
            '#4DB6AC', // O - 青绿色
            '#F06292', // Z - 粉色
            '#7986CB'  // S - 靛蓝色
        ];

        this.bindControls();
        this.initGame();
    }

    initGame() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        this.updateScore();
        this.nextPiece = null;
        this.createNewPiece();
        this.draw();
    }

    bindControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameOver && !this.paused) {
                switch(e.key) {
                    case 'ArrowLeft':
                        this.movePiece(-1, 0);
                        break;
                    case 'ArrowRight':
                        this.movePiece(1, 0);
                        break;
                    case 'ArrowDown':
                        this.movePiece(0, 1);
                        break;
                    case 'ArrowUp':
                        this.rotatePiece();
                        break;
                    case ' ':
                        this.hardDrop();
                        break;
                }
            }
        });

        document.getElementById('startBtn').addEventListener('click', () => {
            this.initGame();
            this.animate();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.paused = !this.paused;
            document.getElementById('pauseBtn').textContent = this.paused ? '继续' : '暂停';
        });
    }

    createNewPiece() {
        if (this.nextPiece === null) {
            const index = Math.floor(Math.random() * this.pieces.length);
            this.currentPiece = {
                shape: this.pieces[index],
                color: this.colors[index],
                x: Math.floor(this.cols / 2) - Math.floor(this.pieces[index][0].length / 2),
                y: 0
            };
        } else {
            this.currentPiece = this.nextPiece;
        }

        const index = Math.floor(Math.random() * this.pieces.length);
        this.nextPiece = {
            shape: this.pieces[index],
            color: this.colors[index],
            x: Math.floor(this.cols / 2) - Math.floor(this.pieces[index][0].length / 2),
            y: 0
        };

        if (this.checkCollision()) {
            this.gameOver = true;
        }

        this.drawNextPiece();
    }

    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        if (this.nextPiece) {
            const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * this.blockSize) / 2;
            const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * this.blockSize) / 2;
            this.nextPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        this.drawBlock(
                            this.nextCtx,
                            x + offsetX / this.blockSize,
                            y + offsetY / this.blockSize,
                            this.nextPiece.color
                        );
                    }
                });
            });
        }
    }

    drawBlock(ctx, x, y, color) {
        const blockSize = this.blockSize;
        // 主体
        ctx.fillStyle = color;
        ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        
        // 高光（左上）
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(x * blockSize, y * blockSize);
        ctx.lineTo((x + 1) * blockSize, y * blockSize);
        ctx.lineTo(x * blockSize, (y + 1) * blockSize);
        ctx.fill();
        
        // 阴影（右下）
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.moveTo((x + 1) * blockSize, y * blockSize);
        ctx.lineTo((x + 1) * blockSize, (y + 1) * blockSize);
        ctx.lineTo(x * blockSize, (y + 1) * blockSize);
        ctx.fill();
    }

    movePiece(dx, dy) {
        this.currentPiece.x += dx;
        this.currentPiece.y += dy;

        if (this.checkCollision()) {
            this.currentPiece.x -= dx;
            this.currentPiece.y -= dy;
            if (dy > 0) {
                this.mergePiece();
                this.clearLines();
                this.createNewPiece();
            }
            return false;
        }
        return true;
    }

    hardDrop() {
        while (this.movePiece(0, 1)) {}
    }

    rotatePiece() {
        const originalShape = this.currentPiece.shape;
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[row.length - 1 - i])
        );

        this.currentPiece.shape = rotated;
        if (this.checkCollision()) {
            this.currentPiece.shape = originalShape;
        }
    }

    checkCollision() {
        return this.currentPiece.shape.some((row, dy) =>
            row.some((value, dx) => {
                if (!value) return false;
                const newX = this.currentPiece.x + dx;
                const newY = this.currentPiece.y + dy;
                return newX < 0 || newX >= this.cols ||
                       newY >= this.rows ||
                       (newY >= 0 && this.board[newY][newX] !== 0);
            })
        );
    }

    mergePiece() {
        this.currentPiece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    const newY = this.currentPiece.y + dy;
                    if (newY >= 0) {
                        this.board[newY][this.currentPiece.x + dx] = this.currentPiece.color;
                    }
                }
            });
        });
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++;
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += [40, 100, 300, 1200][linesCleared - 1] * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            this.updateScore();
        }
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw board
        this.board.forEach((row, y) => {
            row.forEach((color, x) => {
                if (color) {
                    this.drawBlock(this.ctx, x, y, color);
                }
            });
        });

        // Draw current piece
        if (this.currentPiece) {
            this.currentPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        this.drawBlock(
                            this.ctx,
                            this.currentPiece.x + x,
                            this.currentPiece.y + y,
                            this.currentPiece.color
                        );
                    }
                });
            });
        }

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏结束', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    update(deltaTime) {
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.movePiece(0, 1);
            this.dropCounter = 0;
        }
    }

    animate(currentTime = 0) {
        if (this.gameOver) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (!this.paused) {
            this.update(deltaTime);
            this.draw();
        }

        requestAnimationFrame(this.animate.bind(this));
    }
}

// Start the game
const game = new Tetris();