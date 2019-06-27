const ResultType = {
	Ok: Symbol('Result === Ok'),
	Err: Symbol('Result === Err'),
}

export interface Match<T, E, U> {
	ok: (val: T) => U,
	err: (val: E) => U,
}

class ResultPanic extends Error {}

export interface Result<T, E> {
	type: symbol,
	is_ok(): boolean,
	is_err(): boolean,
	ok(): T | undefined,
	err(): E | undefined,
	unwrap(): T,
	unwrap_or(optb: T): T,
	unwrap_err(): E,
	match<U>(fn: Match<T, E, U>): U,
	change<U>(fn: (val: T) => U): Result<U, E>,
	change_err<U>(fn: (err: E) => U): Result<T, U>,
	and_then<U>(fn: (val: T) => Result<U, E>): Result<U, E>,
}

class ResOk<T, E> implements Result<T, E> {
	readonly type = ResultType.Ok
	constructor(private value: T) {}

	is_ok(): boolean {
		return true
	}
	is_err(): boolean {
		return false
	}
	ok(): T | undefined {
		return this.value
	}
	err(): E | undefined {
		return undefined
	}
	unwrap(): T {
		return this.value
	}
	unwrap_or(_optb: T): T {
		return this.value
	}
	unwrap_err(): E {
		throw new ResultPanic('Cannot unwrap Err value of Result.Ok')
	}
	match<U>(fn: Match<T, E, U>): U {
		return fn.ok(this.value)
	}
	change<U>(fn: (value: T) => U): ResOk<U, E> {
		return Ok(fn(this.value))
	}
	change_err<U>(_fn: (err: E) => U): ResOk<T, U> {
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		return this as any as ResOk<T, U>
	}
	and_then<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
		return fn(this.value)
	}
}


export function Ok<T, E>(val: T): ResOk<T, E> {
	return new ResOk(val)
}


class ResErr<T, E> implements Result<T, E> {
	readonly type = ResultType.Err
	constructor(private error: E) {}

	is_ok(): boolean {
		return false
	}
	is_err(): boolean {
		return true
	}
	ok(): T | undefined {
		return undefined
	}
	err(): E | undefined {
		return this.error
	}
	unwrap(): T {
		throw new ResultPanic('Cannot unwrap Ok value of Result.Err')
	}
	unwrap_or(optb: T): T {
		return optb
	}
	unwrap_err(): E {
		return this.error
	}
	match<U>(fn: Match<T, E, U>): U {
		return fn.err(this.error)
	}
	change<U>(_fn: (_val: T) => U): ResErr<U, E> {
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		return this as any as ResErr<U, E>
	}
	change_err<U>(fn: (err: E) => U): ResErr<T, U> {
		return Err(fn(this.error))
	}
	and_then<U>(_fn: (val: T) => Result<U, E>): ResErr<U, E> {
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		return this as any as ResErr<U, E>
	}
}

export function Err<T, E>(error: E): ResErr<T, E> {
	return new ResErr(error)
}


/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function is_result<T, E>(res: Result<T, E> | any): res is Result<T, E> {
	return 'type' in res && (res.type === ResultType.Ok || res.type === ResultType.Err)
}

export function is_ok<T, E>(res: Result<T, E>): res is ResOk<T, E> {
	if (!is_result(res)) throw TypeError('parameter of `is_ok` is not a Result')
	return res.is_ok()
}

export function is_err<T, E>(res: Result<T, E>): res is ResErr<T, E> {
	if (!is_result(res)) throw TypeError('parameter of `is_err` is not a Result')
	return res.is_err()
}

// this does it!!!!
// https://github.com/Microsoft/TypeScript/issues/26223


// https://www.freecodecamp.org/news/typescript-curry-ramda-types-f747e99744ab/


type Unshift<Item, List extends any[]> =
	((first: Item, ...rest: List) => any) extends ((...list: infer R) => any) ? R : never

