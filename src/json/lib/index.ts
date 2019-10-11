import { Result, Ok, Err } from '@ts-actually-safe/monads'
import { result_invariant_message as rinv } from '@ts-actually-safe/monads/lib/result'

interface Transformer<T> {
	readonly name: string
	decode(json: any): T
}

class MaybeTransformer<T> implements Transformer<Maybe<T>> {
	readonly name: string
	constructor(protected readonly decoder: Decoder<T>) {
		this.name = `Maybe<>`
	}

	decode(json: any): Maybe<T> {
		this.decoder.decode(json).ok_maybe()
	}
}

abstract class PanDecoder<T> implements Transformer<Result<T>> {
	constructor(readonly name: string) {}
	abstract _decode(): Result<T>
	get decode() { return this._bound_decoder }
}

const TransformerType = {
	Decoder: Symbol('Transformer.Decoder'),
	Maybe: Symbol('Transformer.Maybe'),
	Optional: Symbol('Transformer.Optional'),
} as const

export interface TopDecoder<T> extends Transformer<Result<T>> {
	//
}

export interface Decoder<T> extends Transformer<Result<T>> {
	readonly type = TransformerType.Decoder
	readonly name: string
	// has to exactly match
	decode(json: any): Result<T>
	// returns a Maybe instead of a Result, *doesn't fail decoding when nested*
	maybe: Transformer<Maybe<T>>
	// returns undefinable instead of a Result, *doesn't fail decoding when nested*
	optional: Transformer<T | undefined>
	// returns a default instead of a Result, *doesn't fail decoding when nested*
	defaulting(default_value: T): Transformer<T>
}

export interface DefaultingDecoder<T> extends Transformer<T> {
	protected readonly decoder: Decoder<T>
	protected readonly default_value: T
	decode(json: any): T
}


class DefaultDecoder<T> {
	protected _bound_decoder: (json: any) => T
	constructor(
		protected readonly decoder: Decoder<T>,
		protected readonly default_value: T,
	) {
		this._bound_decoder = json => this._decode(json)
	}

	function _decode(json: any): T {
		return this.decoder.decode(json).default(this.default_value)
	}
	get decode() { return this._bound_decoder }
}
// function default<T>(decoder: Decoder<T>, default_value: T): DefaultingDecoder<T> {
// 	return new DefaultDecoder(decoder, default_value) as DefaultingDecoder<T>
// }

function defaulting<T>(decoder: Decoder<T>) {
	return function(default_value: T): DefaultingDecoder<T> {
		return new DefaultDecoder(decoder, default_value) as DefaultingDecoder<T>
	}
}


export type DecoderTuple<L extends any[]> = {
	[K in keyof L]: Decoder<L[K]>
}


function is_object(json: any): json is NonNullable<Object> {
	return typeof json === 'object' && json !== null && !Array.isArray(json)
}



export const string = {
	name: 'string',
	decode(json: any): Result<string> {
		if (typeof json === 'string') return Ok(json)
		else return Err(`expected string, got ${json}`)
	},
	defaulting: defaulting(string),
} as const

export const boolean = {
	name: 'boolean',
	decode(json: any): Result<boolean> {
		if (typeof json === 'boolean') return Ok(json)
		else return Err(`expected boolean, got ${json}`)
	},
} as const

export const number = {
	name: 'number',
	decode(json: any): Result<number> {
		if (
			typeof json === 'number'
			&& json !== Infinity
			&& json !== -Infinity
			&& !isNaN(json)
		) return Ok(json)
		else return Err(`expected number, got ${json}`)
	},
} as const
export const loose_number = {
	name: 'loose_number',
	decode(json: any): Result<number> {
		if (typeof json === 'number') return Ok(json)
		else return Err(`expected number, got ${json}`)
	},
} as const
export const int = {
	name: 'int',
	decode(json: any): Result<number> {
		if (
			typeof json === 'number'
			&& json !== Infinity
			&& json !== -Infinity
			&& !isNaN(json)
			&& json % 1 === 0
		) return Ok(json)
		else return Err(`expected int, got ${json}`)
	}
} as const
export const uint = {
	name: 'uint',
	decode(json: any): Result<number> {
		if (
			typeof json === 'number'
			&& json !== Infinity
			&& json !== -Infinity
			&& !isNaN(json)
			&& json % 1 === 0
			&& json >= 0
		) return Ok(json)
		else return Err(`expected uint, got ${json}`)
	}
} as const


abstract class ClassDecoder<T> implements Decoder<T> {
	abstract readonly name: string
	protected _bound_decoder: (json: any) => Result<T>
	protected _bound_defaulting_decoder: (default_value: T) => DefaultingDecoder<T>
	constructor() {
		this._bound_decoder = json => this._decode(json)
		this._bound_defaulting_decoder = defaulting(this)
	}
	abstract _decode(json: any): Result<T>
	get decode() { return this._bound_decoder }
	get defaulting() { return this._bound_defaulting_decoder }
}

