export type Indexable = string | number | boolean

// type Box<T> = { v: T }

// type Unbox<T> = {
// 	0: T extends Box<infer U> ? Unbox<U> : never,
// 	1: T,
// }[
// 	T extends Box<unknown>
// 		? 0
// 		: 1
// ]

// function is_box(box: any): box is Box<any> {
// 	return 'v' in box
// }

// function flatten<B extends Box<any>>(box: B): Unbox<B> {
// 	let current_box = box
// 	while (is_box(current_box)) {
// 		current_box = current_box.v
// 	}

// 	return current_box as Unbox<B>
// }

// const a = flatten({ v: { v: { v: { v: 5 } } } })

