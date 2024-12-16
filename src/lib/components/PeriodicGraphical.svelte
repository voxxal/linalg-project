<script lang="ts">
	import { nthOrderFF, ft_eq_t } from '$lib/fourier';
	import { graphSetup, PI, drawFunction } from '$lib/graph';
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';

	const { step }: { step: number } = $props();
	let stepLerped = new Tween(0, {
		duration: 200,
		easing: cubicOut
	});
	$effect(() => {
		stepLerped.target = step;
	});

	let canvas: HTMLCanvasElement = $state(null as unknown as HTMLCanvasElement);
	$effect(() => {
		graphSetup(canvas, { domain: [-4 * PI, 4 * PI], range: [-PI, 2.5 * PI] });
		const sumOfFouriers = nthOrderFF(ft_eq_t);
		drawFunction(canvas, sumOfFouriers(stepLerped.current), { domain: [-4 * PI, 4 * PI], range: [-PI, 2.5 * PI] });
	});
</script>

<div class="my-16">
	<canvas width={384 * 4} height={384 * 1.75} bind:this={canvas} class="w-full"></canvas>
</div>
