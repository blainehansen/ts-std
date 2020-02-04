import 'mocha'
import './array'
import './number'
import { expect } from 'chai'

import { tuple as t } from '@ts-std/types'
import { Result } from '@ts-std/monads'

function valid(n: number) {
	expect(isNaN(n)).false
	expect(isFinite(n)).true
}

describe('try_clean', () => it('works', () => {
	valid(Number.try_clean(0).unwrap())
	valid(Number.try_clean(1).unwrap())
	valid(Number.try_clean(-1).unwrap())
	valid(Number.try_clean(1.01).unwrap())
	valid(Number.try_clean(-1.01).unwrap())

	expect(Number.try_clean(NaN).unwrap_err()).equal('NaN')
	expect(Number.try_clean(Infinity).unwrap_err()).equal('Infinity')
	expect(Number.try_clean(-Infinity).unwrap_err()).equal('-Infinity')
}))

describe('clamp_range', () => it('works', () => {
	expect(Number.clamp_range(0)).equal(0)

	expect(Number.clamp_range(0, 1)).equal(1)
	expect(Number.clamp_range(0, -1)).equal(0)

	expect(Number.clamp_range(0, undefined, -1)).equal(-1)
	expect(Number.clamp_range(0, undefined, 1)).equal(0)

	expect(Number.clamp_range(0, -1, 1)).equal(0)
	expect(Number.clamp_range(0, 1, 2)).equal(1)
	expect(Number.clamp_range(0, -2, -1)).equal(-1)
}))

describe('validate_range', () => it('works', () => {
	expect(Number.validate_range(0).unwrap()).equal(0)

	expect(Number.validate_range(0, 1).unwrap_err()).eql(['lower', 0])
	expect(Number.validate_range(0, -1).unwrap()).equal(0)

	expect(Number.validate_range(0, undefined, -1).unwrap_err()).eql(['upper', 0])
	expect(Number.validate_range(0, undefined, 1).unwrap()).equal(0)

	expect(Number.validate_range(0, -1, 1).unwrap()).equal(0)
	expect(Number.validate_range(0, 1, 2).unwrap_err()).eql(['lower', 0])
	expect(Number.validate_range(0, -2, -1).unwrap_err()).eql(['upper', 0])
}))

describe('validate_range_exclusive', () => it('works', () => {
	expect(Number.validate_range_exclusive(0).unwrap()).equal(0)

	expect(Number.validate_range_exclusive(0, 1).unwrap_err()).eql(['lower', 0])
	expect(Number.validate_range_exclusive(0, -1).unwrap()).equal(0)

	expect(Number.validate_range_exclusive(0, undefined, -1).unwrap_err()).eql(['upper', 0])
	expect(Number.validate_range_exclusive(0, undefined, 1).unwrap()).equal(0)

	expect(Number.validate_range_exclusive(0, -1, 1).unwrap()).equal(0)
	expect(Number.validate_range_exclusive(0, 1, 2).unwrap_err()).eql(['lower', 0])
	expect(Number.validate_range_exclusive(0, -2, -1).unwrap_err()).eql(['upper', 0])

	expect(Number.validate_range_exclusive(0, 0).unwrap_err()).eql(['lower', 0])
	expect(Number.validate_range_exclusive(0, undefined, 0).unwrap_err()).eql(['upper', 0])
}))

describe('validate_range_lower_exclusive', () => it('works', () => {
	expect(Number.validate_range_lower_exclusive(0).unwrap()).equal(0)

	expect(Number.validate_range_lower_exclusive(0, 1).unwrap_err()).eql(['lower', 0])
	expect(Number.validate_range_lower_exclusive(0, -1).unwrap()).equal(0)

	expect(Number.validate_range_lower_exclusive(0, undefined, -1).unwrap_err()).eql(['upper', 0])
	expect(Number.validate_range_lower_exclusive(0, undefined, 1).unwrap()).equal(0)

	expect(Number.validate_range_lower_exclusive(0, -1, 1).unwrap()).equal(0)
	expect(Number.validate_range_lower_exclusive(0, 1, 2).unwrap_err()).eql(['lower', 0])
	expect(Number.validate_range_lower_exclusive(0, -2, -1).unwrap_err()).eql(['upper', 0])

	expect(Number.validate_range_lower_exclusive(0, 0).unwrap_err()).eql(['lower', 0])
	expect(Number.validate_range_lower_exclusive(0, undefined, 0).unwrap()).equal(0)
}))

