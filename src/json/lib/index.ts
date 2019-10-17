import { Result, Ok, Err, Maybe, Some, None } from '@ts-actually-safe/monads'
import { result_invariant_message as rinv } from '@ts-actually-safe/monads/dist/result'

// const TransformerTypes = {
// 	decoder: Symbol('Transformer.decoder'),
// 	maybe: Symbol('Transformer.maybe'),
// 	null: Symbol('Transformer.null'),
// 	undef: Symbol('Transformer.undef'),
// 	default: Symbol('Transformer.default'),
// } as const

// interface TransformerLike<T> {
// 	type: symbol
// 	readonly name: string
// 	decode(json: unknown): T
// }

// type TransformerType<T extends TransformerLike<unknown>> =
// 	T extends Decoder<infer U> ? U
// 	: T extends TransformerLike<infer U> ? U
// 	: never

// type TransformedCollection<O, D extends { [K in keyof O]: Transformer<O[K]> }> =
// 	{ [K in keyof D]: D[K] extends Decoder<unknown> ? false : true } extends true
// 		? Result<{ [K in keyof D]: TransformerType<D[K]> }>
// 		: { [K in keyof D]: TransformerType<D[K]> }

// type Transformer<T> =
// 	| Decoder<T>
// 	| MaybeTransformer<T>
// 	| NullTransformer<T>
// 	| UndefTransformer<T>
// 	| DefaultTransformer<T>


// // DANGER: test to ensure type invariant holds
// const global_maybe_cache = {} as { [decoder_name: string]: MaybeTransformer<any> }
// const global_null_cache = {} as { [decoder_name: string]: NullTransformer<any> }
// const global_undef_cache = {} as { [decoder_name: string]: UndefTransformer<any> }
// const global_default_cache = {} as { [decoder_name: string]: DefaultTransformer<any> }

// export interface Decoder<T> {
// 	readonly name: string
// 	decode(json: unknown): Result<T>
// }

// export interface Transformer<T> {
// 	readonly name: string
// 	decode(json: unknown): T
// }

// export abstract class Decoder<T> implements TransformerLike<Result<T>> {
export abstract class Decoder<T> {
	// type = TransformerTypes.decoder

	abstract readonly name: string
	abstract decode(json: unknown): Result<T>

	// lenient(): ResultTransformer<T> {
	// 	return new
	// }
	// lenient_maybe(): MaybeTransformer<T> {
	// 	if (global_maybe_cache[this.name]) return global_maybe_cache[this.name]
	// 	return global_maybe_cache[this.name] = new MaybeTransformer(this)
	// }
	// lenient_null(): NullTransformer<T> {
	// 	if (global_null_cache[this.name]) return global_null_cache[this.name]
	// 	return global_null_cache[this.name] = new NullTransformer<T>(this)
	// }
	// lenient_undef(): UndefTransformer<T> {
	// 	if (global_undef_cache[this.name]) return global_undef_cache[this.name]
	// 	return global_undef_cache[this.name] = new UndefTransformer<T>(this)
	// }
	// lenient_default(def: T): DefaultTransformer<T> {
	// 	if (global_default_cache[this.name]) return global_default_cache[this.name]
	// 	return global_default_cache[this.name] = new DefaultTransformer<T>(this, def)
	// }
}

export type DecoderTuple<L extends unknown[]> = {
	[K in keyof L]: Decoder<L[K]>
}

