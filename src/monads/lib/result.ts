import { Unshift } from '@ts-actually-safe/types'

import { Panic, TryFunc, Req } from './common'
import { Maybe, Some, None } from './maybe'


const ResultType = {
	Ok: Symbol('Result.Ok'),
	Err: Symbol('Result.Err'),
} as const

export interface ResultMatch<T, E, U> {
	ok: (value: T) => Req<U>,
	err: (value: E) => Req<U>,
}

export const result_invariant_message = "Result library invariant broken!"

export interface ResultLike<T, E> {
	is_ok(): boolean,
	is_err(): boolean,
	ok_maybe(): Maybe<T>,
	ok_undef(): T | undefined,
	ok_null(): T | null,
	err_maybe(): Maybe<E>,
	err_undef(): E | undefined,
	err_null(): E | null,
	default(other: Req<T>): T,
	default_err(other_err: Req<E>): E,
	expect(message: string): T | never
	expect_err(message: string): E | never
	match<U>(fn: ResultMatch<T, E, U>): U,
	change<U>(fn: (value: T) => Req<U>): Result<U, E>,
	change_err<U>(fn: (err: E) => Req<U>): Result<T, U>,
	and_then<U>(fn: (value: T) => Result<U, E>): Result<U, E>,
	join<L extends any[]>(...args: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E>
	join_collect_err<L extends any[]>(...args: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E[]>
}

export type Result<T, E = string> = ResultOk<T, E> | ResultErr<T, E>

class ResultOk<T, E> implements ResultLike<T, E> {
	private readonly type = ResultType.Ok
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
	ok_null(): T | null {
		return this.value
	}
	err_maybe(): Maybe<E> {
		return None
	}
	err_undef(): E | undefined {
		return undefined
	}
	err_null(): E | null {
		return null
	}
	default(_other: Req<T>): T {
		return this.value
	}
	default_err(other_err: Req<E>): E {
		return other_err
	}
	expect(_message: string): T | never {
		return this.value
	}
	expect_err(message: string): E | never {
		throw new Panic(message)
	}
	match<U>(fn: ResultMatch<T, E, U>): U {
		return fn.ok(this.value)
	}
	change<U>(fn: (value: T) => Req<U>): Result<U, E> {
		return Ok(fn(this.value))
	}
	change_err<U>(_fn: (err: E) => Req<U>): Result<T, U> {
		// DANGER: test to ensure type invariant holds
		return this as any as Result<T, U>
	}
	and_then<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
		return fn(this.value)
	}
	join<L extends any[]>(...others: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E> {
		const others_result = _join(others)
		return others_result.is_ok()
			? new ResultJoinOk([this.value as T, ...others_result.expect(result_invariant_message) as L] as Unshift<T, L>)
			: new ResultJoinErr(others_result.expect_err(result_invariant_message) as Req<E>)
	}
	join_collect_err<L extends any[]>(...others: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E[]> {
		const others_result = _join_collect_err(others)
		return others_result.is_ok()
			? new ResultJoinOk([this.value as T, ...others_result.expect(result_invariant_message) as L] as Unshift<T, L>)
			: new ResultJoinErr(others_result.expect_err(result_invariant_message))
	}
}

export function Ok<T, E>(value: Req<T>): ResultOk<T, E> {
	return new ResultOk(value)
}


class ResultErr<T, E> implements ResultLike<T, E> {
	private readonly type = ResultType.Err
	constructor(private readonly error: Req<E>) {}

	is_ok(): boolean {
		return false
	}
	is_err(): boolean {
		return true
	}
	ok_maybe(): Maybe<T> {
		return None
	}
	ok_undef(): T | undefined {
		return undefined
	}
	ok_null(): T | null {
		return null
	}
	err_maybe(): Maybe<E> {
		return Some(this.error)
	}
	err_undef(): E | undefined {
		return this.error
	}
	err_null(): E | null {
		return this.error
	}
	default(other: Req<T>): T {
		return other
	}
	default_err(other_err: Req<E>): E {
		return this.error
	}
	expect(message: string): T | never {
		throw new Panic(message)
	}
	expect_err(message: string): E | never {
		return this.error
	}
	match<U>(fn: ResultMatch<T, E, U>): U {
		return fn.err(this.error)
	}
	change<U>(_fn: (_value: T) => Req<U>): Result<U, E> {
		// DANGER: test to ensure type invariant holds
		return this as any as Result<U, E>
	}
	change_err<U>(fn: (err: E) => Req<U>): Result<T, U> {
		return Err(fn(this.error))
	}
	and_then<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
		// DANGER: test to ensure type invariant holds
		return this as any as Result<U, E>
	}
	join<L extends any[]>(..._others: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E> {
		return new ResultJoinErr(this.error)
	}
	join_collect_err<L extends any[]>(...others: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E[]> {
		return new ResultJoinErr(others.reduce((errors, other) => {
			if (other.is_err())
				errors.push(other.expect_err(result_invariant_message))
			return errors
		}, [this.error] as E[]) as Req<E[]>)
	}
}

export function Err<T, E>(error: Req<E>): ResultErr<T, E> {
	return new ResultErr(error)
}


export type ResultTuple<L extends any[], E> = { [K in keyof L]: Result<L[K], E> }

export type ResultJoin<L extends any[], E = string> = ResultJoinOk<L, E> | ResultJoinErr<L, E>

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
		if (result.is_ok()) args.push(result.expect(result_invariant_message))
		else return result

	return Ok(args)
}

function _join_collect_err<L extends any[], E>(results: ResultTuple<L, E>): Result<L, E[]> {
	// DANGER: test to ensure type invariant holds
	const args = [] as any as Req<L>
	const errs = [] as E[]
	let seen_err = false
	for (const result of results) {
		if (result.is_ok()) {
			if (!seen_err)
				args.push(result.expect(result_invariant_message))
		}
		else {
			seen_err = true
			errs.push(result.expect_err(result_invariant_message))
		}
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

	export function all<T, E>(results: Result<T, E>[]): Result<T[], E> {
		return _join(results)
	}

	export function all_collect_err<T, E>(results: Result<T, E>[]): Result<T[], E[]> {
		return _join_collect_err(results)
	}

	export function join<L extends any[], E>(...results: ResultTuple<L, E>): ResultJoin<L, E> {
		const results_join = _join(results)
		return results_join.is_ok()
			? new ResultJoinOk(results_join.expect(result_invariant_message))
			: new ResultJoinErr(results_join.expect_err(result_invariant_message) as Req<E>)
	}

	export function join_collect_err<L extends any[], E>(...results: ResultTuple<L, E>): ResultJoin<L, E[]> {
		const results_join = _join_collect_err(results)
		return results_join.is_ok()
			? new ResultJoinOk(results_join.expect(result_invariant_message) as Req<L>)
			: new ResultJoinErr(results_join.expect_err(result_invariant_message) as Req<E[]>)
	}

	export function filter<T, E>(results: Result<T, E>[]): T[] {
		const give = [] as T[]
		for (const result of results) {
			if (result.is_ok()) {
				give.push(result.expect(result_invariant_message))
			}
		}

		return give
	}

	export function attempt<T, F extends TryFunc<T>>(
		fn: F,
	): Result<T, Error> {
		try {
			return Ok(fn())
		}
		catch (e) {
			return Err(e)
		}
	}
}
