<script lang="ts">
	const PI = Math.PI;
	import FourierGraphical from '$lib/components/FourierGraphical.svelte';
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
	const proj = (a: string, b: string) => `\\text{proj}_{${a}}{${b}}`;
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
	<p>
		We can then prove that all continuous real functions on a fixed domain is a vector space TODO
	</p>
	<!-- TODO we need to define the inner product to be the integral somewhere here. -->
	<h2>Catching Waves</h2>
	<p>
		The goal of a Fourier Series is to approximate a function <K math="f" /> with a sum of
		<K math={`\\color{blue}\\sin`} /> and <K math={`\\color{red}\\cos`} />. We do this by
		establishing a subspace <K math="W" /> of
		<K math="C[0, 2\pi]" /> spanned by the following set
	</p>
	<K
		math={`\\{1, \\color{red} \\cos{t}, \\cos{2t}, \\cdots, \\cos{nt}, \\color{blue} \\sin{t}, \\sin{2t}, \\cdots, \\sin{nt}\\color{black} \\}`}
		displayMode={true}
	/>
	<p>
		and projecting <K math="f" /> onto
		<K math="W" /> to find the <b>best approximation</b>.
	</p>
	<p>The best approximation is known as a <K math="n" />th-order Fourier Approximation.</p>
	<p>
		Recall that we must prove that the set is orthognal before we the best approximation theorem can
		hold. We can prove this by showing that <K math={`\\cos{mt} \\perp \\cos{nt}`} /> where
		<K math="m \ne n" />.
	</p>
	<!-- Insert proof here -->
	<p>
		A similar process can be applied to <K math="\sin" />, and is left as an exercise to the reader.
		Now that we have established that the set is orthognal, we know the projection of <K math="f" />
		onto <K math="W" /> is the best approximation of <K math="f" />.
	</p>
	<p>
		This means that the function <K math="f" /> can be approximated by a linear combination of the functions
		in the set of functions that span <K math="W" />.
	</p>
	<div class="grid grid-cols-2 justify-center items-center text-center">
		<K
			math={`\\color{red}a_k = ${proj('\\cos{kt}', 'f')} = \\frac{\\langle f,\\cos{kt}\\rangle}{\\langle \\cos{kt},\\cos{kt}\\rangle}`}
		/>
		<K
			math={`\\color{blue}b_k = ${proj('\\sin{kt}', 'f')} = \\frac{\\langle f,\\sin{kt}\\rangle}{\\langle \\sin{kt},\\sin{kt}\\rangle}`}
		/>
	</div>

	<K
		math={`\\frac{\\langle f,1\\rangle}{\\langle 1,1\\rangle} + \\color{red} a_1\\cos{t} + a_2\\cos{2t} + \\cdots + a_n\\sin{nt} \\color{black} + \\color{blue} b_1\\sin{t} + b_2\\sin{2t} + \\cdots + b_n\\sin{nt}`}
		displayMode={true}
	/>

	<p>Note that:</p>
	<K
		math={`\\color{red}a_k = \\frac{1}{\\pi}\\int_0^{2\\pi}f(t)\\cos{kt}\\,dt`}
		displayMode={true}
	/>
	<p>and,</p>
	<K
		math={`\\frac{\\langle f,1\\rangle}{\\langle 1,1\\rangle} = \\frac{1}{2\\pi}\\int_0^{2\\pi}f(t)\\cdot 1 \\,dt = \\frac{1}{2}\\left[\\color{red}\\frac{1}{\\pi}\\int_0^{2\\pi}f(t)\\cos{(0 \\cdot t)}\\,dt\\color{black}\\right] = \\frac{a_0}{2}`}
		displayMode={true}
	/>
	<p>Which we can then substitute into the above equation, Thus behold...</p>
	<h3 class="text-center font-black">THE FOURIER SERIES EQUATION</h3>
	<div class="not-prose my-16">
		<K
			math={`\\frac{a_0}{2} + \\color{red} a_1\\cos{t} + a_2\\cos{2t} + \\cdots + a_n\\sin{nt} \\color{black} + \\color{blue} b_1\\sin{t} + b_2\\sin{2t} + \\cdots + b_n\\sin{nt}`}
			displayMode={true}
		/>

		<div class="grid grid-cols-2 justify-center items-center text-center">
			<K
				math={`\\color{red}a_k = \\frac{1}{\\pi}\\int_0^{2\\pi}f(t)\\cos{kt}\\,dt`}
				displayMode={true}
			/>
			<K
				math={`\\color{blue}b_k = \\frac{1}{\\pi}\\int_0^{2\\pi}f(t)\\sin{kt}\\,dt`}
				displayMode={true}
			/>
		</div>
	</div>
	<p>
		Using these equations we can decompose any function that is continuous on the domain
		<K math="[0, 2\pi]" />. Let's see this equation in action.
	</p>

	<h2>In motion</h2>
	<p>
		Lets take the function <K math="f(t) = t" /> on the domain <K math="[0, 2\pi]" /> and find the general
		<K math="n" />th-order Fourier Approximation.
	</p>

	<p>
		First we'll find <K math={`\\frac{a_0}{2}`} />:
	</p>
	<K
		math={`a_0 = \\frac{1}{2} \\cdot \\frac{1}{\\pi} \\int_0^{2\\pi} t\\, dt = \\frac{1}{2\\pi} \\left[ \\frac{1}{2}t^2 \\right]_0^{2\\pi} = \\pi`}
		displayMode={true}
	/>
	<p>and for <K math="k > 0" />:</p>
	<K
		math={`a_k = \\frac{1}{\\pi} \\int_0^{2\\pi} t \\cos kt \\,dt = \\frac{1}{\\pi} \\left[ \\frac{1}{k^2} \\cos kt + \\frac{t}{k} \\sin kt \\right]_0^{2\\pi} = 0`}
		displayMode={true}
	/>
	<K
		math={`b_k = \\frac{1}{\\pi} \\int_0^{2\\pi} t \\sin kt \\,dt = \\frac{1}{\\pi} \\left[ \\frac{1}{k^2} \\sin kt + \\frac{t}{k} \\cos kt \\right]_0^{2\\pi} = -\\frac{2}{k}`}
		displayMode={true}
	/>
	<p>Thus our <K math="n" />th-order Fourier Approximation is</p>
	<K
		math={`\\pi - 2 \\sin{t} - \\sin{2t} - \\frac{2}{3} \\sin{3t} - \\cdots - \\frac{2}{n} \\sin{nt}`}
		displayMode={true}
	/>
	<p>
		Lets see what this looks like in a graphical form. The
		<span class="text-blue-500 font-bold">blue line</span> represents our current approximation,
		while the arrows show how adding the next term will affect our approximation. The
		<span class="text-red-500 font-bold">red line</span> is the function we are trying to
		approximate,
		<K math="f(t) = t" />.
	</p>
</article>
<FourierGraphical />
<article class="prose lg:prose-xl m-auto">
	<p>
		Note that this is only on the domain <K math="[0, 2\pi]" /> if we pull back the curtain a bit, we'll
		see that the function repeats with a period of <K math="2\pi" />.
	</p>
	<!-- TODO make a visual for past 2pi, that requires refactoring some of the rendering code and at the time of writing its 11:49 and im going to sleep soon. -->
	<p>Now its your turn. Using a fourier series, decompose the following function into a fourier</p>
</article>
<div class="mb-32"></div>

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
