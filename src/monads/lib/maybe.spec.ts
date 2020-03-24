import 'mocha'
import { expect } from 'chai'

import { Panic } from './common'
import { Maybe, Some, None, MaybeTuple, MaybeJoin } from './maybe'

const im = "type invariant broken!"
const pm = "actually should happen"

describe('Maybe basic api', () => {
	const cases: Maybe<number>[] = [Some(1), None]
	for (const r of cases) {
		const is_some = r.is_some()
		if (r.is_some()) {
			const s: number = r.value
		}
		const message = is_some ? 'Some' : 'None'
		const changed: Maybe<string> = r.change(n => `n is: ${n}`)
		const or_some = r.or(Some(2))
		const or_none = r.or(None)
		const or_some_fn = r.or(() => Some(2))
		const or_none_fn = r.or(() => None)

		const and_some = r.and(Some(2))
		const and_none = r.and(None)
		const and_some_fn = r.and(() => Some(2))
		const and_none_fn = r.and(() => None)

		const xor_some = r.xor(Some(2))
		const xor_none = r.xor(None)
		const xor_some_fn = r.xor(() => Some(2))
		const xor_none_fn = r.xor(() => None)

		const try_change_some: Maybe<boolean> = r.try_change(n => n === 1 ? Some(true) : None)
		const try_change_none: Maybe<string> = r.try_change(n => n === 2 ? Some('two') : None)
		const to_undef = r.to_undef()
		const to_null = r.to_null()
		const to_result = r.to_result('to_result')

		const defaulted = r.default(2)
		const defaulted_fn = r.default(() => 2)

		it(message, () => {
			if (is_some) {
				expect(r.unwrap()).equal(1)
				expect(r.expect(im)).equal(1)
				expect(r.is_none()).false
				expect(changed.expect(im)).equal(`n is: 1`)

				expect(or_some.expect(im)).equal(1)
				expect(or_some_fn.expect(im)).equal(1)
				expect(or_none.expect(im)).equal(1)
				expect(or_none_fn.expect(im)).equal(1)
				expect(and_some.expect(im)).equal(2)
				expect(and_some_fn.expect(im)).equal(2)
				expect(and_none.is_none()).true
				expect(and_none_fn.is_none()).true
				expect(xor_some.is_none()).true
				expect(xor_some_fn.is_none()).true
				expect(xor_none.expect(im)).equal(1)
				expect(xor_none_fn.expect(im)).equal(1)

				expect(try_change_some.expect(im)).equal(true)
				expect(try_change_none.is_none()).true
				expect(to_undef).equal(1)
				expect(to_null).equal(1)
				expect(to_result.is_ok()).true
				expect(to_result.expect(im)).eql(1)
				expect(defaulted).equal(1)
				expect(defaulted_fn).equal(1)
				r.match({
					some: n => {},
					none: () => { expect.fail("matched none on a some") },
				})

				const correct = r.match({
					some: true,
					none: false,
				})
				expect(correct).true
			}
			else {
				expect(() => r.unwrap()).throw(Panic)
				expect(() => r.expect(pm)).throw(Panic, pm)
				expect(r.is_none()).true
				expect(changed.is_none()).true

				expect(or_some.expect(im)).equal(2)
				expect(or_some_fn.expect(im)).equal(2)
				expect(or_none.is_none()).true
				expect(or_none_fn.is_none()).true
				expect(and_some.is_none()).true
				expect(and_some_fn.is_none()).true
				expect(and_none.is_none()).true
				expect(and_none_fn.is_none()).true
				expect(xor_some.expect(im)).equal(2)
				expect(xor_some_fn.expect(im)).equal(2)
				expect(xor_none.is_none()).true
				expect(xor_none_fn.is_none()).true

				expect(try_change_some.is_none()).true
				expect(try_change_none.is_none()).true
				expect(to_undef).undefined
				expect(to_null).null
				expect(to_result.is_err()).true
				expect(defaulted).equal(2)
				expect(defaulted_fn).equal(2)

				r.match({
					some: _ => { expect.fail("matched some on a none") },
					none: () => {},
				})

				const correct = r.match({
					some: false,
					none: true,
				})
				expect(correct).true
			}
		})
	}

	it('from_nillable', () => {
		const null_none = Maybe.from_nillable(null)
		const undefined_none = Maybe.from_nillable(undefined)
		expect(null_none.is_none()).true
		expect(undefined_none.is_none()).true

		const some_null: number = Maybe.from_nillable(1 as number | null).expect(im)
		expect(some_null).equal(1)

		const some_undefined: number = Maybe.from_nillable(1 as number | undefined).expect(im)
		expect(some_undefined).equal(1)

		const some_both: number = Maybe.from_nillable(1 as number | null | undefined).expect(im)
		expect(some_both).equal(1)
	})

	it('attempt', () => {
		const none = Maybe.attempt(() => { throw new Error('bad'); return 1 })
		expect(() => none.expect(pm)).throw(Panic, pm)

		const some = Maybe.attempt(() => 1).expect(im)
		expect(some).equal(1)

		const extra = Maybe.attempt((arg = 1) => arg === 1).expect(im)
		expect(extra).true
	})

	it('join_object', () => {
		const m: Maybe<{ a: number, b: string }> = Maybe.join_object({
			a: Some(1), b: Some('b')
		})

		expect(m).eql(Some({ a: 1, b: 'b' }))

		expect(Maybe.join_object({
			a: None,
			b: Some('b'),
		})).eql(None)

		expect(Maybe.join_object({
			a: Some(1),
			b: None,
		})).eql(None)

		expect(Maybe.join_object({
			a: None,
			b: None,
		})).eql(None)
	})

	it('is_maybe', () => {
		expect(Maybe.is_maybe(Some(1))).true
		expect(Maybe.is_maybe(Some('a'))).true
		expect(Maybe.is_maybe(None)).true
		expect(Maybe.is_maybe(null)).false
		expect(Maybe.is_maybe(undefined)).false
		expect(Maybe.is_maybe('a')).false
		expect(Maybe.is_maybe({ value: 1 })).false
		expect(Maybe.is_maybe([])).false
	})
})


