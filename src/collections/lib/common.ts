import { Dict, KeysOfType } from '@ts-std/types'

type ValueTransformer<T, U> = (value: T) => U
export type ValueProducer<T, U> = KeysOfType<T, U> | ValueTransformer<T, U>
export function make_transformer<T, U>(
	arg: ValueProducer<T, U>,
): ValueTransformer<T, U> {
	return typeof arg === 'function'
		? arg
		: ((v: T) => v[arg as any as keyof T] as any as U) as ValueTransformer<T, U>
}

import xxhashjs from 'xxhashjs'
export function string_to_hash(value: string): number {
	return xxhashjs.h32(value, 0).toNumber()
}

export interface Hashable {
	to_hash(): number
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



export abstract class SpecialDict<T> {
	protected items: Dict<T> = {}

	into_array<K extends string, I extends string>(
		key_symbol: K,
		item_symbol: I
	): ({ [k in K]: string } & { [i in I]: T })[] {
		const give = [] as ({ [k in K]: string } & { [i in I]: T })[]
		for (const key in this.items) {
			const item = this.items[key]
			give.push({
				[key_symbol]: key,
				[item_symbol]: item,
			} as ({ [k in K]: string } & { [i in I]: T }))
		}

		return give
	}

	into_dict() {
		return { ...this.items }
	}

	entries() {
		return Object.entries(this.items)
	}
	keys() {
		return Object.keys(this.items)
	}
	values() {
		return Object.values(this.items)
	}
}
