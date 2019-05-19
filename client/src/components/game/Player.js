export default class Player {
    constructor(obj, windowWidth, windowHeight) {
        this.obj = obj;
        this.windowWidth = windowWidth;
        this.windowHeight = windowHeight;
        this.height = this.windowWidth / 24;
        this.width = this.windowWidth / 3;
        this.x = this.windowWidth / 2 - this.width / 2;
        this.opponentX = this.x;
        this.speedX = this.windowWidth / 150;
        this.value = '';
    }

    start(socket, opponent) {
        this.setCoord(socket, opponent);
        this.resize(this.windowWidth, this.windowHeight);
        this.move(socket);
    }
    
    setCoord(socket, opponent) {
        socket.on('get-opponent-data', data => {
            let coef = this.windowWidth / data[0];
            this.opponentX += data[1] * coef;
            if ( this.opponentX < 0 ) {
                this.opponentX = 0;
            } else if ( this.opponentX + this.width> this.windowWidth ) {
                this.opponentX = this.windowWidth - this.width;
            }
            opponent.style.transform = `translate(${this.opponentX}px, 0px)`;
        })
        
    }

    resize(windowWidth, windowHeight) {
        this.windowWidth = windowWidth;
        this.windowHeight = windowHeight;
        this.height = this.windowWidth / 24;
        this.width = this.windowWidth / 3;
        this.obj.style.width = this.width + "px";
        this.obj.style.height = this.height + "px";
        this.obj.style.transform = `translate(${this.x}px, 0px)`;
    }

    move(socket) {
        if ( window.DeviceMotionEvent ) {
            window.addEventListener("devicemotion", () => {
                let aX = event.accelerationIncludingGravity.x * 5;
                if ( aX > 0 ) {
                    this.x -= this.speedX;
                    if ( this.x < 0 ) {
                        this.x = 0;
                    }
                    this.obj.style.transform = `translate(${this.x}px, 0px)`;
                    socket.emit('set-opponent-data', [this.speedX, this.width, this.height]);
                } else if ( aX < 0 ) {
                    this.x += this.speedX;
                    if ( this.x + this.width > this.windowWidth ) {
                        this.x = this.windowWidth - this.width;
                    }
                    this.obj.style.transform = `translate(${this.x}px, 0px)`;
                    socket.emit('set-opponent-data', [-this.speedX, this.width, this.height]);
                }
            });
        }

        window.addEventListener('keydown', (e) => {
            if ( e.which == '37' ) {
                this.x -= this.speedX;
                if ( this.x < 0 ) {
                    this.x = 0;
                }
                this.obj.style.transform = `translate(${this.x}px, 0px)`;
                socket.emit('set-opponent-data', [this.speedX, this.width, this.height]);
            } else if ( e.which == '39' ) {
                this.x += this.speedX;
                if ( this.x + this.width > this.windowWidth ) {
                    this.x = this.windowWidth - this.width;
                }
                this.obj.style.transform = `translate(${this.x}px, 0px)`;
                socket.emit('set-opponent-data', [-this.speedX, this.width, this.height]);
            }
        })
    }

    getPlayersData(socket) {
        socket.on('get-players-data', () => {
            let data = [{
                "x": this.x,
                "height": this.height,
                "width": this.width
            }, {
                "x": this.opponentX,
                "height": this.height,
                "width": this.width
            }];
            
            socket.emit('set-players-data', data);
        });
    }
}