function sum(nums: number[]) {
	return nums.reduce((a, b) => a + b, 0)
}

describe('Maybe joining functions', () => {
	type Triple = [number, number, number]
	type Case = [boolean, any, any, number[]]
	const cases: [string, MaybeTuple<Triple>, Case][] = [[
		'all some',
		[Some(1), Some(1), Some(1)],
		[true, [1, 1, 1], 3, [1, 1, 1]],
	], [
		'first none',
		[None, Some(1), Some(1)],
		[false, undefined, undefined, [1, 1]],
	], [
		'second none',
		[Some(1), None, Some(1)],
		[false, undefined, undefined, [1, 1]],
	], [
		'third none',
		[Some(1), Some(1), None],
		[false, undefined, undefined, [1, 1]],
	], [
		'firstlast none',
		[None, Some(1), None],
		[false, undefined, undefined, [1]],
	], [
		'lasttwo none',
		[Some(1), None, None],
		[false, undefined, undefined, [1]],
	], [
		'firsttwo none',
		[None, None, Some(1)],
		[false, undefined, undefined, [1]],
	], [
		'all none',
		[None, None, None],
		[false, undefined, undefined, []],
	]]

	const combiner = (a: number, b: number, c: number) => a + b + c
	// const all_panic =

	for (const [message, triple, [is_some, single, combined, filtered]] of cases) {
		const all = Maybe.all(triple)
		it(`${message} all`, () => {
			expect(all.is_some()).equal(is_some)
			expect(all.is_none()).equal(!is_some)
			if (is_some)
				expect(all.expect(im)).eql(single)
			else
				expect(() => all.expect(pm)).throw(Panic, pm)
		})


		const join = Maybe.join(...triple)
		const join_maybe = join.into_maybe()
		const join_combined = join.combine(combiner)
		const join_try_combine_some = join
			.try_combine((a: number, b: number, c: number) => true ? Some(combiner(a, b, c)) : None)
		const join_try_combine_none = join
			.try_combine((a: number, b: number, c: number) => false ? Some(combiner(a, b, c)) : None)

		it(`${message} join`, () => {
			expect(join_maybe.is_some()).equal(is_some)
			expect(join_maybe.is_none()).equal(!is_some)
			if (is_some) {
				expect(join_maybe.expect(im)).eql(single)
				expect(join_combined.expect(im)).eql(combined)
				expect(join_try_combine_some.expect(im)).eql(combined)
				expect(() => join_try_combine_none.expect(pm)).throw(Panic, pm)
			}
			else {
				expect(() => join_maybe.expect(pm)).throw(Panic, pm)
				expect(() => join_combined.expect(pm)).throw(Panic, pm)
				expect(() => join_try_combine_some.expect(pm)).throw(Panic, pm)
				expect(() => join_try_combine_none.expect(pm)).throw(Panic, pm)
			}
		})

		const [a, b, c] = triple
		const m_join = a.join(b, c)
		const m_join_maybe = m_join.into_maybe()
		const m_join_combined = m_join.combine(combiner)
		const m_join_try_combine_some = m_join
			.try_combine((a: number, b: number, c: number) => true ? Some(combiner(a, b, c)) : None)
		const m_join_try_combine_none = m_join
			.try_combine((a: number, b: number, c: number) => false ? Some(combiner(a, b, c)) : None)

		it(`${message} Maybe.join`, () => {
			expect(m_join_maybe.is_some()).equal(is_some)
			expect(m_join_maybe.is_none()).equal(!is_some)
			if (is_some) {
				expect(m_join_maybe.expect(im)).eql(single)
				expect(m_join_combined.expect(im)).eql(combined)
				expect(m_join_try_combine_some.expect(im)).eql(combined)
				expect(() => m_join_try_combine_none.expect(pm)).throw(Panic, pm)
			}
			else {
				expect(() => m_join_maybe.expect(pm)).throw(Panic, pm)
				expect(() => m_join_combined.expect(pm)).throw(Panic, pm)
				expect(() => m_join_try_combine_some.expect(pm)).throw(Panic, pm)
				expect(() => m_join_try_combine_none.expect(pm)).throw(Panic, pm)
			}
		})

		const triple_filtered = Maybe.filter(triple)
		it(`${message} Maybe.filter`, () => {
			expect(triple_filtered).eql(filtered)
		})
	}
})

