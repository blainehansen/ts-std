type IndexableProperties<T> =
	T extends any[] ? { [K in keyof T]: T[K] extends string | number | boolean ? K : never }[number]
	: { [K in keyof T]: T[K] extends string | number | boolean ? K : never }[keyof T]


const thing = {
	a: 's', b: 4, c: '5', d: { complex: 4 }
}

const s: IndexableProperties<typeof thing> = 'a'
const t: IndexableProperties<[string, { val: boolean }]> = '0'

function unfold_by<T>(
	key: IndexableProperties<T>, ...values: T[]
): { [key: string]: T } {
	const r = {} as { [key: string]: T }
	for (const value of values) {
		r['' + (value as any)[key]] = value
	}

	return r
}

console.log(unfold_by<[string, { val: number }]>(
	'0',
		['stuff', { val: 5 }], ['other', { val: 5 }],
	// { name: 'stuff', value: 5 }, { name: 'other', value: 6 }
))


// type KeysOfType<T, U> = {
// 	[K in keyof T]: T[K] extends U ? K : never
// }[keyof T]
// type PickOfType<T, U> = Pick<T, KeysOfType<T, U>>

// type B = KeysOfType<{ a: number, b: boolean }, number>

// function sum(this: number[]): number
// function sum<T>(this: T[], key: KeysOfType<T, number>): number
// function sum<T>(this: T[], key?: KeysOfType<T, number>): number {
// 	if (key === undefined)
// 		return this.reduce((acc, cur) => acc + (cur as any as number), 0)
// 	else
// 		return this.reduce((acc, cur) => acc + (cur[key] as any as number), 0)
// }


// interface Array<T> {
// 	sum(this: number[]): number
// 	sum(this: T[], key: KeysOfType<T, number>): number
// }
// Array.prototype.sum = sum


// const a: number = [1, 1, 1].sum()
// const b: number = [{a: 1, b: true}, {a: 1, b: true}, {a: 1, b: true}].sum('a')
// console.log(a)
// console.log(b)

