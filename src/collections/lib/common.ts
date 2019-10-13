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
