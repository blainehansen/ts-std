import { Hashable } from './common'

export class HashSet<T extends Hashable> implements Iterable<T> {
	protected items: { [hash_key: number]: T }

	static from(items: T[]): HashSet<T> {
		const s = new HashSet()
		s.set_items(items)
		return s
	}

	set_items(items: T[]): this {
		// this._size = items.length
		this.items = {}
		for (let index = items.length - 1; index >= 0; index--) {
			const item = items[index]
			const hash_key = item.to_hash()
			this.items[hash_key] = item
		}

		return this
	}

	constructor(...items: T[]) {
		this.set_items(items)
	}

	// protected _size: number
	// get size() { return this._size }
	get size() { return Object.keys(this.items).length }

	*[Symbol.iterator]() {
		for (const value of Object.values(this.items)) {
			yield value
		}

		// const values = Object.values(this.items)
		// let index = 0
		// return {
		// 	next: function() {
		// 		const done = index === values.length
		// 		return { done, value: !done ? values[index++] : undefined }
		// 	}.bind(this)
		// }
	}

	values() {
		return Object.values(this.items)
	}

	has(item: T): boolean {
		const hash_key = item.to_hash()
		return hash_key in this.items
	}

	add(item: T, ...rest: T[]): this {
		const items = [item].concat(rest)

		for (let index = items.length - 1; index >= 0; index--) {
			const item = items[index]
			const hash_key = item.to_hash()
			this.items[hash_key] = item
			// this._size++
		}

		return this
	}

	delete(item: T, ...rest: T[]): this {
		const items = [item].concat(rest)

		for (let index = items.length - 1; index >= 0; index--) {
			const item = items[index]
			const hash_key = item.to_hash()
			delete this.items[hash_key]
			// this._size--
		}

		return this
	}

	clear(): this {
		this.items = {}
		// this._size = 0
		return this
	}

	// union(other: HashSet<T>): this {

	// }
}
