import { Unshift } from '@ts-lib/types'
import { Result, Ok, Err, Maybe, Some, None } from '@ts-lib/monads'
import { ResultTuple } from '@ts-lib/monads/dist/result'

export type PromiseTuple<L extends any[]> = { [K in keyof L]: Promise<L[K]> }

export type UnboxPromise<P extends Promise<any>> = P extends Promise<infer T> ? T : never

export type PromiseObject<O extends { [key: string]: Promise<any> }> = Promise<{ [K in keyof O]: UnboxPromise<O[K]> }>

// export type PromiseEntries<O extends { [key: string]: Promise<any> }> = ({ [K in keyof O]: [K, UnboxPromise<O[K]>] }[keyof O])[]

// export type PromiseResultTuple<L extends any[]> = { [K in keyof L]: Promise<Result<L[K], any>> }

declare global {
	interface Promise<T> {
		join<L extends any[]>(...args: PromiseTuple<L>): Promise<Unshift<T, L>>,
		// try_join<E, L>(this: Promise<Result<T, E>>, ...others: ResultTuple<L, E>): Promise<Result<Unshift<T, L>, E>>

		use_maybe(): Promise<Maybe<T>>,
		use_result(): Promise<Result<T, Error>>,
	}

	interface PromiseConstructor {
		join<L extends any[]>(...args: PromiseTuple<L>): Promise<L>,
		// try_join<L extends any[]>(...args: PromiseResultTuple<L>): Promise<Maybe<L>>,

		join_object<O extends { [key: string]: Promise<any> }>(obj: O): PromiseObject<O>,

		// result_join<T, L extends (Result<T, any> | Maybe<T>)[]>(): Promise<Result<T, >>,
	}
}


Promise.prototype.join = function<T, L extends any[]>(...args: PromiseTuple<L>): Promise<Unshift<T, L>> {
	return Promise.all([this].concat(args)) as Promise<Unshift<T, L>>
}

Promise.join = function<L extends any[]>(...args: PromiseTuple<L>): Promise<L> {
	return Promise.all(args) as Promise<L>
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
