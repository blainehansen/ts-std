import { Dict, tuple as t } from '@ts-std/types'
import { SpecialDict } from './common'
import { Result, Ok, Err, Maybe } from '@ts-std/monads'
import '@ts-std/extensions/dist/array'
import { Indexable } from '@ts-std/extensions/dist/common'
import { ValueProducer, MapFunc, make_key_accessor } from '@ts-std/extensions/dist/array'


export class OrderedDict<T> extends SpecialDict<T> {
	protected constructor(
		protected readonly array: T[],
		protected readonly indexed_items: Dict<{ index: number, element: T }>,
	) {
		super()
		this.items = Object.entries(indexed_items)
			.index_map(([key, { element }]) => t(key, element))
	}

	static create<T>(
		namer: ValueProducer<T, Indexable>,
		array: T[],
	): OrderedDict<T> {
		const to_key = make_key_accessor<T, Indexable>(namer)

		const items = {}
		for (let index = 0; index < array.length; index++) {
			const element = array[index]
			const key = to_key(element, index, array)
			const final_key = '' + key
			items[final_key] = { index, element }
		}

		return new OrderedDict(array, items)
	}

	static create_unique<T>(
		namer: ValueProducer<T, Indexable>,
		array: T[],
	): Result<OrderedDict<T>, [string, T, T]> {
		const to_key = make_key_accessor<T, Indexable>(namer)

		const items = {}
		for (let index = 0; index < array.length; index++) {
			const element = array[index]
			const key = to_key(element, index, array)
			const final_key = '' + key
			if (final_key in items)
				return Err(t(final_key, element, items[final_key].element))

			items[final_key] = { index, element }
		}

		return Ok(new OrderedDict(array, items))
	}

	map<U>(fn: MapFunc<T, U>): OrderedDict<U> {
		const items = {}
		const array = Array.from({ length: this.array.length }) as U[]
		for (const key in this.indexed_items) {
			const { index, element } = this.indexed_items[key]
			const value = fn(element, index, this.array)
			items[key] = { index, element: value }
			array[index] = value
		}

		return new OrderedDict(array, items)
	}

	to_array() {
		return this.array.slice()
	}

	get_by_index(index: number): Maybe<T> {
		return this.array.maybe_get(index)
	}

	get_by_name(name: string): Maybe<T> {
		return Maybe.from_nillable(this.items[name])
	}
}