describe('validate_range_upper_exclusive', () => it('works', () => {
	expect(Number.validate_range_upper_exclusive(0).unwrap()).equal(0)

	expect(Number.validate_range_upper_exclusive(0, 1).unwrap_err()).eql(['lower', 0])
	expect(Number.validate_range_upper_exclusive(0, -1).unwrap()).equal(0)

	expect(Number.validate_range_upper_exclusive(0, undefined, -1).unwrap_err()).eql(['upper', 0])
	expect(Number.validate_range_upper_exclusive(0, undefined, 1).unwrap()).equal(0)

	expect(Number.validate_range_upper_exclusive(0, -1, 1).unwrap()).equal(0)
	expect(Number.validate_range_upper_exclusive(0, 1, 2).unwrap_err()).eql(['lower', 0])
	expect(Number.validate_range_upper_exclusive(0, -2, -1).unwrap_err()).eql(['upper', 0])

	expect(Number.validate_range_upper_exclusive(0, 0).unwrap()).equal(0)
	expect(Number.validate_range_exclusive(0, undefined, 0).unwrap_err()).eql(['upper', 0])
}))


const nevers = ['a', '', '%^']
const uints = ['0', '1', '34545']
const ints = uints.map(n => `-${n}`)
const floats = uints
	.flat_map(n => [`.${n}`, `${n}.`])
	.flat_map(n => [`0${n}`, `${n}0`, `${n}01`, n])
	.flat_map(n => [`-${n}`, n])

const [lenient_int_safe_floats, lenient_int_unsafe_floats] = floats.split_by(s => !['-', ''].includes(s.split('.')[0]))

const [lenient_uint_safe_ints, lenient_uint_unsafe_ints] = ints.split_by(s => s === '-0' || !s.startsWith('-'))
const [lenient_uint_safe_floats, lenient_uint_unsafe_floats] = floats.split_by(s => {
	const n = parseInt(s)
	return !isNaN(n) && n >= 0
})


function validate(fn: (s: string) => Result<unknown, unknown>, good: string[], bad: string[]) {
	for (const g of good)
		fn(g).unwrap()
	for (const b of bad)
		fn(b).unwrap_err()
}

describe('try_parse_int', () => it('works', () => {
	validate(Number.try_parse_int, [...uints, ...ints], [...floats, ...nevers])
}))

describe('try_parse_uint', () => it('works', () => {
	validate(Number.try_parse_uint, uints, [...ints, ...floats, ...nevers])
}))

describe('try_parse_float', () => it('works', () => {
	validate(Number.try_parse_float, [...uints, ...ints, ...floats], nevers)
}))

describe('try_parse_float_places', () => it('works', () => {
	expect(Number.try_parse_float_places('0', 0).unwrap()).equal(0)
	expect(Number.try_parse_float_places('0.', 0).unwrap()).equal(0)

	expect(Number.try_parse_float_places('0', 1).unwrap()).equal(0)
	expect(Number.try_parse_float_places('0.', 1).unwrap()).equal(0)
	expect(Number.try_parse_float_places('.0', 1).unwrap()).equal(0)
	expect(Number.try_parse_float_places('.1', 1).unwrap()).equal(0.1)
	expect(Number.try_parse_float_places('-.1', 1).unwrap()).equal(-0.1)

	expect(Number.try_parse_float_places('0', 2).unwrap()).equal(0)
	expect(Number.try_parse_float_places('0.', 2).unwrap()).equal(0)
	expect(Number.try_parse_float_places('.0', 2).unwrap()).equal(0)
	expect(Number.try_parse_float_places('.1', 2).unwrap()).equal(0.1)
	expect(Number.try_parse_float_places('.12', 2).unwrap()).equal(0.12)

	expect(Number.try_parse_float_places('.0', 0).unwrap_err()).eql(['.0', 0])
	expect(Number.try_parse_float_places('.1', 0).unwrap_err()).eql(['.1', 0])
	expect(Number.try_parse_float_places('-.1', 0).unwrap_err()).eql(['-.1', 0])

	expect(Number.try_parse_float_places('.01', 1).unwrap_err()).eql(['.01', 1])
	expect(Number.try_parse_float_places('.10', 1).unwrap_err()).eql(['.10', 1])
	expect(Number.try_parse_float_places('-.12', 1).unwrap_err()).eql(['-.12', 1])

	validate((s: string) => Number.try_parse_float_places(s, 7), [...uints, ...ints, ...floats], nevers)
}))

describe('try_lenient_parse_int', () => it('works', () => {
	validate(
		Number.try_lenient_parse_int,
		[...uints, ...ints, ...lenient_int_safe_floats],
		[...lenient_int_unsafe_floats, ...nevers],
	)
}))

describe('try_lenient_parse_uint', () => it('works', () => {
	validate(
		Number.try_lenient_parse_uint,
		[...uints, ...lenient_uint_safe_ints, ...lenient_uint_safe_floats],
		[...lenient_uint_unsafe_ints, ...lenient_uint_unsafe_floats, ...nevers],
	)
}))

describe('try_lenient_parse_float', () => it('works', () => {
	validate(
		Number.try_lenient_parse_float,
		[...uints, ...ints, ...floats],
		nevers,
	)
}))

