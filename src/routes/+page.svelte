<script lang="ts">
	import Expression from './Expression.svelte';
	import { onMount } from 'svelte';
	// @ts-ignore
	import Canvas from './canvas.ts';

	let canvas: Canvas | null = null;
	let isDragging = false;
	let lastX = 0;
    let lastY = 0;

	onMount(() => {
		const htmlCanvas = document.getElementById('graph') as HTMLCanvasElement;
		canvas = new Canvas(htmlCanvas);

		canvas.drawSquares();
		canvas.drawAxes();
		canvas.drawFunction(x => Math.sin(x));
		canvas.drawFunction(x => (x-5)*(x-7)*(x+2));
		canvas.drawScaleIndicators();
	});

	function handleScroll(event: WheelEvent) {
		event.preventDefault();

		if (canvas === null) {
			return;
		}

		canvas.scale = (canvas.scale - event.deltaY * 0.05);
		canvas.clear();
		canvas.drawSquares();
		canvas.drawAxes();
		canvas.drawFunction(x => Math.sin(x));
		canvas.drawFunction(x => (x-5)*(x-7)*(x+2));
		canvas.drawScaleIndicators();
	}

	function handleMouseDown(event: MouseEvent) {
		isDragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
	}

	function handleDrag(event: MouseEvent) {
		if (!isDragging) return;

		if (canvas === null) {
			return;
		}
        const deltaX = event.clientX - lastX;
        const deltaY = event.clientY - lastY;

		const factor = 0.05;

        const deltaCartesianX = deltaX / canvas.scale * factor;
        const deltaCartesianY = deltaY / canvas.scale * factor;
		canvas.cartesianCenter = {
			x: canvas.cartesianCenter.x - deltaCartesianX,
			y: canvas.cartesianCenter.y + deltaCartesianY
		};
		console.log(canvas.cartesianCenter);

		canvas.clear();
		canvas.drawSquares();
		canvas.drawAxes();
		canvas.drawFunction(x => Math.sin(x));
		canvas.drawFunction(x => (x-5)*(x-7)*(x+2));
		canvas.drawScaleIndicators();
	}

	function handleMouseUp() {
        isDragging = false;
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=true>
	<link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
	<title>Home</title>
	<meta name="description" content="Graphing calculator app"/>
</svelte:head>

<section class="app">
	<div class="sidebar">
		<Expression/>
	</div>
	<canvas id="graph" class="graph" on:wheel="{handleScroll}" on:mouseup={handleMouseUp} on:mousedown={handleMouseDown} on:mousemove={handleDrag}></canvas>
</section>

<style>
	:global(*) {
		box-sizing: border-box;
		padding: 0;
		margin: 0;
	}
	.app {
		display: flex;
		width: 100vw;
		height: 100vh;
		background-color: #fff8f7;
	}
	.sidebar {
		display: flex;
		flex-direction: column;
		width: 20%;
		height: 100%;
		border-right: 1px solid rgb(204, 204, 204);
	}
</style>
