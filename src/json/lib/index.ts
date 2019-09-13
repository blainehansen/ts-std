import { Result, Ok, Err } from '@ts-actually-safe/types'

export interface Decoder<T> {
	readonly name: string,
	readonly decode<T>(obj: any) => Result<T>,
}

export type DecoderTuple<L extends any[]> = { [K in keyof L]: Decoder<L[K]> }


class AnyDecoder<L extends any[]> implements Decoder<L[number]> {
	readonly name: string
	constructor(private readonly decoders: DecoderTuple<L>) {
		this.name = 'any: ' + decoders.map(d => d.name).join(', ')
		this.decoders = decoders
	}

	decode(obj: any) {
		for (const decoder of decoders) {
			const result = decoder.decode(obj)
			if (result.is_ok()) return result
		}

		return Err(`expected ${this.name}; got ${obj}`)
	}
}
export function any<L extends any[]>(...decoders: DecoderTuple<L>): Decoder<L[number]> {
	return new AnyDecoder(decoders)
}

// export class all<L extends any[]> implements Decoder<FoldingFunctions<L>> {
// 	name: string
// 	private readonly decoders: DecoderTuple<L>
// 	constructor(...decoders: DecoderTuple<L>) {
// 		this.name = 'all: ' + decoders.map(d => d.name).join(', ')
// 		this.decoders = decoders
// 	}

// 	decode(obj: any) {
// 		let last_result = obj
// 		for (const decoder of decoders) {
// 			//
// 		}

// 		return last_result
// 	}
// }


export const string: Decoder<string> = {
	name: 'string',
	decode(obj: any) {
		if (typeof obj === 'string') return Ok(obj)
		else return Err(`expected string, got ${obj}`)
	}
} as const
export const number: Decoder<number> = {
	name: 'number',
	decode(obj: any) {
		if (typeof obj === 'number') return Ok(obj)
		else return Err(`expected number, got ${obj}`)
	},
} as const
export const boolean: Decoder<boolean> = {
	name: 'boolean',
	decode(obj: any) {
		if (typeof obj === 'boolean') return Ok(obj)
		else return Err(`expected boolean, got ${obj}`)
	},
} as const

export function exactly<T extends string>(value: T): Decoder<T>
export function exactly<T extends boolean>(value: T): Decoder<T>
export function exactly<T extends number>(value: T): Decoder<T>
export function exactly<L extends any[]>(value: L): Decoder<L>
export function exactly<T>(value: { [key: string]: T }): Decoder<{ [key: string]: T }>
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
	readonly name: string
	constructor(private readonly decoder: Decoder<T>) {
		this.name = decoder.name
	}
}

class ArrayDecoder<T> extends collection_decoder<T> implements Decoder<T[]> {
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
export function array<T>(decoder: Decoder<T>): Decoder<T[]> {
	return new ArrayDecoder(decoder)
}

class DictionaryDecoder<T> extends collection_decoder<T> implements Decoder<{ [key: string]: T }> {
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
export function dictionary<T>(decoder: Decoder<T>): Decoder<{ [key: string]: T }> {
	return new DictionaryDecoder(decoder)
}

class EnumDecoder<S extends string, L extends S[]> {
	readonly name: string
	constructor() {
		//
	}

	decode(obj: any) {

	}
}

class TupleDecoder<L extends any[]> implements Decoder<L> {
	readonly name: string
	constructor(private readonly decoders: DecoderTuple<L>) {
		this.name = `[${decoders.map(d => d.name).join(', ')}]`
	}

	decode(obj: any) {
		if (!Array.isArray(obj)) return Err(`tuple `)
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
export function tuple<L extends any[]>(...decoders: DecoderTuple<L>): Decoder<L> {
	return new TupleDecoder(decoders)
}


function is_object(obj: any): obj is Object {
	return typeof obj === 'object' && obj !== null && !Array.isArray(obj)
}

class ObjectDecoder<T> implements Decoder<{ [K in keyof T]: Decoder<T[K]> }> {
	constructor(
		private readonly decoders: { [K in keyof T]: Decoder<T[K]> },
		readonly name: string,
	) {}

	decode(obj: any) {
		if (!is_object(obj)) return Err(`Failed to decode a valid ${name}, input is not an object: ${obj}`)

		const t = {} as T
		for (const [key, decoder] of Object.entries(decoders)) {
			if (!(key in obj)) return Err(`Failed to decode a valid ${name}, input doesn't have value for key: ${key}`)
			const value = obj[key]
			const result = decoder(value)
			if (result.is_err()) return Err(`Failed to decode a valid ${name}, key ${key} has invalid value: ${value}`)
			t[key] = result.unwrap()
		}

		return Ok(t)
	}
}
export function object<T>(decoders: { [K in keyof T]: Decoder<T[K]> }, name: string): Decoder<T> {
	return new ObjectDecoder
}
