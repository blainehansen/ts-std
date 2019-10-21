import { Result, Ok, Err, Maybe, Some, None } from '@ts-std/monads'
import { result_invariant_message as rinv } from '@ts-std/monads/dist/result'

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
// 	decode(input: unknown): T
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
// 	decode(input: unknown): Result<T>
// }

// export interface Transformer<T> {
// 	readonly name: string
// 	decode(input: unknown): T
// }

class Adaptor<U, T> extends Decoder<T> {
	constructor(
		readonly base: Decoder<T>,
		readonly alternate: Decoder<U>,
		readonly adapt_func: (input: U) => T,
	) {
		super()
	}

	decode(input: unknown): Result<T> {
		return this.base.decode(input)
			.or(
				() => this.alternate.decode(input)
					.change(this.adapt_func)
			)
	}

	adapt(other: U): T {
		return this.adapt_func(other)
	}
}

class TryAdaptor<U, T> extends Decoder<T> {
	constructor(
		readonly base: Decoder<T>,
		readonly alternate: Decoder<U>,
		readonly adapt_func: (input: U) => Result<T>,
	) {
		super()
	}

	decode(input: unknown): Result<T> {
		return this.base.decode(input)
			.or(
				() => this.alternate.decode(input)
					.try_change(this.adapt_func)
			)
	}

	try_adapt(other: U): Result<T> {
		return this.adapt_func(other)
	}
}

// export abstract class Decoder<T> implements TransformerLike<Result<T>> {
export abstract class Decoder<T> {
	// type = TransformerTypes.decoder

	abstract readonly name: string
	abstract decode(input: unknown): Result<T>

	adaptable<U>(alternate: Decoder<U>, adapt_func: (input: U) => T) {
		return new Adaptor(this, alternate, adapt_func)
	}

	try_adaptable<U>(alternate: Decoder<U>, adapt_func: (input: U) => Result<T>) {
		return new TryAdaptor(this, alternate, adapt_func)
	}
}

export type DecoderTuple<L extends unknown[]> = {
	[K in keyof L]: Decoder<L[K]>
}

// class ResultTransformer<T> implements TransformerLike<Result<Result<T>>> {
// 	readonly name: string
// 	constructor(readonly decoder: Decoder<Result<T>>) {
// 		this.name = `lenient Result<${decoder.name}>`
// 	}
// 	decode(input: unknown) { return Ok(this.decoder.decode(input)) }
// }
// class MaybeTransformer<T> implements TransformerLike<Maybe<T>> {
// 	type = TransformerTypes.maybe
// 	readonly name: string
// 	constructor(readonly decoder: Decoder<T>) {
// 		this.name = `lenient Maybe<${decoder.name}>`
// 	}
// 	decode(input: unknown) { return Ok(this.decoder.decode(input).ok_maybe()) }
// }
// class NullTransformer<T> implements TransformerLike<T | null> {
// 	type = TransformerTypes.null
// 	readonly name: string
// 	constructor(readonly decoder: Decoder<T>) {
// 		this.name = `lenient ${decoder.name} | null`
// 	}
// 	decode(input: unknown) { return Ok(this.decoder.decode(input).ok_null()) }
// }
// class UndefTransformer<T> implements TransformerLike<T | undefined> {
// 	type = TransformerTypes.undef
// 	readonly name: string
// 	constructor(readonly decoder: Decoder<T>) {
// 		this.name = `lenient ${decoder.name} | undefined`
// 	}
// 	decode(input: unknown) { return Ok(this.decoder.decode(input).ok_undef()) }
// }
// class DefaultTransformer<T> implements TransformerLike<T> {
// 	type = TransformerTypes.default
// 	readonly name: string
// 	constructor(readonly decoder: Decoder<T>, readonly def: T) {
// 		this.name = `lenient default ${decoder.name}`
// 	}
// 	decode(input: unknown) { return Ok(this.decoder.decode(input).default(this.def)) }
// }


