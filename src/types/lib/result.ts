import { Unshift } from './utils'
import { Maybe, Some, None } from './maybe'
type Req<T> = NonNullable<T>

const ResultType = {
	Ok: Symbol('Result.Ok'),
	Err: Symbol('Result.Err'),
} as const

export interface ResultMatch<T, E, U> {
	ok: (value: T) => Req<U>,
	err: (value: E) => Req<U>,
}

class ResultPanic extends Error {}

export interface ResultLike<T, E> {
	type: symbol,
	is_ok(): boolean,
	is_err(): boolean,
	ok_maybe(): Maybe<T>,
	ok_undef(): T | undefined,
	err_maybe(): Maybe<E>,
	err_undef(): E | undefined,
	unwrap(): T | never,
	unwrap_or(other: Req<T>): T,
	unwrap_err(): E | never,
	expect(message: string): T | never
	expect_err(message: string): E | never
	match<U>(fn: ResultMatch<T, E, U>): U,
	change<U>(fn: (value: T) => Req<U>): Result<U, E>,
	change_err<U>(fn: (err: E) => Req<U>): Result<T, U>,
	and_then<U>(fn: (value: T) => Result<U, E>): Result<U, E>,
	join<L extends any[]>(...args: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E>
	join_collect_err<L extends any[]>(...args: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E[]>
}

export type Result<T, E> = ResultOk<T, E> | ResultErr<T, E>

class ResultOk<T, E> implements ResultLike<T, E> {
	readonly type = ResultType.Ok
	constructor(private readonly value: Req<T>) {}

	is_ok(): boolean {
		return true
	}
	is_err(): boolean {
		return false
	}
	ok_maybe(): Maybe<T> {
		return Some(this.value)
	}
	ok_undef(): T | undefined {
		return this.value
	}
	err_maybe(): Maybe<E> {
		return None()
	}
	err_undef(): E | undefined {
		return undefined
	}
	unwrap(): T {
		return this.value
	}
	unwrap_or(_other: Req<T>): T {
		return this.value
	}
	unwrap_err(): never {
		throw new ResultPanic('Cannot unwrap Err value of Result.Ok')
	}
	expect(_message: string): T {
		return this.value
	}
	expect_err(message: string): never {
		throw new ResultPanic(message)
	}
	match<U>(fn: ResultMatch<T, E, U>): U {
		return fn.ok(this.value)
	}
	change<U>(fn: (value: T) => Req<U>): ResultOk<U, E> {
		return Ok(fn(this.value))
	}
	change_err<U>(_fn: (err: E) => Req<U>): ResultOk<T, U> {
		// DANGER: test to ensure type invariant holds
		return this as any as ResultOk<T, U>
	}
	and_then<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
		return fn(this.value)
	}
	join<L extends any[]>(...others: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E> {
		const others_result = _join(others)
		return others_result.is_ok()
			? new ResultJoinOk([this.value as T, ...others_result.unwrap() as L] as Unshift<T, L>)
			: new ResultJoinErr(others_result.unwrap_err() as Req<E>)
	}
	join_collect_err<L extends any[]>(...others: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E[]> {
		const others_result = _join_collect_err(others)
		return others_result.is_ok()
			? new ResultJoinOk([this.value as T, ...others_result.unwrap() as L] as Unshift<T, L>)
			: new ResultJoinErr(others_result.unwrap_err())
	}
}

export function Ok<T, E>(value: Req<T>): ResultOk<T, E> {
	return new ResultOk(value)
}


class ResultErr<T, E> implements ResultLike<T, E> {
	readonly type = ResultType.Err
	constructor(private readonly error: Req<E>) {}

	is_ok(): boolean {
		return false
	}
	is_err(): boolean {
		return true
	}
	ok_maybe(): Maybe<T> {
		return None()
	}
	ok_undef(): T | undefined {
		return undefined
	}
	err_maybe(): Maybe<E> {
		return Some(this.error)
	}
	err_undef(): E | undefined {
		return this.error
	}
	unwrap(): T {
		throw new ResultPanic('Cannot unwrap Ok value of Result.Err')
	}
	unwrap_or(other: Req<T>): T {
		return other
	}
	unwrap_err(): E {
		return this.error
	}
	expect(message: string): never {
		throw new ResultPanic(message)
	}
	expect_err(message: string): E {
		return this.error
	}
	match<U>(fn: ResultMatch<T, E, U>): U {
		return fn.err(this.error)
	}
	change<U>(_fn: (_value: T) => Req<U>): ResultErr<U, E> {
		// DANGER: test to ensure type invariant holds
		return this as any as ResultErr<U, E>
	}
	change_err<U>(fn: (err: E) => Req<U>): ResultErr<T, U> {
		return Err(fn(this.error))
	}
	and_then<U>(_fn: (value: T) => Result<U, E>): ResultErr<U, E> {
		// DANGER: test to ensure type invariant holds
		return this as any as ResultErr<U, E>
	}
	join<L extends any[]>(..._others: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E> {
		return new ResultJoinErr(this.error)
	}
	join_collect_err<L extends any[]>(...others: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E[]> {
		return new ResultJoinErr(others.reduce((errors, other) => {
			if (other.is_err())
				errors.push(other.unwrap_err())
			return errors
		}, [this.error] as E[]) as Req<E[]>)
	}
}

export function Err<T, E>(error: Req<E>): ResultErr<T, E> {
	return new ResultErr(error)
}


type ResultTuple<L extends any[], E> = { [K in keyof L]: Result<L[K], E> }

type ResultJoin<L extends any[], E> = ResultJoinOk<L, E> | ResultJoinErr<L, E>

class ResultJoinOk<L extends any[], E> {
	constructor(private readonly values: L) {}

	combine<T>(fn: (...args: L) => Req<T>): Result<T, E> {
		return Ok(fn(...this.values))
	}

	and_then_combine<T>(fn: (...args: L) => Result<T, E>): Result<T, E> {
		return fn(...this.values)
	}

	into_result(): Result<L, E> {
		return Ok(this.values as Req<L>)
	}
}

class ResultJoinErr<L extends any[], E> {
	constructor(private readonly error: Req<E>) {}

	combine<T>(_fn: (...args: L) => Req<T>): Result<T, E> {
		return Err(this.error)
	}

	and_then_combine<T>(fn: (...args: L) => Result<T, E>): Result<T, E> {
		return Err(this.error)
	}

	into_result(): Result<L, E> {
		return Err(this.error)
	}
}


function _join<L extends any[], E>(results: ResultTuple<L, E>): Result<L, E> {
		// DANGER: test to ensure type invariant holds
		const args = [] as any as Req<L>
		for (const result of results)
			if (result.is_ok()) args.push(result.unwrap())
			else return result

		return Ok(args)
	}

	function _join_collect_err<L extends any[], E>(results: ResultTuple<L, E>): Result<L, E[]> {
		// DANGER: test to ensure type invariant holds
		const args = [] as any as Req<L>
		const errs = [] as E[]
		let seen_err = false
		for (const result of results)
			if (result.is_ok())
				if (!seen_err) args.push(result.unwrap())
			else {
				seen_err = true
				errs.push(result.unwrap_err())
			}

		if (seen_err) return Err(errs)
		else return Ok(args)
	}

export namespace Result {
	export function is_result<T, E>(res: Result<T, E> | any): res is Result<T, E> {
		return res !== null && res !== undefined
			&& 'type' in res
			&& (res.type === ResultType.Ok || res.type === ResultType.Err)
	}

	// export function is_ok<T, E>(res: Result<T, E>): res is ResultOk<T, E> {
	// 	if (!is_result(res)) throw new TypeError('parameter of `is_ok` is not a Result')
	// 	return res.is_ok()
	// }

	// export function is_err<T, E>(res: Result<T, E>): res is ResultErr<T, E> {
	// 	if (!is_result(res)) throw new TypeError('parameter of `is_err` is not a Result')
	// 	return res.is_err()
	// }

	export function all<T, E>(results: Result<T, E>[]): Result<T[], E> {
		return _join(results)
	}

	export function all_collect_err<T, E>(results: Result<T, E>[]): Result<T[], E[]> {
		return _join_collect_err(results)
	}

	export function join<L extends any[], E>(...results: ResultTuple<L, E>): ResultJoin<L, E> {
		const results_join = _join(results)
		return results_join.is_ok()
			? new ResultJoinOk(results_join.unwrap())
			: new ResultJoinErr(results_join.unwrap_err() as Req<E>)
	}

	export function join_collect_err<L extends any[], E>(...results: ResultTuple<L, E>): ResultJoin<L, E[]> {
		const results_join = _join_collect_err(results)
		return results_join.is_ok()
			? new ResultJoinOk(results_join.unwrap() as Req<L>)
			: new ResultJoinErr(results_join.unwrap_err() as Req<E[]>)
	}

	type TryFunc<T> = (() => Req<T>)

	export function attempt<T, E, F extends TryFunc<T>>(
		fn: F,
	): Result<T, E> {
		try {
			return Ok(fn())
		}
		catch (e) {
			return Err(e)
		}
	}
}
