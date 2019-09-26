// https://github.com/Microsoft/TypeScript/issues/26223
// https://www.freecodecamp.org/news/typescript-curry-ramda-types-f747e99744ab/
// https://github.com/Microsoft/TypeScript/issues/23182

export function assert_boolean_type<T extends boolean>(expectTrue: T extends true ? true : false) {}
export function assert_is_type<T, U>(expectTrue: IsType<T, U> extends true ? true : false) {}
export function assert_is_never<T>(expectTrue: IsNever<T> extends true ? true : false) {}

export function assert_type<T>(value: T) {}
export function assert_value_types<T, U>(a: T, b: U, expectTrue: IsType<T, U> extends true ? true : false) {}

// this uses a gross version of "and"
export type IsType<T, U> =
	[T] extends [U] ? [U] extends [T]
		? true
		: false : false

export type IsNever<T> = IsType<T, never>

export type Unshift<Item, List extends any[]> =
	((first: Item, ...rest: List) => any) extends ((...list: infer R) => any) ? R : never



export type KeysOfType<T, U> = T extends any[]
	? { [K in keyof T]: T[K] extends U ? K : never }[number]
	: { [K in keyof T]: T[K] extends U ? K : never }[keyof T]
export type PickOfType<T, U> = Pick<T, KeysOfType<T, U>>


export type Head<L extends any[]> =
	L extends [any, ...any[]]
	? L[0]
	: never

export type Tail<L extends any[]> =
	((...l: L) => unknown) extends ((_: any, ...tail: infer R) => unknown)
	? R
	: []

export type HasTail<L extends any[]> =
	L extends ([] | [any])
	? false
	: true

export type Last<L extends any[]> = {
	0: Last<Tail<L>>
	1: Head<L>
}[
	HasTail<L> extends true
	? 0
	: 1
]

export type OnlyOne<L extends any[]> =
	L extends [any]
	? true
	: false

export type Func = (arg: any) => any

export type SingleParameter<F extends Func> =
	F extends (arg: infer R) => any
	? R
	: never

type ReturnToArg<R extends Func, A extends Func> =
	SingleParameter<A> extends ReturnType<R>
	? true
	: false

export type FoldingFunctions<L extends Func[]> = {
	// base case
	0: ReturnType<L[0]>
	// recursive case
	1: FoldingFunctions<Tail<L>>
	// failure case
	2: never
}[
	HasTail<L> extends true
	? ReturnToArg<Head<L>, Head<Tail<L>>> extends true
		? 1
		: 2
	: OnlyOne<L> extends true
		? 0
		: 2
]


export function tuple<L extends any[]>(...values: L): L {
	return values as L
}




// type RawOptions<T> = {
// 	default?: T,
// 	lazy?: true,
// 	fn: () => T,
// }

// type DetermineReturn<T, O extends RawOptions<T>> = {
// 	promise: O['default'] extends undefined
// 		? O['lazy'] extends undefined
// 			? Promise<T | null>
// 			: Promise<T | null> | null
// 		: O['lazy'] extends undefined
// 			? Promise<T>
// 			: Promise<T> | null,
// 	value: O['default'] extends undefined
// 		? T | null
// 		: T,
// }

// function t<T, O extends RawOptions<T>>(opt: O): DetermineReturn<T, O> {
// 	throw new Error("")
// }

// const a = t({ fn: () => 4 })

// console.log(a.value + 4)


// type MushyReturn<T> = {
// 	promise: Promise<T | null> | null,
// 	value: T | null,
// }

// type Overwrite<A, B> = {
// 	[K in Exclude<keyof A, keyof B>]: A[K]
// } & B


// type DetermineReturn<O> =
// 	O extends RawOptions<infer T>
// 	?  O['default'] extends undefined
// 		// there isn't a default, so the null stays
// 		? DetermineReturnLazy<T, O, MushyReturn<T>>
// 		// there is a default, so we kill the null
// 		: DetermineReturnLazy<T, O, Overwrite<MushyReturn<T>, { promise: Promise<T | null>, value: T }>>
// 	: never


// type DetermineReturnLazy<T, O extends RawOptions<T>, S extends MushyReturn<T>> =
// 	O['lazy'] extends undefined
// 	// it isn't lazy, so we kill the null from promise
// 	? Overwrite<S, { promise: NonNullable<S['promise']> }>
// 	// it is lazy, so we keep the null on promise, and we're done
// 	: S


// function thing<T>(
// 	opt: RawOptions<T>,
// ): DetermineReturn<typeof opt> {
// 	throw new Error("")
// }

// const a = thing({ fn: () => 4 })

// console.log(a.value + 4)
