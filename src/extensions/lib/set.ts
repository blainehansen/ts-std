export type MapFunc<T, U> = (element: T) => U

declare global {
	interface Set<T> {
		to_array<U>(this: Set<T>): T[]
		map_to_array<U>(this: Set<T>, fn: MapFunc<T, U>): T[]
	}
}

Set.prototype.to_array = function<T>(this: Set<T>): T[] {
	return Array.from(this)
}

Set.prototype.map_to_array = function<T, U>(this: Set<T>, fn: MapFunc<T, U>): U[] {
	const give = [] as U[]
	for (const element of this) {
		give.push(fn(element))
	}
	return give
}
