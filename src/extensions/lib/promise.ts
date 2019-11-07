import { Unshift, Cast } from '@ts-std/types'
import { Result, Ok, Err, Maybe, Some, None } from '@ts-std/monads'
import { ResultTuple } from '@ts-std/monads/dist/result'
import { ProducerOrValue } from '@ts-std/monads/dist/common'

export type PromiseTuple<L extends any[]> = { [K in keyof L]: Promise<L[K]> }

export type UnboxPromise<P extends Promise<any>> = P extends Promise<infer T> ? T : never

export type PromiseObject<O extends { [key: string]: Promise<any> }> = Promise<{ [K in keyof O]: UnboxPromise<O[K]> }>

// export type PromiseEntries<O extends { [key: string]: Promise<any> }> = ({ [K in keyof O]: [K, UnboxPromise<O[K]>] }[keyof O])[]

export type PromiseResultTuple<L extends any[], E> = { [K in keyof L]: Promise<Result<L[K], E>> }
export type PromiseMaybeTuple<L extends any[]> = { [K in keyof L]: Promise<Maybe<L[K]>> }

declare global {
	interface Promise<T> {
		join<L extends any[]>(...args: PromiseTuple<L>): Promise<Unshift<T, L>>,
		result_join<T, L extends any[], E>(
			this: Promise<Result<T, E>>,
			...args: PromiseResultTuple<L, E>
		): Promise<Result<Unshift<T, L>, E>>,
		maybe_join<T, L extends any[]>(
			this: Promise<Maybe<T>>,
			...args: PromiseMaybeTuple<L>
		): Promise<Maybe<Unshift<T, L>>>,

		use_maybe(): Promise<Maybe<T>>,
		use_result(): Promise<Result<T, Error>>,

		// then_ok_maybe<T, E>(
		// 	this: Promise<Result<T, E>>,
		// ): Promise<Maybe<T>>,
		// then_ok_undef<T, E>(
		// 	this: Promise<Result<T, E>>,
		// ): Promise<T | undefined>,
		// then_ok_null<T, E>(
		// 	this: Promise<Result<T, E>>,
		// ): Promise<T | null>,
		// then_err_maybe<T, E>(
		// 	this: Promise<Result<T, E>>,
		// ): Promise<Maybe<E>>,
		// then_err_undef<T, E>(
		// 	this: Promise<Result<T, E>>,
		// ): Promise<E | undefined>,
		// then_err_null<T, E>(
		// 	this: Promise<Result<T, E>>,
		// ): Promise<E | null>,

		// then_change<T, E, U>(
		// 	this: Promise<Result<T, E>>,
		// 	fn: (value: T) => U,
		// ): Promise<Result<U, E>>,
		// then_change<T, U>(
		// 	this: Promise<Maybe<T>>,
		// 	fn: (value: T) => U,
		// ): Promise<Maybe<U>>,

		// then_try_change<T, E, U>(
		// 	this: Promise<Result<T, E>>,
		// 	fn: (value: T) => Result<U, E>,
		// ): Promise<Result<U, E>>,
		// then_try_change<T, U>(
		// 	this: Promise<Maybe<T>>,
		// 	fn: (value: T) => Maybe<U>,
		// ): Promise<Maybe<U>>,

		// then_default<T, E>(
		// 	this: Promise<Result<T, E>>,
		// 	def: ProducerOrValue<T>,
		// ): Promise<T>,
		// then_default<T>(
		// 	this: Promise<Maybe<T>>,
		// 	def: ProducerOrValue<T>,
		// ): Promise<T>,

		// then_change_err<T, E, U>(
		// 	this: Promise<Result<T, E>>,
		// 	fn: (err: E) => U,
		// ): Promise<Result<T, U>>,
		// then_default_err<T, E>(
		// 	this: Promise<Result<T, E>>,
		// 	def_err: ProducerOrValue<E>,
		// ): Promise<E>,
		// then_log<T, E>(
		// 	this: Promise<Result<T, E>>,
		// ): Promise<Result<T, E>>,
		// then_log_ok<T, E>(
		// 	this: Promise<Result<T, E>>,
		// ): Promise<Result<T, E>>,
		// then_log_err<T, E>(
		// 	this: Promise<Result<T, E>>,
		// ): Promise<Result<T, E>>,

		// then_to_undef<T>(
		// 	this: Promise<Maybe<T>>,
		// ): Promise<T | undefined>,
		// then_to_null<T>(
		// 	this: Promise<Maybe<T>>,
		// ): Promise<T | null>,
		// then_to_result<T, E>(
		// 	this: Promise<Maybe<T>>,
		// 	err: E,
		// ): Promise<Result<T, E>>,
	}

	interface PromiseConstructor {
		join<L extends any[]>(...args: PromiseTuple<L>): Promise<L>,
		result_join<L extends any[], E>(...args: PromiseResultTuple<L, E>): Promise<Result<L, E>>,
		maybe_join<L extends any[]>(...args: PromiseMaybeTuple<L>): Promise<Maybe<L>>,

		join_object<O extends { [key: string]: Promise<any> }>(obj: O): PromiseObject<O>,

		delay<T>(time: number, value: T): Promise<T>,
		delay(time: number): Promise<void>,
	}
}


