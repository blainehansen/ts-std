export interface Hashable {
	to_hash(): number
}

export abstract class HashWrapper<T> implements Hashable {
	constructor(readonly value: T) {}

	abstract to_hash(): number
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
