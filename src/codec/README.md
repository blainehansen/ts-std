# `@ts-std/codec`

> A convenient and highly type-safe typescript decoder library.

This library makes it simple to create decoders/validators for unknown input. Various decoders and combinators are exposed, that allow you to construct arbitrarily complex types.

```ts
import * as c from '@ts-std/codec'
import { Result, Ok, Err } from '@/ts-std/monads'

const Person = c.object({
  name: c.string,
  height: c.number,
  hobbies: c.array(c.object({
    name: c.string,
    years: c.optional(c.number)
  }))
})
type Person = c.TypeOf<typeof Person>

const ok = ''
```

## `abstract class Decoder<T>`

All the types in this library extend this

```ts
abstract class Decoder<T> {
  abstract readonly name: string
  abstract decode(input: unknown): Result<T>

  // this is implemented for you
  guard(input: unknown): input is T
}
```


## `abstract class Decoder<T> {`
## `type TypeOf<D extends Decoder<unknown>> = D extends Decoder<infer T> ? T : never`
## `function adaptable<L extends any[], T>(`
## `function adaptor<U, T>(decoder: Decoder<U>, func: (input: U) => T): SafeAdaptor<U, T> {`
## `function try_adaptor<U, T>(decoder: Decoder<U>, func: (input: U) => Result<T>): FallibleAdaptor<U, T> {`
## `type DecoderTuple<L extends unknown[]> = {`
## `interface DecodableConstructor<L extends unknown[], T extends Decodable<L>> {`
## `interface Decodable<L extends unknown[] = unknown[]> {`
## `abstract class Serializer {`
## `class JsonSerializer extends Serializer {`
## `function cls<L extends unknown[], T extends Decodable<L>>(cn: DecodableConstructor<L, T>): Decoder<T> {`
## `function wrap<T>(name: string, decoder_func: (input: unknown) => Result<T>): Decoder<T> {`
## `const always = new WrapDecoder(`
## `const never = new WrapDecoder(`
## `const string = new WrapDecoder(`
## `const boolean = new WrapDecoder(`
## `const number = new WrapDecoder(`
## `const loose_number = new WrapDecoder(`
## `const int = new WrapDecoder(`
## `const uint = new WrapDecoder(`
## `function union<L extends unknown[]>(...decoders: DecoderTuple<L>): Decoder<L[number]> {`
## `class all<L extends ((val: any) => any)[]> extends Decoder<FoldingFunctions<L>> {`
## `function value<V extends Primitives>(value: V): Decoder<V> {`
## `function values<V extends Primitives, L extends V[]>(...values: L): Decoder<L[number]> {`
## `const undefined_value = value(undefined as undefined)`
## `const null_value = value(null as null)`
## `function optional<T>(decoder: Decoder<T>): Decoder<T | undefined> {`
## `function nullable<T>(decoder: Decoder<T>): Decoder<T | null> {`
## `function nillable<T>(decoder: Decoder<T>): Decoder<T | null | undefined> {`
## `function maybe<T>(decoder: Decoder<T>): Decoder<Maybe<T>> {`
## `function array<T>(decoder: Decoder<T>): Decoder<T[]> {`
## `function dictionary<T>(decoder: Decoder<T>): Decoder<Dict<T>> {`
## `function transform_dictionary<T>(transformer: Transformer<T>): Transformer<Dict<T>> {`
## `function tuple<L extends unknown[]>(...decoders: DecoderTuple<L>): Decoder<L> {`
## `function object<O>(`
## `function loose_object<O>(`
