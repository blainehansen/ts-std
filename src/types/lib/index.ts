// https://github.com/Microsoft/TypeScript/issues/26223
// https://www.freecodecamp.org/news/typescript-curry-ramda-types-f747e99744ab/
// https://github.com/Microsoft/TypeScript/issues/23182

export function tuple<L extends any[]>(...values: L): L {
	return values as L
}

export type AnyFunc = (...args: any[]) => any

export namespace assert_type {
	export function boolean<B extends boolean>(
		expect_true: B extends true ? true : false
	) {}
	export function value_boolean<B extends boolean>(
		b: B,
		expect_true: B extends true ? true : false
	) {}

	export function same<A, B>(
		expect_true: Same<A, B> extends true ? true : false
	) {}
	export function values_same<A, B>(
		a: A, b: B,
		expect_true: Same<A, B> extends true ? true : false
	) {}

	export function never<A>(
		expect_true: IsNever<A> extends true ? true : false
	) {}
	export function value_never<A>(
		a: A,
		expect_true: IsNever<A> extends true ? true : false
	) {}

	export function value<A>(
		a: A
	) {}


	export function assignable<A, B>(
		expect_true: B extends A ? true : false
	) {}

	export function values_assignable<A, B>(
		a: A, b: B,
		expect_true: B extends A ? true : false
	) {}

	export function callable<F extends AnyFunc, A>(
		expect_true: A extends Parameters<F> ? true : false
	) {}
	export function values_callable<F extends AnyFunc, A>(
		f: F, a: A,
		expect_true: A extends Parameters<F> ? true : false
	) {}

	export function returnable<R, F extends AnyFunc>(
		expect_true: ReturnType<F> extends R ? true : false
	) {}
	export function values_returnable<R, F extends AnyFunc>(
		r: R, f: F,
		expect_true: ReturnType<F> extends R ? true : false
	) {}
}


export type Dict<T> = { [key: string]: T }

export type Cast<T, U> = T extends U ? T : never

export type UnionToIntersection<U> =
	(U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

export type TupleIntersection<L extends any[]> = UnionToIntersection<L[number]>

// this uses a gross version of "and"
export type Same<A, B> =
	[A] extends [B] ? [B] extends [A]
		? true
		: false : false

export type IsNever<T> = Same<T, never>

export type Unshift<Item, List extends any[]> =
	((first: Item, ...rest: List) => any) extends ((...list: infer R) => any) ? R : never


export type KeysOfType<T, U> = T extends any[]
	? { [K in keyof T]: T[K] extends U ? K : never }[number]
	: { [K in keyof T]: T[K] extends U ? K : never }[keyof T]
export type PickOfType<T, U> = Pick<T, Cast<KeysOfType<T, U>, keyof T>>

export type Overwrite<A, B> = {
	[K in Exclude<keyof A, keyof B>]: A[K]
} & B


// https://github.com/microsoft/TypeScript/issues/28791#issuecomment-443520161
export type UnionKeys<T> = T extends T ? keyof T : never

export type OmitVariants<U, K extends UnionKeys<U>, V extends U[K]> = U extends U
	? U[K] extends V ? never : U
	: never

export type PickVariants<U, K extends UnionKeys<U>, V extends U[K]> = U extends U
	? U[K] extends V ? U : never
	: never


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



// export type Length<T extends any[]> = T['length']

// export type Pos<I extends any[]> = Length<I>

// export type Next<I extends any[]> = Unshift<any, I>


// export type Reverse<T extends any[], R extends any[] = [], I extends any[] = []> = {
// 	0: Reverse<T, Unshift<T[Pos<I>], R>, Next<I>>
// 	1: R
// }[
// 	Pos<I> extends Length<T>
// 	? 1
// 	: 0
// ]

// export type Concat<T1 extends any[], T2 extends any[]> = Reverse<Cast<Reverse<T1>, any[]>, T2>





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
