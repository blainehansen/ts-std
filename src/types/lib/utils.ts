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
