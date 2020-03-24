import 'mocha'
import { expect } from 'chai'

import { Panic } from './common'
import { Result, Ok, Err, ResultTuple, ResultJoin } from './result'


const im = "type invariant broken!"
const pm = "actually should happen"

describe('Result basic api', () => {
	const cases: Result<number>[] = [Ok(1), Err('bad')]
	for (const r of cases) {
		const is_ok = r.is_ok()
		if (r.is_ok()) {
			const t: number = r.value
		}
		if (r.is_err()) {
			const e: string = r.error
		}
		const message = is_ok ? 'Ok' : 'Err'
		const changed: Result<string> = r.change(n => `n is: ${n}`)
		const changed_err: Result<number, number> = r.change_err(e => e.length)
		const try_change_ok: Result<boolean> = r.try_change(n => n === 1 ? Ok(true) : Err('different'))
		const try_change_err: Result<string> = r.try_change(n => n === 2 ? Ok('two') : Err('also'))
		const ok_undef = r.ok_undef()
		const ok_null = r.ok_null()
		const err_undef = r.err_undef()
		const err_null = r.err_null()

		const or_ok = r.or(Ok(2))
		const or_err = r.or(Err('or'))
		const or_ok_fn = r.or(() => Ok(2))
		const or_err_fn = r.or(() => Err('or'))

		const and_ok = r.and(Ok(2))
		const and_err = r.and(Err('and'))
		const and_ok_fn = r.and(() => Ok(2))
		const and_err_fn = r.and(() => Err('and'))

		const xorm = 'xor both same'
		const xor_ok = r.xor(Ok(2), xorm)
		const xor_err = r.xor(Err('xor'), xorm)
		const xor_ok_fn = r.xor(() => Ok(2), xorm)
		const xor_err_fn = r.xor(() => Err('xor'), xorm)

		const xor_ok_err_fn = r.xor(() => Ok(2), () => xorm)
		const xor_err_err_fn = r.xor(() => Err('xor'), () => xorm)

		const default_ok = r.default(2)
		const default_err = r.default_err('less bad')

		it(message, () => {
			if (is_ok) {
				expect(r.unwrap()).equal(1)
				expect(r.expect(im)).equal(1)
				expect(() => r.expect_err(pm)).throw(Panic, pm)
				expect(() => r.unwrap_err()).throw(Panic)
				expect(r.is_err()).false
				expect(changed.expect(im)).equal(`n is: 1`)
				expect(changed_err.expect(im)).equal(1)
				expect(try_change_ok.expect(im)).equal(true)
				expect(try_change_err.expect_err(im)).equal('also')
				expect(ok_undef).equal(1)
				expect(ok_null).equal(1)
				expect(err_undef).undefined
				expect(err_null).null

				expect(or_ok.expect(im)).equal(1)
				expect(or_err.expect(im)).equal(1)
				expect(or_ok_fn.expect(im)).equal(1)
				expect(or_err_fn.expect(im)).equal(1)

				expect(and_ok.expect(im)).equal(2)
				expect(and_err.expect_err(im)).equal('and')
				expect(and_ok_fn.expect(im)).equal(2)
				expect(and_err_fn.expect_err(im)).equal('and')

				expect(xor_ok.expect_err(im)).equal(xorm)
				expect(xor_err.expect(im)).equal(1)
				expect(xor_ok_fn.expect_err(im)).equal(xorm)
				expect(xor_err_fn.expect(im)).equal(1)
				expect(xor_ok_err_fn.expect_err(im)).equal(xorm)
				expect(xor_err_err_fn.expect(im)).equal(1)

				expect(default_ok).equal(1)
				expect(default_err).equal('less bad')
				r.match({
					ok: n => {},
					err: _ => { expect.fail("matched err on an ok") },
				})

				const correct = r.match({
					ok: true,
					err: false,
				})
				expect(correct).true
			}
			else {
				expect(() => r.unwrap()).throw(Panic)
				expect(() => r.expect(pm)).throw(Panic, pm)
				expect(r.unwrap_err()).equal('bad')
				expect(r.expect_err(im)).equal('bad')
				expect(r.is_err()).true
				expect(changed.expect_err(im)).equal('bad')
				expect(changed_err.expect_err(im)).equal(3)
				expect(try_change_ok.expect_err(im)).equal('bad')
				expect(try_change_err.expect_err(im)).equal('bad')
				expect(ok_undef).undefined
				expect(ok_null).null
				expect(err_undef).equal('bad')
				expect(err_null).equal('bad')

				expect(or_ok.expect(im)).equal(2)
				expect(or_err.expect_err(im)).equal('bad')
				expect(or_ok_fn.expect(im)).equal(2)
				expect(or_err_fn.expect_err(im)).equal('bad')

				expect(and_ok.expect_err(im)).equal('bad')
				expect(and_err.expect_err(im)).equal('bad')
				expect(and_ok_fn.expect_err(im)).equal('bad')
				expect(and_err_fn.expect_err(im)).equal('bad')

				expect(xor_ok.expect(im)).equal(2)
				expect(xor_err.expect_err(im)).equal(xorm)
				expect(xor_ok_fn.expect(im)).equal(2)
				expect(xor_err_fn.expect_err(im)).equal(xorm)
				expect(xor_ok_err_fn.expect(im)).equal(2)
				expect(xor_err_err_fn.expect_err(im)).equal(xorm)

				expect(default_ok).equal(2)
				expect(default_err).equal('bad')

				r.match({
					ok: _ => { expect.fail("matched ok on an err") },
					err: _ => {},
				})

				const correct = r.match({
					ok: false,
					err: true,
				})
				expect(correct).true
			}
		})
	}

	it('from_nillable', () => {
		const null_err = Result.from_nillable(null, 'is null').expect_err(im)
		const undefined_err = Result.from_nillable(undefined, () => 'is undefined').expect_err(im)
		expect(null_err).equal('is null')
		expect(undefined_err).equal('is undefined')

		const ok_null: number = Result.from_nillable(1 as number | null, 'never').expect(im)
		expect(ok_null).equal(1)

		const ok_undefined: number = Result.from_nillable(1 as number | undefined, 'never').expect(im)
		expect(ok_undefined).equal(1)

		const ok_both: number = Result.from_nillable(1 as number | null | undefined, 'never').expect(im)
		expect(ok_both).equal(1)
	})

	it('attempt', () => {
		const err = Result.attempt(() => { throw new Error('bad'); return 1 })
			.change_err(e => e.message)
			.expect_err(im)
		expect(err).equal('bad')

		const ok = Result.attempt(() => 1).expect(im)
		expect(ok).equal(1)

		const extra = Result.attempt((arg = 1) => arg === 1).expect(im)
		expect(extra).true
	})

	it('join_object', () => {
		const r: Result<{ a: number, b: string }> = Result.join_object({
			a: Ok(1), b: Ok('b')
		})

		expect(r).eql(Ok({ a: 1, b: 'b' }))

		expect(Result.join_object({
			a: Err('a'),
			b: Ok('b'),
		})).eql(Err('a'))

		expect(Result.join_object({
			a: Ok(1),
			b: Err('b'),
		})).eql(Err('b'))

		expect(Result.join_object({
			a: Err('a'),
			b: Err('b'),
		})).eql(Err('a'))
	})
	it('join_object_collect_err', () => {
		const r: Result<{ a: number, b: string }, string[]> = Result.join_object_collect_err({
			a: Ok(1), b: Ok('b')
		})

		expect(r).eql(Ok({ a: 1, b: 'b' }))

		expect(Result.join_object_collect_err({
			a: Err('a'),
			b: Ok('b'),
		})).eql(Err(['a']))

		expect(Result.join_object_collect_err({
			a: Ok(1),
			b: Err('b'),
		})).eql(Err(['b']))

		expect(Result.join_object_collect_err({
			a: Err('a'),
			b: Err('b'),
		})).eql(Err(['a', 'b']))
	})

	it('is_result', () => {
		expect(Result.is_result(Ok(1))).true
		expect(Result.is_result(Ok('a'))).true
		expect(Result.is_result(Err('a'))).true
		expect(Result.is_result(Err(null))).true
		expect(Result.is_result(null)).false
		expect(Result.is_result(undefined)).false
		expect(Result.is_result('a')).false
		expect(Result.is_result({ value: 1 })).false
		expect(Result.is_result([])).false
	})
})

