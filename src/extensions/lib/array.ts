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
