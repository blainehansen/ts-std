export class Panic extends Error {}

export type Req<T> = NonNullable<T>

export type TryFunc<T> = () => Req<T>

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






type RawOptions<T> = {
	default?: T,
	lazy?: true,
	fn: () => T,
}

type DetermineReturn<T, O extends RawOptions<T>> = {
	promise: O['default'] extends undefined
		? O['lazy'] extends undefined
			? Promise<T | null>
			: Promise<T | null> | null
		: O['lazy'] extends undefined
			? Promise<T>
			: Promise<T> | null,
	value: O['default'] extends undefined
		? T | null
		: T,
}

function t<T, O extends RawOptions<T>>(opt: O): DetermineReturn<T, O> {
	throw new Error("")
}

const a = t({ fn: () => 4 })

console.log(a.value + 4)


type MushyReturn<T> = {
	promise: Promise<T | null> | null,
	value: T | null,
}

type Overwrite<A, B> = {
	[K in Exclude<keyof A, keyof B>]: A[K]
} & B


type DetermineReturn<O> =
	O extends RawOptions<infer T>
	?  O['default'] extends undefined
		// there isn't a default, so the null stays
		? DetermineReturnLazy<T, O, MushyReturn<T>>
		// there is a default, so we kill the null
		: DetermineReturnLazy<T, O, Overwrite<MushyReturn<T>, { promise: Promise<T | null>, value: T }>>
	: never


type DetermineReturnLazy<T, O extends RawOptions<T>, S extends MushyReturn<T>> =
	O['lazy'] extends undefined
	// it isn't lazy, so we kill the null from promise
	? Overwrite<S, { promise: NonNullable<S['promise']> }>
	// it is lazy, so we keep the null on promise, and we're done
	: S


function thing<T>(
	opt: RawOptions<T>,
): DetermineReturn<typeof opt> {
	throw new Error("")
}

const a = thing({ fn: () => 4 })

console.log(a.value + 4)








// type Args = [number, boolean, string]
// type K = Args[number]

// // interface Decoder<T> {
// //     decode(obj: any): Result<T>
// // }

// type Decoder<T> = {
// 		decode: (obj: any) => Result<T>
// }


// type Result<T> = [true, T] | [false, undefined]

// type DecoderTuple<T extends any[]> = { [K in keyof T]: Decoder<T[K]> }

// function oneOf<L extends any[]>(obj: any, ...decoders: DecoderTuple<L>): Result<L[number]> {
// 	for (const decoder of decoders) {
// 		const [successful, value] = decoder.decode(obj)
// 		if (successful) return [true, value]
// 	}

// 	return [false, undefined]
// }


// const str = {
// 	decode(obj: any): Result<string> {
// 		if (typeof obj === 'string') return [true, obj]
// 		else return [false, undefined]
// 	}
// }
// const num = {
// 	decode(obj: any): Result<number> {
// 		if (typeof obj === 'number') return [true, obj]
// 		else return [false, undefined]
// 	}
// }
// const bool = {
// 	decode(obj: any): Result<boolean> {
// 		if (typeof obj === 'boolean') return [true, obj]
// 		else return [false, undefined]
// 	}
// }

// const o: any = 'd'

// const a = oneOf(o, str, num, bool)
