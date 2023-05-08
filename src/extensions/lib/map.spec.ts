import 'mocha'
import './map'
import { expect } from 'chai'

describe('entries_to_array', () => {
	it('works', () => {
		expect(new Map().entries_to_array()).eql([])
		expect(new Map([[1, 'a'], [1, 'a'], [2, 'b']]).entries_to_array()).eql([[1, 'a'], [2, 'b']])
	})
})
describe('entries_map_to_array', () => {
	it('works', () => {
		expect(new Map().entries_map_to_array(() => null)).eql([])

		expect(new Map([[1, 'a'], [1, 'a'], [2, 'b']]).entries_map_to_array(() => null)).eql([null, null])

		const fmt = ([n, s]: [number, string]) => `${n}${s}`
		expect(new Map([[1, 'a'], [1, 'a'], [2, 'b']]).entries_map_to_array(fmt)).eql(['1a', '2b'])
		expect(new Map([[1, 'a'], [2, 'b'], [1, 'a'], [2, 'b']]).entries_map_to_array(fmt)).eql(['1a', '2b'])
	})
})

describe('keys_to_array', () => {
	it('works', () => {
		expect(new Map().keys_to_array()).eql([])
		expect(new Map([[1, 'a'], [1, 'a'], [2, 'b']]).keys_to_array()).eql([1, 2])
	})
})
describe('keys_map_to_array', () => {
	it('works', () => {
		expect(new Map().keys_map_to_array(() => null)).eql([])

		expect(new Map([[1, 'a'], [1, 'a'], [2, 'b']]).keys_map_to_array(() => null)).eql([null, null])

		const fmt = (n: number) => n
		expect(new Map([[1, 'a'], [1, 'a'], [2, 'b']]).keys_map_to_array(fmt)).eql([1, 2])
		expect(new Map([[1, 'a'], [2, 'b'], [1, 'a'], [2, 'b']]).keys_map_to_array(fmt)).eql([1, 2])
	})
})

describe('values_to_array', () => {
	it('works', () => {
		expect(new Map().values_to_array()).eql([])
		expect(new Map([[1, 'a'], [1, 'a'], [2, 'b']]).values_to_array()).eql(['a', 'b'])
	})
})
describe('values_map_to_array', () => {
	it('works', () => {
		expect(new Map().values_map_to_array(() => null)).eql([])

		expect(new Map([[1, 'a'], [1, 'a'], [2, 'b']]).values_map_to_array(() => null)).eql([null, null])

		const fmt = (s: string) => s
		expect(new Map([[1, 'a'], [1, 'a'], [2, 'b']]).values_map_to_array(fmt)).eql(['a', 'b'])
		expect(new Map([[1, 'a'], [2, 'b'], [1, 'a'], [2, 'b']]).values_map_to_array(fmt)).eql(['a', 'b'])
	})
})
