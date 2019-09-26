export type FunctionOrValue<A extends any[], T> = ((...args: A) => T) | T
export type TransformerOrValue<T, U> = FunctionOrValue<[T], U>
export type ProducerOrValue<U> = FunctionOrValue<[], U>

export class Panic extends Error {}

// export abstract class MonadLike<T, E> {
// 	map_over<U>(fn: (value: T) => U): this<U, E>
// 	try_map_over<U>(fn: (value: T) => this<U, E>): this<U, E>

// 	is_successful(): boolean
// 	is_error(): boolean {
// 		return !this.is_successful()
// 	}

// 	match<U>(options: {
// 		success: (value: T) => U,
// 		error: (error: E) => U,
// 	}): U {
// 		return this.is_successful()
// 			?
// 			:
// 	}
// 	default(value: T): T {
// 		return this.is_successful()
// 			? this.expect("")
// 			: value
// 	}
// 	expect(string?: message): T | never

// 	create_successful(value: T): this<T, E>
// 	create_error(error: E): this<T, E>

// 	join<L extends any[]>(...args: ResultTuple<L, E>): MonadLike<Unshift<T, L>, E>
// 	join_collect_err<L extends any[]>(...args: ResultTuple<L, E>): MonadLike<Unshift<T, L>, E[]>
// }
