import { Dict } from '@ts-std/types'
import { SpecialDict } from './common'
import { Result, Ok, Err, Maybe } from '@ts-std/monads'
import '@ts-std/extensions/dist/array'
import { Indexable } from '@ts-std/extensions/dist/common'
import { ValueProducer } from '@ts-std/extensions/dist/array'

export class OrderedDict<T> extends SpecialDict<T> {
	protected constructor(
		protected readonly array: T[],
		items: Dict<T>,
	) {
		super()
		this.items = items
	}

	static create<T>(
		namer: ValueProducer<T, Indexable>,
		array: T[],
	): Result<OrderedDict<T>, [string, T, T]> {
		const index_result = array.unique_index_by(namer)
		if (index_result.is_err())
			return Err(index_result.error)
		const items = index_result.value
		return Ok(new OrderedDict(array, items))
	}

	get_by_index(index: number): Maybe<T> {
		return this.array.maybe_get(index)
	}

	get_by_name(name: string): Maybe<T> {
		return Maybe.from_nillable(this.items[name])
	}
}