// class ResultTransformer<T> implements TransformerLike<Result<Result<T>>> {
// 	readonly name: string
// 	constructor(readonly decoder: Decoder<Result<T>>) {
// 		this.name = `lenient Result<${decoder.name}>`
// 	}
// 	decode(json: unknown) { return Ok(this.decoder.decode(json)) }
// }
// class MaybeTransformer<T> implements TransformerLike<Maybe<T>> {
// 	type = TransformerTypes.maybe
// 	readonly name: string
// 	constructor(readonly decoder: Decoder<T>) {
// 		this.name = `lenient Maybe<${decoder.name}>`
// 	}
// 	decode(json: unknown) { return Ok(this.decoder.decode(json).ok_maybe()) }
// }
// class NullTransformer<T> implements TransformerLike<T | null> {
// 	type = TransformerTypes.null
// 	readonly name: string
// 	constructor(readonly decoder: Decoder<T>) {
// 		this.name = `lenient ${decoder.name} | null`
// 	}
// 	decode(json: unknown) { return Ok(this.decoder.decode(json).ok_null()) }
// }
// class UndefTransformer<T> implements TransformerLike<T | undefined> {
// 	type = TransformerTypes.undef
// 	readonly name: string
// 	constructor(readonly decoder: Decoder<T>) {
// 		this.name = `lenient ${decoder.name} | undefined`
// 	}
// 	decode(json: unknown) { return Ok(this.decoder.decode(json).ok_undef()) }
// }
// class DefaultTransformer<T> implements TransformerLike<T> {
// 	type = TransformerTypes.default
// 	readonly name: string
// 	constructor(readonly decoder: Decoder<T>, readonly def: T) {
// 		this.name = `lenient default ${decoder.name}`
// 	}
// 	decode(json: unknown) { return Ok(this.decoder.decode(json).default(this.def)) }
// }


function is_object(json: unknown): json is NonNullable<Object> {
	return typeof json === 'object' && json !== null && !Array.isArray(json)
}


class WrapDecoder<T> extends Decoder<T> {
	constructor(
		readonly name: string,
		readonly decoder_func: (json: unknown) => Result<T>,
	) {
		super()
	}

	decode(json: unknown) {
		return this.decoder_func(json)
	}
}
export function wrap<T>(name: string, decoder_func: (json: unknown) => Result<T>): Decoder<T> {
	return new WrapDecoder(name, decoder_func) as Decoder<T>
}


// export const always = new WrapDecoder(
// 	'always',
// 	function(json: unknown): Result<unknown> {
// 		return Ok(json)
// 	},
// )

// export const never = new WrapDecoder(
// 	'never',
// 	function(json: unknown): Result<never> {
// 		return Err('never')
// 	}
// )

export const string = new WrapDecoder(
	'string',
	function(json: unknown): Result<string> {
		if (typeof json === 'string') return Ok(json)
		else return Err(`expected string, got ${json}`)
	},
)

export const boolean = new WrapDecoder(
	'boolean',
	function (json: unknown): Result<boolean> {
		if (typeof json === 'boolean') return Ok(json)
		else return Err(`expected boolean, got ${json}`)
	},
)

export const number = new WrapDecoder(
	'number',
	function decode(json: unknown): Result<number> {
		if (
			typeof json === 'number'
			&& json !== Infinity
			&& json !== -Infinity
			&& !isNaN(json)
		) return Ok(json)
		else return Err(`expected number, got ${json}`)
	},
)
export const loose_number = new WrapDecoder(
	'loose_number',
	function decode(json: unknown): Result<number> {
		if (typeof json === 'number') return Ok(json)
		else return Err(`expected number, got ${json}`)
	},
)
export const int = new WrapDecoder(
	'int',
	function decode(json: unknown): Result<number> {
		if (
			typeof json === 'number'
			&& json !== Infinity
			&& json !== -Infinity
			&& !isNaN(json)
			&& json % 1 === 0
		) return Ok(json)
		else return Err(`expected int, got ${json}`)
	},
)
export const uint = new WrapDecoder(
	'uint',
	function decode(json: unknown): Result<number> {
		if (
			typeof json === 'number'
			&& json !== Infinity
			&& json !== -Infinity
			&& !isNaN(json)
			&& json % 1 === 0
			&& json >= 0
		) return Ok(json)
		else return Err(`expected uint, got ${json}`)
	},
)


