import 'mocha'
import { expect } from 'chai'

import { Panic } from './utils'
import { Maybe, Some, None, MaybeTuple, MaybeJoin } from './maybe'

const im = "type invariant broken!"
const pm = "actually should happen"

describe('Maybe basic api', () => {
	const cases: Maybe<number>[] = [Some(1), None()]
	for (const r of cases) {
		const is_some = r.is_some()
		const message = is_some ? 'Some' : 'None'
		const changed: Maybe<string> = r.change(n => `n is: ${n}`)
		const or_some = r.or(Some(2))
		const or_none = r.or(None())
		const and_some = r.and(Some(2))
		const and_none = r.and(None())
		const and_then_some: Maybe<boolean> = r.and_then(n => n === 1 ? Some(true) : None())
		const and_then_none: Maybe<string> = r.and_then(n => n === 2 ? Some('two') : None())
		const to_undef = r.to_undef()
		const default_none = r.default(2)

		it(message, () => {
			if (is_some) {
				expect(r.expect(im)).equal(1)
				expect(r.is_none()).false
				expect(changed.expect(im)).equal(`n is: 1`)
				expect(or_some.expect(im)).equal(1)
				expect(or_none.expect(im)).equal(1)
				expect(and_some.expect(im)).equal(2)
				expect(and_none.is_none()).true
				expect(and_then_some.expect(im)).equal(true)
				expect(and_then_none.is_none()).true
				expect(to_undef).equal(1)
				expect(default_none).equal(1)
				r.match({
					some: n => n,
					none: () => { expect.fail("matched none on a some"); return 1 },
				})
			}
			else {
				expect(() => r.expect(pm)).throw(Panic, pm)
				expect(r.is_none()).true
				expect(changed.is_none()).true
				expect(or_some.expect(im)).equal(2)
				expect(or_none.is_none()).true
				expect(and_some.is_none()).true
				expect(and_none.is_none()).true
				expect(and_then_some.is_none()).true
				expect(and_then_none.is_none()).true
				expect(to_undef).undefined
				expect(default_none).equal(2)
				r.match({
					some: _ => { expect.fail("matched some on a none"); return 1 },
					none: 1,
				})
			}
		})
	}

	it('attempt', () => {
		const none = Maybe.attempt(() => { throw new Error('bad'); return 1 })
		expect(() => none.expect(pm)).throw(Panic, pm)

		const some = Maybe.attempt(() => 1).expect(im)
		expect(some).equal(1)
	})
})


function sum(nums: number[]) {
	return nums.reduce((a, b) => a + b, 0)
}

describe('Maybe joining functions', () => {
	type Triple = [number, number, number]
	type Case = [boolean, any, any]
	const cases: [string, MaybeTuple<Triple>, Case][] = [[
		'all some',
		[Some(1), Some(1), Some(1)],
		[true, [1, 1, 1], 3],
	], [
		'first none',
		[None(), Some(1), Some(1)],
		[false, undefined, undefined],
	], [
		'second none',
		[Some(1), None(), Some(1)],
		[false, undefined, undefined],
	], [
		'third none',
		[Some(1), Some(1), None()],
		[false, undefined, undefined],
	], [
		'firstlast none',
		[None(), Some(1), None()],
		[false, undefined, undefined],
	], [
		'lasttwo none',
		[Some(1), None(), None()],
		[false, undefined, undefined],
	], [
		'firsttwo none',
		[None(), None(), Some(1)],
		[false, undefined, undefined],
	], [
		'all none',
		[None(), None(), None()],
		[false, undefined, undefined],
	]]

	const combiner = (a: number, b: number, c: number) => a + b + c
	// const all_panic =

	for (const [message, triple, [is_some, single, collected]] of cases) {
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
		const join_and_then_some = join
			.and_then_combine((a: number, b: number, c: number) => true ? Some(combiner(a, b, c)) : None())
		const join_and_then_none = join
			.and_then_combine((a: number, b: number, c: number) => false ? Some(combiner(a, b, c)) : None())

		it(`${message} join`, () => {
			expect(join_maybe.is_some()).equal(is_some)
			expect(join_maybe.is_none()).equal(!is_some)
			if (is_some) {
				expect(join_maybe.expect(im)).eql(single)
				expect(join_combined.expect(im)).eql(collected)
				expect(join_and_then_some.expect(im)).eql(collected)
				expect(() => join_and_then_none.expect(pm)).throw(Panic, pm)
			}
			else {
				expect(() => join_maybe.expect(pm)).throw(Panic, pm)
				expect(() => join_combined.expect(pm)).throw(Panic, pm)
				expect(() => join_and_then_some.expect(pm)).throw(Panic, pm)
				expect(() => join_and_then_none.expect(pm)).throw(Panic, pm)
			}
		})

		const [a, b, c] = triple
		const m_join = a.join(b, c)
		const m_join_maybe = m_join.into_maybe()
		const m_join_combined = m_join.combine(combiner)
		const m_join_and_then_some = m_join
			.and_then_combine((a: number, b: number, c: number) => true ? Some(combiner(a, b, c)) : None())
		const m_join_and_then_none = m_join
			.and_then_combine((a: number, b: number, c: number) => false ? Some(combiner(a, b, c)) : None())

		it(`${message} Maybe.join`, () => {
			expect(m_join_maybe.is_some()).equal(is_some)
			expect(m_join_maybe.is_none()).equal(!is_some)
			if (is_some) {
				expect(m_join_maybe.expect(im)).eql(single)
				expect(m_join_combined.expect(im)).eql(collected)
				expect(m_join_and_then_some.expect(im)).eql(collected)
				expect(() => m_join_and_then_none.expect(pm)).throw(Panic, pm)
			}
			else {
				expect(() => m_join_maybe.expect(pm)).throw(Panic, pm)
				expect(() => m_join_combined.expect(pm)).throw(Panic, pm)
				expect(() => m_join_and_then_some.expect(pm)).throw(Panic, pm)
				expect(() => m_join_and_then_none.expect(pm)).throw(Panic, pm)
			}
		})
	}
})


describe('Maybe dangerous any casts', () => {
	it('None.change', () => {
		const m = None<number>().change(n => n + 1)
		expect(m.is_some()).false
		expect(m.is_none()).true
		expect(() => m.expect(pm)).throw(Panic, pm)
	})

	it('None.and_then', () => {
		const m = None<number>().and_then(() => Some(1))
		expect(m.is_some()).false
		expect(m.is_none()).true
		expect(() => m.expect(pm)).throw(Panic, pm)
	})

	it('None.and', () => {
		const m = None<number>().and(Some(1))
		expect(m.is_some()).false
		expect(m.is_none()).true
		expect(() => m.expect(pm)).throw(Panic, pm)
	})
})
