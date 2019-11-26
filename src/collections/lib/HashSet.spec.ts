import 'mocha'
import { expect } from 'chai'
import { tuple as t } from '@ts-std/types'

import { Hashable } from './common'
import { HashSet } from './HashSet'

type Key = { id: number }
const zero_key: Key = { id: 1 }
const one_key: Key = { id: 2 }
const two_key: Key = { id: 3 }
const key_hash = 'id' as const
const initial_items = [
	zero_key,
	one_key,
	two_key,
]

describe('HashSet', () => {
	it('empty', () => {
		const s = HashSet<Key>(key_hash)
		expect(s.size).equal(0)
		expect(s.has(zero_key)).false
		expect(s.has(one_key)).false
		expect(s.has(two_key)).false

		const f = HashSet.from<Key>(key_hash, [])
		expect(f.size).equal(0)
		expect(f.has(zero_key)).false
		expect(f.has(one_key)).false
		expect(f.has(two_key)).false
	})

	it('full', () => {
		const s = HashSet(key_hash, ...initial_items)
		expect(s.size).equal(3)
		expect(s.has(zero_key)).true
		expect(s.has(one_key)).true
		expect(s.has(two_key)).true

		const f = HashSet.from(key_hash, initial_items)
		expect(f.size).equal(3)
		expect(f.has(zero_key)).true
		expect(f.has(one_key)).true
		expect(f.has(two_key)).true

		const e = HashSet<Key>(key_hash)
		e.set_items(initial_items)
		expect(e.size).equal(3)
		expect(e.has(zero_key)).true
		expect(e.has(one_key)).true
		expect(e.has(two_key)).true
	})

	it('equatable', () => {
		const s = HashSet(key_hash, ...initial_items)
		expect(s.equal(s)).true
		const f = HashSet.from(key_hash, initial_items)
		expect(f.equal(f)).true

		expect(s.equal(f)).true
		const e = HashSet<Key>(key_hash)

		expect(s.equal(e)).false
		expect(e.equal(s)).false
		expect(s.equal(f)).true
		expect(f.equal(s)).true

		const a = HashSet.of_numbers(1, 2, 3)
		const b = HashSet.of_numbers(3, 2, 1)
		expect(a.equal(b)).true
		expect(b.equal(a)).true

		const c = HashSet.of_numbers(3, 2)
		expect(a.equal(c)).false
		expect(b.equal(c)).false
		expect(c.equal(a)).false
		expect(c.equal(b)).false

		const d = HashSet.of_numbers(2)
		expect(a.equal(d)).false
		expect(b.equal(d)).false
		expect(d.equal(a)).false
		expect(d.equal(b)).false
	})

	it('iterable', () => {
		const s = HashSet.from(key_hash, initial_items)
		const a: typeof initial_items = []
		for (const item of s) {
			a.push(item)
		}

		expect(a).deep.members(initial_items)
	})

	it('values', () => {
		const s = HashSet.from(key_hash, initial_items)
		expect(s.values()).deep.members(initial_items)
	})

	it('add', () => {
		const s = HashSet.from(key_hash, initial_items)

		s.add(zero_key)
		expect(s.has(zero_key)).true
		s.add(one_key)
		expect(s.has(one_key)).true
		s.add(two_key)
		expect(s.has(two_key)).true
	})

	it('delete', () => {
		const s = HashSet.from(key_hash, initial_items)

		s.delete(zero_key)
		expect(s.has(zero_key)).false
		s.delete(one_key)
		expect(s.has(one_key)).false
		s.delete(two_key)
		expect(s.has(two_key)).false
	})

	it('clear', () => {
		const s = HashSet.from(key_hash, initial_items)
		s.clear()
		expect(s.has(zero_key)).false
		expect(s.has(one_key)).false
		expect(s.has(two_key)).false
	})


	it('mutate_union', () => {
		const s = HashSet<Key>(key_hash)
			.mutate_union(HashSet(key_hash, zero_key))

		expect(s.has(zero_key)).true
		expect(s.has(one_key)).false
		expect(s.has(two_key)).false

		const o = HashSet<Key>(key_hash)
			.mutate_union(HashSet(key_hash, zero_key), HashSet(key_hash, zero_key, one_key))

		expect(o.has(zero_key)).true
		expect(o.has(one_key)).true
		expect(o.has(two_key)).false
	})

	it('union', () => {
		const a = HashSet(key_hash, zero_key)
		const b = HashSet(key_hash, zero_key, one_key)
		const c = HashSet(key_hash, zero_key, two_key)
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
		const s = HashSet<Key>(key_hash, zero_key)
			.mutate_intersection(HashSet(key_hash, zero_key, one_key))

		expect(s.has(zero_key)).true
		expect(s.has(one_key)).false
		expect(s.has(two_key)).false

		const o = HashSet<Key>(key_hash, zero_key)
			.mutate_intersection(HashSet(key_hash, zero_key), HashSet(key_hash, zero_key, one_key))

		expect(o.has(zero_key)).true
		expect(o.has(one_key)).false
		expect(o.has(two_key)).false
	})

	it('intersection', () => {
		const a = HashSet(key_hash, zero_key)
		const b = HashSet(key_hash, zero_key, one_key)
		const c = HashSet(key_hash, zero_key, two_key)
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
			.from(key_hash, initial_items)
			.mutate_difference(HashSet(key_hash, zero_key))

		expect(s.has(zero_key)).false
		expect(s.has(one_key)).true
		expect(s.has(two_key)).true

		const o = HashSet
			.from(key_hash, initial_items)
			.mutate_difference(HashSet(key_hash, zero_key), HashSet(key_hash, zero_key, one_key))

		expect(o.has(zero_key)).false
		expect(o.has(one_key)).false
		expect(o.has(two_key)).true
	})

	it('difference', () => {
		const a = HashSet.from(key_hash, initial_items)
		const b = HashSet(key_hash, one_key)
		const c = HashSet(key_hash, two_key)
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

describe('Hashable implementation', () => {
	class Thing implements Hashable {
		constructor(readonly id: number) {}
		to_hash() { return this.id }
	}

	it('works', () => {
		const items = [new Thing(1), new Thing(2), new Thing(3)]
		const a = HashSet.from_hashable(items)
		expect(a.values()).deep.members(items)
	})
})

describe('string implementation', () => {
	it('works', () => {
		const a = HashSet.of_strings('a', 'b', 'c', 'd', 'a')
		expect(a.values()).members(['a', 'b', 'c', 'd'])
	})
})

describe('number implementation', () => {
	it('works', () => {
		const a = HashSet.of_numbers(1, 2, 3, 4, 1)
		expect(a.values()).members([1, 2, 3, 4])
	})
})
