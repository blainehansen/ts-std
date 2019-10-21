import 'mocha'
import { expect } from 'chai'

import { tuple as t } from '@ts-std/types'
import { Result, Ok, Err, Maybe, Some, None } from '@ts-std/monads'

import { Hashable } from './common'
import { HashMap } from './HashMap'

class Key implements Hashable {
	constructor(readonly s: string) {}

	to_hash() {
		return this.s.length % 3
	}
}

const zero_key = new Key('')
const one_key = new Key('|')
const two_key = new Key('||')

const initial_items = [
	t(zero_key, 0),
	t(one_key, 1),
	t(two_key, 2),
]

describe('HashMap', () => {
	it('empty', () => {
		const s = new HashMap<Key, number>()
		expect(s.size).equal(0)
		expect(s.has(zero_key)).false
		expect(s.has(one_key)).false
		expect(s.has(two_key)).false

		const f = HashMap.from<Key, number>([])
		expect(f.size).equal(0)
		expect(f.has(zero_key)).false
		expect(f.has(one_key)).false
		expect(f.has(two_key)).false
	})

	it('full', () => {
		const s = new HashMap(...initial_items)
		expect(s.size).equal(3)
		expect(s.has(zero_key)).true
		expect(s.has(one_key)).true
		expect(s.has(two_key)).true

		const f = HashMap.from(initial_items)
		expect(f.size).equal(3)
		expect(f.has(zero_key)).true
		expect(f.has(one_key)).true
		expect(f.has(two_key)).true

		const e = new HashMap<Key, number>()
		e.set_items(initial_items)
		expect(e.size).equal(3)
		expect(e.has(zero_key)).true
		expect(e.has(one_key)).true
		expect(e.has(two_key)).true
	})

	it('iterable', () => {
		const s = HashMap.from(initial_items)
		const a: typeof initial_items = []
		for (const item of s) {
			a.push(item)
		}

		expect(a).deep.members(initial_items)
	})

	it('entries', () => {
		const s = HashMap.from(initial_items)
		expect(s.entries()).deep.members(initial_items)
	})

	it('get', () => {
		const s = HashMap.from(initial_items)
		expect(s.get(zero_key)).eql(Some(0))
		expect(s.get(one_key)).eql(Some(1))
		expect(s.get(two_key)).eql(Some(2))
	})

	it('set', () => {
		const s = HashMap.from(initial_items)

		s.set(zero_key, 9)
		expect(s.get(zero_key)).eql(Some(9))
		expect(s.has(zero_key)).true
		s.set(one_key, 99)
		expect(s.get(one_key)).eql(Some(99))
		expect(s.has(one_key)).true
		s.set(two_key, 999)
		expect(s.get(two_key)).eql(Some(999))
		expect(s.has(two_key)).true
	})

	it('delete', () => {
		const s = HashMap.from(initial_items)

		s.delete(zero_key)
		expect(s.get(zero_key)).eql(None)
		expect(s.has(zero_key)).false
		s.delete(one_key)
		expect(s.get(one_key)).eql(None)
		expect(s.has(one_key)).false
		s.delete(two_key)
		expect(s.get(two_key)).eql(None)
		expect(s.has(two_key)).false
	})

	it('clear', () => {
		const s = HashMap.from(initial_items)
		s.clear()
		expect(s.get(zero_key)).eql(None)
		expect(s.get(one_key)).eql(None)
		expect(s.get(two_key)).eql(None)

		expect(s.has(zero_key)).false
		expect(s.has(one_key)).false
		expect(s.has(two_key)).false
	})


	it('mutate_merge', () => {
		const s = HashMap
			.from(initial_items)
			.mutate_merge(new HashMap([zero_key, 9]))

		expect(s.get(zero_key)).eql(Some(9))
		expect(s.get(one_key)).eql(Some(1))
		expect(s.get(two_key)).eql(Some(2))

		const o = HashMap
			.from(initial_items)
			.mutate_merge(new HashMap([zero_key, 9]), new HashMap([zero_key, 999], [one_key, 99]))

		expect(o.get(zero_key)).eql(Some(999))
		expect(o.get(one_key)).eql(Some(99))
		expect(o.get(two_key)).eql(Some(2))
	})

	it('merge', () => {
		const a = new HashMap([zero_key, 9])
		const b = new HashMap([zero_key, 99], [one_key, 1])
		const c = new HashMap([zero_key, 999], [two_key, 2])
		const u = a.merge(b, c)

		expect(a.get(zero_key)).eql(Some(9))
		expect(a.get(one_key)).eql(None)
		expect(a.get(two_key)).eql(None)

		expect(b.get(zero_key)).eql(Some(99))
		expect(b.get(one_key)).eql(Some(1))
		expect(b.get(two_key)).eql(None)

		expect(c.get(zero_key)).eql(Some(999))
		expect(c.get(one_key)).eql(None)
		expect(c.get(two_key)).eql(Some(2))

		expect(u.get(zero_key)).eql(Some(999))
		expect(u.get(one_key)).eql(Some(1))
		expect(u.get(two_key)).eql(Some(2))
	})



	it('mutate_filter', () => {
		const s = new HashMap([zero_key, 9])
			.mutate_filter(new HashMap([zero_key, 99], [one_key, 1]))

		expect(s.get(zero_key)).eql(Some(9))
		expect(s.get(one_key)).eql(None)
		expect(s.get(two_key)).eql(None)

		const o = new HashMap([zero_key, 9], [two_key, 2])
			.mutate_filter(new HashMap([zero_key, 99]), new HashMap([zero_key, 999], [one_key, 1]))

		expect(o.get(zero_key)).eql(Some(9))
		expect(o.get(one_key)).eql(None)
		expect(o.get(two_key)).eql(None)
	})

	it('filter', () => {
		const a = new HashMap([zero_key, 9])
		const b = new HashMap([zero_key, 99], [one_key, 1])
		const c = new HashMap([zero_key, 999], [two_key, 2])
		const u = a.filter(b, c)

		expect(a.get(zero_key)).eql(Some(9))
		expect(a.get(one_key)).eql(None)
		expect(a.get(two_key)).eql(None)

		expect(b.get(zero_key)).eql(Some(99))
		expect(b.get(one_key)).eql(Some(1))
		expect(b.get(two_key)).eql(None)

		expect(c.get(zero_key)).eql(Some(999))
		expect(c.get(one_key)).eql(None)
		expect(c.get(two_key)).eql(Some(2))

		expect(u.get(zero_key)).eql(Some(9))
		expect(u.get(one_key)).eql(None)
		expect(u.get(two_key)).eql(None)
	})


	it('mutate_remove', () => {
		const s = HashMap
			.from(initial_items)
			.mutate_remove(new HashMap([zero_key, 9]))

		expect(s.get(zero_key)).eql(None)
		expect(s.get(one_key)).eql(Some(1))
		expect(s.get(two_key)).eql(Some(2))

		const o = HashMap
			.from(initial_items)
			.mutate_remove(new HashMap([zero_key, 9]), new HashMap([zero_key, 999], [one_key, 99]))

		expect(o.get(zero_key)).eql(None)
		expect(o.get(one_key)).eql(None)
		expect(o.get(two_key)).eql(Some(2))
	})

	it('remove', () => {
		const a = HashMap.from(initial_items)
		const b = new HashMap([one_key, 9])
		const c = new HashMap([two_key, 9])
		const u = a.remove(b, c)

		expect(a.get(zero_key)).eql(Some(0))
		expect(a.get(one_key)).eql(Some(1))
		expect(a.get(two_key)).eql(Some(2))

		expect(b.get(zero_key)).eql(None)
		expect(b.get(one_key)).eql(Some(9))
		expect(b.get(two_key)).eql(None)

		expect(c.get(zero_key)).eql(None)
		expect(c.get(one_key)).eql(None)
		expect(c.get(two_key)).eql(Some(9))

		expect(u.get(zero_key)).eql(Some(0))
		expect(u.get(one_key)).eql(None)
		expect(u.get(two_key)).eql(None)
	})


	it('mutate_defaults', () => {
		const s = new HashMap([zero_key, 0])
			.mutate_defaults(new HashMap([zero_key, 9], [one_key, 1]))

		expect(s.get(zero_key)).eql(Some(0))
		expect(s.get(one_key)).eql(Some(1))
		expect(s.get(two_key)).eql(None)

		const o = new HashMap([zero_key, 0])
			.mutate_defaults(new HashMap([one_key, 1]), new HashMap([zero_key, 999], [one_key, 99]))

		expect(o.get(zero_key)).eql(Some(0))
		expect(o.get(one_key)).eql(Some(1))
		expect(o.get(two_key)).eql(None)
	})

	it('defaults', () => {
		const a = new HashMap([zero_key, 9])
		const b = new HashMap([zero_key, 99], [one_key, 1])
		const c = new HashMap([zero_key, 999], [two_key, 2])
		const u = a.defaults(b, c)

		expect(a.get(zero_key)).eql(Some(9))
		expect(a.get(one_key)).eql(None)
		expect(a.get(two_key)).eql(None)

		expect(b.get(zero_key)).eql(Some(99))
		expect(b.get(one_key)).eql(Some(1))
		expect(b.get(two_key)).eql(None)

		expect(c.get(zero_key)).eql(Some(999))
		expect(c.get(one_key)).eql(None)
		expect(c.get(two_key)).eql(Some(2))

		expect(u.get(zero_key)).eql(Some(9))
		expect(u.get(one_key)).eql(Some(1))
		expect(u.get(two_key)).eql(Some(2))
	})
})