class UnionDecoder<L extends unknown[]> extends Decoder<L[number]> {
	readonly name: string
	constructor(readonly decoders: DecoderTuple<L>) {
		super()
		this.name = decoders.map(d => d.name).join(' | ')
	}

	decode(json: unknown) {
		for (const decoder of this.decoders) {
			const result = decoder.decode(json)
			if (result.is_ok()) return result
		}

		return Err(`expected ${this.name}; got ${json}`)
	}
}
export function union<L extends unknown[]>(...decoders: DecoderTuple<L>): Decoder<L[number]> {
	return new UnionDecoder(decoders) as Decoder<L[number]>
}

// export class all<L extends ((val: any) => any)[]> extends Decoder<FoldingFunctions<L>> {
// 	name: string
// 	readonly decoders: DecoderTuple<L>
// 	constructor(...decoders: DecoderTuple<L>) {
// 		this.name = 'all: ' + decoders.map(d => d.name).join(', ')
// 		this.decoders = decoders
// 	}

// 	decode(json: unknown) {
// 		let last_result = json
// 		for (const decoder of decoders) {
// 			//
// 		}

// 		return last_result
// 	}
// }


type Primitives = string | boolean | number | null | undefined

class ValuesDecoder<V extends Primitives, L extends V[]> extends Decoder<L[number]> {
	readonly name: string
	constructor(readonly values: L) {
		super()
		this.name = values.join(' | ')
	}

	decode(json: unknown): Result<L[number]> {
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
	return new UnionDecoder([decoder, undefined_value]) as Decoder<T | undefined>
}
export function nullable<T>(decoder: Decoder<T>): Decoder<T | null> {
	return new UnionDecoder([decoder, null_value]) as Decoder<T | null>
}
export function nillable<T>(decoder: Decoder<T>): Decoder<T | null | undefined> {
	return new UnionDecoder([decoder, null_value, undefined_value]) as Decoder<T | null | undefined>
}

class MaybeDecoder<T> extends Decoder<Maybe<T>> {
	readonly name: string
	constructor(readonly decoder: Decoder<T>) {
		super()
		this.name = `Maybe<${decoder.name}>`
	}
	decode(json: unknown): Result<Maybe<T>> {
		if (json === null || json === undefined)
			return Ok(None)
		// if (Maybe.is_maybe(json))
		// 	return json.match({
		// 		some: value => this.decoder
		// 			.decode(value)
		// 			.change(value => Some(value)),
		// 		none: () => Ok(None),
		// 	})
		return this.decoder
			.decode(json)
			.change(value => Some(value))
			.change_err(err => `expected ${this.name}, encountered this error: ${err}`)
	}
}
export function maybe<T>(decoder: Decoder<T>): Decoder<Maybe<T>> {
	return new MaybeDecoder<T>(decoder) as Decoder<Maybe<T>>
}


function decoder_err<T>(decoder: Decoder<T>, json: unknown) {
	return Err(`expected ${decoder.name}, got ${json}`)
}

class ArrayDecoder<T> extends Decoder<T[]> {
	readonly name: string
	constructor(readonly decoder: Decoder<T>) {
		super()
		this.name = `${decoder.name}[]`
	}

	decode(json: unknown): Result<T[]> {
		const { name, decoder } = this

		if (!Array.isArray(json)) return decoder_err(this, json)

		const give: T[] = []
		for (let index = 0; index < json.length; index++) {
			const item = json[index]
			const result = decoder.decode(item)
			if (result.is_err())
				return Err(`while decoding ${name}: at index ${index}, failed to decode ${decoder.name}: ${result.expect_err(rinv)}`)

			give.push(result.expect(rinv))
		}

		return Ok(give)
	}
}
export function array<T>(decoder: Decoder<T>): Decoder<T[]> {
	return new ArrayDecoder(decoder) as Decoder<T[]>
}


export type Dict<T> = { [key: string]: T }
class DictionaryDecoder<T> extends Decoder<Dict<T>> {
	readonly name: string
	constructor(readonly decoder: Decoder<T>) {
		super()
		this.name = `Dict<${decoder.name}>`
	}

