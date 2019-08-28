export * from './result'


// type Constructor<T, A extends any[]> = { new(...args: any[]): T }
// type Constructor<T> = { new(...args: any[]): T }

// type GetDescriptor<T, A extends any[]> = { get: (...args: A) => T }

// function asyncData<T>(
// 	target: Object, propertyName: string | symbol,
// 	// descriptor: TypedPropertyDescriptor<Promise<T>>
// ) {
// 	// capture the method
// 	// create a closure

// 	// const original = descriptor.get as () => Promise<T>

// 	// place the new correct things on the class instance to make *vue* do the right thing
// 	// Object.defineProperty(target, propertyName)

// 	// descriptor.get = function() {
// 	// 	return original()
// 	// }

// 	// return descriptor
// }

// function asyncComputed(debounce: number) {
// 	return function(target: Object, propertyName: string | symbol, descriptor: PropertyDescriptor) {
// 		const original = descriptor.get
// 	}
// }

// // function asyncData<T, R, K extends keyof T>(fn: () => R) {
// function asyncData<T, R>(fn: () => R)
// function asyncData<T, T>(fn: (this: T) => R) {
// 	return function(target: T, propertyName: string | symbol) {
// 		const val = (target as any)[propertyName]

// 		if (delete target[propertyName]) {
// 			Object.defineProperty(target, propertyName, {
// 				get() {
// 					if (val !== undefined) return val
// 					return fn.apply(this)
// 				},
// 				enumerable: false,
// 				configurable: false,
// 			})
// 		}
// 	}
// }

// import Promise from 'bluebird'

// function look(target: Object, propertyName: string) {
// 	console.log('bound')
// }

// function hello() {
// 	console.log('called')
// 	return Promise.resolve('hello')
// }

// function AsyncData<T, R>(fn: (this: T) => R) {

// }

// class Thing {
// 	p: string = 'hello'

// 	d = AsyncData(async function() {
// 		return this.p + await Promise.resolve(' world')
// 	})

// 	get relies() {
// 		return this.d.then(d => d + ' world')
// 	}

// 	// @asyncData
// 	// get stuff() {
// 	// 	return Promise.resolve('stuff')
// 	// }

// 	// @asyncComputed(200)
// 	// get hey() {
// 	// 	return Promise.resolve('hey')
// 	// }

// 	// get needHey() {
// 	// 	return this.hey.is_ok()
// 	// }
// }

// new Thing()


// class VueAsync<T> {
// 	constructor() {}

// 	data() {
// 		return new VueAsyncData()
// 	}

// 	computed() {
// 		//
// 	}
// }

// class VueAsyncData<T, V extends Vue, W extends (keyof V)[]> {
// 	private _promise: Promise<T>
// 	private _value: T

// 	constructor(
// 		readonly watch: W,
// 		readonly fn: (deps: { [K in keyof W]: V[K] }) => Promise<T>,
// 	) {

// 	}

// 	get promise() {
// 		return this._promise
// 	}
// 	get value() {
// 		return this._value
// 	}
// }



export class IceCreamComponent {
	@Emoji()
	flavor = 'vanilla'
}


// Property Decorator
function Emoji() {
	return function(target: Object, key: string | symbol) {

		let val = target[key]

		const getter = () => {
			return val
		}
		const setter = (next) => {
			console.log('updating flavor...')
			val = `${next}`
		}

		Object.defineProperty(target, key, {
			get: getter,
			set: setter,
			enumerable: true,
			configurable: true,
		})
	}
}






type AsyncData<T, E extends Error> = {
	readonly promise: Promise<T>,
	readonly value: T,
	readonly error: E,
	readonly loading: boolean,
	readonly refresh: () => void
}

type Obj<C, K extends keyof C> = { [A in K]: C[A] }

type AsyncDataOptions<T> = {

}

// type NoDefaultAsyncDataOptions<T> = AsyncDataOptions

function data<T, C, K extends keyof C>(self: C, attrs: K[],
	fn: (this: C) => Promise<T>,
	default?: T,
): AsyncData<T> {
	let [promise, value] = default !== undefined
		?	[Promise.resolve(default), default]
		: [Promise.resolve(null), null]

	let error = null
	let loading = false

	self.$watch(
		function(this: C) {
			return pick(this, attrs)
		},
		function(obj: Obj<C, K>) {
			const p = fn(obj)
			if (is_promise(p)) {
				loading = true
				promise = p
				p.then(v => { value = v })
			}
		},
		{ deep: true, immediate: !lazy },
	)

	return { promise, value, error, loading }
}

class Comp {
	id = 3

	// @data(['id'], async({ id }) => fetch(id))
	// post!: AsyncData<number>
	post_id = data(() => Promise.resolve(this.id))
}