type S = Unshift<number, [number, boolean, string]>

const s: S = [3, 9, true, 'st']

class Res<A> {
	constructor(private val: A) {}

	join<L extends any[]>(...rest: L): Unshift<A, L> {
		return [this.val, ...rest] as Unshift<A, L>
	}
}


export type ResultTuple<L, E> = { [K in keyof L]: Result<L[K], E> }

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function combine<U, E, L extends any[]>(fn: (...args: L) => U, results: ResultTuple<L, E>): Result<U, E> {
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	const args = [] as any as L
	for (const result of results)
		if (result.is_ok()) args.push(result.unwrap())
		else return result


	return Ok(fn(...args))
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function combine_new_err<U, E, X, L extends any[]>(fn: (...args: L) => U, new_err: X, results: ResultTuple<L, E>): Result<U, X> {
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	const args = [] as any as L
	for (const result of results)
		if (result.is_ok()) args.push(result.unwrap())
		else return Err(new_err)


	return Ok(fn(...args))
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function combine_collect_err<U, E, L extends any[]>(fn: (...args: L) => U, ...results: ResultTuple<L, E>): Result<U, E[]> {
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	const args = [] as any as L
	const errs = [] as E[]
	let seen_err = false
	for (const result of results)
		if (result.is_ok()) {
			if (!seen_err) args.push(result.unwrap())
		}
		else {
			seen_err = true
			errs.push(result.unwrap_err())
		}


	if (seen_err) return Err(errs)
	else return Ok(fn(...args))
}



// type Constructor<T, A extends any[]> = { new(...args: any[]): T }
// type Constructor<T> = { new(...args: any[]): T }

// type GetDescriptor<T, A extends any[]> = { get: (...args: A) => T }

// function asyncData<T>(
// 	target: Object, propertyName: string | symbol,
// 	// descriptor: TypedPropertyDescriptor<Promise<T>>
// ) {
// 	// capture the method
// 	// create a closure

// 	// const original = descriptor.get as () => Promise<T>

// 	// place the new correct things on the class instance to make *vue* do the right thing
// 	// Object.defineProperty(target, propertyName)

// 	// descriptor.get = function() {
// 	// 	return original()
// 	// }

// 	// return descriptor
// }

// function asyncComputed(debounce: number) {
// 	return function(target: Object, propertyName: string | symbol, descriptor: PropertyDescriptor) {
// 		const original = descriptor.get
// 	}
// }

// // function asyncData<T, R, K extends keyof T>(fn: () => R) {
// function asyncData<T, R>(fn: () => R);
// function asyncData<T, T>(fn: (this: T) => R) {
// 	return function(target: T, propertyName: string | symbol) {
// 		const val = (target as any)[propertyName]

// 		if (delete target[propertyName]) {
// 			Object.defineProperty(target, propertyName, {
// 				get() {
// 					if (val !== undefined) return val
// 					return fn.apply(this)
// 				},
// 				enumerable: false,
// 				configurable: false,
// 			})
// 		}
// 	}
// }

// import Promise from 'bluebird'

// function look(target: Object, propertyName: string) {
// 	console.log('bound')
// }

// function hello() {
// 	console.log('called')
// 	return Promise.resolve('hello')
// }

// function AsyncData<T, R>(fn: (this: T) => R) {

// }

// class Thing {
// 	p: string = 'hello'

// 	d = AsyncData(async function() {
// 		return this.p + await Promise.resolve(' world')
// 	})

// 	get relies() {
// 		return this.d.then(d => d + ' world')
// 	}

// 	// @asyncData
// 	// get stuff() {
// 	// 	return Promise.resolve('stuff')
// 	// }

// 	// @asyncComputed(200)
// 	// get hey() {
// 	// 	return Promise.resolve('hey')
// 	// }

// 	// get needHey() {
// 	// 	return this.hey.is_ok()
// 	// }
// }

// new Thing()
