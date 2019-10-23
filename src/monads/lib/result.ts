import { Unshift } from '@ts-std/types'

import { Panic, TransformerOrValue, ProducerOrValue }from './common'
import { Maybe, Some, None } from './maybe'


export const result_invariant_message = "Result library invariant broken!"

const ResultType = {
	Ok: Symbol('Result.Ok'),
	Err: Symbol('Result.Err'),
} as const

export type ResultMatch<T, E, U> = {
	ok: TransformerOrValue<T, U>,
	err: TransformerOrValue<E, U>,
}

export interface ResultLike<T, E> {
	is_ok(): boolean,
	is_err(): boolean,
	ok_maybe(): Maybe<T>,
	ok_undef(): T | undefined,
	ok_null(): T | null,
	err_maybe(): Maybe<E>,
	err_undef(): E | undefined,
	err_null(): E | null,

	match<U>(fn: ResultMatch<T, E, U>): U,

	expect(message: string): T | never,
	expect_err(message: string): E | never,

	change<U>(fn: (value: T) => U): Result<U, E>,
	try_change<U>(fn: (value: T) => Result<U, E>): Result<U, E>,

	change_err<U>(fn: (err: E) => U): Result<T, U>,

	and<U>(other: ProducerOrValue<Result<U, E>>): Result<U, E>
	or(other: ProducerOrValue<Result<T, E>>): Result<T, E>
	xor(other: ProducerOrValue<Result<T, E>>, same_err: ProducerOrValue<E>): Result<T, E>

