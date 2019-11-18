import 'mocha'
import { expect } from 'chai'

import { Result, Ok, Err, Maybe, Some, None } from '@ts-std/monads'

import { LockedValue } from './LockedValue'

describe('LockedValue', () => {
	it('works', () => {
		const d = new LockedValue<number>((a, b) => a === b)
		expect(d.get()).eql(None)
		const r: Result<void, number> = d.set(0)
		expect(r).eql(Ok(undefined))

		expect(d.set(0)).eql(Ok(undefined))
		expect(d.set(1)).eql(Err(1))
		expect(d.get()).eql(Some(0))
	})
})
