import 'mocha'
import { expect } from 'chai'

import { tuple as t } from '@ts-actually-safe/types'

import { Hashable } from './common'
import { HashSet } from './HashSet'

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
	zero_key,
	one_key,
	two_key,
]


describe('HashSet', () => {
	it('empty', () => {
		const s = new HashSet<Key>()
		expect(s.size).equal(0)
		expect(s.has(zero_key)).false
		expect(s.has(one_key)).false
		expect(s.has(two_key)).false

		const f = HashSet.from<Key>([])
		expect(f.size).equal(0)
		expect(f.has(zero_key)).false
		expect(f.has(one_key)).false
		expect(f.has(two_key)).false
	})

	it('full', () => {
		const s = new HashSet(...initial_items)
		expect(s.size).equal(3)
		expect(s.has(zero_key)).true
		expect(s.has(one_key)).true
		expect(s.has(two_key)).true

		const f = HashSet.from(initial_items)
		expect(f.size).equal(3)
		expect(f.has(zero_key)).true
		expect(f.has(one_key)).true
		expect(f.has(two_key)).true

		const e = new HashSet<Key>()
		e.set_items(initial_items)
		expect(e.size).equal(3)
		expect(e.has(zero_key)).true
		expect(e.has(one_key)).true
		expect(e.has(two_key)).true
	})

	it('iterable', () => {
		const s = HashSet.from(initial_items)
		const a: typeof initial_items = []
		for (const item of s) {
			a.push(item)
		}

		expect(a).deep.members(initial_items)
	})

	it('values', () => {
		const s = HashSet.from(initial_items)
		expect(s.values()).deep.members(initial_items)
	})

	it('add', () => {
		const s = HashSet.from(initial_items)

		s.add(zero_key)
		expect(s.has(zero_key)).true
		s.add(one_key)
		expect(s.has(one_key)).true
		s.add(two_key)
		expect(s.has(two_key)).true
	})

	it('delete', () => {
		const s = HashSet.from(initial_items)

		s.delete(zero_key)
		expect(s.has(zero_key)).false
		s.delete(one_key)
		expect(s.has(one_key)).false
		s.delete(two_key)
		expect(s.has(two_key)).false
	})

	it('clear', () => {
		const s = HashSet.from(initial_items)
		s.clear()
		expect(s.has(zero_key)).false
		expect(s.has(one_key)).false
		expect(s.has(two_key)).false
	})


	it('mutate_union', () => {
		const s = new HashSet<Key>()
			.mutate_union(new HashSet(zero_key))

		expect(s.has(zero_key)).true
		expect(s.has(one_key)).false
		expect(s.has(two_key)).false

		const o = new HashSet<Key>()
			.mutate_union(new HashSet(zero_key), new HashSet(zero_key, one_key))

		expect(o.has(zero_key)).true
		expect(o.has(one_key)).true
		expect(o.has(two_key)).false
	})

	it('union', () => {
		const a = new HashSet(zero_key)
		const b = new HashSet(zero_key, one_key)
		const c = new HashSet(zero_key, two_key)
		const u = a.union(b, c)

		expect(a.has(zero_key)).true
		expect(a.has(one_key)).false
		expect(a.has(two_key)).false

		expect(b.has(zero_key)).true
		expect(b.has(one_key)).true
		expect(b.has(two_key)).false

		expect(c.has(zero_key)).true
		expect(c.has(one_key)).false
		expect(c.has(two_key)).true

		expect(u.has(zero_key)).true
		expect(u.has(one_key)).true
		expect(u.has(two_key)).true
	})


	it('mutate_intersection', () => {
		const s = new HashSet<Key>(zero_key)
			.mutate_intersection(new HashSet(zero_key, one_key))

		expect(s.has(zero_key)).true
		expect(s.has(one_key)).false
		expect(s.has(two_key)).false

		const o = new HashSet<Key>(zero_key)
			.mutate_intersection(new HashSet(zero_key), new HashSet(zero_key, one_key))

		expect(o.has(zero_key)).true
		expect(o.has(one_key)).false
		expect(o.has(two_key)).false
	})

	it('intersection', () => {
		const a = new HashSet(zero_key)
		const b = new HashSet(zero_key, one_key)
		const c = new HashSet(zero_key, two_key)
		const u = a.intersection(b, c)

		expect(a.has(zero_key)).true
		expect(a.has(one_key)).false
		expect(a.has(two_key)).false

		expect(b.has(zero_key)).true
		expect(b.has(one_key)).true
		expect(b.has(two_key)).false

		expect(c.has(zero_key)).true
		expect(c.has(one_key)).false
		expect(c.has(two_key)).true

		expect(u.has(zero_key)).true
		expect(u.has(one_key)).false
		expect(u.has(two_key)).false
	})


	it('mutate_difference', () => {
		const s = HashSet
			.from(initial_items)
			.mutate_difference(new HashSet(zero_key))

		expect(s.has(zero_key)).false
		expect(s.has(one_key)).true
		expect(s.has(two_key)).true

		const o = HashSet
			.from(initial_items)
			.mutate_difference(new HashSet(zero_key), new HashSet(zero_key, one_key))

		expect(o.has(zero_key)).false
		expect(o.has(one_key)).false
		expect(o.has(two_key)).true
	})

	it('difference', () => {
		const a = HashSet.from(initial_items)
		const b = new HashSet(one_key)
		const c = new HashSet(two_key)
		const u = a.difference(b, c)

		expect(a.has(zero_key)).true
		expect(a.has(one_key)).true
		expect(a.has(two_key)).true

		expect(b.has(zero_key)).false
		expect(b.has(one_key)).true
		expect(b.has(two_key)).false

		expect(c.has(zero_key)).false
		expect(c.has(one_key)).false
		expect(c.has(two_key)).true

		expect(u.has(zero_key)).true
		expect(u.has(one_key)).false
		expect(u.has(two_key)).false
	})
})
