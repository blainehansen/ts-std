import { Unshift } from '@ts-std/types'

import { Panic, TransformerOrValue, ProducerOrValue } from './common'
import { Result, Ok, Err } from './result'

export const maybe_invariant_message = "Maybe library invariant broken!"

const MaybeType = {
	Some: Symbol("Maybe.Some"),
	None: Symbol("Maybe.None"),
} as const

export type MaybeMatch<T, U> = {
	some: TransformerOrValue<T, U>,
	none: ProducerOrValue<U>,
}

export interface MaybeLike<T> {
	is_some(): boolean
	is_none(): boolean
	to_undef(): T | undefined
	to_null(): T | null
	to_result<E>(err: E): Result<T, E>

	match<U>(fn: MaybeMatch<T, U>): U

	change<U>(fn: (value: T) => U): Maybe<U>
	try_change<U>(fn: (value: T) => Maybe<U>): Maybe<U>

	and<U>(other: ProducerOrValue<Maybe<U>>): Maybe<U>
	or(other: ProducerOrValue<Maybe<T>>): Maybe<T>
	xor(other: ProducerOrValue<Maybe<T>>): Maybe<T>

	default(def: ProducerOrValue<T>): T
	expect(message: string): T | never
	join<L extends any[]>(...args: MaybeTuple<L>): MaybeJoin<Unshift<T, L>>
}

export type Maybe<T> = MaybeSome<T> | MaybeNone<T>

class MaybeSome<T> implements MaybeLike<T> {
	private readonly type = MaybeType.Some
	constructor(private readonly value: T) {}

	is_some(): boolean {
		return true
	}
	is_none(): boolean {
		return false
	}
	to_undef(): T | undefined {
		return this.value
	}
	to_null(): T | null {
		return this.value
	}
	to_result<E>(err: E): Result<T, E> {
		return Ok(this.value)
	}
	match<U>(fn: MaybeMatch<T, U>): U {
		return typeof fn.some === 'function'
			? (fn.some as (value: T) => U)(this.value)
			: fn.some
	}
	change<U>(fn: (value: T) => U): Maybe<U> {
		return Some(fn(this.value))
	}
	try_change<U>(fn: (value: T) => Maybe<U>): Maybe<U> {
		return fn(this.value)
	}
	or(other: ProducerOrValue<Maybe<T>>): Maybe<T> {
		return this
	}
	and<U>(other: ProducerOrValue<Maybe<U>>): Maybe<U> {
		return typeof other === 'function' ? other() : other
	}
	xor(other: ProducerOrValue<Maybe<T>>): Maybe<T> {
		const other_maybe = typeof other === 'function' ? other() : other
		return other_maybe.is_some()
			? None
			: this
	}
	default(value: ProducerOrValue<T>): T {
		return this.value
	}
	expect(message: string): T | never {
		return this.value
	}
	join<L extends any[]>(...args: MaybeTuple<L>): MaybeJoin<Unshift<T, L>> {
		const others_maybe = _join(args)
		return others_maybe.is_some()
			? new MaybeJoinSome([this.value as T, ...others_maybe.expect(maybe_invariant_message) as L] as Unshift<T, L>)
			: new MaybeJoinNone()
	}
}

export function Some<T>(value: T): Maybe<T> {
	return new MaybeSome(value)
}


class MaybeNone<T> implements MaybeLike<T> {
	private readonly type = MaybeType.None

	is_some(): boolean {
		return false
	}
	is_none(): boolean {
		return true
	}
	to_undef(): T | undefined {
		return undefined
	}
	to_null(): T | null {
		return null
	}
	to_result<E>(err: E): Result<T, E> {
		return Err(err)
	}
	match<U>(fn: MaybeMatch<T, U>): U {
		return typeof fn.none === 'function'
			? (fn.none as () => U)()
			: fn.none
	}
	change<U>(_fn: (value: T) => U): Maybe<U> {
		return this as any as Maybe<U>
	}
	try_change<U>(_fn: (value: T) => Maybe<U>): Maybe<U> {
		return this as any as Maybe<U>
	}
	or(other: ProducerOrValue<Maybe<T>>): Maybe<T> {
		return typeof other === 'function' ? other() : other
	}
	and<U>(other: ProducerOrValue<Maybe<U>>): Maybe<U> {
		return this as any as Maybe<U>
	}
	xor(other: ProducerOrValue<Maybe<T>>): Maybe<T> {
		const other_maybe = typeof other === 'function' ? other() : other
		return other_maybe.is_some()
			? other_maybe
			: this
	}
	default(other: ProducerOrValue<T>): T {
		return typeof other === 'function' ? (other as () => T)() : other
	}
	expect(message: string): T | never {
		throw new Panic(message)
	}
	join<L extends any[]>(..._args: MaybeTuple<L>): MaybeJoin<Unshift<T, L>> {
		return new MaybeJoinNone()
	}
}

export const None: Maybe<any> = new MaybeNone()

export type MaybeTuple<L extends any[]> = { [K in keyof L]: Maybe<L[K]> }

export type MaybeJoin<L extends any[]> = MaybeJoinSome<L> | MaybeJoinNone<L>

class MaybeJoinSome<L extends any[]> {
	constructor(private readonly values: L) {}

	combine<T>(fn: (...args: L) => T): Maybe<T> {
		return Some(fn(...this.values))
	}

	try_combine<T>(fn: (...args: L) => Maybe<T>): Maybe<T> {
		return fn(...this.values)
	}

	into_maybe(): Maybe<L> {
		return Some(this.values as L)
	}
}

class MaybeJoinNone<L extends any[]> {
	combine<T>(_fn: (...args: L) => T): Maybe<T> {
		return None
	}

	try_combine<T>(_fn: (...args: L) => Maybe<T>): Maybe<T> {
		return None
	}

	into_maybe(): Maybe<L> {
		return None
	}
}


function _join<L extends any[]>(maybes: MaybeTuple<L>): Maybe<L> {
	// DANGER: test to ensure type invariant holds
	const args = [] as any as L
	for (const maybe of maybes) {
		if (maybe.is_some()) args.push(maybe.expect(maybe_invariant_message))
		else return maybe
	}

	return Some(args)
}

export namespace Maybe {
	export function from_nillable<T>(value: T | null | undefined): Maybe<T> {
		return value === null || value === undefined
			? None
			: Some(value)
	}

	export function is_maybe(value: unknown): value is Maybe<unknown> {
		return value !== null && value !== undefined
			&& ((value as any).type === MaybeType.Some || (value as any).type === MaybeType.None)
	}

	export function all<T>(maybes: Maybe<T>[]): Maybe<T[]> {
		return _join(maybes)
	}

	export function filter<T>(maybes: Maybe<T>[]): T[] {
		const give = [] as T[]
		for (const maybe of maybes) {
			if (maybe.is_some()) {
				give.push(maybe.expect(maybe_invariant_message))
			}
		}

		return give
	}

	export function join<L extends any[]>(...maybes: MaybeTuple<L>): MaybeJoin<L> {
		const others_maybe = _join(maybes)
		return others_maybe.is_some()
			? new MaybeJoinSome(others_maybe.expect(maybe_invariant_message) as L)
			: new MaybeJoinNone()
	}

	export function attempt<T>(fn: () => T): Maybe<T> {
		try {
			return Some(fn())
		}
		catch (_) {
			return None
		}
	}
}
