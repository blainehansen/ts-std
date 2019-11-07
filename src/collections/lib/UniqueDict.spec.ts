import 'mocha'
import { expect } from 'chai'

import { tuple as t, Dict } from '@ts-std/types'
import { Result, Ok, Err, Maybe, Some, None } from '@ts-std/monads'

import { UniqueDict } from './UniqueDict'

describe('UniqueDict', () => {
	it('works', () => {
		const d = new UniqueDict<number>()
		expect(d.get('a')).eql(None)
		const r: Result<void, [string, number, number]> = d.set('a', 0)
		expect(r).eql(Ok(undefined))
		expect(d.set('a', 0)).eql(Err(t('a', 0, 0)))
		expect(d.set('a', 1)).eql(Err(t('a', 0, 1)))
		expect(d.get('a')).eql(Some(0))

		expect(d.set('b', 1)).eql(Ok(undefined))
		expect(d.set('b', 2)).eql(Err(t('b', 1, 2)))
		expect(d.get('b')).eql(Some(1))
	})

	it('into_array', () => {
		const d = new UniqueDict<number>()
		const a: { key: string, value: number }[] = d.into_array('key', 'value')
		expect(a).eql([])

		d.set('a', 0)
		d.set('b', 1)
		d.set('b', 2)
		const b: { name: string, item: number }[] = d.into_array('name', 'item')
		expect(b).eql([{ name: 'a', item: 0 }, { name: 'b', item: 1 }])
	})
	it('into_dict', () => {
		const d = new UniqueDict<number>()
		const a: Dict<number> = d.into_dict()
		expect(a).eql({})

		d.set('a', 0)
		d.set('b', 1)
		d.set('b', 2)
		const b = d.into_dict()
		expect(b).eql({ a: 0, b: 1 })
	})

	const d = new UniqueDict<number>()
	d.set('a', 0)
	d.set('b', 1)
	d.set('b', 2)
	it('entries', () => {
		expect(d.entries()).eql([['a', 0], ['b', 1]])
	})
	it('keys', () => {
		expect(d.keys()).deep.members(['a', 'b'])
	})
	it('values', () => {
		expect(d.values()).deep.members([0, 1])
	})
})
