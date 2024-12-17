import { PI } from './graph';

// Fouriers should always have i == 0 as 0, i == 1 as the constant and so on...
export const nthOrderFF =
	(fn: (i: number) => (t: number) => number) => (i: number) => (t: number) => {
		let sum = 0;
		for (let j = 0; j <= i; j++) {
			sum += fn(j)(t);
		}

		if (i % 1 !== 0) {
			sum += fn(Math.ceil(i))(t) * (i - Math.trunc(i));
		}
		return sum;
	};

export const ft_eq_t = (i: number) => (t: number) =>
	i === 0 ? 0 : i === 1 ? PI : -(2 / (i - 1)) * Math.sin((i - 1) * t);
export const ft_eq_t_2 = (i: number) => (t: number) =>
	i === 0
		? 0
		: i === 1
			? (4 * PI ** 2) / 3
			: (4 / (i - 1) ** 2) * Math.cos((i - 1) * t) - ((4 * PI) / (i - 1)) * Math.sin((i - 1) * t);

export const ft_eq_square = (i: number) => (t: number) =>
	i <= 1
		? 0
		: (2 / (PI * (i - 1)) +
				(2 * Math.cos(PI * (i - 1))) / (PI * (i - 1)) -
				(4 * Math.cos((PI * (i - 1)) / 2)) / (PI * (i - 1))) *
			Math.sin((i - 1) * t);
