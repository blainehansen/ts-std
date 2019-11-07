import 'mocha'
import { expect } from 'chai'

import { tuple as t, Dict } from '@ts-std/types'
import { Result, Ok, Err } from '@ts-std/monads'

import { DefaultDict } from './DefaultDict'

describe('DefaultDict', () => {
	it('works', () => {
		const d = new DefaultDict(() => [] as number[])
		expect(d.get('a')).eql([])

		d.get('b').push(1)
		d.get('b').push(2)
		d.get('b').push(3)
		expect(d.get('b')).eql([1, 2, 3])

		expect(d.get('a')).eql([])
	})

	it('into_array', () => {
		const d = new DefaultDict(() => [] as number[])
		const a: { key: string, value: number[] }[] = d.into_array('key', 'value')
		expect(a).eql([])

		d.get('a')
		d.get('b').push(1)
		d.get('b').push(2)
		d.get('b').push(3)
		const b: { name: string, item: number[] }[] = d.into_array('name', 'item')
		expect(b).eql([{ name: 'a', item: [] }, { name: 'b', item: [1, 2, 3] }])
	})
	it('into_dict', () => {
		const d = new DefaultDict(() => [] as number[])
		const a: Dict<number[]> = d.into_dict()
		expect(a).eql({})

		d.get('a')
		d.get('b').push(1)
		d.get('b').push(2)
		d.get('b').push(3)
		const b = d.into_dict()
		expect(b).eql({ a: [], b: [1, 2, 3] })
	})

	const d = new DefaultDict(() => [] as number[])
	d.get('a')
	d.get('b').push(1)
	d.get('b').push(2)
	d.get('b').push(3)
	it('entries', () => {
		expect(d.entries()).eql([['a', []], ['b', [1, 2, 3]]])
	})
	it('keys', () => {
		expect(d.keys()).deep.members(['a', 'b'])
	})
	it('values', () => {
		expect(d.values()).deep.members([[], [1, 2, 3]])
	})
})
