import { Result, Ok, Err } from '@ts-actually-safe/types'

export interface Decoder<T> {
	name: string,
	decode<T>(obj: any) => Result<T>,
}

export type DecoderTuple<L extends any[]> = { [K in keyof L]: Decoder<L[K]> }

export function any<L extends any[]>(obj: any, ...decoders: DecoderTuple<L>): Result<L[number]> {
	for (const decoder of decoders) {
		const result = decoder.decode(obj)
		if (result.is_ok()) return result
	}

	return Err("")
}

export function all<L extends ((arg: any) => any)[]>(obj: any, ...decoders: L): Result<FoldingFunctions<L>> {
	let last_result = obj
	for (const decoder of decoders) {
		//
	}

	return last_result
}


export const string: Decoder<string> = {
	name: 'string',
	decode(obj: any): Result<string> {
		if (typeof obj === 'string') return Ok(obj)
		else return Err(`expected string, got ${obj}`)
	}
}
export const number: Decoder<number> = {
	name: 'number',
	decode(obj: any): Result<number> {
		if (typeof obj === 'number') return Ok(obj)
		else return Err(`expected number, got ${obj}`)
	},
}
export const boolean: Decoder<boolean> = {
	name: 'boolean',
	decode(obj: any): Result<boolean> {
		if (typeof obj === 'boolean') return Ok(obj)
		else return Err(`expected boolean, got ${obj}`)
	},
}

export function exactly<T extends string>(value: T): Decoder<T>
export function exactly<T extends boolean>(value: T): Decoder<T>
export function exactly<T extends number>(value: T): Decoder<T>
export function exactly(value: null): Decoder<null>
export function exactly(value: undefined): Decoder<undefined>

// export class exactly {
// 	constructor(private value: )
// }

export function exactly(value: any): any {
	// switch (typeof value) {
	// 	case 'string': return
	// 	case 'boolean': return
	// 	case 'number': return
	// }

	return function(obj: any) {
		if (obj === value) return Ok(value)
		else return Err(`expected exactly ${value}, got: ${obj}`)
	}
}

export const exactly_undefined = exactly(undefined)
export const exactly_null = exactly(null)


abstract class collection_decoder<T> {
	name: string
	constructor(private decoder: Decoder<T>) {
		this.name = decoder.name
	}
}

export class array<T> extends collection_decoder<T> implements Decoder<T[]> {
	decode(obj: any) {
		if (!Array.isArray(obj)) return Err(`expected array, got ${obj}`)

		const give: T[] = []
		for (let index = 0; index < obj.length; index++) {
			const item = obj[index]
			const result = this.decoder.decode(item)
			if (result.is_err()) return Err(`invalid item while decoding array of ${this.name}: at index ${index}, got ${obj}`)

			give.push(result.unwrap())
		}

		return Ok(give)
	}
}

export class dictionary<T> extends collection_decoder<T> implements Decoder<{ [key: string]: T }> {
	decode(obj: any, in_place = false) {
		if (!is_object(obj)) return Err(`expecting dictionary of ${this.name}, got ${obj}`)

		const give = in_place
			? obj
			: {} as { [key: string]: T }

		for (const key in obj) {
			const value = obj[key]
			const result = this.decoder.decode(value)
			if (result.is_err()) return Err(`invalid item while decoding dictionary of ${this.name}: at key ${key}, got ${value}`)
			give[key] = result.unwrap()
		}

		return Ok(give)
	}
}

export function enum() {

}

export function tuple<L extends any[]>(...decoders: DecoderTuple<L>): Decoder<L> {
	return function(obj: any): Result<L> {
		if (!Array.isArray(obj)) return Err(``)
		if (obj.length !== decoders.length) return Err(``)

		const t = [] as L
		for (let index = 0; index < decoders.length; index++) {
			const decoder = decoders[index]
			const value = obj[index]
			const result = decoder(value)
			if (result.is_err()) return result
			t.push(result.unwrap())
		}

		return t
	}
}




function is_object(obj: any): obj is Object {
	return typeof obj === 'object' && obj !== null && !Array.isArray(obj)
}

export function object<T>(decoders: { [K in keyof T]: Decoder<T[K]> }, name: string): Decoder<T> {
	return function(obj: any): T {
		if (!is_object(obj)) return Err(`Failed to decode a valid ${name}, input is not an object: ${obj}`)

		const t = {} as T
		for (const [key, decoder] of Object.entries(decoders)) {
			if (!(key in obj)) return Err(`Failed to decode a valid ${name}, input doesn't have value for key: ${key}`)
			const value = obj[key]
			const result = decoder(value)
			if (result.is_err()) return Err(`Failed to decode a valid ${name}, key ${key} has invalid value: ${value}`)
			t[key] = result.unwrap()
		}

		return t
	}
}