	decode(json: unknown): Result<Dict<T>> {
		const { name, decoder } = this

		if (!is_object(json)) return Err(`expecting ${name}, got ${json}`)

		// const give = in_place
		// 	? json
		// 	: {} as Dict<T>
		const give = {} as Dict<T>

		for (const key in json) {
			const value = json[key]
			const result = decoder.decode(value)
			if (result.is_err())
				return Err(`while decoding ${name}, at key ${key}, failed to decode ${decoder.name}: ${result.expect_err(rinv)}`)

			give[key] = result.expect(rinv)
		}

		return Ok(give)
	}

	// decode_items(json: unknown): Result<Dict<Result<T>>> {
	// 	const { name, decoder } = this

	// 	if (!is_object(json)) return Err(`expecting ${name}, got ${json}`)

	// 	const give = {} as Dict<T>

	// 	for (const key in json) {
	// 		give[key] = decoder.decode(json[key])
	// 	}

	// 	return Ok(give)
	// }
}
export function dictionary<T>(decoder: Decoder<T>): Decoder<Dict<T>> {
	return new DictionaryDecoder(decoder) as Decoder<Dict<T>>
}

// class DictTransformer<T> implements Transformer<Dict<T>> {
// 	readonly name: string
// 	constructor(readonly transformer: Transformer<T>) {
// 		this.name = `Dict<${transformer.name}>`
// 	}
// 	decode(dict: Dict<unknown>): Dict<T> {
// 		const give = {} as Dict<T>
// 		for (const key in dict) {
// 			give = this.transformer.transform(dict[key])
// 		}
// 		return give
// 	}
// }
// export function transform_dictionary<T>(transformer: Transformer<T>): Transformer<Dict<T>> {
// 	return new DictTransformer(transformer) as Transformer<Dict<T>>
// }


class TupleDecoder<L extends unknown[]> extends Decoder<L> {
	readonly name: string
	constructor(readonly decoders: DecoderTuple<L>) {
		super()
		this.name = `[${decoders.map(d => d.name).join(', ')}]`
	}

	decode(json: unknown): Result<L> {
		const { name, decoders } = this

		if (
			!Array.isArray(json)
			|| json.length !== decoders.length
		) return Err(`expected ${name}, got ${json}`)

		const t = [] as unknown as L
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
export function tuple<L extends unknown[]>(...decoders: DecoderTuple<L>): Decoder<L> {
	return new TupleDecoder(decoders) as Decoder<L>
}


class StrictObjectDecoder<O> extends Decoder<O> {
// class StrictObjectDecoder<O, D extends { [K in keyof O]: Transformer<O[K]> }> extends Decoder<O> {
	constructor(
		readonly name: string,
		readonly decoders: { [K in keyof O]: Decoder<O[K]> },
		// readonly decoders: D,
	) {
		super()
	}

	decode(json: unknown): Result<O> {
	// decode(json: unknown): TransformedCollection<D> {
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

		return Ok(give)
	}
}
export function object<O>(
	name: string,
	decoders: { [K in keyof O]: Decoder<O[K]> },
): Decoder<O> {
	return new StrictObjectDecoder(name, decoders) as Decoder<O>
}


class LooseObjectDecoder<O> extends Decoder<O> {
	constructor(
		readonly name: string,
		readonly decoders: { [K in keyof O]: Decoder<O[K]> },
	) {
		super()
	}

	decode(json: unknown): Result<O> {
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
}
export function loose_object<O>(
	name: string,
	decoders: { [K in keyof O]: Decoder<O[K]> },
): Decoder<O> {
	return new LooseObjectDecoder(name, decoders) as Decoder<O>
}
