export default class Ball {
    constructor(obj, windowWidth, windowHeight) {
        this.obj = obj;
        this.windowWidth = windowWidth;
        this.windowHeight = windowHeight;
        this.diameter = this.windowWidth / 10;
        this.x = this.windowWidth / 2 - this.diameter / 2;
        this.y = this.windowHeight / 2 - this.diameter / 2;
        this.speedX = 0;
        this.speedY = 0;
    }
    
    setCoords(x, y, isShift) {
        // shift if second player
        if ( isShift ) {
            this.obj.style.transform = `translate(${x - this.diameter}px, 
                ${y - this.diameter}px)`;
        } else {
            this.obj.style.transform = `translate(${x}px, ${y}px)`;
        }
    }
    
    resize(windowWidth, windowHeight) {
        this.windowWidth = windowWidth;
        this.windowHeight = windowHeight;
        this.diameter = this.windowWidth / 10;
        this.obj.style.width = this.diameter + "px";
        this.obj.style.height = this.diameter + "px";
        this.obj.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
}