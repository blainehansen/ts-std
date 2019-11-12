import 'mocha'
import { expect } from 'chai'

import { Result, Ok, Err, Maybe, Some, None } from '@ts-std/monads'

import { UniqueValue } from './UniqueValue'

describe('UniqueValue', () => {
	it('works', () => {
		const d = new UniqueValue<number>()
		expect(d.get()).eql(None)
		const r: Result<void, [number, number]> = d.set(0)

		expect(r).eql(Ok(undefined))
		expect(d.set(0)).eql(Err([0, 0]))
		expect(d.set(1)).eql(Err([0, 1]))
		expect(d.get()).eql(Some(0))
	})
})
