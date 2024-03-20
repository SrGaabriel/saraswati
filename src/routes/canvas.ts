import { displayNumber } from "./util"

export default class Canvas {
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D
    public cartesianCenter: Point
    public scale: number
    public canvasCenter: Point

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.context = canvas.getContext('2d')!!
        this.context.imageSmoothingEnabled = false;
        this.cartesianCenter = { x: 0, y: 0 }
        this.scale = 80
        var windowScale = window.devicePixelRatio;
        canvas.width = canvas.clientWidth * windowScale;
        canvas.height = canvas.clientHeight * windowScale;
        this.canvasCenter = {x:this.canvas.width/2, y:this.canvas.height/2}
    }

    translateCartesianToCanvas(point: Point): Point {
        const { x: centerXCartesian, y: centerYCartesian } = this.cartesianCenter;
    
        const xCanvas = (point.x - centerXCartesian) * this.scale + this.canvas.width / 2;
        const yCanvas = this.canvas.height / 2 - (point.y - centerYCartesian) * this.scale;
    
        return { x: xCanvas, y: yCanvas };
    }

    translateCanvasToCartesian(point: Point): Point {
        const { x: centerXCartesian, y: centerYCartesian } = this.cartesianCenter;
    
        const xCartesian = (point.x - this.canvas.width / 2) / this.scale + centerXCartesian;
        const yCartesian = (this.canvas.height / 2 - point.y) / this.scale + centerYCartesian;
    
        return { x: xCartesian, y: yCartesian };
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    drawLine(start: Point, end: Point) {
        const startCanvas = this.translateCartesianToCanvas(start)
        const endCanvas = this.translateCartesianToCanvas(end)
        this.context.beginPath()
        this.context.strokeStyle = 'green'
        this.context.lineWidth = 3
        this.context.moveTo(startCanvas.x, startCanvas.y)
        this.context.lineTo(endCanvas.x, endCanvas.y)
        this.context.stroke()
        this.context.closePath()
    }

    drawFunction(fun: (x: number) => number): void {
        this.context.beginPath();
        this.context.strokeStyle = 'blue';
        this.context.lineWidth = 2;
    
        for (let xCanvas = 0; xCanvas < this.canvas.width; xCanvas++) {
            const xCartesian = this.translateCanvasToCartesian({x: xCanvas, y: 0}).x
            const yCartesian = fun(xCartesian);
            const yCanvas = this.translateCartesianToCanvas({x: 0, y: yCartesian}).y

            if (xCanvas === 0) {
                this.context.moveTo(xCanvas, yCanvas);
            } else {
                this.context.lineTo(xCanvas, yCanvas);
              }
        }
    
        this.context.stroke();
    }

    drawAxes() {
        // Draw X-axis
        const axes = this.translateCartesianToCanvas({x:0, y:0});
        this.context.beginPath();
        this.context.moveTo(0, axes.y);
        this.context.lineTo(this.canvas.width, axes.y);
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 1;
        this.context.stroke();

        // Draw Y-axis
        this.context.beginPath();
        this.context.moveTo(axes.x, 0);
        this.context.lineTo(axes.x, this.canvas.height);
        this.context.stroke();
    }

    drawScaleIndicators(): void {
        this.context.font = '12px Roboto';
        this.context.fillStyle = 'black';
    
        const xAxisY = this.canvas.height / 2 - -this.cartesianCenter.y * this.scale;
        const yAxisX = -this.cartesianCenter.x * this.scale + this.canvas.width / 2;

        const firstIndicator = this.firstIndicatorOnScreen;
        const spatialInterval = this.spatialInterval;
        for (let i = firstIndicator.x; i <= this.xAxisRange; i += spatialInterval) {
            const xCanvas = (i - this.cartesianCenter.x) * this.scale + this.canvas.width / 2;
            const point = this.translateCanvasToCartesian({x: xCanvas, y: xAxisY});
            if (point.x === 0) continue;
            this.context.fillText(displayNumber(point.x), xCanvas-12, xAxisY + 15);
        }
        
        for (let i = firstIndicator.y; i <= this.yAxisRange; i += spatialInterval) {
            const yCanvas = this.canvas.height / 2 - (i - this.cartesianCenter.y) * this.scale;
            const point = this.translateCanvasToCartesian({x: yAxisX, y: yCanvas});
            this.context.fillText(displayNumber(point.y), yAxisX - 35, yCanvas);
        }
    }
    
    
    drawSquares(): void {
        this.context.font = '12px Roboto'; // Example: 20px Arial
        this.context.fillStyle = 'black';

        const firstIndicator = this.firstIndicatorOnScreen;
        const spatialInterval = this.spatialInterval;
        for (let i = firstIndicator.x; i <= this.xAxisRange; i += spatialInterval) {
            for (let j = this.firstIndicatorOnScreen.y; j <= this.xAxisRange; j += spatialInterval) {
                const xCanvas = (i - this.cartesianCenter.x) * this.scale + this.canvas.width / 2;
                const previousXCanvas = (i - this.spatialInterval - this.cartesianCenter.x) * this.scale + this.canvas.width / 2;
                const yCanvas = this.canvas.height / 2 - (j - this.cartesianCenter.y) * this.scale;
                this.context.beginPath();
                this.context.strokeStyle = 'black';
                this.context.lineWidth = 0.25;
                this.context.moveTo(xCanvas, yCanvas);
                this.context.lineTo(previousXCanvas, yCanvas);
                this.context.moveTo(xCanvas, yCanvas);
                this.context.lineTo(xCanvas, yCanvas - this.spatialInterval * this.scale);
                this.context.stroke();
                this.context.closePath();
            }
        }
    }

    get xAxisRange(): number {
        return Math.ceil(this.canvas.width / (2 * this.scale));
    }


    get yAxisRange(): number {
        return Math.ceil(this.canvas.height / (2 * this.scale));
    }

    get spatialInterval(): number {
        return Math.max(this.xAxisRange, this.yAxisRange) / 10;
    }

    get firstIndicatorOnScreen(): Point {
        return {
            x: Math.floor(-this.xAxisRange / this.spatialInterval) * this.spatialInterval,
            y: Math.floor(-this.yAxisRange / this.spatialInterval) * this.spatialInterval
        };
    }

    isAxisVisible(): boolean {
        const xRange = Math.ceil(this.canvas.width / (2 * this.scale));
        const yRange = Math.ceil(this.canvas.height / (2 * this.scale));
        return this.cartesianCenter.x >= -xRange && this.cartesianCenter.x <= xRange &&
               this.cartesianCenter.y >= -yRange && this.cartesianCenter.y <= yRange;
    }
}

export interface Point {
    x: number
    y: number
}