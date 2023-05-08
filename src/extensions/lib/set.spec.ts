import 'mocha'
import './set'
import { expect } from 'chai'

describe('to_array', () => {
	it('works', () => {
		expect(new Set().to_array()).eql([])
		expect(new Set([1, 1, 2]).to_array()).eql([1, 2])
	})
})
describe('map_to_array', () => {
	it('works', () => {
		expect(new Set().map_to_array(() => null)).eql([])

		expect(new Set([1, 2]).map_to_array(() => null)).eql([null, null])

		const inc = (n: number) => n + 1
		expect(new Set([1, 1, 2]).map_to_array(inc)).eql([2, 3])
		expect(new Set([1, 1, 2, 2]).map_to_array(inc)).eql([2, 3])
	})
})
