import 'mocha'
import { expect } from 'chai'

import * as json from './index'
import { tuple as t, assert_type as assert } from '@ts-std/types'
import { Result, Ok, Err, Maybe, Some, None } from '@ts-std/monads'

function validate<T>(decoder: json.Decoder<T>, ok_values: T[], err_values: any[]) {
	for (const value of ok_values)
		expect(decoder.decode(value)).eql(Ok(value))

	for (const value of err_values)
		expect(decoder.decode(value).is_err()).true
}


describe('cls', () => {
	it('works', () => {
		class A implements json.Decodable {
			constructor(readonly x: number, readonly y: string) {}
			static decoder = json.tuple(json.number, json.string)
			serialize() {
				return t(this.x, this.y)
			}
		}

		const pairs = [
			t(t(1, 'a'), new A(1, 'a')),
			t(t(0, ''), new A(0, '')),
			t(new A(1, 'a'), new A(1, 'a')),
			t(new A(0, ''), new A(0, '')),
		]

		const v: json.Decoder<A> = json.cls(A)

		for (const [ok_value, expected] of pairs)
			expect(v.decode(ok_value)).eql(Ok(expected))

		const err_values = [[], ['a'], {}, { a: 'a' }, true, 3, Some(true), Some([]), Some('a'), None, Some('')]
		for (const err_value of err_values)
			expect(v.decode(err_value).is_err()).true
	})
})

describe('adaptable', () => {
	it('works', () => {
		const a = json.adaptable(
			json.boolean,
			json.adaptor(json.number, n => !!n),
			json.try_adaptor(json.string, s => {
				if (s === 'true') return Ok(true)
				if (s === 'false') return Ok(false)
				return Err("")
			}),
		)

		assert.same<json.TypeOf<typeof a>, boolean>(true)

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
	})
})

describe('wrap', () => {
	it('works', () => {
		const d = json.wrap("'b' | 7", json => {
			const b = 'b' as const
			const seven = 7 as const
			return json === b || json === seven
				? Ok(json)
				: Err('blah')
		})

		assert.same<json.TypeOf<typeof d>, 'b' | 7>(true)

		validate<'b' | 7>(
			d,
			['b', 7],
			[null, undefined, [], ['a'], {}, { a: 'a' }, true, false, 'a', Infinity, NaN, -Infinity, -NaN],
		)
	})
})

describe('string', () => {
	it('works', () => {
		const d = json.string
		assert.same<json.TypeOf<typeof d>, string>(true)

		validate<string>(
			d,
			['', 'a', "long thing", `stuff: ${5}`],
			[null, undefined, [], ['a'], {}, { a: 'a' }, 5, true, false],
		)
	})
})

describe('boolean', () => {
	it('works', () => {
		const d = json.boolean
		assert.same<json.TypeOf<typeof d>, boolean>(true)

		validate<boolean>(
			d,
			[true, false],
			[null, undefined, [], ['a'], {}, { a: 'a' }, 5, 'a'],
		)
	})
})


