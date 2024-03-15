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
        this.scale = 100
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
        console.log(startCanvas, endCanvas)
        this.context.beginPath()
        this.context.strokeStyle = 'green'
        this.context.lineWidth = 3
        this.context.moveTo(startCanvas.x, startCanvas.y)
        this.context.lineTo(endCanvas.x, endCanvas.y)
        this.context.stroke()
        this.context.closePath()
    }

    drawFunction(fun: (x: number) => number): void {
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            console.error("Canvas context is not supported!");
            return;
        }
    
        ctx.beginPath();
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
    
        let firstPoint = true;
    
        for (let xCanvas = 0; xCanvas < this.canvas.width; xCanvas++) {
            const xCartesian = this.translateCanvasToCartesian({x: xCanvas, y: 0}).x
            const yCartesian = fun(xCartesian);
            const yCanvas = this.translateCartesianToCanvas({x: 0, y: yCartesian}).y
    
            if (isFinite(yCanvas)) {
                if (firstPoint) {
                    ctx.moveTo(xCanvas, yCanvas);
                    firstPoint = false;
                } else {
                    ctx.lineTo(xCanvas, yCanvas);
                }
            }
        }
    
        ctx.stroke();
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
        this.context.font = '12px Roboto'; // Example: 20px Arial
        this.context.fillStyle = 'black';
    
        const xAxisRange = this.canvas.width / (2 * this.scale);
        const yAxisRange = this.canvas.height / (2 * this.scale);
        const xAxisY = this.canvas.height / 2 - (0 - this.cartesianCenter.y) * this.scale;
        const yAxisX = (0 - this.cartesianCenter.x) * this.scale + this.canvas.width / 2;

        console.log(this.cartesianCenter);

        const numericInterval = this.calculateIntervalBasedOnScale();
        const xSpatialInterval = xAxisRange / 20;
        const ySpatialInterval = yAxisRange / 20;
        const firstIndicatorInTheScreenX = Math.floor(-xAxisRange / xSpatialInterval) * xSpatialInterval;
        const firstIndicatorInTheScreenY = Math.floor(-yAxisRange / ySpatialInterval) * ySpatialInterval;

        for (let i = firstIndicatorInTheScreenX; i <= xAxisRange; i += xSpatialInterval) {
            if (i == 0) {
                continue;
            }
            const xCanvas = (i - this.cartesianCenter.x) * this.scale + this.canvas.width / 2;
            this.context.fillText((i*(1-numericInterval)*-1).toFixed(2).toString(), xCanvas, xAxisY + 15);
        }
        
        for (let i = firstIndicatorInTheScreenY; i <= yAxisRange; i += ySpatialInterval) {
            if (i == 0) {
                continue;
            }
            const yCanvas = this.canvas.height / 2 - (i - this.cartesianCenter.y) * this.scale;
            this.context.fillText((i*(1-numericInterval)*-1).toFixed(2).toString(), yAxisX - 15, yCanvas);
        }
    }
    
    
    drawSquares(): void {
        const xRange = Math.ceil(this.canvas.width / (2 * this.scale));
        const yRange = Math.ceil(this.canvas.height / (2 * this.scale));

        const bigSquareLength = this.scale;
        const smallSquareLength = bigSquareLength / 5;

        // Draw squares
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 2;
        for (let i = -xRange; i <= xRange; i++) {
            for (let j = -yRange; j <= yRange; j++) {
                const xCanvas = (i - this.cartesianCenter.x) * bigSquareLength + this.canvas.width / 2;
                const yCanvas = this.canvas.height / 2 - (j - this.cartesianCenter.y) * bigSquareLength;

                this.context.lineWidth = 0.1;
                for (let k = 0; k < 5; k++) {
                    for (let l = 0; l < 5; l++) {
                        this.context.strokeRect(xCanvas+smallSquareLength*k, yCanvas+smallSquareLength*l, smallSquareLength, smallSquareLength);

                    }
                }

                this.context.lineWidth = 0.2;
                this.context.strokeRect(xCanvas, yCanvas, bigSquareLength, bigSquareLength);
            }
        }
    }

    isAxisVisible(): boolean {
        const xRange = Math.ceil(this.canvas.width / (2 * this.scale));
        const yRange = Math.ceil(this.canvas.height / (2 * this.scale));
        return this.cartesianCenter.x >= -xRange && this.cartesianCenter.x <= xRange &&
               this.cartesianCenter.y >= -yRange && this.cartesianCenter.y <= yRange;
    }

    calculateIntervalBasedOnScale(): number {
        return this.scale / 100;
    }
}

export interface Point {
    x: number
    y: number
}