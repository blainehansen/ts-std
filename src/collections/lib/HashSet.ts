import {
	Items, ItemsHolder, Hashable, ValueProducer, string_to_hash, make_transformer,
	union_items, intersection_items, difference_items,
} from './common'

export function HashSet<T>(to_hash: ValueProducer<T, number>, ...items: T[]): HashSetClass<T> {
	return new HashSetClass(make_transformer(to_hash), items)
}

export namespace HashSet {
	export function from<T>(to_hash: ValueProducer<T, number>, items: T[]): HashSetClass<T> {
		return new HashSetClass(make_transformer(to_hash), items)
	}
	export function from_hashable<T extends Hashable>(items: T[]) {
		return new HashSetClass(t => t.to_hash(), items)
	}
	export function of_hashable<T extends Hashable>(...items: T[]) {
		return new HashSetClass(t => t.to_hash(), items)
	}
	export function from_numbers(items: number[]) {
		return new HashSetClass(n => n, items)
	}
	export function of_numbers(...items: number[]) {
		return new HashSetClass(n => n, items)
	}
	export function from_strings(items: string[]) {
		return new HashSetClass(string_to_hash, items)
	}
	export function of_strings(...items: string[]) {
		return new HashSetClass(string_to_hash, items)
	}
}


class HashSetClass<T> implements Iterable<T> {
	protected items!: Items<T>
	constructor(
		readonly to_hash: (value: T) => number,
		items: T[],
	) {
		this.set_items(items)
	}

	set_items(items: T[]): this {
		this.items = {}
		for (let index = 0; index < items.length; index++) {
			const item = items[index]
			const hash_key = this.to_hash(item)
			this.items[hash_key] = item
		}

		return this
	}

	equal(other: HashSetClass<T>): boolean {
		const this_hash_keys = Object.keys(this.items).sort()
		const other_hash_keys = Object.keys(other.items).sort()

		if (this_hash_keys.length !== other_hash_keys.length)
			return false

		let t
		let o
		while ((t = this_hash_keys.pop()) && (o = other_hash_keys.pop())) {
			if (t !== o)
				return false
		}
		return true
	}

	get size() { return Object.keys(this.items).length }

	*[Symbol.iterator]() {
		const values = Object.values(this.items)
		for (let index = 0; index < values.length; index++) {
			yield values[index]
		}
	}

	values() {
		return Object.values(this.items)
	}

	has(item: T): boolean {
		const hash_key = this.to_hash(item)
		return hash_key in this.items
	}

	add(item: T): this {
		const hash_key = this.to_hash(item)
		this.items[hash_key] = item
		return this
	}

	add_all(...items: T[]): this {
		for (let index = 0; index < items.length; index++) {
			const item = items[index]
			const hash_key = this.to_hash(item)
			this.items[hash_key] = item
		}
		return this
	}

	delete(item: T): this {
		const hash_key = this.to_hash(item)
		delete this.items[hash_key]
		return this
	}

	delete_all(...items: T[]): this {
		for (let index = 0; index < items.length; index++) {
			const item = items[index]
			const hash_key = this.to_hash(item)
			delete this.items[hash_key]
		}
		return this
	}

	clear(): this {
		this.items = {}
		return this
	}


	protected static union_items<T>(items: Items<T>, others: HashSetClass<T>[]) {
		return union_items(items, others as any as ItemsHolder<T>[])
	}

	// mutating version of union
	mutate_union(other: HashSetClass<T>, ...rest: HashSetClass<T>[]): this {
		this.items = HashSetClass.union_items(this.items, [other].concat(rest))
		return this
	}

	// non-mutating
	union(other: HashSetClass<T>, ...rest: HashSetClass<T>[]): HashSetClass<T> {
		const items = HashSetClass.union_items({ ...this.items }, [other].concat(rest))
		const s = new HashSetClass<T>(this.to_hash, [])
		s.items = items
		return s
	}


	protected static intersection_items<T>(items: Items<T>, others: HashSetClass<T>[]) {
		return intersection_items(items, others as any as ItemsHolder<T>[])
	}

	// in place version of intersection
	mutate_intersection(other: HashSetClass<T>, ...rest: HashSetClass<T>[]): this {
		this.items = HashSetClass.intersection_items(this.items, [other].concat(rest))
		return this
	}

	// non-mutating
	intersection(other: HashSetClass<T>, ...rest: HashSetClass<T>[]): HashSetClass<T> {
		const items = HashSetClass.intersection_items({ ...this.items }, [other].concat(rest))
		const s = new HashSetClass<T>(this.to_hash, [])
		s.items = items
		return s
	}


	protected static difference_items<T>(items: Items<T>, others: HashSetClass<T>[]) {
		return difference_items(items, others as any as ItemsHolder<T>[])
	}

	// in place version of difference
	mutate_difference(other: HashSetClass<T>, ...rest: HashSetClass<T>[]): this {
		this.items = HashSetClass.difference_items(this.items, [other].concat(rest))
		return this
	}

	// non-mutating
	difference(other: HashSetClass<T>, ...rest: HashSetClass<T>[]): HashSetClass<T> {
		const items = HashSetClass.difference_items({ ...this.items }, [other].concat(rest))
		const s = new HashSetClass<T>(this.to_hash, [])
		s.items = items
		return s
	}
}
