import { Result, Ok, Err } from '@ts-std/monads'

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Infinity
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NaN
// https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary

declare global {
	interface Math {
		// try_add(a: number, b: number): Result<number>,
		// try_sub(a: number, b: number): Result<number>,
		// try_mult(a: number, b: number): Result<number>,
		try_div(numerator: number, denominator: number): Result<number>,

		// try_exp(a: number, b: number): Result<number>,

		// round_places(n: number, places: number): number,
		// floor_places(n: number, places: number): number,
		// ceil_places(n: number, places: number): number,
		// validate_places(n: number, places: number): Result<number>,
	}
}


Math.try_div = function(numerator: number, denominator: number): Result<number> {
	return denominator !== 0
		? Ok(numerator / denominator)
		: Err('division by zero')
}

// function roundToTwo(num) {
// 	return +(Math.round(num + "e+2")  + "e-2");
// }

// Number.round_places = function(n: number, places: number): number {
// 	//
// }
// Number.floor_places = function(n: number, places: number): number {
// 	//
// }
// Number.ceil_places = function(n: number, places: number): number {
// 	//
// }
// Number.validate_places = function(n: number, places: number): Result<number> {
// 	const modulator = places
// }
