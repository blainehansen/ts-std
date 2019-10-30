import { KeysOfType, Dict, tuple as t } from '@ts-std/types'
import { Result, Ok, Err, Maybe, Some, None } from '@ts-std/monads'

import { Indexable } from './common'

export type MapFunc<T, U> = (element: T, index: number, array: T[]) => U

export type Unzip<L extends any[]> = { [K in keyof L]: L[K][] }

export type ValueProducer<T, U> = KeysOfType<T, U> | MapFunc<T, U>

declare global {
	interface Array<T> {
		sum(this: number[]): number
		sum(this: T[], key: ValueProducer<T, number>): number

		filter_map<U>(fn: MapFunc<T, U | undefined>): U[]

		maybe_find(fn: MapFunc<T, boolean>): Maybe<T>

		index_by(
			arg: ValueProducer<T, Indexable>
		): Dict<T>
		unique_index_by(
			arg: ValueProducer<T, Indexable>
		): Result<Dict<T>, [string, T, T]>

		entries_to_dict<T>(this: [string, T][]): Dict<T>
		unique_entries_to_dict<T>(this: [string, T][]): Result<Dict<T>, [string, T, T]>

		unzip<L extends any[]>(this: L[]): Maybe<Unzip<L>>


		sort_by<T extends number | string>(this: T[]): T[]
		sort_by(this: T[], key: ValueProducer<T, number | string>): T[]
		// mutate_sort_by(this: T[], key: ValueProducer<T, number | string>): T[]
	}

	interface ArrayConstructor {
		zip_lenient<L extends any[]>(...arrays: Unzip<L>): L[]
		zip_equal<L extends any[]>(...arrays: Unzip<L>): Result<L[], [number, number]>
	}
}


function make_key_accessor<T, U>(
	arg: KeysOfType<T, U> | MapFunc<T, U>,
): MapFunc<T, U> {
	return typeof arg === 'function'
		? arg
		: ((v: T) => v[arg as any as keyof T] as any as U) as MapFunc<T, U>
}


function sum(this: number[]): number
function sum<T>(this: T[], key: ValueProducer<T, number>): number
function sum<T>(this: T[], key?: ValueProducer<T, number>): number {
	const to_number =
		key === undefined ? (v: T) => v as any as number
		: make_key_accessor<T, number>(key)

	let sum = 0
	for (let index = 0; index < this.length; index++) {
		sum += to_number(this[index], index, this)
	}

	return sum
}
Array.prototype.sum = sum

Array.prototype.filter_map = function<T, U>(
	this: T[],
	fn: MapFunc<T, U | undefined>,
): U[] {
	const give = [] as U[]
	for (let index = 0; index < this.length; index++) {
		const element = this[index]
		const mapped = fn(element, index, this)
		if (mapped !== undefined)
			give.push(mapped)
	}

	return give
}

Array.prototype.maybe_find = function<T>(this: T[], fn: MapFunc<T, boolean>) {
	for (let index = 0; index < this.length; index++) {
		const element = this[index]
		if (fn(element, index, this))
			return Some(element)
	}
	return None
}


Array.prototype.index_by = function<T>(
	this: T[],
	arg: ValueProducer<T, Indexable>,
): Dict<T> {
	const to_key = make_key_accessor<T, Indexable>(arg)

	const indexed = {} as Dict<T>
	for (let index = 0; index < this.length; index++) {
		const element = this[index]
		const key = to_key(element, index, this)

		indexed['' + key] = element
	}

	return indexed
}

Array.prototype.unique_index_by = function<T>(
	this: T[],
	arg: ValueProducer<T, Indexable>,
): Result<Dict<T>, [string, T, T]> {
	const to_key = make_key_accessor<T, Indexable>(arg)

	const indexed = {} as Dict<T>
	for (let index = 0; index < this.length; index++) {
		const element = this[index]
		const key = to_key(element, index, this)

		const final_key = '' + key
		if (final_key in indexed)
			return Err([final_key, element, indexed[final_key]])

		indexed[final_key] = element
	}

	return Ok(indexed)
}


Array.prototype.entries_to_dict = function<T>(
	this: [string, T][],
): Dict<T> {
	const indexed = {} as Dict<T>
	for (let index = 0; index < this.length; index++) {
		const [key, element] = this[index]
		indexed[key] = element
	}

	return indexed
}
Array.prototype.unique_entries_to_dict = function<T>(
	this: [string, T][],
): Result<Dict<T>, [string, T, T]> {
	const indexed = {} as Dict<T>
	for (let index = 0; index < this.length; index++) {
		const [key, element] = this[index]
		if (key in indexed)
			return Err(t(key, element, indexed[key]))
		indexed[key] = element
	}

	return Ok(indexed)
}


Array.prototype.unzip = function<L extends any[]>(this: L[]): Maybe<Unzip<L>> {
	const first_element = this[0]
	if (first_element === undefined) return None

	const tup_length = first_element.length
	const give = Array.from({ length: tup_length }, () => []) as any as Unzip<L>
	for (const tup of this) {
		for (let tup_index = 0; tup_index < tup_length; tup_index++) {
			give[tup_index].push(tup[tup_index])
		}
	}

	return Some(give)
}

function sort_by<T extends number | string>(this: T[], order: 'asc' | 'desc' = 'asc'): T[]
function sort_by(this: T[], key: ValueProducer<T, number | string>): T[]
function sort_by(this: T[], key?: ValueProducer<T, number | string>): T[] {
	const give = this.slice()
}
Array.prototype.sort_by = sort_by

Array.zip_lenient = function<L extends any[]>(...arrays: Unzip<L>): L[] {
	let give_length
	for (let index = 0; index < arrays.length; index++) {
		const cur_length = arrays[index].length
		give_length = give_length === undefined
			? cur_length
			: Math.min(give_length, cur_length)
	}

	give_length = give_length || 0

	const give = [] as L[]
	for (let index = 0; index < give_length; index++) {
		give.push(arrays.map(a => a[index]) as L)
	}

	return give
}

Array.zip_equal = function<L extends any[]>(...arrays: Unzip<L>): Result<L[], [number, number]> {
	let all_lengths: number | undefined
	for (const array of arrays) {
		if (all_lengths === undefined)
			all_lengths = array.length
		else if (array.length !== all_lengths)
			return Err([all_lengths, array.length])
	}

	const length = all_lengths || 0

	const give = [] as L[]
	for (let index = 0; index < length; index++) {
		give.push(arrays.map(a => a[index]) as L)
	}

	return Ok(give)
}