Promise.prototype.join = function<T, L extends any[]>(...args: PromiseTuple<L>): Promise<Unshift<T, L>> {
	return Promise.all([this].concat(args)) as Promise<Unshift<T, L>>
}
Promise.join = function<L extends any[]>(...args: PromiseTuple<L>): Promise<L> {
	return Promise.all(args) as Promise<L>
}

function _result_join<L extends any[], E>(
	args: PromiseResultTuple<L, E>,
): Promise<Result<L, E>> {
	const give = Array.from({ length: args.length }) as { [K in keyof L]: L[K] | undefined }
	return new Promise(resolve => {
		for (let index = 0; index < args.length; index++) {
			args[index].then(r => r.match({
				ok: v => {
					give[index] = v
					if (give.every(g => g !== undefined))
						return resolve(Ok(give as L))
				},
				err: e => resolve(Err(e)),
			}))
		}
	})
}
Promise.prototype.result_join = function<T, L extends any[], E>(
	this: Promise<Result<T, E>>,
	...args: PromiseResultTuple<L, E>
): Promise<Result<Unshift<T, L>, E>> {
	return _result_join([this].concat(args) as any as PromiseResultTuple<Unshift<T, L>, E>)
}
Promise.result_join = function<L extends any[], E>(...args: PromiseResultTuple<L, E>): Promise<Result<L, E>> {
	if (args.length === 0)
		return Promise.resolve(Ok([] as any as L))
	return _result_join(args)
}

function _maybe_join<L extends any[]>(
	args: PromiseMaybeTuple<L>,
): Promise<Maybe<L>> {
	const give = Array.from({ length: args.length }) as { [K in keyof L]: L[K] | undefined }
	return new Promise(resolve => {
		for (let index = 0; index < args.length; index++) {
			args[index].then(r => r.match({
				some: v => {
					give[index] = v
					if (give.every(g => g !== undefined))
						return resolve(Some(give as L))
				},
				none: () => resolve(None),
			}))
		}
	})
}
Promise.prototype.maybe_join = function<T, L extends any[]>(
	this: Promise<Maybe<T>>,
	...args: PromiseMaybeTuple<L>
): Promise<Maybe<Unshift<T, L>>> {
	return _maybe_join([this].concat(args) as any as PromiseMaybeTuple<Unshift<T, L>>)
}
Promise.maybe_join = function<L extends any[]>(...args: PromiseMaybeTuple<L>): Promise<Maybe<L>> {
	if (args.length === 0)
		return Promise.resolve(Some([] as any as L))
	return _maybe_join(args)
}


Promise.join_object = async function<O extends { [key: string]: Promise<any> }>(
	obj: O,
): PromiseObject<O> {
	// PromiseEntries<O>
	const pairs_promises: Promise<[string, any]>[] = []
	for (const [key, promise] of Object.entries(obj)) {
		pairs_promises.push(new Promise(resolve => {
			promise.then(value => resolve([key, value]))
		}))
	}

	const pairs = await Promise.all(pairs_promises)

	const give = {} as PromiseObject<O>
	for (const [key, value] of pairs) {
		give[key] = value
	}

	return give
}


Promise.prototype.use_maybe = function<T>(): Promise<Maybe<T>> {
	return this
		.then(Some)
		.catch(() => None)
}

Promise.prototype.use_result = function<T>(): Promise<Result<T, Error>> {
	return this
		.then(Ok)
		.catch(Err)
}

