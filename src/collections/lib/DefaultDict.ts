import { Dict } from '@ts-std/types'

export class DefaultDict<T> {
	protected items: Dict<T> = {}
	constructor(readonly initializer: () => T) {}

	get(key: string): T {
		const item = this.items[key]
		if (item === undefined)
			return this.items[key] = this.initializer()
		return item
	}

	into_array<K extends string, I extends string>(
		key_symbol: K,
		item_symbol: I,
	): { [k in K]: string, [i in I]: T }[] {
		const give = [] as { [k in K]: string, [i in I]: T }[]
		for (const key in this.items) {
			const item = this.items[key]
			give.push({
				[key_symbol]: key,
				[item_symbol]: item,
			})
		}

		return give
	}
}
