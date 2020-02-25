import 'mocha'
import { expect } from 'chai'

import * as c from './index'
import { tuple as t, assert_type as assert } from '@ts-std/types'
import { Result, Ok, Err, Maybe, Some, None } from '@ts-std/monads'

function validate<T>(decoder: c.Decoder<T>, ok_values: T[], err_values: any[]) {
	for (const value of ok_values)
		expect(decoder.decode(value)).eql(Ok(value))

	for (const value of err_values)
		expect(decoder.decode(value).is_err()).true
}


describe('cls', () => it('works', () => {
	class A implements c.Codec {
		constructor(readonly x: number, readonly y: string) {}
		static decode = c.tuple(c.number, c.string)
		encode() {
			return t(this.x, this.y)
		}
		static decoder: c.Decoder<A> = c.cls(A)
	}

	const pairs = [
		t(t(1, 'a'), new A(1, 'a')),
		t(t(0, ''), new A(0, '')),
		t(new A(1, 'a'), new A(1, 'a')),
		t(new A(0, ''), new A(0, '')),
	]

	for (const [ok_value, expected] of pairs)
		expect(A.decoder.decode(ok_value)).eql(Ok(expected))

	const err_values = [[], ['a'], {}, { a: 'a' }, true, 3, Some(true), Some([]), Some('a'), None, Some('')]
	for (const err_value of err_values)
		expect(A.decoder.decode(err_value).is_err()).true
}))

describe('adapt', () => it('works', () => {
	const a = c.adapt(
		c.boolean,
		c.adaptor(c.number, n => !!n),
		c.try_adaptor(c.string, s => {
			if (s === 'true') return Ok(true)
			if (s === 'false') return Ok(false)
			return Err("")
		}),
	)

	assert.same<c.TypeOf<typeof a>, boolean>(true)

	const pairs = [
		t(true, true),
		t(false, false),
		t(1, true),
		t(0, false),
		t('true', true),
		t('false', false),
	]

	for (const [ok_value, expected] of pairs)
		expect(a.decode(ok_value)).eql(Ok(expected))

	const err_values = [[], 'a', 'tru', ['a'], {}, { a: 'a' }, Some(true), Some([]), Some('a'), None, Some('')]
	for (const err_value of err_values)
		expect(a.decode(err_value).is_err()).true
}))

describe('wrap', () => it('works', () => {
	const d = c.wrap("'b' | 7", c => {
		const b = 'b' as const
		const seven = 7 as const
		return c === b || c === seven
			? Ok(c)
			: Err('blah')
	})

	assert.same<c.TypeOf<typeof d>, 'b' | 7>(true)

	validate<'b' | 7>(
		d,
		['b', 7],
		[null, undefined, [], ['a'], {}, { a: 'a' }, true, false, 'a', Infinity, NaN, -Infinity, -NaN],
	)
}))

describe('string', () => it('works', () => {
	const d = c.string
	assert.same<c.TypeOf<typeof d>, string>(true)

	validate<string>(
		d,
		['', 'a', "long thing", `stuff: ${5}`],
		[null, undefined, [], ['a'], {}, { a: 'a' }, 5, true, false],
	)
}))

describe('boolean', () => it('works', () => {
	const d = c.boolean
	assert.same<c.TypeOf<typeof d>, boolean>(true)

	validate<boolean>(
		d,
		[true, false],
		[null, undefined, [], ['a'], {}, { a: 'a' }, 5, 'a'],
	)
}))


