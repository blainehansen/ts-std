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
// function asyncData<T, R>(fn: () => R);
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