function sum(nums: number[]) {
	return nums.reduce((a, b) => a + b, 0)
}

function msg(e: string) {
	return `message is: ${e}`
}

function msg_join(e: string[]) {
	return e.join(' ')
}

describe('Result joining functions', () => {
	type Triple = [number, number, number]
	type Case = [boolean, any, any, number[]]
	const cases: [string, ResultTuple<Triple, string>, Case][] = [[
		'all ok',
		[Ok(1), Ok(1), Ok(1)],
		[true, [1, 1, 1], 3, [1, 1, 1]],
	], [
		'first err',
		[Err('ugh'), Ok(1), Ok(1)],
		[false, 'ugh', ['ugh'], [1, 1]],
	], [
		'second err',
		[Ok(1), Err('ugh'), Ok(1)],
		[false, 'ugh', ['ugh'], [1, 1]],
	], [
		'third err',
		[Ok(1), Ok(1), Err('ugh')],
		[false, 'ugh', ['ugh'], [1, 1]],
	], [
		'firstlast err',
		[Err('ugh'), Ok(1), Err('ugh')],
		[false, 'ugh', ['ugh', 'ugh'], [1]],
	], [
		'lasttwo err',
		[Ok(1), Err('seen'), Err('notseen')],
		[false, 'seen', ['seen', 'notseen'], [1]],
	], [
		'firsttwo err',
		[Err('seen'), Err('notseen'), Ok(1)],
		[false, 'seen', ['seen', 'notseen'], [1]],
	], [
		'all err',
		[Err('seen'), Err('notseen'), Err('notseen')],
		[false, 'seen', ['seen', 'notseen', 'notseen'], []],
	]]

	const combiner = (a: number, b: number, c: number) => a + b + c

	for (const [message, triple, [is_ok, single, combined, filtered]] of cases) {
		const all = Result.all(triple)
		it(`${message} all`, () => {
			expect(all.is_ok()).equal(is_ok)
			expect(all.is_err()).equal(!is_ok)
			if (is_ok)
				expect(all.expect(im)).eql(single)
			else
				expect(all.expect_err(im)).eql(single)
		})

		const all_collect_err = Result.all_collect_err(triple)
		it(`${message} all_collect_err`, () => {
			expect(all_collect_err.is_ok()).equal(is_ok)
			expect(all_collect_err.is_err()).equal(!is_ok)
			if (is_ok)
				expect(all_collect_err.expect(im)).eql(single)
			else
				expect(all_collect_err.expect_err(im)).eql(combined)
		})

		const join = Result.join(...triple)
		const join_res = join.into_result()
		const join_combined = join.combine(combiner)
		// this always fails, so we're mostly checking *which* err is encountered
		const join_try_combine_ok = join
			.try_combine((a: number, b: number, c: number) => true ? Ok(combiner(a, b, c)) : Err('nope'))
		const join_try_combine_err = join
			.try_combine((a: number, b: number, c: number) => false ? Ok(combiner(a, b, c)) : Err('nope'))

		it(`${message} join`, () => {
			expect(join_res.is_ok()).equal(is_ok)
			expect(join_res.is_err()).equal(!is_ok)
			if (is_ok) {
				expect(join_res.expect(im)).eql(single)
				expect(join_combined.expect(im)).eql(combined)
				expect(join_try_combine_ok.expect(im)).eql(combined)
				expect(join_try_combine_err.expect_err(im)).eql('nope')
			}
			else {
				expect(join_res.expect_err(im)).eql(single)
				expect(join_combined.expect_err(im)).eql(single)
				expect(join_try_combine_ok.expect_err(im)).eql(single)
				expect(join_try_combine_err.expect_err(im)).eql(single)
			}
		})

		const join_collect = Result.join_collect_err(...triple)
		const join_collect_res = join_collect.into_result()
		const join_collect_combined = join_collect.combine(combiner)
		const join_collect_try_combine_ok = join_collect
			.try_combine((a: number, b: number, c: number) => true ? Ok(combiner(a, b, c)) : Err(['nope']))
		const join_collect_try_combine_err = join_collect
			.try_combine((a: number, b: number, c: number) => false ? Ok(combiner(a, b, c)) : Err(['nope']))

		it(`${message} join_collect_err`, () => {
			expect(join_collect_res.is_ok()).equal(is_ok)
			expect(join_collect_res.is_err()).equal(!is_ok)
			if (is_ok) {
				expect(join_collect_res.expect(im)).eql(single)
				expect(join_collect_combined.expect(im)).eql(combined)
				expect(join_collect_try_combine_ok.expect(im)).eql(combined)
				expect(join_collect_try_combine_err.expect_err(im)).eql(['nope'])
			}
			else {
				expect(join_collect_res.expect_err(im)).eql(combined)
				expect(join_collect_combined.expect_err(im)).eql(combined)
				expect(join_collect_try_combine_ok.expect_err(im)).eql(combined)
				expect(join_collect_try_combine_err.expect_err(im)).eql(combined)
			}
		})

		const [a, b, c] = triple
		const r_join = a.join(b, c)
		const r_join_res = r_join.into_result()
		const r_join_combined = r_join.combine(combiner)
		const r_join_try_combine_ok = r_join
			.try_combine((a: number, b: number, c: number) => true ? Ok(combiner(a, b, c)) : Err('nope'))
		const r_join_try_combine_err = r_join
			.try_combine((a: number, b: number, c: number) => false ? Ok(combiner(a, b, c)) : Err('nope'))

		it(`${message} Result.join`, () => {
			expect(r_join_res.is_ok()).equal(is_ok)
			expect(r_join_res.is_err()).equal(!is_ok)
			if (is_ok) {
				expect(r_join_res.expect(im)).eql(single)
				expect(r_join_combined.expect(im)).eql(combined)
				expect(r_join_try_combine_ok.expect(im)).eql(combined)
				expect(r_join_try_combine_err.expect_err(im)).eql('nope')
			}
			else {
				expect(r_join_res.expect_err(im)).eql(single)
				expect(r_join_combined.expect_err(im)).eql(single)
				expect(r_join_try_combine_ok.expect_err(im)).eql(single)
				expect(r_join_try_combine_err.expect_err(im)).eql(single)
			}
		})

		const r_join_collect = a.join_collect_err(b, c)
		const r_join_collect_res = r_join_collect.into_result()
		const r_join_collect_combined = r_join_collect.combine(combiner)
		const r_join_collect_try_combine_ok = r_join_collect
			.try_combine((a: number, b: number, c: number) => true ? Ok(combiner(a, b, c)) : Err(['nope']))
		const r_join_collect_try_combine_err = r_join_collect
			.try_combine((a: number, b: number, c: number) => false ? Ok(combiner(a, b, c)) : Err(['nope']))

		it(`${message} Result.join`, () => {
			expect(r_join_collect_res.is_ok()).equal(is_ok)
			expect(r_join_collect_res.is_err()).equal(!is_ok)
			if (is_ok) {
				expect(r_join_collect_res.expect(im)).eql(single)
				expect(r_join_collect_combined.expect(im)).eql(combined)
				expect(r_join_collect_try_combine_ok.expect(im)).eql(combined)
				expect(r_join_collect_try_combine_err.expect_err(im)).eql(['nope'])
			}
			else {
				expect(r_join_collect_res.expect_err(im)).eql(combined)
				expect(r_join_collect_combined.expect_err(im)).eql(combined)
				expect(r_join_collect_try_combine_ok.expect_err(im)).eql(combined)
				expect(r_join_collect_try_combine_err.expect_err(im)).eql(combined)
			}
		})

		const triple_filtered = Result.filter(triple)
		it(`${message} Result.filter`, () => {
			expect(triple_filtered).eql(filtered)
		})

		const [triple_split_oks, triple_split_errs] = Result.split(triple)
		it(`${message} Result.split`, () => {
			expect(triple_split_oks).eql(filtered)

			if (is_ok)
				expect(triple_split_errs).eql([])
			else
				expect(triple_split_errs).eql(combined)
		})
	}
})

