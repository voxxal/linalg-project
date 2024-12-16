export const PI = Math.PI;

export const numOnScreen =
	(
		canvas: HTMLCanvasElement,
		{ domain, range }: { domain: [number, number]; range: [number, number] }
	) =>
	(num: number) => [
		((num - domain[0]) / (domain[1] - domain[0])) * canvas.width,
		canvas.height - ((num - range[0]) / (range[1] - range[0])) * canvas.height
	];

export const graphSetup = (
	canvas: HTMLCanvasElement,
	{
		domain = [0, 2 * PI],
		range = [-2 * PI, 2 * PI],
		gridSize = (2 * PI) / 8
	}: { domain?: [number, number]; range?: [number, number]; gridSize?: number } = {}
) => {
	const ctx = canvas.getContext('2d')!!;
	ctx.fillStyle = '#fff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#aaa';
	const domainSize = domain[1] - domain[0];
	const rangeSize = range[1] - range[0];
	for (let x = domain[0]; x < domain[1]; x += gridSize) {
		const pos = ((x - domain[0]) / domainSize) * canvas.width;
		ctx.fillRect(pos, 0, 1, canvas.height);
	}

	for (let y = range[0]; y < range[1]; y += gridSize) {
		const pos = canvas.height - ((y - range[0]) / rangeSize) * canvas.height;
		ctx.fillRect(0, pos, canvas.width, 1);
	}
	ctx.fillStyle = '#000';
	const [zeroXLine, zeroYLine] = numOnScreen(canvas, { domain, range })(0);

	ctx.fillRect(zeroXLine, 0, 4, canvas.height);
	ctx.fillRect(0, zeroYLine - 2, canvas.width, 4);
};

export const drawFunction = (
	canvas: HTMLCanvasElement,
	fn: (t: number) => number,
	{
		domain = [0, 2 * PI],
		range = [-2 * PI, 2 * PI],
		percision = 0.03,
		color = '#3b82f6',
		width = 2
	}: {
		domain?: [number, number];
		range?: [number, number];
		percision?: number;
		color?: string;
		width?: number;
	} = {}
) => {
	const ctx = canvas.getContext('2d')!!;
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	ctx.beginPath();
	const coord = numOnScreen(canvas, { domain, range });
	ctx.moveTo(coord(domain[0])[0], coord(fn(domain[0]))[1]);
	for (let t = domain[0]; t < domain[1]; t += percision) {
		ctx.lineTo(coord(t)[0], coord(fn(t))[1]);
	}
	ctx.stroke();
};