	default(def: ProducerOrValue<T>): T,
	default_err(def_err: ProducerOrValue<E>): E,
	join<L extends any[]>(...args: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E>
	join_collect_err<L extends any[]>(...args: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E[]>
}

export type Result<T, E = string> = ResultOk<T, E> | ResultErr<T, E>

class ResultOk<T, E> implements ResultLike<T, E> {
	private readonly type = ResultType.Ok
	constructor(private readonly value: T) {}

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
	default(def: ProducerOrValue<T>): T {
		return this.value
	}
	default_err(def_err: ProducerOrValue<E>): E {
		return typeof def_err === 'function' ? (def_err as () => E)() : def_err
	}
	expect(message: string): T | never {
		return this.value
	}
	expect_err(message: string): E | never {
		throw new Panic(message)
	}
	match<U>(fn: ResultMatch<T, E, U>): U {
		return typeof fn.ok === 'function'
			? (fn.ok as (value: T) => U)(this.value)
			: fn.ok
	}
	change<U>(fn: (value: T) => U): Result<U, E> {
		return Ok(fn(this.value))
	}
	change_err<U>(_fn: (err: E) => U): Result<T, U> {
		// DANGER: test to ensure type invariant holds
		return this as any as Result<T, U>
	}

	and<U>(other: ProducerOrValue<Result<U, E>>): Result<U, E> {
		return typeof other === 'function' ? other() : other
	}
	or(other: ProducerOrValue<Result<T, E>>): Result<T, E> {
		return this
	}
	xor(other: ProducerOrValue<Result<T, E>>, same_err: ProducerOrValue<E>): Result<T, E> {
		const other_result = typeof other === 'function' ? other() : other
		return other_result.is_ok()
			? Err(typeof same_err === 'function' ? (same_err as () => E)() : same_err)
			: this
	}

	try_change<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
		return fn(this.value)
	}
	join<L extends any[]>(...others: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E> {
		const others_result = _join(others)
		return others_result.is_ok()
			? new ResultJoinOk([this.value as T, ...others_result.expect(result_invariant_message) as L] as Unshift<T, L>)
			: new ResultJoinErr(others_result.expect_err(result_invariant_message) as E)
	}
	join_collect_err<L extends any[]>(...others: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E[]> {
		const others_result = _join_collect_err(others)
		return others_result.is_ok()
			? new ResultJoinOk([this.value as T, ...others_result.expect(result_invariant_message) as L] as Unshift<T, L>)
			: new ResultJoinErr(others_result.expect_err(result_invariant_message))
	}
}

export function Ok<T>(value: T): Result<T, any> {
	return new ResultOk(value)
}


class ResultErr<T, E> implements ResultLike<T, E> {
	private readonly type = ResultType.Err
	constructor(private readonly error: E) {}

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
	default(def: ProducerOrValue<T>): T {
		return typeof def === 'function' ? (def as () => T)() : def
	}
	default_err(def_err: ProducerOrValue<E>): E {
		return this.error
	}
	expect(message: string): T | never {
		throw new Panic(`Result.expect was called on Err.\nMessage: ${message}\nUnderlying Err value:\n${this.error}`)
	}
	expect_err(message: string): E | never {
		return this.error
	}
	match<U>(fn: ResultMatch<T, E, U>): U {
		return typeof fn.err === 'function'
			? (fn.err as (error: E) => U)(this.error)
			: fn.err
	}
	change<U>(_fn: (_value: T) => U): Result<U, E> {
		// DANGER: test to ensure type invariant holds
		return this as any as Result<U, E>
	}
	change_err<U>(fn: (err: E) => U): Result<T, U> {
		return Err(fn(this.error))
	}
	try_change<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
		// DANGER: test to ensure type invariant holds
		return this as any as Result<U, E>
	}

	and<U>(_other: ProducerOrValue<Result<U, E>>): Result<U, E> {
		// DANGER: test to ensure type invariant holds
		return this as any as Result<U, E>
	}
	or(other: ProducerOrValue<Result<T, E>>): Result<T, E> {
		const other_result = typeof other === 'function' ? other() : other
		return other_result.is_ok()
			? other_result
			: this
	}
	xor(other: ProducerOrValue<Result<T, E>>, same_err: ProducerOrValue<E>): Result<T, E> {
		const other_result = typeof other === 'function' ? other() : other
		return other_result.is_ok()
			? other_result
			: Err(typeof same_err === 'function' ? (same_err as () => E)() : same_err)
	}


	join<L extends any[]>(..._others: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E> {
		return new ResultJoinErr(this.error)
	}
	join_collect_err<L extends any[]>(...others: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E[]> {
		return new ResultJoinErr(others.reduce((errors, other) => {
			if (other.is_err())
				errors.push(other.expect_err(result_invariant_message))
			return errors
		}, [this.error] as E[]) as E[])
	}
}

export function Err<E>(error: E): Result<any, E> {
	return new ResultErr(error)
}


export type ResultTuple<L extends any[], E> = { [K in keyof L]: Result<L[K], E> }

export type ResultJoin<L extends any[], E = string> = ResultJoinOk<L, E> | ResultJoinErr<L, E>

class ResultJoinOk<L extends any[], E> {
	constructor(private readonly values: L) {}

	combine<T>(fn: (...args: L) => T): Result<T, E> {
		return Ok(fn(...this.values))
	}

	try_combine<T>(fn: (...args: L) => Result<T, E>): Result<T, E> {
		return fn(...this.values)
	}

	into_result(): Result<L, E> {
		return Ok(this.values as L)
	}
}

class ResultJoinErr<L extends any[], E> {
	constructor(private readonly error: E) {}

	combine<T>(_fn: (...args: L) => T): Result<T, E> {
		return Err(this.error)
	}

	try_combine<T>(fn: (...args: L) => Result<T, E>): Result<T, E> {
		return Err(this.error)
	}

	into_result(): Result<L, E> {
		return Err(this.error)
	}
}


function _join<L extends any[], E>(results: ResultTuple<L, E>): Result<L, E> {
	// DANGER: test to ensure type invariant holds
	const args = [] as any as L
	for (const result of results)
		if (result.is_ok()) args.push(result.expect(result_invariant_message))
		else return result

	return Ok(args)
}

function _join_collect_err<L extends any[], E>(results: ResultTuple<L, E>): Result<L, E[]> {
	// DANGER: test to ensure type invariant holds
	const args = [] as any as L
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
	export function from_nillable<T, E>(value: T | null | undefined, err: ProducerOrValue<E>): Result<T, E> {
		return value === null || value === undefined
			? Err(typeof err === 'function' ? (err as () => E)() : err)
			: Ok(value)
	}

	export function is_result(value: unknown): value is Result<unknown, unknown> {
		return value !== null && value !== undefined
			&& ((value as any).type === ResultType.Ok || (value as any).type === ResultType.Err)
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
			: new ResultJoinErr(results_join.expect_err(result_invariant_message) as E)
	}

	export function join_collect_err<L extends any[], E>(...results: ResultTuple<L, E>): ResultJoin<L, E[]> {
		const results_join = _join_collect_err(results)
		return results_join.is_ok()
			? new ResultJoinOk(results_join.expect(result_invariant_message) as L)
			: new ResultJoinErr(results_join.expect_err(result_invariant_message) as E[])
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

	export function split<T, E>(results: Result<T, E>[]): [T[], E[]] {
		const oks = [] as T[]
		const errs = [] as E[]
		for (const result of results) {
			if (result.is_ok())
				oks.push(result.expect(result_invariant_message))
			else
				errs.push(result.expect_err(result_invariant_message))
		}

		return [oks, errs]
	}

	export function attempt<T>(fn: () => T): Result<T, Error> {
		try {
			return Ok(fn())
		}
		catch (e) {
			return Err(e)
		}
	}
}
