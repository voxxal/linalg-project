<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import K from './K.svelte';
	const MAX_ORDER = 20;

	const graphSetup = (canvas: HTMLCanvasElement) => {
		const ctx = canvas.getContext('2d')!!;
		ctx.fillStyle = '#fff';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'transparent';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = '#aaa';
		const NUM_LINES = 8;
		for (let i = 1; i <= NUM_LINES; i++) {
			ctx.fillRect(0, (1 / NUM_LINES) * i * (canvas.height / 2), canvas.width, 1);
			ctx.fillRect(0, canvas.height - (1 / NUM_LINES) * i * (canvas.height / 2), canvas.width, 1);
			ctx.fillRect((1 / NUM_LINES) * i * canvas.width, 0, 1, canvas.height);
		}
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, 4, canvas.height);
		ctx.fillRect(0, canvas.height / 2 - 4, canvas.width, 4);
	};

	let step = $state(0);
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

	const tToScreenX = (canvas: HTMLCanvasElement, t: number) => (t * canvas.width) / (2 * Math.PI);

	const fnToScreenY = (canvas: HTMLCanvasElement, v: number) =>
		(1 - v / (2 * Math.PI)) * (canvas.height / 2);

	const drawFunction = (
		canvas: HTMLCanvasElement,
		fn: (t: number) => number,
		{ percision = 0.03, color = '#3b82f6', width = 2 } = {}
	) => {
		const ctx = canvas.getContext('2d')!!;
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.beginPath();
		ctx.moveTo(0, (1 - fn(0) / (2 * Math.PI)) * (canvas.height / 2));
		for (let t = 0; t < 2 * Math.PI; t += percision) {
			ctx.lineTo(tToScreenX(canvas, t), fnToScreenY(canvas, fn(t)));
		}
		ctx.stroke();
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
		ctx.lineTo(
			tox - headlen * Math.cos(angle - Math.PI / 7),
			toy - headlen * Math.sin(angle - Math.PI / 7)
		);

		//path from the side point of the arrow, to the other side point
		ctx.lineTo(
			tox - headlen * Math.cos(angle + Math.PI / 7),
			toy - headlen * Math.sin(angle + Math.PI / 7)
		);

		//path from the side point back to the tip of the arrow, and then
		//again to the opposite side point
		ctx.lineTo(tox, toy);
		ctx.lineTo(
			tox - headlen * Math.cos(angle - Math.PI / 7),
			toy - headlen * Math.sin(angle - Math.PI / 7)
		);

		//draws the paths created above
		ctx.stroke();
		ctx.restore();
	}

	const drawArrows = (
		canvas: HTMLCanvasElement,
		fn1: (t: number) => number,
		fn2: (t: number) => number
	) => {
		const ctx = canvas.getContext('2d')!!;

		for (let t = 0; t < 2 * Math.PI; t += 0.3) {
			const x = tToScreenX(canvas, t);
			if (Math.abs((fn2(t) - fn1(t)) * arrowScale.current) < 0.2) continue;
			drawArrow(
				ctx,
				x,
				fnToScreenY(canvas, fn1(t)),
				x,
				fnToScreenY(canvas, fn1(t) + (fn2(t) - fn1(t)) * arrowScale.current),
				3,
				fn1(t) - fn2(t) < 0 ? 'green' : '#ef4444'
			);
		}
	};

	const myGloriousHorribleHackThatIsInTotalViolationOfAllRulesOfTypescript =
		null as unknown as HTMLCanvasElement;
	let mainCanvas: HTMLCanvasElement = $state(
		myGloriousHorribleHackThatIsInTotalViolationOfAllRulesOfTypescript
	);
	let canvases: HTMLCanvasElement[] = Array(MAX_ORDER).fill(myGloriousHorribleHackThatIsInTotalViolationOfAllRulesOfTypescript)

	const fourierFunction = (i: number) => (t: number) =>
		i === 0 ? 0 : i === 1 ? Math.PI : -(2 / (i - 1)) * Math.sin((i - 1) * t);
	const nthOrderFF = (i: number) => (t: number) => {
		let sum = 0;
		for (let j = 0; j <= i; j++) {
			sum += fourierFunction(j)(t);
		}

		if (i % 1 !== 0) {
			sum += fourierFunction(Math.ceil(i))(t) * (i - Math.trunc(i));
		}
		return sum;
	};

	$effect(() => {
		graphSetup(mainCanvas);
		drawFunction(mainCanvas, (t) => t, { color: '#ef4444' });

		for (let i = 0; i < canvases.length; i++) {
			const canvas = canvases[i];
			graphSetup(canvas);
			drawFunction(canvas, fourierFunction(i + 1));
		}
	});
	
    $effect(() => {
		stepLerped.target = step;
		arrowDirty = true;
	});

	$effect(() => {
		graphSetup(mainCanvas);
		drawFunction(mainCanvas, (t) => t, { color: '#ef4444' });
		drawFunction(mainCanvas, nthOrderFF(stepLerped.current));
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
				nthOrderFF(stepLerped.current),
				nthOrderFF(Math.ceil(stepLerped.current + 0.01))
			);
        scrollTrack.scrollLeft = Math.max(0, (stepLerped.current - 0.75) * (384 + 32))
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
	}
</script>

<div class="my-16">
	<div class="mx-8 flex">
		<div>
			<canvas height={384 * 2} width={384} bind:this={mainCanvas}></canvas>
			<div><K math={step === 0 ? "f(x) = 0" : `${step - 1}\\text{${getOrdinalSuffix(step - 1)} degree Fourier Approximation}`} displayMode={true} /></div>
		</div>

		<div class="flex basis-[384px] flex-1 gap-8 ml-16 overflow-scroll" bind:this={scrollTrack}>
			{#each canvases as _, i}
				<div>
					<div class="grid *:col-start-1 *:row-start-1 grid-cols-1 grid-rows-1 w-[384px]">
						<canvas
							height={384 * 2}
							width={384}
							bind:this={canvases[i]}
                            style="opacity: {Math.max(0.15, ((stepLerped.current - i) / 1.5 + 0.7))}"
						></canvas>
						<div
							class="{Math.ceil(stepLerped.current) === i ? 'bg-yellow-100 opacity-20' : ''} transition-all"
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
