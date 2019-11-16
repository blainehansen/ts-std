import 'mocha'
import { expect } from 'chai'

import { tuple as t, Dict } from '@ts-std/types'
import { Result, Ok, Err, Maybe, Some, None } from '@ts-std/monads'

import { OrderedDict } from './OrderedDict'

describe('OrderedDict', () => {
	it('works', () => {
		type A = { name: string, v: number }
		const r: Result<OrderedDict<A>, [string, A, A]> =
			OrderedDict.create_unique('name', [{ name: 'a', v: 1 }, { name: 'b', v: 1 }])
		if (!r.is_ok())
			throw new Error()
		const d = r.value

		const a: Maybe<A> = d.get_by_index(0)
		expect(a).eql(Some({ name: 'a', v: 1 }))
		expect(d.get_by_index(1)).eql(Some({ name: 'b', v: 1 }))
		expect(d.get_by_index(2)).eql(None)
		expect(d.get_by_index(-1)).eql(Some({ name: 'b', v: 1 }))
		expect(d.get_by_index(-2)).eql(Some({ name: 'a', v: 1 }))
		expect(d.get_by_index(-3)).eql(None)

		const b: Maybe<A> = d.get_by_name('a')
		expect(b).eql(Some({ name: 'a', v: 1 }))
		expect(d.get_by_name('b')).eql(Some({ name: 'b', v: 1 }))
		expect(d.get_by_name('c')).eql(None)

		const t = OrderedDict.create('name', [{ name: 'a', v: 1 }, { name: 'b', v: 1 }])
		expect(t.get_by_index(0)).eql(Some({ name: 'a', v: 1 }))
		expect(t.get_by_index(1)).eql(Some({ name: 'b', v: 1 }))
		expect(t.get_by_index(2)).eql(None)
		expect(t.get_by_index(-1)).eql(Some({ name: 'b', v: 1 }))
		expect(t.get_by_index(-2)).eql(Some({ name: 'a', v: 1 }))
		expect(t.get_by_index(-3)).eql(None)

		expect(t.get_by_name('a')).eql(Some({ name: 'a', v: 1 }))
		expect(t.get_by_name('b')).eql(Some({ name: 'b', v: 1 }))
		expect(t.get_by_name('c')).eql(None)
	})

	it('map', () => {
		const t = OrderedDict.create('name', [{ name: 'a', v: 1 }, { name: 'b', v: 2 }])
		const m = t.map(n => n.v)
		expect(m.get_by_index(0)).eql(Some(1))
		expect(m.get_by_index(1)).eql(Some(2))
		expect(m.get_by_index(2)).eql(None)
		expect(m.get_by_index(-1)).eql(Some(2))
		expect(m.get_by_index(-2)).eql(Some(1))
		expect(m.get_by_index(-3)).eql(None)

		expect(m.get_by_name('a')).eql(Some(1))
		expect(m.get_by_name('b')).eql(Some(2))
		expect(m.get_by_name('c')).eql(None)
	})

	it('into_array', () => {
		const d = OrderedDict.create_unique(n => n === 0 ? 'a' : 'b', [0, 1]).expect('')
		const a: { key: string, value: number }[] = d.into_array('key', 'value')
		expect(a).eql([{ key: 'a', value: 0 }, { key: 'b', value: 1 }])
	})
	it('into_dict', () => {
		const d = OrderedDict.create_unique(n => n === 0 ? 'a' : 'b', [0, 1]).expect('')
		const a: Dict<number> = d.into_dict()
		expect(a).eql({ a: 0, b: 1 })
	})

	const d = OrderedDict.create_unique(n => n === 0 ? 'a' : 'b', [0, 1]).expect('')
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
