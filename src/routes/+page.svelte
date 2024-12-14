<script lang="ts">
	const PI = Math.PI;
	import K from '$lib/components/K.svelte';
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
		for (let x = 0; x < 25; x += 0.01) {
			circle(ctx, (x * width) / 2, height / 2 + fn(x) * 150, 2);
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
			ctx.lineTo((x * width) / 2, height / 2 + sum * 150);
		}
		ctx.stroke();
		ctx.closePath();
	};
	const vu = `\\vec{u}`;
	const realR = `\\mathbb{R}`;
</script>

<svelte:head>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css" />
</svelte:head>

<div class="bg-black text-white text-center h-[50vh] grid items-center justify-center">
	<div>
		<h1 class="text-4xl font-black mb-2">Fourier Series</h1>
		<h2 class="text-xl">Aiden Shi, Misha Shatalov, Abraham Jiang</h2>
	</div>
</div>

<article class="prose lg:prose-xl m-auto mt-16">
	<p>
		Fourier series are everywhere in daily life. From noise canceling headphones to cellphone lines
		to
		<a href="https://www.youtube.com/watch?v=XggxeuFDaDU">making sure bridges don't fall apart</a>,
		Fourier series are used everywhere. Fourier series have some surprising connections to linear
		algebra that we'll be exploring today.
	</p>
	<h2>A Quick Recap...</h2>
	<p>
		Recall that to prove any set <K math="V" /> is a vector space, the following conditions must all
		hold where <K math={`${vu}, \\vec{v}`} /> are vectors in V and <K math="c" /> is any scalar in
		<K math={realR} />
	</p>
	<ol>
		<li><K math={`${vu} + \\vec{v}`} /> is in <K math="V" /></li>
		<li>
			<K math="V" /> has a zero vector <K math={`\\vec{0}`} /> such that for every
			<K math={`${vu}`} /> in <K math="V" />, <K math={`${vu} + \\vec{0} = ${vu}`} />.
		</li>
		<li><K math={`c${vu}`} /> is in <K math="V" /></li>
	</ol>
	<p>We can then prove that all real functions TODO</p>
</article>
<!-- <div class="min-h-screen w-full">
	<Canvas class="min-h-screen">
		<Layer {render} />
	</Canvas>
</div>
{#each fouriers as fourier}
	<select bind:value={fourier.type}>
		<option value="sin">sin</option>
		<option value="cos">cos</option>
	</select>
{/each} -->