describe('Maybe.join_nillable', () => it('works', () => {
	const combiner = (a: string, b = '', c = '') => a + b + c
	const a = 'a'
	const b = null as string | null
	const c = undefined as string | undefined
	const d = 'd' as string | undefined
	expect(Maybe.join_nillable(a, b, c).combine(combiner)).eql(None)
	expect(Maybe.join_nillable(b, c, a).combine(combiner)).eql(None)
	expect(Maybe.join_nillable(b, a).combine(combiner)).eql(None)
	expect(Maybe.join_nillable(c, a).combine(combiner)).eql(None)
	expect(Maybe.join_nillable(a, c).combine(combiner)).eql(None)
	expect(Maybe.join_nillable(a, b).combine(combiner)).eql(None)

	expect(Maybe.join_nillable(a, d).combine(combiner)).eql(Some('ad'))
	expect(Maybe.join_nillable(d).combine(combiner)).eql(Some('d'))
	expect(Maybe.join_nillable(a).combine(combiner)).eql(Some('a'))
}))

describe('Maybe dangerous any casts', () => {
	it('None.change', () => {
		const m = None.change(n => n + 1)
		expect(m.is_some()).false
		expect(m.is_none()).true
		expect(() => m.expect(pm)).throw(Panic, pm)
	})

	it('None.try_change', () => {
		const m = None.try_change(() => Some(1))
		expect(m.is_some()).false
		expect(m.is_none()).true
		expect(() => m.expect(pm)).throw(Panic, pm)
	})

	it('None.and', () => {
		const m = None.and(Some(1))
		expect(m.is_some()).false
		expect(m.is_none()).true
		expect(() => m.expect(pm)).throw(Panic, pm)
	})
})


describe('tap', () => it('works', () => {
	const s = Some(1)
	const n = None as Maybe<number>

	for (const m of [s, n]) {
		let tap_count = 0
		let tap_some_count = 0
		let tap_none_count = 0

		const a: boolean = m
			.tap((_: Maybe<number>) => {
				tap_count++
			})
			.tap_some((_: number) => {
				tap_some_count++
			})
			.tap_none(() => {
				tap_none_count++
			})
			.change(n => n > 0)
			.default(false)

		if (m.is_some()) {
			expect(a).true
			expect(tap_count).equal(1)
			expect(tap_some_count).equal(1)
			expect(tap_none_count).equal(0)
		}
		else {
			expect(a).false
			expect(tap_count).equal(1)
			expect(tap_some_count).equal(0)
			expect(tap_none_count).equal(1)
		}
	}
}))
