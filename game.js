class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 50;
        this.height = 30;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.speed = 5;
        this.bullets = [];
        this.lives = 3;
        this.score = 0;
        this.powerups = [];
        this.isDoubleShooting = false;
        this.lastShot = 0;
        this.shootDelay = 250; // Minimum time between shots in ms
        this.shield = 0;  // Shield percentage (0-100)
        this.shieldActive = false;
    }

    draw(ctx) {
        // Draw shield if active
        if (this.shield > 0) {
            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 
                   this.width * 0.8, 0, Math.PI * 2);
            ctx.stroke();
            
            // Update shield display
            document.getElementById('shield').textContent = this.shield;
        }

        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // Draw bullets
        this.bullets.forEach(bullet => {
            ctx.fillStyle = this.isDoubleShooting ? '#00ffff' : 'yellow';
            ctx.fillRect(bullet.x, bullet.y, 3, 15);
        });
    }

    move(direction) {
        if (direction === 'left' && this.x > 0) {
            this.x -= this.speed;
        }
        if (direction === 'right' && this.x < this.canvas.width - this.width) {
            this.x += this.speed;
        }
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot >= this.shootDelay) {
            const shootSound = document.getElementById('shootSound');
            shootSound.currentTime = 0;
            shootSound.play();

            if (this.isDoubleShooting) {
                this.bullets.push(
                    { x: this.x + 10, y: this.y, speed: 7 },
                    { x: this.x + this.width - 10, y: this.y, speed: 7 }
                );
            } else {
                this.bullets.push({
                    x: this.x + this.width / 2,
                    y: this.y,
                    speed: 7
                });
            }
            this.lastShot = now;
        }
    }

    updateBullets() {
        this.bullets = this.bullets.filter(bullet => bullet.y > 0);
        this.bullets.forEach(bullet => bullet.y -= bullet.speed);
    }
}

class Enemy {
    constructor(x, y) {
        this.width = 40;
        this.height = 30;
        this.x = x;
        this.y = y;
        this.direction = 1;
        this.speed = 3;
        this.bullets = [];
        this.lastShot = 0;
        this.shootDelay = 1500;
    }

    draw(ctx) {
        // Draw alien ship with more detail
        ctx.fillStyle = '#FF0000';
        
        // Main body
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y); // Top middle
        ctx.lineTo(this.x + this.width, this.y + this.height/2); // Right middle
        ctx.lineTo(this.x + this.width - 10, this.y + this.height); // Right bottom
        ctx.lineTo(this.x + 10, this.y + this.height); // Left bottom
        ctx.lineTo(this.x, this.y + this.height/2); // Left middle
        ctx.closePath();
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(this.x + this.width/3, this.y + this.height/3, 5, 0, Math.PI * 2);
        ctx.arc(this.x + (this.width * 2/3), this.y + this.height/3, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw enemy bullets
        this.bullets.forEach(bullet => {
            ctx.fillStyle = '#FF0000';
            // Draw alien bullet as a small lightning bolt
            ctx.beginPath();
            ctx.moveTo(bullet.x, bullet.y);
            ctx.lineTo(bullet.x + 4, bullet.y + 5);
            ctx.lineTo(bullet.x - 2, bullet.y + 10);
            ctx.lineTo(bullet.x + 2, bullet.y + 15);
            ctx.stroke();
            ctx.fill();
        });
    }

    move() {
        this.x += this.speed * this.direction;
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot >= this.shootDelay) {
            // Play alien shoot sound
            const alienShootSound = document.getElementById('alienShootSound');
            alienShootSound.currentTime = 0;
            alienShootSound.volume = 0.4;
            alienShootSound.play();

            this.bullets.push({
                x: this.x + this.width / 2,
                y: this.y + this.height,
                speed: 5
            });
            this.lastShot = now;
        }
    }

    updateBullets() {
        this.bullets = this.bullets.filter(bullet => bullet.y < 600);
        this.bullets.forEach(bullet => bullet.y += bullet.speed);
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type; // 'doubleShot' or 'shield'
        this.speed = 2;
    }

    draw(ctx) {
        ctx.fillStyle = this.type === 'doubleShot' ? '#00ffff' : '#ff00ff';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.y += this.speed;
    }
}

