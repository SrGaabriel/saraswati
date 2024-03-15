export default class Canvas {
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D
    public cartesianCenter: Point
    public scale: number

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.context = canvas.getContext('2d')!!
        this.context.imageSmoothingEnabled = false;
        this.cartesianCenter = { x: 0, y: 0 }
        this.scale = 50
        var windowScale = window.devicePixelRatio;
        canvas.width = canvas.clientWidth * windowScale;
        canvas.height = canvas.clientHeight * windowScale;
        this.context.scale(windowScale, windowScale);
    }

    translateCartesianToCanvas(point: Point): Point {
        const { x: centerXCartesian, y: centerYCartesian } = this.cartesianCenter;
    
        const xCanvas = (point.x - centerXCartesian) * this.scale + this.canvas.width / 2;
        const yCanvas = this.canvas.height / 2 - (point.y - centerYCartesian) * this.scale;
    
        return { x: Math.round(xCanvas), y: Math.round(yCanvas) };
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
        const { x: centerXCartesian, y: centerYCartesian } = this.cartesianCenter;
    
        ctx.beginPath();
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
    
        let firstPoint = true;
    
        for (let xCanvas = 0; xCanvas < this.canvas.width; xCanvas++) {
            const xCartesian = (xCanvas - this.canvas.width / 2) / this.scale + centerXCartesian;
            const yCartesian = fun(xCartesian);
            const yCanvas = this.canvas.height / 2 - (yCartesian - centerYCartesian) * this.scale;
    
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
        const xAxisY = this.canvas.height / 2 - (0 - this.cartesianCenter.y) * this.scale;
        this.context.beginPath();
        this.context.moveTo(0, xAxisY);
        this.context.lineTo(this.canvas.width, xAxisY);
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 1;
        this.context.stroke();

        // Draw Y-axis
        const yAxisX = (0 - this.cartesianCenter.x) * this.scale + this.canvas.width / 2;
        this.context.beginPath();
        this.context.moveTo(yAxisX, 0);
        this.context.lineTo(yAxisX, this.canvas.height);
        this.context.stroke();
    }

    drawScaleIndicators(): void {
        this.context.font = '12px Roboto'; // Example: 20px Arial
        this.context.fillStyle = 'black';
    
        const xAxisRange = Math.ceil(this.canvas.width / (2 * this.scale));
        const yAxisRange = Math.ceil(this.canvas.height / (2 * this.scale));
        const xAxisY = this.canvas.height / 2 - (0 - this.cartesianCenter.y) * this.scale;
        const yAxisX = (0 - this.cartesianCenter.x) * this.scale + this.canvas.width / 2;
    
        for (let i = -xAxisRange; i <= xAxisRange; i++) {
            if (i === 0) continue;
            const xCanvas = this.translateCartesianToCanvas({ x: this.cartesianCenter.x + i, y: 0 }).x;
            this.context.fillText(Math.ceil(this.cartesianCenter.x + i).toString(), xCanvas - 3, xAxisY + 15);
        }
    
        for (let i = -yAxisRange; i <= yAxisRange; i++) {
            const yCanvas = this.translateCartesianToCanvas({ x: 0, y: this.cartesianCenter.y + i }).y;
            this.context.fillText(Math.ceil(this.cartesianCenter.y + i).toString(), yAxisX + 5, yCanvas + 5);
        }
    }
    
    
    drawSquares(): void {
        // Calculate the range of values for the squares
        const xRange = Math.ceil(this.canvas.width / (2 * this.scale));
        const yRange = Math.ceil(this.canvas.height / (2 * this.scale));

        // Calculate the length of a small square
        const bigSquareLength = this.scale;
        const smallSquareLength = bigSquareLength / 5;

        // Clear canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
}

export interface Point {
    x: number
    y: number
}