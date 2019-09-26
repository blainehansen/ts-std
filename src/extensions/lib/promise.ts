import { Unshift } from '@ts-actually-safe/types'
import { Result, Ok, Err, Maybe, Some, None } from '@ts-actually-safe/monads'
import { ResultTuple } from '@ts-actually-safe/monads/dist/result'

export type PromiseTuple<L extends any[]> = { [K in keyof L]: Promise<L[K]> }

export type UnboxPromise<P extends Promise<any>> = P extends Promise<infer T> ? T : never

declare global {
	interface Promise<T> {
		join<L extends any[]>(...args: PromiseTuple<L>): Promise<Unshift<T, L>>,
		// try_join<E, L>(this: Promise<Result<T, E>>, ...others: ResultTuple<L, E>): Promise<Result<Unshift<T, L>, E>>

		use_maybe(): Promise<Maybe<T>>
		use_result(): Promise<Result<T, Error>>
	}

	interface PromiseConstructor {
		join<L extends any[]>(...args: PromiseTuple<L>): Promise<L>,
		object<O extends { [key: string]: Promise<any> }>(obj: O): Promise<{ [K in keyof O]: UnboxPromise<O[K]> }>

		result_join<T, L extends (Result<T, any> | Maybe<T>)[]>(): Promise<Result<T, >>
	}
}


Promise.prototype.join = function<T, L extends any[]>(...args: PromiseTuple<L>): Promise<Unshift<T, L>> {
	return Promise.all([this].concat(args)) as Promise<Unshift<T, L>>
}

Promise.join = function<L extends any[]>(...args: PromiseTuple<L>): Promise<L> {
	return Promise.all(args) as Promise<L>
}

Promise.object = function<O extends { [key: string]: Promise<any> }>(
	obj: O,
): Promise<{ [K in keyof O]: UnboxPromise<O[K]> }> {
	//
}


Promise.prototype.use_maybe = function<T>(): Promise<Maybe<T>> {
	return this
		.then(v => Some(v))
		.catch(_ => None)
}

Promise.prototype.use_result = function<T>(): Promise<Result<T, Error>> {
	return this
		.then(v => Ok(v))
		.catch(e => Err(e))
}




// type PromiseExecutor<T> =
// 	(resolve: (value?: T) => void, reject?: (reason?: any) => void) => void


// class MyPromise<T> extends Promise<T> {
// 	constructor(executor: PromiseExecutor<T>) {
// 		super((resolve, reject) => executor(resolve, reject))
// 	}

// 	// then(onFulfilled, onRejected) {
// 	//     // before
// 	//     const returnValue = super.then(onFulfilled, onRejected);
// 	//     // after
// 	//     return returnValue;
// 	// }
// }
