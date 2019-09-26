import { tuple as t, KeysOfType, PickOfType } from '@ts-actually-safe/types'
import { Result, Ok, Err, Maybe, Some, None } from '@ts-actually-safe/monads'

type MapFunc<T, U> = (element: T, index: number, array: T[]) => U

declare global {
	interface Array<T> {
		sum(this: number[]): number
		sum(this: T[], key: KeysOfType<T, number>): number

		filter_map<U>(fn: MapFunc<T, Maybe<U>>): U[]

		maybe_find(fn: MapFunc<T, boolean>): Maybe<T>
		result_find<E>(fn: MapFunc<T, boolean>, not_found_err: E): Result<T, E>

		index_by(
			arg: KeysOfType<T, Indexable> | MapFunc<T, Indexable>
		): { [key: string]: T }

		unzip_lenient<L extends any[]>(this: L[]): {  }
	}
}
Array.prototype.sum = sum
Array.prototype.filter_map = filter_map
Array.prototype.maybe_find = maybe_find
Array.prototype.result_find = result_find
Array.prototype.index_by = index_by


function sum(this: number[]): number
function sum<T>(this: T[], key: KeysOfType<T, number>): number
function sum<T>(this: T[], key?: KeysOfType<T, number>): number {
	if (key === undefined)
		return this.reduce((acc, cur) => acc + (cur as any as number), 0)
	else
		return this.reduce((acc, cur) => acc + (cur[key] as any as number), 0)
}

function filter_map<T, U>(
	this: T[],
	fn: MapFunc<T, U | undefined>,
): U[] {
	const give = [] as U[]
	for (let index = 0; index < this.length; index++) {
		const element = this[index]
		fn(element, index, this).match({
			some: mapped => { give.push(mapped) },
			none: () => {}
		})
	}

	return give
}

function maybe_find<T>(this: T[], fn: MapFunc<T, boolean>) {
	for (let index = 0; index < this.length; index++) {
		const element = this[index]
		if (fn(element))
			return Some(element)
	}
	return None
}

function result_find<T, E>(this: T[], fn: MapFunc<T, boolean>, not_found_err: E) {
	for (let index = 0; index < this.length; index++) {
		const element = this[index]
		if (fn(element))
			return Ok(element)
	}
	return Err(not_found_err)
}

type Indexable = string | number | boolean

function index_by<T>(
	this: T[],
	arg: KeysOfType<T, Indexable> | MapFunc<T, Indexable>,
): { [key: string]: T } {
	const is_function = typeof arg === 'function'

	const r = {} as { [key: string]: T }
	for (let index = 0; index < this.length; index++) {
		const element = this[index]
		const key = is_function
			? (arg as MapFunc<T, Indexable>)(element)
			: arg as KeysOfType<T, Indexable>

		r['' + key] = element
	}

	return r
}


const a: number = [1, 1, 1].sum()
const b: number = [{ a: 1, b: true }, { a: 1, b: true }, { a: 1, b: true }].sum('a')
const b: number = [t(1, 'a'), t(1, 'a'), t(1, 'a')].sum('0')
console.log(a)
console.log(b)

const thing = {
	a: 's', b: 4, c: '5', d: { complex: 4 }
}

console.log(index_by<[string, { val: number }]>(
	'0',
		['stuff', { val: 5 }], ['other', { val: 5 }],
	// { name: 'stuff', value: 5 }, { name: 'other', value: 6 }
))




// perhaps put this on an object extension?
// export function get_in(obj: object | undefined | null, key: string): Maybe<any> {
// 	const value = key.split(".").reduce((o, x) => (o === null || o === undefined ? o : (o as any)[x]), obj)
// 	return Some(value)
// }






// type Box<T> = { v: T }

// type Unbox<T> = {
// 	0: T extends Box<infer U> ? Unbox<U> : never,
// 	1: T,
// }[
// 	T extends Box<unknown>
// 		? 0
// 		: 1
// ]

// function is_box(box: any): box is Box<any> {
// 	return 'v' in box
// }

// function flatten<B extends Box<any>>(box: B): Unbox<B> {
// 	let current_box = box
// 	while (is_box(current_box)) {
// 		current_box = current_box.v
// 	}

// 	return current_box as Unbox<B>
// }

// const a = flatten({ v: { v: { v: { v: 5 } } } })
