import { Maybe, Some, None } from '@ts-actually-safe/monads'

import { Hashable } from './common'

export class HashMap<K extends Hashable, T> implements Iterable<[K, T]> {
	protected items!: { [hash_key: number]: [K, T] }

	static from<K extends Hashable, T>(items: [K, T][]): HashMap<K, T> {
		const s = new HashMap<K, T>()
		s.set_items(items)
		return s
	}

	set_items(items: [K, T][]): this {
		// this._size = items.length
		this.items = {}
		for (let index = items.length - 1; index >= 0; index--) {
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
		for (let index = entries.length - 1; index >= 0; index--) {
			yield entries[index]
		}
		// const values =
		// let index = 0
		// return {
		// 	next: function() {
		// 		return {
		// 			done: values,
		// 			value: ,
		// 		}
		// 	}.bind(this)
		// }
	}

	entries() {
		return Object.values(this.items)
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

		for (let index = keys.length - 1; index >= 0; index--) {
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

	update(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): this {
		const others = [other].concat(rest)

		for (let index = 0; index < others.length; index++) {
			const other = others[index]
			this.items = { ...this.items, ...other.items }
		}

		return this
	}

	subtract(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): this {
		const others = [other].concat(rest)

		for (let index = 0; index < others.length; index++) {
			const other = others[index]
			for (const hash_key in other.items) {
				delete this.items[hash_key]
			}
		}

		return this
	}
}
