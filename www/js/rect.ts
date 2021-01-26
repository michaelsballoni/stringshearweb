class Rect {
    x: number;
    y: number;

    width: number;
    height: number;

    top: number;
    left: number;
    right: number;
    bottom: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.top = this.y;
        this.left = this.x;
        this.right = this.x + this.width;
        this.bottom = this.y + this.height;
    }
}