function is_object(input: unknown): input is NonNullable<Object> {
	return typeof input === 'object' && input !== null && !Array.isArray(input)
}


export interface DecodableConstructor<L extends unknown[], T extends Decodable<L>> {
	new (...args: L): T
	decoder: Decoder<L>
}

export interface Decodable<L extends unknown[] = unknown[]> {
	serialize(): L
}


export abstract class Serializer {
	abstract serialize<D extends Decodable>(output: D): string
	abstract deserialize(input: string): Result<unknown, Error>
	decode<T>(input: string, decoder: Decoder<T>): Result<T> {
		return this.deserialize(input)
			.change_err(e => e.message)
			.try_change(input => decoder.decode(input))
	}
}

export class JsonSerializer extends Serializer {
	serialize<D extends Decodable>(output: D): string {
		return JSON.stringify(output.serialize())
	}
	deserialize(input: string): Result<unknown, Error> {
		return Result.attempt(JSON.parse(input))
	}
}


class ClassDecoder<L extends unknown[], T extends Decodable<L>> extends Decoder<T> {
	readonly name: string
	constructor(readonly cn: DecodableConstructor<L, T>) {
		super()
		this.name = cn.name
	}

	decode(input: unknown) {
		if (input instanceof this.cn) return Ok(input)
		return this.cn.decoder.decode(input)
			.change_err(e => `while decoding class ${this.name}: ${e}`)
			.change(args => new this.cn(...args))
	}
}
export function cls<L extends unknown[], T extends Decodable<L>>(cn: DecodableConstructor<L, T>): Decoder<T> {
	return new ClassDecoder(cn) as Decoder<T>
}


class WrapDecoder<T> extends Decoder<T> {
	constructor(
		readonly name: string,
		readonly decoder_func: (input: unknown) => Result<T>,
	) {
		super()
	}

	decode(input: unknown) {
		return this.decoder_func(input)
	}
}
export function wrap<T>(name: string, decoder_func: (input: unknown) => Result<T>): Decoder<T> {
	return new WrapDecoder(name, decoder_func) as Decoder<T>
}


// export const always = new WrapDecoder(
// 	'always',
// 	function(input: unknown): Result<unknown> {
// 		return Ok(input)
// 	},
// )

// export const never = new WrapDecoder(
// 	'never',
// 	function(input: unknown): Result<never> {
// 		return Err('never')
// 	}
// )

export const string = new WrapDecoder(
	'string',
	function(input: unknown): Result<string> {
		if (typeof input === 'string') return Ok(input)
		else return Err(`expected string, got ${input}`)
	},
) as Decoder<string>

export const boolean = new WrapDecoder(
	'boolean',
	function (input: unknown): Result<boolean> {
		if (typeof input === 'boolean') return Ok(input)
		else return Err(`expected boolean, got ${input}`)
	},
) as Decoder<boolean>

export const number = new WrapDecoder(
	'number',
	function decode(input: unknown): Result<number> {
		if (
			typeof input === 'number'
			&& input !== Infinity
			&& input !== -Infinity
			&& !isNaN(input)
		) return Ok(input)
		else return Err(`expected number, got ${input}`)
	},
) as Decoder<number>
export const loose_number = new WrapDecoder(
	'loose_number',
	function decode(input: unknown): Result<number> {
		if (typeof input === 'number') return Ok(input)
		else return Err(`expected number, got ${input}`)
	},
) as Decoder<number>
export const int = new WrapDecoder(
	'int',
	function decode(input: unknown): Result<number> {
		if (
			typeof input === 'number'
			&& input !== Infinity
			&& input !== -Infinity
			&& !isNaN(input)
			&& input % 1 === 0
		) return Ok(input)
		else return Err(`expected int, got ${input}`)
	},
) as Decoder<number>
export const uint = new WrapDecoder(
	'uint',
	function decode(input: unknown): Result<number> {
		if (
			typeof input === 'number'
			&& input !== Infinity
			&& input !== -Infinity
			&& !isNaN(input)
			&& input % 1 === 0
			&& input >= 0
		) return Ok(input)
		else return Err(`expected uint, got ${input}`)
	},
) as Decoder<number>


