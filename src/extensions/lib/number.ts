import { Result, Ok, Err } from '@ts-std/monads'

declare global {
	interface NumberConstructor {
		try_clean(n: number): Result<number>,
		clamp_range(n: number, lower?: number, upper?: number): number,
		validate_range(n: number, lower?: number, upper?: number): Result<number, ['lower' | 'upper', number]>,
		validate_range_exclusive(n: number, lower?: number, upper?: number): Result<number, ['lower' | 'upper', number]>,
		validate_range_lower_exclusive(n: number, lower?: number, upper?: number): Result<number, ['lower' | 'upper', number]>,
		validate_range_upper_exclusive(n: number, lower?: number, upper?: number): Result<number, ['lower' | 'upper', number]>,

		try_parse_int(s: string): Result<number>,
		try_parse_uint(s: string): Result<number>,
		try_parse_float(s: string): Result<number>,
		try_parse_float_places(s: string, places: number): Result<number, string | [string, number]>,

		try_lenient_parse_int(s: string): Result<number>,
		try_lenient_parse_uint(s: string): Result<number>,
		try_lenient_parse_float(s: string): Result<number>,
	}
}

Number.try_clean = function(n: number): Result<number, 'NaN' | '-Infinity' | 'Infinity'> {
	if (isNaN(n)) return Err('NaN')
	if (n === Infinity) return Err('Infinity')
	if (n === -Infinity) return Err('-Infinity')
	return Ok(n)
}

Number.clamp_range = function(n: number, lower = -Infinity, upper = Infinity): number {
	return Math.min(Math.max(n, lower), upper)
}
Number.validate_range = function(n: number, lower = -Infinity, upper = Infinity): Result<number, ['lower' | 'upper', number]> {
	if (n < lower) return Err(['lower', n])
	if (n > upper) return Err(['upper', n])
	return Ok(n)
}
Number.validate_range_exclusive = function(n: number, lower = -Infinity, upper = Infinity): Result<number, ['lower' | 'upper', number]> {
	if (n <= lower) return Err(['lower', n])
	if (n >= upper) return Err(['upper', n])
	return Ok(n)
}
Number.validate_range_lower_exclusive = function(n: number, lower = -Infinity, upper = Infinity): Result<number, ['lower' | 'upper', number]> {
	if (n <= lower) return Err(['lower', n])
	if (n > upper) return Err(['upper', n])
	return Ok(n)
}
Number.validate_range_upper_exclusive = function(n: number, lower = -Infinity, upper = Infinity): Result<number, ['lower' | 'upper', number]> {
	if (n < lower) return Err(['lower', n])
	if (n >= upper) return Err(['upper', n])
	return Ok(n)
}


const int_regex = /^-?\d+$/
const uint_regex = /^\d+$/
const float_regex = /^\-?(?:\d+(?:\.\d*)?|\d*\.\d+)$/
Number.try_parse_int = function(s: string): Result<number> {
	return int_regex.test(s)
		? Ok(parseInt(s))
		: Err(s)
}
Number.try_parse_uint = function(s: string): Result<number> {
	return uint_regex.test(s)
		? Ok(parseInt(s))
		: Err(s)
}
Number.try_parse_float = function(s: string): Result<number> {
	return float_regex.test(s)
		? Ok(parseFloat(s))
		: Err(s)
}
Number.try_parse_float_places = function(s: string, places: number): Result<number, string | [string, number]> {
	if (!float_regex.test(s)) return Err(s)

	const [, fractional_portion = ''] = s.split('.')
	return fractional_portion.length <= places
		? Ok(parseFloat(s))
		: Err([s, places])
}

Number.try_lenient_parse_int = function(s: string): Result<number> {
	const parsed = parseInt(s)
	return !isNaN(parsed)
		? Ok(parsed)
		: Err(s)
}
Number.try_lenient_parse_uint = function(s: string): Result<number> {
	const int_parsed = Number.try_lenient_parse_int(s)
	if (int_parsed.is_err())
		return int_parsed
	return int_parsed.value >= 0
		? Ok(int_parsed.value)
		: Err(s)
}
Number.try_lenient_parse_float = function(s: string): Result<number> {
	const parsed = parseFloat(s)
	return !isNaN(parsed)
		? Ok(parsed)
		: Err(s)
}
