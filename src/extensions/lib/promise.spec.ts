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