class UnionDecoder<L extends unknown[]> extends Decoder<L[number]> {
	readonly name: string
	constructor(readonly decoders: DecoderTuple<L>) {
		super()
		this.name = decoders.map(d => d.name).join(' | ')
	}

	decode(input: unknown) {
		for (const decoder of this.decoders) {
			const result = decoder.decode(input)
			if (result.is_ok()) return result
		}

		return Err(`expected ${this.name}; got ${input}`)
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

// 	decode(input: unknown) {
// 		let last_result = input
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

	decode(input: unknown): Result<L[number]> {
		for (const value of this.values) {
			if (value === input) return Ok(value)
		}

		return Err(`expected ${this.name}; got ${input}`)
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
	decode(input: unknown): Result<Maybe<T>> {
		if (input === null || input === undefined)
			return Ok(None)
		// if (Maybe.is_maybe(input))
		// 	return input.match({
		// 		some: value => this.decoder
		// 			.decode(value)
		// 			.change(value => Some(value)),
		// 		none: () => Ok(None),
		// 	})
		return this.decoder
			.decode(input)
			.change(value => Some(value))
			.change_err(err => `expected ${this.name}, encountered this error: ${err}`)
	}
}
export function maybe<T>(decoder: Decoder<T>): Decoder<Maybe<T>> {
	return new MaybeDecoder<T>(decoder) as Decoder<Maybe<T>>
}


function decoder_err<T>(decoder: Decoder<T>, input: unknown) {
	return Err(`expected ${decoder.name}, got ${input}`)
}

class ArrayDecoder<T> extends Decoder<T[]> {
	readonly name: string
	constructor(readonly decoder: Decoder<T>) {
		super()
		this.name = `${decoder.name}[]`
	}

	decode(input: unknown): Result<T[]> {
		const { name, decoder } = this

		if (!Array.isArray(input)) return decoder_err(this, input)

		const give: T[] = []
		for (let index = 0; index < input.length; index++) {
			const item = input[index]
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

	decode(input: unknown): Result<Dict<T>> {
		const { name, decoder } = this

		if (!is_object(input)) return Err(`expecting ${name}, got ${input}`)

		// const give = in_place
		// 	? input
		// 	: {} as Dict<T>
		const give = {} as Dict<T>

		for (const key in input) {
			const value = input[key]
			const result = decoder.decode(value)
			if (result.is_err())
				return Err(`while decoding ${name}, at key ${key}, failed to decode ${decoder.name}: ${result.expect_err(rinv)}`)

			give[key] = result.expect(rinv)
		}

		return Ok(give)
	}
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

	decode(input: unknown): Result<L> {
		const { name, decoders } = this

		if (
			!Array.isArray(input)
			|| input.length !== decoders.length
		) return Err(`expected ${name}, got ${input}`)

		const t = [] as unknown as L
		for (let index = 0; index < decoders.length; index++) {
			const decoder = decoders[index]
			const value = input[index]
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

	decode(input: unknown): Result<O> {
	// decode(input: unknown): TransformedCollection<D> {
		const { name, decoders } = this

		if (!is_object(input)) return Err(`Failed to decode a valid ${name}, input is not an object: ${input}`)

		const give = {} as O
		for (const key in input) {
			if (!(key in decoders)) return Err(`Failed to decode a valid ${name}, input had invalid extra key ${key}`)
			const decoder = decoders[key]
			const value = input[key]
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

	decode(input: unknown): Result<O> {
		const { name, decoders } = this

		if (!is_object(input)) return Err(`Failed to decode a valid ${name}, input is not an object: ${input}`)

		const give = { ...input } as O
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