// Promise.prototype.then_ok_maybe = function<T, E>(
// 	this: Promise<Result<T, E>>,
// ): Promise<Maybe<T>> {
// 	return this.then(r => r.ok_maybe())
// }
// Promise.prototype.then_ok_undef = function<T, E>(
// 	this: Promise<Result<T, E>>,
// ): Promise<T | undefined> {
// 	return this.then(r => r.ok_undef())
// }
// Promise.prototype.then_ok_null = function<T, E>(
// 	this: Promise<Result<T, E>>,
// ): Promise<T | null> {
// 	return this.then(r => r.ok_null())
// }
// Promise.prototype.then_err_maybe = function<T, E>(
// 	this: Promise<Result<T, E>>,
// ): Promise<Maybe<E>> {
// 	return this.then(r => r.err_maybe())
// }
// Promise.prototype.then_err_undef = function<T, E>(
// 	this: Promise<Result<T, E>>,
// ): Promise<E | undefined> {
// 	return this.then(r => r.err_undef())
// }
// Promise.prototype.then_err_null = function<T, E>(
// 	this: Promise<Result<T, E>>,
// ): Promise<E | null> {
// 	return this.then(r => r.err_null())
// }

// function then_change<T, E, U>(
// 	this: Promise<Result<T, E>>,
// 	fn: (value: T) => U,
// ): Promise<Result<U, E>>
// function then_change<T, U>(
// 	this: Promise<Maybe<T>>,
// 	fn: (value: T) => U,
// ): Promise<Maybe<U>>
// function then_change<T, E, U>(
// 	this: Promise<any>,
// 	fn: (value: T) => U,
// ) {
// 	return this.then(r => r.change(fn))
// }
// Promise.prototype.then_change = then_change

// function then_try_change<T, E, U>(
// 	this: Promise<Result<T, E>>,
// 	fn: (value: T) => Result<U, E>,
// ): Promise<Result<U, E>>
// function then_try_change<T, U>(
// 	this: Promise<Maybe<T>>,
// 	fn: (value: T) => Maybe<U>,
// ): Promise<Maybe<U>>
// function then_try_change<T, E, U>(
// 	this: Promise<any>,
// 	fn: (value: T) => any,
// ) {
// 	return this.then(r => r.try_change(fn))
// }
// Promise.prototype.then_try_change = then_try_change

// function then_default<T, E>(
// 	this: Promise<Result<T, E>>,
// 	def: ProducerOrValue<T>,
// ): Promise<T>
// function then_default<T>(
// 	this: Promise<Maybe<T>>,
// 	def: ProducerOrValue<T>,
// ): Promise<T>
// function then_default<T, E>(
// 	this: Promise<any>,
// 	def: ProducerOrValue<T>,
// ) {
// 	return this.then(r => r.default(def))
// }
// Promise.prototype.then_default = then_default


// Promise.prototype.then_change_err = function<T, E, U>(
// 	this: Promise<Result<T, E>>,
// 	fn: (err: E) => U,
// ): Promise<Result<T, U>> {
// 	return this.then(r => r.change_err(fn))
// }
// Promise.prototype.then_default_err = function<T, E>(
// 	this: Promise<Result<T, E>>,
// 	def_err: ProducerOrValue<E>,
// ): Promise<E> {
// 	return this.then(r => r.default_err(def_err))
// }
// Promise.prototype.then_log = function<T, E>(
// 	this: Promise<Result<T, E>>,
// ): Promise<Result<T, E>> {
// 	return this.then(r => r.log())
// }
// Promise.prototype.then_log_ok = function<T, E>(
// 	this: Promise<Result<T, E>>,
// ): Promise<Result<T, E>> {
// 	return this.then(r => r.log_ok())
// }
// Promise.prototype.then_log_err = function<T, E>(
// 	this: Promise<Result<T, E>>,
// ): Promise<Result<T, E>> {
// 	return this.then(r => r.log_err())
// }

// Promise.prototype.then_to_undef = function<T>(
// 	this: Promise<Maybe<T>>,
// ): Promise<T | undefined> {
// 	return this.then(r => r.to_undef())
// }
// Promise.prototype.then_to_null = function<T>(
// 	this: Promise<Maybe<T>>,
// ): Promise<T | null> {
// 	return this.then(r => r.to_null())
// }
// Promise.prototype.then_to_result = function<T, E>(
// 	this: Promise<Maybe<T>>,
// 	err: E,
// ): Promise<Result<T, E>> {
// 	return this.then(r => r.to_result(err))
// }



function delay<T>(time: number, value: T): Promise<T>
function delay(time: number): Promise<void>
function delay<T>(time: number, value?: T): any {
	let timer
	return new Promise(resolve => {
		timer = setTimeout(value => {
			resolve(value)
		}, time, value)
	})
		.finally(() => {
			clearTimeout(timer)
		})
}

Promise.delay = delay