describe('error inference', () => it('works', () => {
	const a: Result<true> = Result.join(Ok(3), Err('a'), Ok('b'))
		.combine((num, bool, str): true => { throw new Error() })

	const b: Result<true, number> = Result.join(
		Ok(3) as Result<3, number>,
		Err(1) as Result<'a', number>,
		Ok('b') as Result<'b', number>,
	)
		.combine((num, bool, str): true => { throw new Error() })

	const c: Result<any> = Result.join_object({ a: Ok(5), b: Err('d') })

	const d: Result<any, number> = Result.join_object({ a: Ok(5) as Result<number, number>, b: Err(5) })
}))

describe('Result dangerous any casts', () => {
	it('Ok.change_err', () => {
		const r: Result<number, number> = (Ok(4) as Result<number>).change_err(e => e.length)
		expect(r.is_ok()).true
		expect(r.is_err()).false
		expect(r.expect(im)).a('number')
		expect(() => r.expect_err(pm)).throw(Panic, pm)
	})

	it('Err.change', () => {
		const r: Result<boolean> = (Err('bad') as Result<number>).change(n => n === 1)
		expect(r.is_ok()).false
		expect(r.is_err()).true
		expect(() => r.expect(pm)).throw(Panic, pm)
		expect(r.expect_err(im)).a('string')
	})

	it("Err.try_change", () => {
		const r: Result<boolean> = (Err('bad') as Result<number>).try_change(n => n === 1 ? Ok(true) : Err('not one'))
		expect(r.is_ok()).false
		expect(r.is_err()).true
		expect(() => r.expect(pm)).throw(Panic, pm)
		expect(r.expect_err(im)).a('string')
	})
})

describe('tap', () => it('works', () => {
	const o: Result<number> = Ok(1)
	const e: Result<number> = Err('nope')

	for (const r of [o, e]) {
		let tap_count = 0
		let tap_ok_count = 0
		let tap_err_count = 0

		const a: boolean = r
			.tap((_: Result<number>) => {
				tap_count++
			})
			.tap_ok((_: number) => {
				tap_ok_count++
			})
			.tap_err((_: string) => {
				tap_err_count++
			})
			.change(n => n > 0)
			.default(false)

		if (r.is_ok()) {
			expect(a).true
			expect(tap_count).equal(1)
			expect(tap_ok_count).equal(1)
			expect(tap_err_count).equal(0)
		}
		else {
			expect(a).false
			expect(tap_count).equal(1)
			expect(tap_ok_count).equal(0)
			expect(tap_err_count).equal(1)
		}
	}
}))
