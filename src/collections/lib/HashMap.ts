import { Maybe, Some, None } from '@ts-lib/monads'

import { Items, Hashable, ItemsHolder, union_items, intersection_items, difference_items } from './common'

export class HashMap<K extends Hashable, T> implements Iterable<[K, T]> {
	protected items!: Items<[K, T]>

	static from<K extends Hashable, T>(items: [K, T][]): HashMap<K, T> {
		const s = new HashMap<K, T>()
		s.set_items(items)
		return s
	}

	set_items(items: [K, T][]): this {
		// this._size = items.length
		this.items = {}
		for (let index = 0; index < items.length; index++) {
			const [key, item] = items[index]
			const hash_key = key.to_hash()
			this.items[hash_key] = [key, item]
		}

		return this
	}

	constructor(...items: [K, T][]) {
		this.set_items(items)
	}

	// protected _size: number
	// get size() { return this._size }
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
		const hash_key = key.to_hash()
		return hash_key in this.items
	}

	get(key: K): Maybe<T> {
		const hash_key = key.to_hash()
		return hash_key in this.items
			? Some(this.items[hash_key][1])
			: None
	}

	set(key: K, item: T): this {
		const hash_key = key.to_hash()
		this.items[hash_key] = [key, item]
		return this
	}

	delete(key: K, ...rest: K[]): this {
		const keys = [key].concat(rest)

		for (let index = 0; index < keys.length; index++) {
			const key = keys[index]
			const hash_key = key.to_hash()
			delete this.items[hash_key]
		}

		return this
	}

	clear(): this {
		this.items = {}
		return this
	}



	protected static union_items<K extends Hashable, T>(items: Items<[K, T]>, others: HashMap<K, T>[]) {
		return union_items(items, others as any as ItemsHolder<[K, T]>[])
	}

	// mutating version of union
	mutate_merge(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): this {
		this.items = HashMap.union_items(this.items, [other].concat(rest))
		return this
	}

	// non-mutating
	merge(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): HashMap<K, T> {
		const items = HashMap.union_items({ ...this.items }, [other].concat(rest))
		const s = new HashMap<K, T>()
		s.items = items
		return s
	}


	protected static intersection_items<K extends Hashable, T>(items: Items<[K, T]>, others: HashMap<K, T>[]) {
		return intersection_items(items, others as any as ItemsHolder<[K, T]>[])
	}

	// in place version of intersection
	mutate_filter(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): this {
		this.items = HashMap.intersection_items(this.items, [other].concat(rest))
		return this
	}

	// non-mutating
	filter(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): HashMap<K, T> {
		const items = HashMap.intersection_items({ ...this.items }, [other].concat(rest))
		const s = new HashMap<K, T>()
		s.items = items
		return s
	}


	protected static difference_items<K extends Hashable, T>(items: Items<[K, T]>, others: HashMap<K, T>[]) {
		return difference_items(items, others as any as ItemsHolder<[K, T]>[])
	}

	// in place version of difference
	mutate_remove(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): this {
		this.items = HashMap.difference_items(this.items, [other].concat(rest))
		return this
	}

	// non-mutating
	remove(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): HashMap<K, T> {
		const items = HashMap.difference_items({ ...this.items }, [other].concat(rest))
		const s = new HashMap<K, T>()
		s.items = items
		return s
	}


	protected static defaults_items<K extends Hashable, T>(items: Items<[K, T]>, others: HashMap<K, T>[]) {
		for (let index = 0; index < others.length; index++) {
			const other = others[index]
			for (const hash_key in other.items) {
				if (!(hash_key in items))
					items[hash_key] = other.items[hash_key]
			}
		}

		return items
	}

	mutate_defaults(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): this {
		this.items = HashMap.defaults_items(this.items, [other].concat(rest))
		return this
	}

	defaults(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): HashMap<K, T> {
		const items = HashMap.defaults_items({ ...this.items }, [other].concat(rest))
		const s = new HashMap<K, T>()
		s.items = items
		return s
	}
}
