export interface Hashable {
	to_hash(): number
}

class HashWrapper<T> implements Hashable {
	constructor(
		readonly value: T,
		protected readonly _to_hash: (value: T) => number,
	) {}

	to_hash(): number {
		return this._to_hash(this.value)
	}
}

export function Hasher<T>(to_hash: (value: T) => number) {
	return function(value: T) {
		return new HashWrapper<T>(value, to_hash)
	}
}

export type Items<T> = { [hash_key: number]: T }

export type ItemsHolder<T> = {
	items: Items<T>
}

export function union_items<T>(items: Items<T>, others: ItemsHolder<T>[]) {
	for (let index = 0; index < others.length; index++) {
		const other = others[index]
		items = { ...items, ...other.items }
	}
	return items
}

export function intersection_items<T>(items: Items<T>, others: ItemsHolder<T>[]) {
	for (const hash_key in items) {
		let keep_key = false
		for (let index = 0; index < others.length; index++) {
			const other = others[index]
			if (hash_key in other.items) {
				keep_key = true
				break
			}
		}

		if (!keep_key)
			delete items[hash_key]
	}

	return items
}

export function difference_items<T>(items: Items<T>, others: ItemsHolder<T>[]) {
	for (let index = 0; index < others.length; index++) {
		const other = others[index]
		for (const hash_key in other.items) {
			delete items[hash_key]
		}
	}

	return items
}

// *[Symbol.iterator]() {
// 	const values = Object.values(this.items)
// 	let index = 0
// 	return {
// 		next: function() {
// 			const done = index === values.length
// 			return { done, value: !done ? values[index++] : undefined }
// 		}.bind(this)
// 	}
// }