describe('number', () => {
	it('works', () => {
		const d = json.number
		assert.same<json.TypeOf<typeof d>, number>(true)

		validate<number>(
			d,
			[5, -5, 5.5, -5.5],
			[null, undefined, [], ['a'], {}, { a: 'a' }, true, false, 'a', Infinity, NaN, -Infinity, -NaN],
		)
	})
})
describe('loose_number', () => {
	it('works', () => {
		validate<number>(
			json.loose_number,
			[5, -5, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
			[null, undefined, [], ['a'], {}, { a: 'a' }, true, false, 'a'],
		)
	})
})
describe('int', () => {
	it('works', () => {
		validate<number>(
			json.int,
			[-2, -1, 0, 1, 2],
			[null, undefined, [], ['a'], {}, { a: 'a' }, true, false, 'a', 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
		)
	})
})
describe('uint', () => {
	it('works', () => {
		validate<number>(
			json.uint,
			[0, 1, 2],
			[null, undefined, [], ['a'], {}, { a: 'a' }, true, false, 'a', -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
		)
	})
})


describe('union', () => {
	it('works', () => {
		const d = json.union(json.string, json.boolean, json.number)
		assert.same<json.TypeOf<typeof d>, string | boolean | number>(true)

		validate<string | boolean | number>(
			d,
			['a', '', false, true, -1, 0, 1],
			[null, undefined, [], ['a'], {}, { a: 'a' }],
		)

		validate<string | null | undefined>(
			json.union(json.string, json.null_value, json.undefined_value),
			['a', '', null, undefined],
			[[], ['a'], {}, { a: 'a' }, true, false, 0, 1, 2, -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
		)

		// const separated = json.union(json.string, json.null_value).decode
		// expect(separated('a')).eql(Ok('a'))
	})
})


describe('null_value', () => {
	it('works', () => {
		validate<null>(
			json.null_value,
			[null],
			[undefined, [], ['a'], {}, { a: 'a' }, true, false, 'a', 0, 1, 2, -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
		)
	})
})

describe('undefined_value', () => {
	it('works', () => {
		validate<undefined>(
			json.undefined_value,
			[undefined],
			[null, [], ['a'], {}, { a: 'a' }, true, false, 'a', 0, 1, 2, -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
		)
	})
})


describe('value', () => {
	it('works', () => {
		validate<'a'>(
			json.value('a'),
			['a'],
			[null, undefined, [], ['a'], {}, { a: 'a' }, true, 3, 'b'],
		)

		const a: Result<5> = json.value(5).decode(null)

		// const separated = json.value(4).decode
		// expect(separated(4)).eql(Ok(4))
	})
})

describe('values', () => {
	it('works', () => {
		validate<'a' | 5>(
			json.values('a', 5),
			[5, 'a'],
			[null, undefined, [], ['a'], {}, { a: 'a' }, true, 3, 'b'],
		)

		const a: Result<'a' | 5> = json.values('a', 5).decode(null)

		// const separated = json.values(4, 5).decode
		// expect(separated(4)).eql(Ok(4))
		// expect(separated(5)).eql(Ok(5))
	})
})

describe('optional', () => {
	it('works', () => {
		validate<string | undefined>(
			json.optional(json.string),
			['a', '', undefined],
			[null, [], ['a'], {}, { a: 'a' }, true, 3],
		)
	})
})

describe('nullable', () => {
	it('works', () => {
		validate<string | null>(
			json.nullable(json.string),
			['a', '', null],
			[undefined, [], ['a'], {}, { a: 'a' }, true, 3],
		)
	})
})

describe('nillable', () => {
	it('works', () => {
		validate<string | null | undefined>(
			json.nillable(json.string),
			['a', '', undefined, null],
			[[], ['a'], {}, { a: 'a' }, true, 3],
		)
	})
})

describe('maybe', () => {
	it('works', () => {
		const v = json.maybe(json.string)

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
	})
})


describe('array', () => {
	it('works', () => {
		validate<string[]>(
			json.array(json.string),
			[['a', ''], []],
			[null, undefined, [1], {}, { a: 'a' }, true, false, 'a', -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
		)

		validate<(string | number | null)[]>(
			json.array(json.union(json.string, json.number, json.null_value)),
			[[null, 'a', '', 5, -1, null], []],
			[null, undefined, [true], {}, { a: 'a' }, true, false, 'a', -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
		)

		// const separated = json.array(json.number).decode
		// expect(separated([4])).eql(Ok([4]))
	})
})

describe('dictionary', () => {
	it('works', () => {
		validate<{ [key: string]: number }>(
			json.dictionary(json.number),
			[{ a: 1, b: 5 }, {}],
			[null, undefined, [], ['a'], { a: 'a' }, true, false, 'a', 0, 1, 2, -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
		)

		validate<{ [key: string]: number | null }>(
			json.dictionary(json.union(json.number, json.null_value)),
			[{ a: 1, b: null, c: 5 }, {}],
			[null, undefined, [], ['a'], { a: 'a' }, true, false, 'a', 0, 1, 2, -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
		)

		// const separated = json.dictionary(json.number).decode
		// expect(separated({ a: 4 })).eql(Ok({ a: 4 }))
	})
})

describe('tuple', () => {
	it('works', () => {
		validate<[number, boolean, string]>(
			json.tuple(json.number, json.boolean, json.string),
			[[1, true, 'a'], [0, false, '']],
			[null, undefined, [false, 'a', 0], [], ['a'], { a: 'a' }, true, false, 'a', 0, 1, 2, -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
		)

		validate<[]>(
			json.tuple(),
			[[]],
			[null, undefined, [false, 'a', 0], ['a'], { a: 'a' }, true, false, 'a', 0, 1, 2, -2, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
		)

		validate<[number | string, boolean]>(
			json.tuple(json.union(json.number, json.string), json.boolean),
			[[1, true], ['a', false]],
			[null, undefined, [], [false, 'a', 0], ['a'], { a: 'a' }, true, 'a', 0, 1, -1, 5.5, -5.5, Infinity, NaN, -Infinity, -NaN],
		)

		// const separated = json.tuple(json.number, json.boolean).decode
		// expect(separated([1, true])).eql(Ok([1, true]))
	})
})

describe('object', () => {
	it('works', () => {
		validate<{ a: string, b: boolean, c: number | null }>(
			json.object('thing', {
				a: json.string,
				b: json.boolean,
				c: json.union(json.number, json.null_value),
			}),
			[{ a: 'a', b: true, c: 5 }, { a: 'a', b: true, c: null }],
			[null, undefined, [], ['a'], { a: 'a', b: 0, c: 4 }, { a: 'a', b: true, c: 4, d: 'a' }, true, 'a', 2, -2, 5.5, -5.5, Infinity, NaN],
		)

		// const separated = json.object('separated', { a: json.number }).decode
		// expect(separated({ a: 1 })).eql(Ok({ a: 1 }))
	})
})

describe('loose_object', () => {
	it('works', () => {
		validate(
			json.loose_object('thing', {
				a: json.string,
				b: json.boolean,
				c: json.union(json.number, json.null_value),
			}),
			[
				{ a: 'a', b: true, c: 5 },
				{ a: 'a', b: true, c: null },
				{ a: 'a', b: true, c: 4, d: 'a' } as any as { a: string, b: boolean, c: number | null },
			],
			[null, undefined, [], ['a'], { a: 'a', b: 0, c: 4 }, { a: 'a', b: true, d: 'a' }, true, 'a', 2, -2, 5.5, -5.5, Infinity, NaN],
		)

		// const separated = json.object('separated', { a: json.number }).decode
		// expect(separated({ a: 1 })).eql(Ok({ a: 1 }))
	})
})