class Explosion {
    constructor(x, y, color = '#FFA500') {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.timer = 0;
        this.maxTime = 20;
        
        // Create explosion particles
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                color: color
            });
        }
    }

    update() {
        this.timer++;
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
        });
    }

    draw(ctx) {
        this.particles.forEach(particle => {
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x, particle.y, 2, 2);
        });
    }

    isFinished() {
        return this.timer >= this.maxTime;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.initializeGame();
    }

    initializeGame() {
        this.player = new Player(this.canvas);
        this.enemies = [];
        this.keys = {};
        this.gameOver = false;
        this.score = 0;
        this.powerups = [];
        this.explosions = [];
        this.enemyDirection = 1;
        this.enemyDropDistance = 30;
        this.lastEnemyMove = 0;
        this.enemyMoveDelay = 200; // Reduced from 300 to 200 for faster movement
        
        // Reset display
        this.updateScore();
        this.updateLives();
        document.getElementById('shield').textContent = '0';
        
        // Initialize alien sound
        this.alienSound = document.getElementById('alienMoveSound');
        this.alienSound.volume = 0.5;
        this.alienSound.playbackRate = 1.5;
        this.alienSound.play();
        
        this.lastAlienSound = 0;
        this.alienSoundDelay = 500;
        
        this.initializeEnemies();
        this.setupEventListeners();
        this.gameLoop();
    }

    initializeEnemies() {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                this.enemies.push(new Enemy(
                    col * 60 + 100,
                    row * 50 + 50
                ));
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ') {
                this.player.shoot();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    createExplosion(x, y, color) {
        this.explosions.push(new Explosion(x, y, color));
    }

    checkCollisions() {
        // Check player bullets hitting enemies
        for (let i = this.player.bullets.length - 1; i >= 0; i--) {
            const bullet = this.player.bullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (bullet.x >= enemy.x && 
                    bullet.x <= enemy.x + enemy.width &&
                    bullet.y >= enemy.y && 
                    bullet.y <= enemy.y + enemy.height) {
                    
                    // Play explosion sound at full volume
                    const explosionSound = document.getElementById('explosionSound');
                    explosionSound.currentTime = 0;
                    explosionSound.volume = 1.0;
                    explosionSound.play();
                    
                    // Create larger explosion
                    this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#FFA500');
                    this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#FF0000');
                    
                    this.player.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    this.score += 100;
                    this.updateScore();
                    
                    if (Math.random() < 0.1) {
                        const powerupType = Math.random() < 0.5 ? 'doubleShot' : 'shield';
                        this.powerups.push(new PowerUp(enemy.x, enemy.y, powerupType));
                    }
                    break;
                }
            }
        }

        // Improved enemy bullet collision detection
        this.enemies.forEach(enemy => {
            enemy.bullets.forEach((bullet, bulletIndex) => {
                const bulletCenterX = bullet.x + 1.5;
                const bulletCenterY = bullet.y + 7.5;
                
                if (this.pointInTriangle(
                    bulletCenterX, bulletCenterY,
                    this.player.x + this.player.width/2, this.player.y,
                    this.player.x, this.player.y + this.player.height,
                    this.player.x + this.player.width, this.player.y + this.player.height
                )) {
                    enemy.bullets.splice(bulletIndex, 1);
                    
                    // Check if shield is active
                    if (this.player.shield > 0) {
                        this.player.shield -= 25; // Reduce shield by 25%
                        if (this.player.shield <= 0) {
                            this.player.shield = 0;
                        }
                        // Create shield hit effect
                        this.createExplosion(bulletCenterX, bulletCenterY, '#ff00ff');
                    } else {
                        this.player.lives--;
                        this.updateLives();
                        // Create red explosion at collision point
                        this.createExplosion(bulletCenterX, bulletCenterY, '#FF0000');
                        
                        if (this.player.lives <= 0) {
                            this.checkGameOver();
                        }
                    }
                }
            });
        });

        // Check power-up collection
        this.powerups.forEach((powerup, index) => {
            if (this.checkCollision(powerup, this.player)) {
                // Play powerup sound
                const powerupSound = document.getElementById('powerupSound');
                powerupSound.currentTime = 0;
                powerupSound.volume = 0.4;
                powerupSound.play();

                if (powerup.type === 'doubleShot') {
                    this.player.isDoubleShooting = true;
                    setTimeout(() => {
                        this.player.isDoubleShooting = false;
                    }, 10000);
                } else if (powerup.type === 'shield') {
                    this.player.shield = 100;
                }
                
                // Remove the powerup
                this.powerups.splice(index, 1);
            }
        });
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    updateLives() {
        document.getElementById('lives').textContent = this.player.lives;
    }

    moveEnemies() {
        const now = Date.now();
        if (now - this.lastEnemyMove >= this.enemyMoveDelay) {
            let shouldChangeDirection = false;
            
            // Play alien sound at intervals
            if (now - this.lastAlienSound >= this.alienSoundDelay) {
                const alienSound = document.getElementById('alienMoveSound');
                alienSound.currentTime = 0;
                alienSound.volume = 0.5;
                alienSound.playbackRate = 1.5;
                alienSound.play();
                this.lastAlienSound = now;
            }

            this.enemies.forEach(enemy => {
                enemy.move();
                if ((enemy.x <= 0 && enemy.direction === -1) || 
                    (enemy.x + enemy.width >= this.canvas.width && enemy.direction === 1)) {
                    shouldChangeDirection = true;
                }
                
                // Random enemy shooting
                if (Math.random() < 0.01) {
                    enemy.shoot();
                }
            });

            if (shouldChangeDirection) {
                this.enemies.forEach(enemy => {
                    enemy.direction *= -1;
                    enemy.y += this.enemyDropDistance;
                });
            }

            this.lastEnemyMove = now;
        }
    }

    update() {
        if (this.keys['ArrowLeft']) {
            this.player.move('left');
        }
        if (this.keys['ArrowRight']) {
            this.player.move('right');
        }

        this.moveEnemies();
        this.player.updateBullets();
        this.enemies.forEach(enemy => enemy.updateBullets());
        
        this.powerups.forEach((powerup, index) => {
            powerup.update();
            if (powerup.y > this.canvas.height) {
                this.powerups.splice(index, 1);
            }
        });

        this.checkCollisions();
        this.checkWinCondition();

        // Update explosions
        this.explosions = this.explosions.filter(explosion => !explosion.isFinished());
        this.explosions.forEach(explosion => explosion.update());
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw starfield background
        this.ctx.fillStyle = '#000033';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.player.draw(this.ctx);
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.powerups.forEach(powerup => powerup.draw(this.ctx));
        
        // Draw explosions
        this.explosions.forEach(explosion => explosion.draw(this.ctx));
    }

    gameLoop() {
        if (!this.gameOver) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    // Helper method for triangle collision detection
    pointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
        const area = Math.abs((x2-x1)*(y3-y1) - (x3-x1)*(y2-y1))/2;
        const a1 = Math.abs((x1-px)*(y2-py) - (x2-px)*(y1-py))/2;
        const a2 = Math.abs((x2-px)*(y3-py) - (x3-px)*(y2-py))/2;
        const a3 = Math.abs((x3-px)*(y1-py) - (x1-px)*(y3-py))/2;
        return Math.abs(area - (a1 + a2 + a3)) < 0.1;
    }

    // Update the game over handling
    checkGameOver() {
        if (this.player.lives <= 0) {
            this.gameOver = true;
            this.alienSound.pause();
            setTimeout(() => {
                alert('Game Over! Final Score: ' + this.score);
                this.initializeGame(); // Reset and restart the game
            }, 100);
        }
    }

    // Update win condition
    checkWinCondition() {
        if (this.enemies.length === 0) {
            this.gameOver = true;
            this.alienSound.pause();
            setTimeout(() => {
                alert('You win! Final Score: ' + this.score);
                this.initializeGame(); // Reset and restart the game
            }, 100);
        }
    }
}

// Start the game
new Game(); 