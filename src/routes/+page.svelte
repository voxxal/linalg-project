<script lang="ts">
	const PI = Math.PI;
	import { Canvas, Layer, type Render } from 'svelte-canvas';
	const fn = (t: number) => 4 * Math.floor(t) - 2 * Math.floor(2 * t) + 1;
	const circle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.closePath();
	};
	const fouriers = $state([
		{
			type: 'sin',
			amplitude: 4 / PI,
			stretch: 2 * PI
		},
		{
			type: 'sin',
			amplitude: 4 / (3 * PI),
			stretch: 6 * PI
		}
	]);
	$effect(() => {
		(window as any).fouriers = fouriers;
	});
	const render: Render = ({ context: ctx, width, height }) => {
		ctx.fillStyle = '#ccc';
		ctx.fillRect(0, height / 2 - 1, width, 2);
		ctx.fillStyle = '#000';
		for (let x = 0; x < 25; x += 0.05) {
			circle(ctx, x * 100, height / 2 + fn(x) * 150, 2);
		}

		ctx.beginPath();
		ctx.strokeStyle = '#f00';
		ctx.moveTo(0, height / 2);
		for (let x = 0; x < 25; x += 0.01) {
			let sum = 0;
			for (const fourier of fouriers) {
				const typeFn = fourier.type == 'sin' ? Math.sin : Math.cos;
				sum += fourier.amplitude * typeFn(fourier.stretch * x);
			}
			ctx.lineTo(x * 100, height / 2 + sum * 150);
		}
		ctx.stroke();
		ctx.closePath();
	};
</script>

<div class="min-h-screen w-full">
	<Canvas class="min-h-screen">
		<Layer {render} />
	</Canvas>
</div>
{#each fouriers as fourier}
	<select bind:value={fourier.type}>
		<option value="sin">sin</option>
		<option value="cos">cos</option>
	</select>
{/each}