describe('number', () => it('works', () => {
	const d = c.number
	assert.same<c.TypeOf<typeof d>, number>(true)

	validate<number>(
		d,
		[5, -5, 5.5, -5.5],
		[null, undefined, [], ['a'], {}, { a: 'a' }, true, false, 'a', Infinity, NaN, -Infinity, -NaN],
	)
}))
describe('loose_number', () => it('works', () => {
	validate<number>(
		c.loose_number,
		[5, -5, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
		[null, undefined, [], ['a'], {}, { a: 'a' }, true, false, 'a'],
	)
}))
describe('int', () => it('works', () => {
	validate<number>(
		c.int,
		[-2, -1, 0, 1, 2],
		[null, undefined, [], ['a'], {}, { a: 'a' }, true, false, 'a', 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
	)
}))
describe('uint', () => it('works', () => {
	validate<number>(
		c.uint,
		[0, 1, 2],
		[null, undefined, [], ['a'], {}, { a: 'a' }, true, false, 'a', -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
	)
}))


describe('recursive', () => it('works', () => {
	type Category = {
	  name: string,
	  categories: Category[],
	}

	const Category: c.Decoder<Category> = c.object('Category', { name: c.string, categories: c.array(c.recursive(() => Category)) })
	assert.same<c.TypeOf<typeof Category>, Category>(true)

	validate<Category>(
		Category,
		[{ name: 'a', categories: [] }, { name: 'b', categories: [{ name: 'b', categories: [] }] }],
		[null, undefined, [], 'a', true, 1, { name: 1, categories: [] }],
	)
}))


describe('union', () => it('works', () => {
	const d = c.union(c.string, c.boolean, c.number)
	assert.same<c.TypeOf<typeof d>, string | boolean | number>(true)

	validate<string | boolean | number>(
		d,
		['a', '', false, true, -1, 0, 1],
		[null, undefined, [], ['a'], {}, { a: 'a' }],
	)

	validate<string | null | undefined>(
		c.union(c.string, c.null_literal, c.undefined_literal),
		['a', '', null, undefined],
		[[], ['a'], {}, { a: 'a' }, true, false, 0, 1, 2, -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
	)

	// const separated = c.union(c.string, c.null_literal).decode
	// expect(separated('a')).eql(Ok('a'))
}))


// describe('intersection', () => {
// 	it('works', () => {
// 		const d = c.intersection(
// 			c.object('a', { a: c.number }),
// 			c.object('b', { b: c.string }),
// 		)
// 		assert.same<c.TypeOf<typeof d>, { a: number, b: string }>(true)

// 		validate<{ a: number, b: string }>(
// 			d,
// 			[{ a: 1, b: 'a' }],
// 			[{ a: 1, b: 4 }, { a: 'a', b: 'a' }, { b: 'a' }, { a: 1 }, null, undefined, [], ['a'], {}, true, false, 'a', -2]
// 		)

// 		const n = c.intersection(
// 			d,
// 			c.object('c', { c: c.boolean }),
// 			c.loose_object('d', { d: c.union(c.number, c.string) }),
// 		)
// 		assert.same<c.TypeOf<typeof n>, { a: number, b: string, c: boolean, d: number | string }>(true)

// 		validate<{ a: number, b: string, c: boolean, d: number | string }>(
// 			n,
// 			[{ a: 1, b: 'a', c: true, d: 1 }, { a: 1, b: 'a', c: true, d: 'a' }],
// 			[{ a: 1, b: 'a', c: false, d: true }, { a: 'a', b: 'a' }, { b: 'a' }, { a: 1 }, null, undefined, [], ['a'], {}, true, false, 'a', -2]
// 		)
// 	})
// })

describe('null_literal', () => it('works', () => {
	validate<null>(
		c.null_literal,
		[null],
		[undefined, [], ['a'], {}, { a: 'a' }, true, false, 'a', 0, 1, 2, -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
	)
}))

describe('undefined_literal', () => it('works', () => {
	validate<undefined>(
		c.undefined_literal,
		[undefined],
		[null, [], ['a'], {}, { a: 'a' }, true, false, 'a', 0, 1, 2, -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
	)
}))


describe('literal', () => it('works', () => {
	validate<'a'>(
		c.literal('a'),
		['a'],
		[null, undefined, [], ['a'], {}, { a: 'a' }, true, 3, 'b'],
	)

	const a: Result<5> = c.literal(5).decode(null)

	// const separated = c.literal(4).decode
	// expect(separated(4)).eql(Ok(4))
}))

describe('literals', () => it('works', () => {
	validate<'a' | 5>(
		c.literals('a', 5),
		[5, 'a'],
		[null, undefined, [], ['a'], {}, { a: 'a' }, true, 3, 'b'],
	)

	const a: Result<'a' | 5> = c.literals('a', 5).decode(null)

	// const separated = c.literals(4, 5).decode
	// expect(separated(4)).eql(Ok(4))
	// expect(separated(5)).eql(Ok(5))
}))

describe('optional', () => it('works', () => {
	validate<string | undefined>(
		c.optional(c.string),
		['a', '', undefined],
		[null, [], ['a'], {}, { a: 'a' }, true, 3],
	)
}))

describe('nullable', () => it('works', () => {
	validate<string | null>(
		c.nullable(c.string),
		['a', '', null],
		[undefined, [], ['a'], {}, { a: 'a' }, true, 3],
	)
}))

describe('nillable', () => it('works', () => {
	validate<string | null | undefined>(
		c.nillable(c.string),
		['a', '', undefined, null],
		[[], ['a'], {}, { a: 'a' }, true, 3],
	)
}))

describe('maybe', () => it('works', () => {
	const v = c.maybe(c.string)

	const pairs = [
		t('a', Some('a')),
		t('', Some('')),
		t(undefined, None),
		t(null, None),
	]

	for (const [ok_value, expected] of pairs)
		expect(v.decode(ok_value)).eql(Ok(expected))

	const err_values = [[], ['a'], {}, { a: 'a' }, true, 3, Some(true), Some([]), Some('a'), None, Some('')]
	for (const err_value of err_values)
		expect(v.decode(err_value).is_err()).true
}))


describe('array', () => it('works', () => {
	validate<string[]>(
		c.array(c.string),
		[['a', ''], []],
		[null, undefined, [1], {}, { a: 'a' }, true, false, 'a', -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
	)

	validate<(string | number | null)[]>(
		c.array(c.union(c.string, c.number, c.null_literal)),
		[[null, 'a', '', 5, -1, null], []],
		[null, undefined, [true], {}, { a: 'a' }, true, false, 'a', -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
	)

	// const separated = c.array(c.number).decode
	// expect(separated([4])).eql(Ok([4]))
}))

describe('dictionary', () => it('works', () => {
	validate<{ [key: string]: number }>(
		c.dictionary(c.number),
		[{ a: 1, b: 5 }, {}],
		[null, undefined, [], ['a'], { a: 'a' }, true, false, 'a', 0, 1, 2, -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
	)

	validate<{ [key: string]: number | null }>(
		c.dictionary(c.union(c.number, c.null_literal)),
		[{ a: 1, b: null, c: 5 }, {}],
		[null, undefined, [], ['a'], { a: 'a' }, true, false, 'a', 0, 1, 2, -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
	)

	// const separated = c.dictionary(c.number).decode
	// expect(separated({ a: 4 })).eql(Ok({ a: 4 }))
}))

describe('tuple', () => it('works', () => {
	validate<[number, boolean, string]>(
		c.tuple(c.number, c.boolean, c.string),
		[[1, true, 'a'], [0, false, '']],
		[null, undefined, [false, 'a', 0], [], ['a'], { a: 'a' }, true, false, 'a', 0, 1, 2, -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
	)

	validate<[]>(
		c.tuple(),
		[[]],
		[null, undefined, [false, 'a', 0], ['a'], { a: 'a' }, true, false, 'a', 0, 1, 2, -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
	)

	validate<[number | string, boolean]>(
		c.tuple(c.union(c.number, c.string), c.boolean),
		[[1, true], ['a', false]],
		[null, undefined, [], [false, 'a', 0], ['a'], { a: 'a' }, true, 'a', 0, 1, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
	)

	// const separated = c.tuple(c.number, c.boolean).decode
	// expect(separated([1, true])).eql(Ok([1, true]))
}))

describe('object', () => it('works', () => {
	validate<{ a: string, b: boolean, c: number | null }>(
		c.object('thing', {
			a: c.string,
			b: c.boolean,
			c: c.union(c.number, c.null_literal),
		}),
		[{ a: 'a', b: true, c: 5 }, { a: 'a', b: true, c: null }],
		[{}, null, undefined, [], ['a'], { a: 'a', b: 0, c: 4 }, { a: 'a', b: true, c: 4, d: 'a' }, true, 'a', 2, 5.5, -5.5, Infinity, NaN],
	)

	const anon = c.object({
		a: c.string,
		b: c.boolean,
		c: c.union(c.number, c.null_literal),
	})
	validate<{ a: string, b: boolean, c: number | null }>(
		anon,
		[{ a: 'a', b: true, c: 5 }, { a: 'a', b: true, c: null }],
		[{}, null, undefined, [], ['a'], { a: 'a', b: 0, c: 4 }, { a: 'a', b: true, c: 4, d: 'a' }, true, 'a', 2, 5.5, -5.5, Infinity, NaN],
	)

	expect(anon.name).equal('{ a: string, b: boolean, c: number | null }')

	// const separated = c.object('separated', { a: c.number }).decode
	// expect(separated({ a: 1 })).eql(Ok({ a: 1 }))
}))

describe('loose_object', () => it('works', () => {
	validate(
		c.loose_object('thing', {
			a: c.string,
			b: c.boolean,
			c: c.union(c.number, c.null_literal),
		}),
		[
			{ a: 'a', b: true, c: 5 },
			{ a: 'a', b: true, c: null },
			{ a: 'a', b: true, c: 4, d: 'a' } as any as { a: string, b: boolean, c: number | null },
		],
		[{}, null, undefined, [], ['a'], { a: 'a', b: 0, c: 4 }, { a: 'a', b: true, d: 'a' }, true, 'a', 2, -2, 5.5, -5.5, Infinity, NaN],
	)

	validate(
		c.loose_object({
			a: c.string,
			b: c.boolean,
			c: c.union(c.number, c.null_literal),
		}),
		[
			{ a: 'a', b: true, c: 5 },
			{ a: 'a', b: true, c: null },
			{ a: 'a', b: true, c: 4, d: 'a' } as any as { a: string, b: boolean, c: number | null },
		],
		[{}, null, undefined, [], ['a'], { a: 'a', b: 0, c: 4 }, { a: 'a', b: true, d: 'a' }, true, 'a', 2, -2, 5.5, -5.5, Infinity, NaN],
	)

	// const separated = c.object('separated', { a: c.number }).decode
	// expect(separated({ a: 1 })).eql(Ok({ a: 1 }))
}))
