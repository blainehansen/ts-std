import 'mocha'
import { expect } from 'chai'

import { tuple as t } from '@ts-actually-safe/types'
import { Result, Ok, Err, Maybe, Some, None } from '@ts-actually-safe/monads'

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

	it('update', () => {
		const s = HashMap
			.from(initial_items)
			.update(new HashMap([zero_key, 9]))

		expect(s.get(zero_key)).eql(Some(9))
		expect(s.get(one_key)).eql(Some(1))
		expect(s.get(two_key)).eql(Some(2))

		const o = HashMap
			.from(initial_items)
			.update(new HashMap([zero_key, 9]), new HashMap([zero_key, 999], [one_key, 99]))

		expect(o.get(zero_key)).eql(Some(999))
		expect(o.get(one_key)).eql(Some(99))
		expect(o.get(two_key)).eql(Some(2))
	})

	it('subtract', () => {
		const s = HashMap
			.from(initial_items)
			.subtract(new HashMap([zero_key, 9]))

		expect(s.get(zero_key)).eql(None)
		expect(s.get(one_key)).eql(Some(1))
		expect(s.get(two_key)).eql(Some(2))

		const o = HashMap
			.from(initial_items)
			.subtract(new HashMap([zero_key, 9]), new HashMap([zero_key, 999], [one_key, 99]))

		expect(o.get(zero_key)).eql(None)
		expect(o.get(one_key)).eql(None)
		expect(o.get(two_key)).eql(Some(2))
	})
})
