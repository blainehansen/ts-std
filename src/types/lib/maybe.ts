import { Unshift } from './utils'
type Req<T> = NonNullable<T>

const MaybeType = {
	Some: Symbol("Maybe.Some"),
	None: Symbol("Maybe.None"),
} as const

export type MaybeMatch<T, U> = {
	some: (value: T) => Req<U>,
	none: (() => Req<U>) | Req<U>
}

export interface MaybeLike<T> {
	type: symbol
	is_some(): boolean
	is_none(): boolean
	to_undef(): T | undefined
	match<U>(fn: MaybeMatch<T, U>): U
	change<U>(fn: (value: T) => Req<U>): Maybe<U>
	and_then<U>(fn: (value: T) => Maybe<U>): Maybe<U>
	or<U>(other: Maybe<U>): Maybe<T | U>
	and<U>(other: Maybe<U>): Maybe<U>
	unwrap_or(def: Req<T>): T
	unwrap(): T | never
	expect(message: string): T | never
	join<L extends any[]>(...args: MaybeTuple<L>): MaybeJoin<Unshift<T, L>>
}

export type Maybe<T> = MaybeSome<T> | MaybeNone<T>

class MaybePanic extends Error {}

class MaybeSome<T> implements MaybeLike<T> {
	readonly type = MaybeType.Some
	constructor(private readonly value: Req<T>) {}

	is_some(): boolean {
		return true
	}
	is_none(): boolean {
		return false
	}
	to_undef(): T {
		return this.value
	}
	match<U>(fn: MaybeMatch<T, U>): U {
		return fn.some(this.value)
	}
	change<U>(fn: (value: T) => Req<U>): Maybe<U> {
		return Some(fn(this.value))
	}
	and_then<U>(fn: (value: T) => Maybe<U>): Maybe<U> {
		return fn(this.value)
	}
	or<U>(_other: Maybe<U>): Maybe<T> {
		return this
	}
	and<U>(other: Maybe<U>): Maybe<U> {
		return other
	}
	unwrap_or(_value: Req<T>): T {
		return this.value
	}
	unwrap(): T {
		return this.value
	}
	expect(_message: string): T {
		return this.value
	}
	join<L extends any[]>(...args: MaybeTuple<L>): MaybeJoin<Unshift<T, L>> {
		const others_maybe = _join(args)
		return others_maybe.is_some()
			? new MaybeJoinSome([this.value as T, ...others_maybe.unwrap() as L] as Unshift<T, L>)
			: new MaybeJoinNone()
	}
}

export function Some<T>(value: Req<T>): Maybe<T> {
	return new MaybeSome(value)
}


function is_function<T>(fn: any): fn is () => T {
	return typeof fn === 'function'
}

class MaybeNone<T> implements MaybeLike<T> {
	readonly type = MaybeType.None

	is_some(): boolean {
		return false
	}
	is_none(): boolean {
		return true
	}
	to_undef(): undefined {
		return undefined
	}
	match<U>(fn: MaybeMatch<T, U>): U {
		if (is_function(fn.none))
			return fn.none()
		else
			return fn.none
	}
	change<U>(_fn: (value: T) => Req<U>): MaybeNone<U> {
		return this as any as MaybeNone<U>
	}
	and_then<U>(_fn: (value: T) => Maybe<U>): MaybeNone<U> {
		return this as any as MaybeNone<U>
	}
	or<U>(other: Maybe<U>): Maybe<U> {
		return other
	}
	and<U>(_other: Maybe<U>): MaybeNone<U> {
		return this as any as MaybeNone<U>
	}
	unwrap_or(other: Req<T>): T {
		return other
	}
	unwrap(): never {
		throw new MaybePanic("Trying to unwrap None.")
	}
	expect(message: string): never {
		throw new MaybePanic(message)
	}
	join<L extends any[]>(..._args: MaybeTuple<L>): MaybeJoin<Unshift<T, L>> {
		return new MaybeJoinNone()
	}
}

export function None<T>(): Maybe<T> {
	return new MaybeNone()
}


type MaybeTuple<L extends any[]> = { [K in keyof L]: Maybe<L[K]> }

type MaybeJoin<L extends any[]> = MaybeJoinSome<L> | MaybeJoinNone<L>

class MaybeJoinSome<L extends any[]> {
	constructor(private readonly values: L) {}

	combine<T>(fn: (...args: L) => Req<T>): Maybe<T> {
		return Some(fn(...this.values))
	}

	and_then_combine<T>(fn: (...args: L) => Maybe<T>): Maybe<T> {
		return fn(...this.values)
	}

	into_maybe(): Maybe<L> {
		return Some(this.values as Req<L>)
	}
}

class MaybeJoinNone<L extends any[]> {
	combine<T>(_fn: (...args: L) => Req<T>): Maybe<T> {
		return None()
	}

	and_then_combine<T>(_fn: (...args: L) => Maybe<T>): Maybe<T> {
		return None()
	}

	into_maybe(): Maybe<L> {
		return None()
	}
}


function _join<L extends any[]>(maybes: MaybeTuple<L>): Maybe<L> {
	// DANGER: test to ensure type invariant holds
	const args = [] as any as Req<L>
	for (const maybe of maybes)
		if (maybe.is_some()) args.push(maybe.unwrap())
		else return maybe

	return Some(args)
}

export namespace Maybe {
	export function from_nullable<T>(value: Req<T> | null | undefined): Maybe<T> {
		if (value === null || value === undefined) return None()
		else return Some(value)
	}

	export function is_maybe<T>(value: Maybe<T> | any): value is Maybe<T> {
		return 'type' in value && (value.type === MaybeType.Some || value.type === MaybeType.None)
	}

	// export function is_some<T>(value: Maybe<T>): value is MaybeSome<T> {
	// 	if (!is_maybe(value)) throw new TypeError("parameter of `is_some` is not a Maybe")
	// 	return value.is_some()
	// }

	// export function is_none<T>(value: Maybe<T>): value is MaybeNone<T> {
	// 	if (!is_maybe(value)) throw new TypeError("parameter of `is_none` is not a Maybe")
	// 	return value.is_none()
	// }

	// export function get_in(obj: object | undefined | null, key: string): Maybe<any> {
	// 	const value = key.split(".").reduce((o, x) => (o === null || o === undefined ? o : (o as any)[x]), obj)
	// 	return Some(value)
	// }

	export function all<T>(maybes: Maybe<T>[]): Maybe<T[]> {
		return _join(maybes)
	}

	export function join<L extends any[]>(...maybes: MaybeTuple<L>): MaybeJoin<L> {
		const others_maybe = _join(maybes)
		return others_maybe.is_some()
			? new MaybeJoinSome(others_maybe.unwrap() as Req<L>)
			: new MaybeJoinNone()
	}


	type TryFunc<T> = (() => Req<T>)

	export function attempt<T, F extends TryFunc<T>>(fn: F): Maybe<T> {
		try {
			return Some(fn())
		}
		catch (_) {
			return None()
		}
	}
}
