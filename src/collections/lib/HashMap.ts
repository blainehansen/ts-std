import { Maybe, Some, None } from '@ts-std/monads'

import {
	Items, ItemsHolder, Hashable, ValueProducer, string_to_hash, make_transformer,
	union_items, intersection_items, difference_items,
} from './common'

export function HashMap<K, T>(to_hash: ValueProducer<K, number>, ...items: [K, T][]): HashMapClass<K, T> {
	return new HashMapClass(make_transformer(to_hash), items)
}

export namespace HashMap {
	export function from<K, T>(to_hash: ValueProducer<K, number>, items: [K, T][]): HashMapClass<K, T> {
		return new HashMapClass(make_transformer(to_hash), items)
	}
	export function from_hashable<K extends Hashable, T>(items: [K, T][]) {
		return new HashMapClass(t => t.to_hash(), items)
	}
	export function of_hashable<K extends Hashable, T>(...items: [K, T][]) {
		return new HashMapClass(t => t.to_hash(), items)
	}
	export function from_numbers<T>(items: [number, T][]) {
		return new HashMapClass(n => n, items)
	}
	export function of_numbers<T>(...items: [number, T][]) {
		return new HashMapClass(n => n, items)
	}
	export function from_strings<T>(items: [string, T][]) {
		return new HashMapClass(string_to_hash, items)
	}
	export function of_strings<T>(...items: [string, T][]) {
		return new HashMapClass(string_to_hash, items)
	}
}

class HashMapClass<K, T> implements Iterable<[K, T]> {
	protected items!: Items<[K, T]>
	constructor(
		readonly to_hash: (key: K) => number,
		items: [K, T][],
	) {
		this.set_items(items)
	}

	set_items(items: [K, T][]): this {
		this.items = {}
		for (let index = 0; index < items.length; index++) {
			const [key, item] = items[index]
			const hash_key = this.to_hash(key)
			this.items[hash_key] = [key, item]
		}

		return this
	}

	get size() { return Object.keys(this.items).length }

	*[Symbol.iterator]() {
		const entries = Object.values(this.items)
		for (let index = 0; index < entries.length; index++) {
			yield entries[index]
		}
	}

	entries() {
		return Object.values(this.items)
	}

	keys() {
		return Object.values(this.items).map(([k, _]) => k)
	}

	values() {
		return Object.values(this.items).map(([_, t]) => t)
	}


	has(key: K): boolean {
		const hash_key = this.to_hash(key)
		return hash_key in this.items
	}

	get(key: K): Maybe<T> {
		const hash_key = this.to_hash(key)
		return hash_key in this.items
			? Some(this.items[hash_key][1])
			: None
	}

	set(key: K, item: T): this {
		const hash_key = this.to_hash(key)
		this.items[hash_key] = [key, item]
		return this
	}
	set_all(...entries: [K, T][]): this {
		for (let index = 0; index < entries.length; index++) {
			const entry = entries[index]
			const hash_key = this.to_hash(entry[0])
			this.items[hash_key] = entry
		}
		return this
	}

	delete(key: K): this {
		const hash_key = this.to_hash(key)
		delete this.items[hash_key]
		return this
	}
	delete_all(...keys: K[]): this {
		for (let index = 0; index < keys.length; index++) {
			const key = keys[index]
			const hash_key = this.to_hash(key)
			delete this.items[hash_key]
		}
		return this
	}

	clear(): this {
		this.items = {}
		return this
	}


	protected static union_items<K, T>(items: Items<[K, T]>, others: HashMapClass<K, T>[]) {
		return union_items(items, others as any as ItemsHolder<[K, T]>[])
	}

	// mutating version of union
	mutate_merge(other: HashMapClass<K, T>, ...rest: HashMapClass<K, T>[]): this {
		this.items = HashMapClass.union_items(this.items, [other].concat(rest))
		return this
	}

	// non-mutating
	merge(other: HashMapClass<K, T>, ...rest: HashMapClass<K, T>[]): HashMapClass<K, T> {
		const items = HashMapClass.union_items({ ...this.items }, [other].concat(rest))
		const s = new HashMapClass<K, T>(this.to_hash, [])
		s.items = items
		return s
	}


	protected static intersection_items<K, T>(items: Items<[K, T]>, others: HashMapClass<K, T>[]) {
		return intersection_items(items, others as any as ItemsHolder<[K, T]>[])
	}

	// in place version of intersection
	mutate_filter(other: HashMapClass<K, T>, ...rest: HashMapClass<K, T>[]): this {
		this.items = HashMapClass.intersection_items(this.items, [other].concat(rest))
		return this
	}

	// non-mutating
	filter(other: HashMapClass<K, T>, ...rest: HashMapClass<K, T>[]): HashMapClass<K, T> {
		const items = HashMapClass.intersection_items({ ...this.items }, [other].concat(rest))
		const s = new HashMapClass<K, T>(this.to_hash, [])
		s.items = items
		return s
	}


	protected static difference_items<K, T>(items: Items<[K, T]>, others: HashMapClass<K, T>[]) {
		return difference_items(items, others as any as ItemsHolder<[K, T]>[])
	}

	// in place version of difference
	mutate_remove(other: HashMapClass<K, T>, ...rest: HashMapClass<K, T>[]): this {
		this.items = HashMapClass.difference_items(this.items, [other].concat(rest))
		return this
	}

	// non-mutating
	remove(other: HashMapClass<K, T>, ...rest: HashMapClass<K, T>[]): HashMapClass<K, T> {
		const items = HashMapClass.difference_items({ ...this.items }, [other].concat(rest))
		const s = new HashMapClass<K, T>(this.to_hash, [])
		s.items = items
		return s
	}


	protected static defaults_items<K, T>(items: Items<[K, T]>, others: HashMapClass<K, T>[]) {
		for (let index = 0; index < others.length; index++) {
			const other = others[index]
			for (const hash_key in other.items) {
				if (!(hash_key in items))
					items[hash_key] = other.items[hash_key]
			}
		}

		return items
	}

	mutate_defaults(other: HashMapClass<K, T>, ...rest: HashMapClass<K, T>[]): this {
		this.items = HashMapClass.defaults_items(this.items, [other].concat(rest))
		return this
	}

	defaults(other: HashMapClass<K, T>, ...rest: HashMapClass<K, T>[]): HashMapClass<K, T> {
		const items = HashMapClass.defaults_items({ ...this.items }, [other].concat(rest))
		const s = new HashMapClass<K, T>(this.to_hash, [])
		s.items = items
		return s
	}
}
