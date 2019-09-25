import { Unshift } from '@ts-actually-safe/types'

import { Panic, TryFunc, TransformerOrValue, ProducerOrValue } from './common'

export const maybe_invariant_message = "Maybe library invariant broken!"

const MaybeType = {
	Some: Symbol("Maybe.Some"),
	None: Symbol("Maybe.None"),
} as const

// export type MaybeMatch<T, U> = {
// 	some: TransformerOrValue<T, U>,
// 	none: ProducerOrValue<U>,
// }

export type MaybeMatch<T, U> =
	| {
		some: (value: T) => U,
		none: () => U,
	}
	| {
		some: (value: T) => U,
		none: U,
	}

export interface MaybeLike<T> {
	is_some(): boolean
	is_none(): boolean
	to_undef(): T | undefined
	to_null(): T | null
	match<U>(fn: MaybeMatch<T, U>): U

	change<U>(fn: (value: T) => U): Maybe<U>
	// try_change<U>(fn: TransformerOrValue<T, Maybe<U>>): Maybe<U>
	try_change<U>(fn: (value: T) => Maybe<U>): Maybe<U>
	// and_then<U>(fn: (value: T) => Maybe<U>): Maybe<U>

	// to_result<E>(err: E): Result<T, E>

	// and<U>(other: Maybe<U>): Maybe<U>
	and<U>(other: ProducerOrValue<Maybe<U>>): Maybe<U>
	// or(other: Maybe<T>): Maybe<T>
	or(other: ProducerOrValue<Maybe<T>>): Maybe<T>
	// xor(other: Maybe<T>): Maybe<T>
	xor(other: ProducerOrValue<Maybe<T>>): Maybe<T>
	default(def: T): T
	expect(message: string): T | never
	join<L extends any[]>(...args: MaybeTuple<L>): MaybeJoin<Unshift<T, L>>
}

export type Maybe<T> = MaybeSome<T> | MaybeNone<T>

const MaybeJoinNoneSingleton = new MaybeJoinNone<any>()

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
	match<U>(fn: MaybeMatch<T, U>): U {
		return fn.some(this.value)
	}
	change<U>(fn: (value: T) => U): Maybe<U> {
		return Some(fn(this.value))
	}
	and_then<U>(fn: (value: T) => Maybe<U>): Maybe<U> {
		return fn(this.value)
	}
	or(_other: Maybe<T>): Maybe<T> {
		return this
	}
	and<U>(other: Maybe<U>): Maybe<U> {
		return other
	}
	xor(other: Maybe<T>): Maybe<T> {
		return other.is_none()
			? self as Maybe<T>
			: other
	}
	default(_value: T): T {
		return this.value
	}
	expect(_message: string): T | never {
		return this.value
	}
	join<L extends any[]>(...args: MaybeTuple<L>): MaybeJoin<Unshift<T, L>> {
		const others_maybe = _join(args)
		return others_maybe.is_some()
			? new MaybeJoinSome([this.value as T, ...others_maybe.expect(maybe_invariant_message) as L] as Unshift<T, L>)
			: MaybeJoinNoneSingleton
	}
}

export function Some<T>(value: T): Maybe<T> {
	return new MaybeSome(value)
}


function is_function<T>(fn: any): fn is () => T {
	return typeof fn === 'function'
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
	match<U>(fn: MaybeMatch<T, U>): U {
		if (is_function(fn.none))
			return fn.none()
		else
			return fn.none
	}
	change<U>(_fn: (value: T) => U): Maybe<U> {
		return this as any as Maybe<U>
	}
	and_then<U>(_fn: (value: T) => Maybe<U>): Maybe<U> {
		return this as any as Maybe<U>
	}
	or(other: Maybe<T>): Maybe<T> {
		return other
	}
	and<U>(_other: Maybe<U>): Maybe<U> {
		return this as any as Maybe<U>
	}
	xor(other: Maybe<T>): Maybe<T> {
		return other.is_some()
			? other
			: self as Maybe<T>
	}
	default(other: T): T {
		return other
	}
	expect(message: string): T | never {
		throw new Panic(message)
	}
	join<L extends any[]>(..._args: MaybeTuple<L>): MaybeJoin<Unshift<T, L>> {
		return MaybeJoinNoneSingleton
	}
}

export const None = new MaybeNone<any>()

export type MaybeTuple<L extends any[]> = { [K in keyof L]: Maybe<L[K]> }

export type MaybeJoin<L extends any[]> = MaybeJoinSome<L> | MaybeJoinNone<L>

class MaybeJoinSome<L extends any[]> {
	constructor(private readonly values: L) {}

	combine<T>(fn: (...args: L) => T): Maybe<T> {
		return Some(fn(...this.values))
	}

	and_then_combine<T>(fn: (...args: L) => Maybe<T>): Maybe<T> {
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

	and_then_combine<T>(_fn: (...args: L) => Maybe<T>): Maybe<T> {
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
	export function from_nillable<T>(value: NonNullable<T> | null | undefined): Maybe<NonNullable<T>> {
		if (value === null || value === undefined) return None
		else return Some(value)
	}

	export function is_maybe<T>(value: Maybe<T> | any): value is Maybe<T> {
		return 'type' in value && (value.type === MaybeType.Some || value.type === MaybeType.None)
	}

	// perhaps put this on an object extension?
	// export function get_in(obj: object | undefined | null, key: string): Maybe<any> {
	// 	const value = key.split(".").reduce((o, x) => (o === null || o === undefined ? o : (o as any)[x]), obj)
	// 	return Some(value)
	// }

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
			: MaybeJoinNoneSingleton
	}

	export function attempt<T, F extends TryFunc<T>>(fn: F): Maybe<T> {
		try {
			return Some(fn())
		}
		catch (_) {
			return None
		}
	}
}
