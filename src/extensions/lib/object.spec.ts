import 'mocha'
import './object'
import { expect } from 'chai'

import { Maybe, Some, None } from '@ts-std/monads'

describe('maybe_get', () => {
	it('empty', () => {
		expect(Object.maybe_get({}, 'a')).eql(None)
		expect(Object.maybe_get({}, 1)).eql(None)
		expect(Object.maybe_get({}, true)).eql(None)
	})

	it('there', () => {
		const o: { [key: string]: string } = { a: 'a', 1: '1', true: 'true' }

		expect(Object.maybe_get(o, 'a')).eql(Some('a'))
		expect(Object.maybe_get(o, 1)).eql(Some('1'))
		expect(Object.maybe_get(o, true)).eql(Some('true'))
	})
})
