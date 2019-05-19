module.exports = class Ball {
    constructor(io, nsp, windowWidth, windowHeight) {
        this.windowWidth = windowWidth;
        this.windowHeight = windowHeight;
        this.diameter = this.windowWidth / 10;
        this.x = this.windowWidth / 2 - this.diameter / 2;
        this.y = this.windowHeight / 2 - this.diameter / 2;
        this.speedX = [-3, 3][Math.round(Math.random())];
        this.speedY = [-3, 3][Math.round(Math.random())];
        this.power = 1.3;
        this.fPData = null;
        this.sPData = null;
        this.fPScore = 0;
        this.sPScore = 0;
        this.io = io;
        this.nsp = nsp;
        this.interval = null;
        this.timeout = null;
    }

    getPlayersData(fPData, sPData) {
        this.fPData = fPData;
        this.sPData = sPData;
    }

    start() {
        this.speedX = [-3, 3][Math.round(Math.random())];
        this.speedY = [-3, 3][Math.round(Math.random())];
        
        this.interval = setInterval(() => {
            this.io.of(this.nsp).emit('get-players-data');
            this.x += this.speedX;
            this.y += this.speedY;
            this.hitArea();
            this.getCoords();
            this.collisionWithPlayers();
        }, 30);
    }

    hitArea() {
        let r = this.diameter / 2;
        let width = this.windowWidth - 16,
            height = this.windowHeight - 16;
        
        if ( this.x > width - r || this.x < 0) {
            this.speedX = -this.speedX;
        } else if ( this.y < 0 - this.diameter ) {
            this.fPScore += 1;
            this.io.of(this.nsp).emit('first-player-score', this.fPScore);
            this.endRound();
        } else if ( this.y > height + this.diameter ) {
            this.sPScore += 1;
            this.io.of(this.nsp).emit('second-player-score', this.sPScore);
            this.endRound();
        }
    }
    collisionWithPlayers() {
        // fp, sP (firtsPlayer, secondPlayer)
       if ( this.fPData && this.sPData ) {
            let fP = this.fPData;
            let sP = this.sPData;
            let r = this.diameter / 2;
            // 16 scroll widht
            let height = this.windowHeight - 16;

            if ( this.y > height - r - fP['height'] &&
                this.x < fP['x'] + fP['width'] &&
                this.x + this.diameter> fP['x']) {
                this.speedY = -this.speedY * this.power;
                this.speedX = [-5, -4, -3, -2, 2, 3, 4, 5][Math.round(Math.random()  * 4)];
            } else if ( this.y < 0 + sP['height'] &&
                        this.x < sP['x'] + sP['width'] &&
                        this.x + this.diameter > sP['x']) {
                this.speedY = -this.speedY * this.power;
                this.speedX = [-5, -4, -3, -2, 2, 3, 4, 5][Math.round(Math.random()  * 4)];
            }
       } else {
           console.log("No players data");
       }
    }

    getCoords() {
        this.io.of(this.nsp).emit('get-ball-coords', 
                            [this.x, this.y, this.windowWidth, this.windowHeight]);
    }

    endRound() {
        clearInterval(this.interval);
        this.x = this.windowWidth / 2 - this.diameter / 2;
        this.y = this.windowHeight / 2 - this.diameter / 2;
        this.timeout = setTimeout(() => {
            this.start();
        }, 1000);
    }

    endGame() {
        clearTimeout(this.timeout);
        clearInterval(this.interval);
    }
}