class UnionDecoder<L extends any[]> extends ClassDecoder<L[number]> {
	readonly name: string
	constructor(protected readonly decoders: DecoderTuple<L>) {
		super()
		this.name = decoders.map(d => d.name).join(' | ')
	}

	_decode(json: any): Result<L[number]> {
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

// export class all<L extends any[]> extends ClassDecoder<FoldingFunctions<L>> {
// 	name: string
// 	protected readonly decoders: DecoderTuple<L>
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


type Primitives = string | boolean | number | null | undefined

class ValuesDecoder<V extends Primitives, L extends V[]> extends ClassDecoder<L[number]> {
	readonly name: string
	constructor(protected readonly values: L) {
		super()
		this.name = values.join(' | ')
	}

	_decode(json: any): Result<L[number]> {
		for (const value of this.values) {
			if (value === json) return Ok(value)
		}

		return Err(`expected ${this.name}; got ${json}`)
	}
}
export function value<V extends Primitives>(value: V): Decoder<V> {
	return new ValuesDecoder([value]) as Decoder<V>
}
export function values<V extends Primitives, L extends V[]>(...values: L): Decoder<L[number]> {
	return new ValuesDecoder(values) as Decoder<L[number]>
}


export const undefined_value = value(undefined as undefined)
export const null_value = value(null as null)

export function optional<T>(decoder: Decoder<T>): Decoder<T | undefined> {
	return new UnionDecoder(decoder, undefined_value) as Decoder<T | undefined>
}


abstract class collection_decoder<T> {
	readonly name: string
	constructor(protected readonly decoder: Decoder<T>) {
		this.name = decoder.name
	}
}


class ArrayDecoder<T> extends collection_decoder<T> implements Decoder<T[]> {
	protected _bound_decoder: (json: any) => Result<T[]>
	get decode() { return this._bound_decoder }

	constructor(protected readonly decoder: Decoder<T>) {
		super(decoder)
		this._bound_decoder = json => this._decode(json)
	}

	_decode(json: any): Result<T[]> {
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
	protected _bound_decoder: (json: any) => Result<{ [key: string]: T }>
	get decode() { return this._bound_decoder }

	constructor(protected readonly decoder: Decoder<T>) {
		super(decoder)
		this._bound_decoder = json => this._decode(json)
	}

	_decode(json: any): Result<{ [key: string]: T }> {
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


class TupleDecoder<L extends any[]> extends ClassDecoder<L> {
	readonly name: string
	constructor(protected readonly decoders: DecoderTuple<L>) {
		super()
		this.name = `[${decoders.map(d => d.name).join(', ')}]`
	}

	_decode(json: any): Result<L> {
		const { name, decoders } = this

		if (
			!Array.isArray(json)
			|| json.length !== decoders.length
		) return Err(`expected ${name}, got ${json}`)

		const t = [] as any as L
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


class StrictObjectDecoder<O> extends ClassDecoder<O> {
	constructor(
		readonly name: string,
		protected readonly decoders: { [K in keyof O]: Decoder<O[K]> },
	) {
		super()
	}

	_decode(json: any): Result<O> {
		const { name, decoders } = this

		if (!is_object(json)) return Err(`Failed to decode a valid ${name}, input is not an object: ${json}`)

		const give = {} as O
		for (const key in json) {
			if (!(key in decoders)) return Err(`Failed to decode a valid ${name}, input had invalid extra key ${key}`)
			const decoder = decoders[key]
			const value = json[key]
			const result = decoder.decode(value)
			if (result.is_err()) return Err(`Failed to decode a valid ${name}, key ${key} has invalid value: ${value}`)
			give[key as keyof O] = result.expect(rinv)
		}

		return Ok(give as O)
	}
}
export function object<O>(
	name: string,
	decoders: { [K in keyof O]: Decoder<O[K]> },
): Decoder<O> {
	return new StrictObjectDecoder(name, decoders) as Decoder<O>
}


class LooseObjectDecoder<O> extends ClassDecoder<O> {
	constructor(
		readonly name: string,
		protected readonly decoders: { [K in keyof O]: Decoder<O[K]> },
	) {
		super()
	}

	_decode(json: any): Result<O> {
		const { name, decoders } = this

		if (!is_object(json)) return Err(`Failed to decode a valid ${name}, input is not an object: ${json}`)

		const give = { ...json } as O
		for (const key in decoders) {
			if (!(key in give)) return Err(`Failed to decode a valid ${name}, input doesn't have value for key: ${key}`)
			const decoder = decoders[key]
			const value = give[key]
			const result = decoder.decode(value)
			if (result.is_err()) return Err(`Failed to decode a valid ${name}, key ${key} has invalid value: ${value}`)
			give[key as keyof O] = result.expect(rinv)
		}

		return Ok(give as O)
	}

	// get decode() { return this._decode.bind(this) }
	// get decode() { return (json: any) => this._decode(json) }
}
export function loose_object<O>(
	name: string,
	decoders: { [K in keyof O]: Decoder<O[K]> },
): Decoder<O> {
	return new LooseObjectDecoder(name, decoders) as Decoder<O>
}
