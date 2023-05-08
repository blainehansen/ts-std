export type MapFunc<T, U> = (element: T) => U

declare global {
	interface Map<K, V> {
		entries_to_array(this: Map<K, V>): [K, V][]
		entries_map_to_array<U>(this: Map<K, V>, fn: MapFunc<[K, V], U>): U[]

		keys_to_array(this: Map<K, V>): K[]
		keys_map_to_array<U>(this: Map<K, V>, fn: MapFunc<K, U>): U[]

		values_to_array(this: Map<K, V>): V[]
		values_map_to_array<U>(this: Map<K, V>, fn: MapFunc<V, U>): U[]
	}
}


Map.prototype.entries_to_array = function<K, V>(this: Map<K, V>): [K, V][] {
	return Array.from(this.entries())
}
Map.prototype.entries_map_to_array = function<K, V, U>(this: Map<K, V>, fn: MapFunc<[K, V], U>): U[] {
	const give = [] as U[]
	for (const element of this.entries()) {
		give.push(fn(element))
	}
	return give
}
Map.prototype.keys_to_array = function<K, V>(this: Map<K, V>): K[] {
	return Array.from(this.keys())
}
Map.prototype.keys_map_to_array = function<K, V, U>(this: Map<K, V>, fn: MapFunc<K, U>): U[] {
	const give = [] as U[]
	for (const element of this.keys()) {
		give.push(fn(element))
	}
	return give
}
Map.prototype.values_to_array = function<K, V>(this: Map<K, V>): V[] {
	return Array.from(this.values())
}
Map.prototype.values_map_to_array = function<K, V, U>(this: Map<K, V>, fn: MapFunc<V, U>): U[] {
	const give = [] as U[]
	for (const element of this.values()) {
		give.push(fn(element))
	}
	return give
}
