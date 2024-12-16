<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import K from './K.svelte';
	import { graphSetup, PI, drawFunction, numOnScreen } from '$lib/graph';
	import { ft_eq_t, nthOrderFF } from '$lib/fourier';
	const MAX_ORDER = 20;

	let { step = $bindable() }: { step: number } = $props();
	let showArrows = $state(true);
	let stepLerped = new Tween(0, {
		duration: 200,
		easing: cubicOut
	});

	let arrowScale = $state(
		new Tween(1, {
			duration: 200,
			easing: cubicOut
		})
	);
	let arrowDirty = $state(false);
	let scrollTrack: HTMLDivElement = $state(null as unknown as HTMLDivElement);

	const graphSettings: { domain: [number, number]; range: [number, number] } = {
		domain: [0, 2 * PI],
		range: [-PI, 2.5 * PI]
	};

	// yoinked directly from https://codepen.io/chanthy/pen/WxQoVG
	function drawArrow(
		ctx: CanvasRenderingContext2D,
		fromx: number,
		fromy: number,
		tox: number,
		toy: number,
		arrowWidth: number,
		color: string
	) {
		//variables to be used when creating the arrow
		var headlen = 10;
		var angle = Math.atan2(toy - fromy, tox - fromx);

		ctx.save();
		ctx.strokeStyle = color;

		//starting path of the arrow from the start square to the end square
		//and drawing the stroke
		ctx.beginPath();
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.lineWidth = arrowWidth;
		ctx.stroke();

		//starting a new path from the head of the arrow to one of the sides of
		//the point
		ctx.beginPath();
		ctx.moveTo(tox, toy);
		ctx.lineTo(tox - headlen * Math.cos(angle - PI / 7), toy - headlen * Math.sin(angle - PI / 7));

		//path from the side point of the arrow, to the other side point
		ctx.lineTo(tox - headlen * Math.cos(angle + PI / 7), toy - headlen * Math.sin(angle + PI / 7));

		//path from the side point back to the tip of the arrow, and then
		//again to the opposite side point
		ctx.lineTo(tox, toy);
		ctx.lineTo(tox - headlen * Math.cos(angle - PI / 7), toy - headlen * Math.sin(angle - PI / 7));

		//draws the paths created above
		ctx.stroke();
		ctx.restore();
	}

	const drawArrows = (
		canvas: HTMLCanvasElement,
		fn1: (t: number) => number,
		fn2: (t: number) => number
	) => {
		const coord = numOnScreen(canvas, graphSettings);
		const ctx = canvas.getContext('2d')!!;

		for (let t = 0; t < 2 * PI; t += 0.3) {
			const x = coord(t)[0];
			if (Math.abs((fn2(t) - fn1(t)) * arrowScale.current) < 0.2) continue;
			drawArrow(
				ctx,
				x,
				coord(fn1(t))[1],
				x,
				coord(fn1(t) + (fn2(t) - fn1(t)) * arrowScale.current)[1],
				3,
				fn1(t) - fn2(t) < 0 ? 'green' : '#ef4444'
			);
		}
	};

	let mainCanvas: HTMLCanvasElement = $state(null as unknown as HTMLCanvasElement);
	let canvases: HTMLCanvasElement[] = Array(MAX_ORDER).fill(null as unknown as HTMLCanvasElement);
	$effect(() => {
		graphSetup(mainCanvas, graphSettings);
		drawFunction(mainCanvas, (t) => t, { color: '#ef4444', ...graphSettings });

		for (let i = 0; i < canvases.length; i++) {
			const canvas = canvases[i];
			graphSetup(canvas, graphSettings);
			drawFunction(canvas, ft_eq_t(i + 1), graphSettings);
		}
	});

	$effect(() => {
		stepLerped.target = step;
		arrowDirty = true;
	});

	$effect(() => {
		graphSetup(mainCanvas, graphSettings);
		drawFunction(mainCanvas, (t) => t, { color: '#ef4444', ...graphSettings });
		const sumOfFouriers = nthOrderFF(ft_eq_t);
		drawFunction(mainCanvas, sumOfFouriers(stepLerped.current), graphSettings);
		if (
			Math.ceil(stepLerped.current + 0.05) != Math.ceil(stepLerped.current + 0.01) &&
			arrowDirty
		) {
			arrowScale = new Tween(0, {
				duration: 200,
				easing: cubicOut
			});
			arrowScale.target = 1;
			arrowDirty = false;
		}
		if (showArrows && step !== MAX_ORDER)
			drawArrows(
				mainCanvas,
				sumOfFouriers(stepLerped.current),
				sumOfFouriers(Math.ceil(stepLerped.current + 0.01))
			);
		scrollTrack.scrollLeft = Math.max(0, (stepLerped.current - 0.75) * (384 + 32));
	});

	// thanks claude
	const getOrdinalSuffix = (n: number): string => {
		// Convert number to absolute value to handle negative numbers
		const num = Math.abs(Math.floor(n));

		// Special case for numbers between 11 and 13
		if (num % 100 >= 11 && num % 100 <= 13) {
			return `th`;
		}

		// Determine suffix based on last digit
		switch (num % 10) {
			case 1:
				return `st`;
			case 2:
				return `nd`;
			case 3:
				return `rd`;
			default:
				return `th`;
		}
	};
</script>

<div class="my-16">
	<div class="mx-8 flex">
		<div>
			<canvas height={384 * 1.75} width={384} bind:this={mainCanvas}></canvas>
			<div>
				<K
					math={step === 0
						? 'f(x) = 0'
						: `${step - 1}\\text{${getOrdinalSuffix(step - 1)} order Fourier Approximation}`}
					displayMode={true}
				/>
			</div>
		</div>

		<div class="flex basis-[384px] flex-1 gap-8 ml-16 overflow-scroll" bind:this={scrollTrack}>
			{#each canvases as _, i}
				<div>
					<div class="grid *:col-start-1 *:row-start-1 grid-cols-1 grid-rows-1 w-[384px]">
						<canvas
							height={384 * 1.75}
							width={384}
							bind:this={canvases[i]}
							style="opacity: {Math.max(0.15, (stepLerped.current - i) / 1.5 + 0.7)}"
						></canvas>
						<div
							class="{Math.ceil(stepLerped.current) === i
								? 'bg-yellow-100 opacity-20'
								: ''} transition-all"
						></div>
					</div>
					<div>
						<K
							math={i === 0 ? `\\pi` : `-\\frac{2}{${i}}\\sin{${i === 1 ? '' : i}t}`}
							displayMode={true}
						/>
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div class="flex mx-8 gap-4">
		<input type="range" class="flex-1" min={0} max={MAX_ORDER} bind:value={step} />
		<div>
			<label for="show-arrows" class="mr-2">Show Arrows: </label><input
				type="checkbox"
				id="show-arrows"
				bind:checked={showArrows}
			/>
		</div>
	</div>
</div>
