export type Unshift<Item, List extends any[]> =
	((first: Item, ...rest: List) => any) extends ((...list: infer R) => any) ? R : never

// this does it!!!!
// https://github.com/Microsoft/TypeScript/issues/26223


// https://www.freecodecamp.org/news/typescript-curry-ramda-types-f747e99744ab/


// type S = Unshift<number, [number, boolean, string]>

// const s: S = [3, 9, true, 'st']

// class Res<A> {
// 	constructor(private val: A) {}

// 	join<L extends any[]>(...rest: L): Unshift<A, L> {
// 		return [this.val, ...rest] as Unshift<A, L>
// 	}
// }



type Head<L extends any[]> =
	L extends [any, ...any[]]
	? L[0]
	: never

type A = Head<[string, number]>

type Tail<L extends any[]> =
	((...l: L) => unknown) extends ((_: any, ...tail: infer R) => unknown)
	? R
	: []

type HasTail<L extends any[]> =
	L extends ([] | [any])
	? false
	: true

type Last<L extends any[]> = {
	0: Last<Tail<L>>
	1: Head<L>
}[
	HasTail<L> extends true
	? 0
	: 1
]

type OnlyOne<L extends any[]> =
	L extends [any]
	? true
	: false

type Func = (arg: any) => any

type SingleParameter<F extends Func> =
	F extends (arg: infer R) => any
	? R
	: never

type ReturnToArg<R extends Func, A extends Func> =
	SingleParameter<A> extends ReturnType<R>
	? true
	: false

type F = ReturnToArg<() => string, (arg: string) => void>

type S = SingleParameter<(args: any[]) => any>


type FoldingFunctions<L extends Func[]> = {
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

type Z = FoldingFunctions<[() => string, (v: number) => boolean]>

