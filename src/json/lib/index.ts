import { Result, Ok, Err } from '@ts-actually-safe/monads'
import { result_invariant_message as rinv } from '@ts-actually-safe/monads/lib/result'

// export namespace json {}

export interface Decoder<T> {
	readonly name: string,
	decode(json: any): Result<T>,
}

// export interface ValueDecoder<> {

// }

export type DecoderTuple<L extends any[]> = {
	[K in keyof L]: Decoder<L[K]>

	// [K in keyof L]: L[K] extends null | undefined
	// 	? ValueDecoder<L[K]>
	// 	:
}


function is_object(json: any): json is NonNullable<Object> {
	return typeof json === 'object' && json !== null && !Array.isArray(json)
}


export const string = {
	name: 'string',
	decode(json: any): Result<string> {
		if (typeof json === 'string') return Ok(json)
		else return Err(`expected string, got ${json}`)
	}
} as const
export const number = {
	name: 'number',
	decode(json: any): Result<number> {
		if (typeof json === 'number') return Ok(json)
		else return Err(`expected number, got ${json}`)
	},
} as const
export const boolean = {
	name: 'boolean',
	decode(json: any): Result<boolean> {
		if (typeof json === 'boolean') return Ok(json)
		else return Err(`expected boolean, got ${json}`)
	},
} as const


class UnionDecoder<L extends any[]> implements Decoder<L[number]> {
	readonly name: string
	constructor(private readonly decoders: DecoderTuple<L>) {
		this.name = decoders.map(d => d.name).join(' | ')
	}

	decode(json: any): Result<L[number]> {
		for (const decoder of this.decoders) {
			const result = decoder.decode(json)
			if (result.is_ok()) return result
		}

		return Err(`expected ${this.name}; got ${json}`)
	}
}
export function union<L extends any[]>(...decoders: DecoderTuple<L>): Decoder<L[number]> {
	return new UnionDecoder(decoders) as Decoder<L[number]>
}

// export class all<L extends any[]> implements Decoder<FoldingFunctions<L>> {
// 	name: string
// 	private readonly decoders: DecoderTuple<L>
// 	constructor(...decoders: DecoderTuple<L>) {
// 		this.name = 'all: ' + decoders.map(d => d.name).join(', ')
// 		this.decoders = decoders
// 	}

// 	decode(json: any) {
// 		let last_result = json
// 		for (const decoder of decoders) {
// 			//
// 		}

// 		return last_result
// 	}
// }


// type BasicallyEverything = string | boolean | number | any[] | { [key: string]: any } | null | undefined

// class ValuesDecoder<V extends BasicallyEverything, L extends V[]> implements Decoder<L[number]> {
// 	readonly name: string
// 	constructor(private readonly values: L) {
// 		this.name = values.join(' | ')
// 	}

// 	decode(json: any) {
// 		for (const value of this.values) {
// 			if (value === json) return Ok(value)
// 			if (Array.isArray(value))
// 		}

// 		return Err(`expected ${this.name}; got ${json}`)
// 	}
// }
// export function value<V extends BasicallyEverything>(value: V): Decoder<V> {
// 	return new ValuesDecoder([value])
// }
// export function values<V extends BasicallyEverything, L extends V[]>(...values: L): Decoder<L[number]> {
// 	return new ValuesDecoder(values)
// }


// export const undefined_value = value(undefined)
// export const null_value = value(null)


abstract class collection_decoder<T> {
	readonly name: string
	constructor(protected readonly decoder: Decoder<T>) {
		this.name = decoder.name
	}
}


class ArrayDecoder<T> extends collection_decoder<T> implements Decoder<T[]> {
	decode(json: any): Result<T[]> {
		const { name, decoder } = this

		if (!Array.isArray(json)) return Err(`expected array of ${name}, got ${json}`)

		const give: T[] = []
		for (let index = 0; index < json.length; index++) {
			const item = json[index]
			const result = decoder.decode(item)
			if (result.is_err())
				return Err(`while decoding array of ${name}: at index ${index}, failed to decode ${decoder.name}: ${result.expect_err(rinv)}`)

			give.push(result.expect(rinv))
		}

		return Ok(give)
	}
}
export function array<T>(decoder: Decoder<T>): Decoder<T[]> {
	return new ArrayDecoder(decoder) as Decoder<T[]>
}


class DictionaryDecoder<T> extends collection_decoder<T> implements Decoder<{ [key: string]: T }> {
	decode(json: any): Result<{ [key: string]: T }> {
		const { name, decoder } = this

		if (!is_object(json)) return Err(`expecting dictionary of ${name}, got ${json}`)

		// const give = in_place
		// 	? json
		// 	: {} as { [key: string]: T }
		const give = {} as { [key: string]: T }

		for (const key in json) {
			const value = json[key]
			const result = decoder.decode(value)
			if (result.is_err())
				return Err(`while decoding dictionary of ${name}, at key ${key}, failed to decode ${decoder.name}: ${result.expect_err(rinv)}`)

			give[key] = result.expect(rinv)
		}

		return Ok(give)
	}
}
export function dictionary<T>(decoder: Decoder<T>): Decoder<{ [key: string]: T }> {
	return new DictionaryDecoder(decoder) as Decoder<{ [key: string]: T }>
}


class TupleDecoder<L extends any[]> implements Decoder<L> {
	readonly name: string
	constructor(private readonly decoders: DecoderTuple<L>) {
		this.name = `[${decoders.map(d => d.name).join(', ')}]`
	}

	decode(json: any): Result<L> {
		const { name, decoders } = this

		if (
			!Array.isArray(json)
			|| json.length !== decoders.length
		) return Err(`expected ${name}, got ${json}`)

		const t = [] as any as NonNullable<L>
		for (let index = 0; index < decoders.length; index++) {
			const decoder = decoders[index]
			const value = json[index]
			const result = decoder.decode(value)
			if (result.is_err())
				return Err(`while decoding ${name}, at index ${index}, failed to decode ${decoder.name}: ${result.expect_err(rinv)}`)

			t.push(result.expect(rinv))
		}

		return Ok(t)
	}
}
export function tuple<L extends any[]>(...decoders: DecoderTuple<L>): Decoder<L> {
	return new TupleDecoder(decoders) as Decoder<L>
}


class ObjectDecoder<O> implements Decoder<O> {
	constructor(
		readonly name: string,
		private readonly decoders: { [K in keyof O]: Decoder<O[K]> },
	) {}

	decode(json: any): Result<O> {
		const { name, decoders } = this

		if (!is_object(json)) return Err(`Failed to decode a valid ${name}, input is not an object: ${json}`)

		const t = {} as O
		for (const key in decoders) {
			if (!(key in json)) return Err(`Failed to decode a valid ${name}, input doesn't have value for key: ${key}`)
			const decoder = decoders[key]
			const value = json[key]
			const result = decoder.decode(value)
			if (result.is_err()) return Err(`Failed to decode a valid ${name}, key ${key} has invalid value: ${value}`)
			t[key as keyof O] = result.expect(rinv)
		}

		return Ok(t as NonNullable<O>)
	}
}
export function object<O>(
	name: string,
	decoders: { [K in keyof O]: Decoder<O[K]> },
): Decoder<O> {
	return new ObjectDecoder(name, decoders) as Decoder<O>
}
