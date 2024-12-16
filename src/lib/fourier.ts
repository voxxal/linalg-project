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
