export class Panic extends Error {}
export type Req<T> = NonNullable<T>
export type TryFunc<T> = () => Req<T>

// export interface MonadLike<T> {
// 	default(other: Req<T>): T,
// 	expect(message: string): T | never
// 	change<U>(fn: (value: T) => Req<U>): MonadLike<U>,
// 	and_then<U>(fn: (value: T) => MonadLike<U>): MonadLike<U>,
// 	// join<L extends any[]>(...args: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E>
// 	// join_collect_err<L extends any[]>(...args: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E[]>
// }
