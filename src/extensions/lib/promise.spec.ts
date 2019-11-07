import 'mocha'
import './promise'
import { expect } from 'chai'

import { tuple as t } from '@ts-std/types'
import { Result, Ok, Err, Maybe, Some, None } from '@ts-std/monads'

async function av<T>(v: T) {
	return Promise.resolve(v)
}

async function ev(v: any): Promise<any> {
	throw new Error('ev')
}

describe('Promise.prototype.join', () => {
	it('no args', async () => {
		const p: Promise<[number]> = av(1).join()
		expect(await p).eql([1])
	})

	it('works', async () => {
		const p: Promise<[number, string, boolean]> = av(1).join(av('a'), av(true))
		expect(await p).eql([1, 'a', true])
	})
})
describe('Promise.join', () => {
	it('no args', async () => {
		const p: Promise<[]> = Promise.join()
		expect(await p).eql([])
	})

	it('works', async () => {
		const p: Promise<[number, string, boolean]> = Promise.join(av(1), av('a'), av(true))
		expect(await p).eql([1, 'a', true])
	})
})

const absurd_wait = 1000
const reasonable_wait = 10

describe('Promise.prototype.result_join', () => {
	it('no args', async () => {
		const p: Promise<Result<[number]>> = av(Ok(1)).result_join()
		expect(await p).eql(Ok([1]))
	})

	it('works', async function () {
		const p: Promise<Result<[number, string, boolean]>> = av(Ok(1)).result_join(av(Ok('a')), av(Ok(true)))
		expect(await p).eql(Ok([1, 'a', true]))

		this.timeout(absurd_wait - 100)
		const d: Promise<Result<[number, string, boolean]>> =
			Promise.delay(absurd_wait, Ok(1))
			.result_join(
				Promise.delay(reasonable_wait, Err('a')),
				Promise.delay(absurd_wait, Ok(true)),
			)
		expect(await d).eql(Err('a'))
	})
})
describe('Promise.result_join', () => {
	it('no args', async () => {
		const p: Promise<Result<[]>> = Promise.result_join()
		expect(await p).eql(Ok([]))
	})

	it('works', async function () {
		const p: Promise<Result<[number, string, boolean]>> = Promise.result_join(av(Ok(1)), av(Ok('a')), av(Ok(true)))
		expect(await p).eql(Ok([1, 'a', true]))

		this.timeout(absurd_wait - 100)
		const d: Promise<Result<[number, boolean, string]>> = Promise.result_join(
			Promise.delay(absurd_wait, Ok(1)),
			Promise.delay(absurd_wait, Ok(true)),
			Promise.delay(reasonable_wait, Err('a')),
		)
		expect(await p).eql(Ok([1, 'a', true]))
	})
})

describe('Promise.prototype.maybe_join', () => {
	it('no args', async () => {
		const p: Promise<Maybe<[number]>> = av(Some(1)).maybe_join()
		expect(await p).eql(Some([1]))
	})

	it('works', async function () {
		const p: Promise<Maybe<[number, string, boolean]>> = av(Some(1)).maybe_join(av(Some('a')), av(Some(true)))
		expect(await p).eql(Some([1, 'a', true]))

		this.timeout(absurd_wait - 100)
		const d: Promise<Maybe<[string, number, boolean]>> =
			Promise.delay(reasonable_wait, None)
			.maybe_join(
				Promise.delay(absurd_wait, Some(1)),
				Promise.delay(absurd_wait, Some(true)),
			)
		expect(await d).eql(None)
	})
})
describe('Promise.maybe_join', () => {
	it('no args', async () => {
		const p: Promise<Maybe<[]>> = Promise.maybe_join()
		expect(await p).eql(Some([]))
	})

	it('works', async function () {
		const p: Promise<Maybe<[number, string, boolean]>> = Promise.maybe_join(av(Some(1)), av(Some('a')), av(Some(true)))
		expect(await p).eql(Some([1, 'a', true]))

		this.timeout(absurd_wait - 100)
		const d: Promise<Maybe<[string, number, boolean]>> = Promise.maybe_join(
			Promise.delay(reasonable_wait, None),
			Promise.delay(absurd_wait, Some(1)),
			Promise.delay(absurd_wait, Some(true)),
		)
		expect(await d).eql(None)
	})
})


describe('Promise.join_object', () => {
	it('no args', async () => {
		const p: Promise<{}> = Promise.join_object({})
		expect(await p).eql({})
	})

	it('works', async () => {
		const p: Promise<{ 1: number, a: string, true: boolean }> = Promise.join_object({
			1: av(1), a: av('a'), true: av(true),
		})
		expect(await p).eql({ 1: 1, a: 'a', true: true })
	})
})

describe('use_maybe', () => {
	it('some', async () => {
		const p: Promise<Maybe<number>> = av(1).use_maybe()
		expect(await p).eql(Some(1))
	})

	it('none', async () => {
		const p: Promise<Maybe<number>> = ev(1).use_maybe()
		expect(await p).eql(None)
	})
})

describe('use_result', () => {
	it('ok', async () => {
		const p: Promise<Result<number, Error>> = av(1).use_result()
		expect(await p).eql(Ok(1))
	})

	it('err', async () => {
		const p: Promise<Result<number, Error>> = ev(1).use_result()
		expect((await p).expect_err('uh oh').message).eql('ev')
	})
})

describe('Promise.delay', () => {
	it('with value', async () => {
		const p: Promise<string> = Promise.delay(500, 'a')
		expect(await p).eql('a')
	})
	it('without value', async () => {
		const p: Promise<void> = Promise.delay(500)
		expect(await p).eql(undefined)
	})
})
