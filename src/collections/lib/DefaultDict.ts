import { Dict } from '@ts-std/types'
import { SpecialDict } from './common'

export class DefaultDict<T> extends SpecialDict<T> {
	constructor(readonly initializer: () => T) { super() }

	get(key: string): T {
		if (!(key in this.items))
			return this.items[key] = this.initializer()
		return this.items[key]
	}
}
