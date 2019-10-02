import { Maybe, Some, None } from '@ts-actually-safe/monads'
import { Hashable } from './common'

export class HashSet<K extends Hashable, T> {
	protected items: { [hash_key: number]: T } = {}

	constructor(items?: { [hash_key: number]: T } | [number, T][]) {
		if (items !== undefined) {
			if (Array.isArray(items)) {
				const obj = {} as { [hash_key: number]: T }
				for (const [hash_key, item] of items) {
					obj[hash_key] = item
				}

				this.items = obj
			}
			else
				this.items = items
		}
	}

	set(key: K, item: T): void {
		const hash_key = item.to_hash()
		this.items[hash_key] = item
	}

	get(key: K): Maybe<T> {
		const hash_key = item.to_hash()
		return hash_key in this.items
			? Some(this.items[hash_key])
			: None
	}
}
